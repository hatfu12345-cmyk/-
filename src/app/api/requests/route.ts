
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

// GET - получение списка заявок
export async function GET(request: NextRequest) {
  const user = await getUserFromToken(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Не авторизован' },
      { status: 401 }
    );
  }

  // Определяем, может ли пользователь видеть все заявки (сотрудник деканата)
  const canViewAll = user.role === 'STAFF' || user.role === 'EMPLOYEE';
  
  // Получаем заявки
  const requests = await prisma.request.findMany({
    where: canViewAll ? {} : { userId: user.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return NextResponse.json({ requests });
}

// POST - создание новой заявки
export async function POST(request: NextRequest) {
  const user = await getUserFromToken(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Не авторизован' },
      { status: 401 }
    );
  }

  try {
    const { type, comment } = await request.json();
    
    // Валидация данных
    if (!type || !comment) {
      return NextResponse.json(
        { error: 'Тип заявки и комментарий обязательны' },
        { status: 400 }
      );
    }
    
    // Создаем заявку
    const newRequest = await prisma.request.create({
      data: {
        type,
        status: 'PROCESSING',
        comment,
        userId: user.id
      }
    });
    
    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при создании заявки' },
      { status: 500 }
    );
  }
}
