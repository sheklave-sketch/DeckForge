import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const projects = await prisma.project.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        status: true,
        deckUrl: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            slides: true,
          },
        },
      },
    });

    const formattedProjects = projects.map((project) => ({
      id: project.id,
      title: project.title,
      status: project.status,
      deckUrl: project.deckUrl,
      slideCount: project._count.slides,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    }));

    return NextResponse.json({ projects: formattedProjects });
  } catch (error: any) {
    console.error('Projects list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
