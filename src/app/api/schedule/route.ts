import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Функция для получения пользователя из токена в cookie
async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
      }
    });

    return user;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const user = await getUserFromToken(request);

  if (!user) {
    return NextResponse.json(
      { error: 'Не авторизован' },
      { status: 401 }
    );
  }

  const items = await prisma.scheduleItem.findMany({
    where: { userId: user.id },
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
  });

  return NextResponse.json({ schedule: items, items });
}
