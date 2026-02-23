// API Route: Generate presentation from content
import { NextRequest, NextResponse } from 'next/server';
import { parseContent } from '@/lib/ai/parser';
import { mapContentToComponents } from '@/lib/ai/mapper';
import { renderPresentation, getBrandKit } from '@/lib/components/renderer';
import { uploadFile } from '@/lib/supabase/storage';
import prisma from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Support both old format (flat fields) and new format (content + parameters)
    const projectId = body.projectId;
    const content = body.content || body.rawContent || '';
    const parameters = body.parameters || {
      tone: body.tone,
      audience: body.audience,
      style: body.style,
      slideCount: body.slideCount,
    };
    const brandKitId = body.brandKitId;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing required field: projectId', receivedKeys: Object.keys(body) },
        { status: 400 }
      );
    }

    // If no content provided, try to get it from the project record
    let finalContent = content;
    if (!finalContent) {
      const project = await prisma.project.findUnique({ where: { id: projectId }, select: { inputContent: true } });
      finalContent = project?.inputContent || '';
    }

    if (!finalContent) {
      return NextResponse.json(
        { error: 'No content provided. Please enter content in the text area.', receivedKeys: Object.keys(body) },
        { status: 400 }
      );
    }

    // 1. Update project status
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'GENERATING' },
    });

    // 2. Parse content with AI
    console.log('[Generate] Parsing content...');
    const parsedContent = await parseContent(finalContent, parameters);

    // Save parsed content
    await prisma.project.update({
      where: { id: projectId },
      data: {
        parsedContent: parsedContent as any,
        parameters: parameters as any,
      },
    });

    // 3. Get available components from database
    console.log('[Generate] Fetching components...');
    const components = await prisma.component.findMany({
      where: { isPublic: true },
      select: {
        id: true,
        name: true,
        category: true,
        tags: true,
        useCases: true,
        bestFor: true,
        dataSchema: true,
        renderCode: true,
      },
    });

    if (components.length === 0) {
      return NextResponse.json(
        { error: 'No components available. Run database seed first.' },
        { status: 500 }
      );
    }

    // 4. Map content to components
    console.log('[Generate] Mapping to components...');
    const { slideBlueprints } = await mapContentToComponents(
      parsedContent,
      components,
      parameters
    );

    // Enrich blueprints with render code
    const enrichedBlueprints = slideBlueprints.map((bp) => {
      const component = components.find((c) => c.id === bp.componentId);
      return {
        ...bp,
        renderCode: component?.renderCode || '',
      };
    });

    // Save blueprint
    await prisma.project.update({
      where: { id: projectId },
      data: { slideBlueprint: enrichedBlueprints as any },
    });

    // 5. Get brand kit
    let brand = getBrandKit();
    if (brandKitId) {
      const brandKit = await prisma.brandKit.findUnique({
        where: { id: brandKitId },
      });
      if (brandKit) {
        brand = getBrandKit({
          colors: brandKit.colors as any,
          fonts: brandKit.fonts as any,
          logoData: brandKit.logoUrl || undefined,
        });
      }
    }

    // 6. Render PPTX
    console.log('[Generate] Rendering PPTX...');
    const pptxBuffer = await renderPresentation(enrichedBlueprints, brand);

    // 7. Upload to Supabase Storage
    console.log('[Generate] Uploading to storage...');
    const fileName = `${projectId}-${Date.now()}.pptx`;
    const pptxUrl = await uploadFile(
      'DECKS',
      fileName,
      pptxBuffer,
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    );

    // 8. Save slides to database
    console.log('[Generate] Saving slides...');
    await Promise.all(
      enrichedBlueprints.map((bp) =>
        prisma.slide.create({
          data: {
            projectId,
            position: bp.position,
            componentId: bp.componentId,
            data: bp.data as any,
          },
        })
      )
    );

    // 9. Update project status
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'READY',
        pptxUrl,
      },
    });

    return NextResponse.json({
      success: true,
      projectId,
      pptxUrl,
      slideCount: enrichedBlueprints.length,
    });
  } catch (error: any) {
    console.error('[Generate] Error:', error);

    // Update project status to failed
    if (error.projectId) {
      await prisma.project.update({
        where: { id: error.projectId },
        data: { status: 'DRAFT' },
      });
    }

    return NextResponse.json(
      {
        error: error.message || 'Generation failed',
        details: error.stack,
      },
      { status: 500 }
    );
  }
}
