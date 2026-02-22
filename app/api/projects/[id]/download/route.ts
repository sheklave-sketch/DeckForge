// API Route: Download PPTX file
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;

    // Get project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { pptxUrl: true, title: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (!project.pptxUrl) {
      return NextResponse.json(
        { error: 'Presentation not yet generated' },
        { status: 404 }
      );
    }

    // Fetch PPTX from Supabase Storage
    const response = await fetch(project.pptxUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch PPTX from storage');
    }

    const buffer = await response.arrayBuffer();

    // Return PPTX file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${project.title || 'presentation'}.pptx"`,
      },
    });
  } catch (error: any) {
    console.error('[Download] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Download failed' },
      { status: 500 }
    );
  }
}
