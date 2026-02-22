// API Route: Create new project
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, brandKitId } = body;

    if (!userId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, title' },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        userId,
        title,
        brandKitId: brandKitId || null,
        status: 'DRAFT',
      },
    });

    return NextResponse.json({ project });
  } catch (error: any) {
    console.error('[Create Project] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Project creation failed' },
      { status: 500 }
    );
  }
}
