// API Route: Create new project
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, brandKitId, email, name } = body;

    if (!userId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, title' },
        { status: 400 }
      );
    }

    // Ensure user exists in database (auto-create if missing)
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: userId,
          email: email || `${userId}@temp.deckforge.app`,
          name: name || 'DeckForge User',
          plan: 'FREE',
        },
      });
      // Create default brand kit
      await prisma.brandKit.create({
        data: {
          userId,
          name: 'Default Brand Kit',
          colors: { primary: '#2563eb', secondary: '#7c3aed', accent: '#10b981', text: '#1e293b', background: '#ffffff' },
          fonts: { heading: 'Arial', body: 'Arial' },
          tone: 'formal',
        },
      });
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
