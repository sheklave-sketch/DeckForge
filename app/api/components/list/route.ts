// API Route: List components
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query
    const where: any = { isPublic: true };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    // Fetch components
    const components = await prisma.component.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        tags: true,
        thumbnailUrl: true,
        useCases: true,
        bestFor: true,
        popularity: true,
        source: true,
      },
      orderBy: { popularity: 'desc' },
      take: limit,
    });

    // Get counts by category
    const categoryCounts = await prisma.component.groupBy({
      by: ['category'],
      _count: true,
      where: { isPublic: true },
    });

    return NextResponse.json({
      components,
      total: components.length,
      categories: categoryCounts.map((c) => ({
        name: c.category,
        count: c._count,
      })),
    });
  } catch (error: any) {
    console.error('[List Components] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list components' },
      { status: 500 }
    );
  }
}
