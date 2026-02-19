import { NextResponse } from 'next/server';
import { z } from 'zod';

import { verifyPassword, createSessionToken } from '@/server/auth';
import { db } from '@/server/db';

import type { NextRequest} from 'next/server';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const data = loginSchema.parse(body);

    // Find user
    const user = await db.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Verify password
    const isValid = await verifyPassword(data.password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Create session token
    const token = await createSessionToken(user.id, user.email);

    // Store session in database (optional, for server-side session management)
    await db.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
    });

    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
