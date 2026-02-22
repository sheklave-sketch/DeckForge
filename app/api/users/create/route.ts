import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const createUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  plan: z.enum(['FREE', 'PRO', 'ENTERPRISE']).default('FREE'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, email, name, plan } = createUserSchema.parse(body);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        id,
        email,
        name,
        plan,
        stripeCustomerId: null,
      },
    });

    // Create default brand kit for the user
    await prisma.brandKit.create({
      data: {
        userId: user.id,
        name: 'Default Brand Kit',
        colors: {
          primary: '#2563eb',
          secondary: '#7c3aed',
          accent: '#10b981',
          text: '#1e293b',
          background: '#ffffff',
        },
        fonts: {
          heading: 'Arial',
          body: 'Arial',
        },
        tone: 'formal',
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
      },
    });
  } catch (error: any) {
    console.error('User creation error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
