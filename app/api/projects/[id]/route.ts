import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        slides: {
          orderBy: {
            slideNumber: 'asc',
          },
          select: {
            id: true,
            slideNumber: true,
            componentName: true,
            componentCategory: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      project: {
        id: project.id,
        title: project.title,
        status: project.status,
        rawContent: project.rawContent,
        deckUrl: project.deckUrl,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        slides: project.slides,
      },
    });
  } catch (error: any) {
    console.error('Project fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}
