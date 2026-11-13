
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

// GET - получение списка уведомлений
export async function GET(request: NextRequest) {
  const user = await getUserFromToken(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Не авторизован' },
      { status: 401 }
    );
  }

  // Получаем параметры из запроса
  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get('unreadOnly') === 'true';
  
  // Фильтр по непрочитанным уведомлениям
  const whereClause = unreadOnly 
    ? { userId: user.id, read: false }
    : { userId: user.id };
  
  // Получаем уведомления
  const notifications = await prisma.notification.findMany({
    where: whereClause,
    orderBy: {
      createdAt: 'desc'
    }
  });

  return NextResponse.json({ notifications });
}

// PATCH - отметка уведомлений как прочитанных
export async function PATCH(request: NextRequest) {
  const user = await getUserFromToken(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Не авторизован' },
      { status: 401 }
    );
  }

  try {
    const { notificationIds } = await request.json();
    
    // Если не указаны ID, помечаем все уведомления как прочитанные
    if (!notificationIds || notificationIds.length === 0) {
      await prisma.notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true }
      });
      
      return NextResponse.json({ 
        message: 'Все уведомления отмечены как прочитанные' 
      });
    }
    
    // Помечаем указанные уведомления как прочитанные
    await prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds
        },
        userId: user.id,
        read: false
      },
      data: { read: true }
    });
    
    return NextResponse.json({ 
      message: 'Уведомления отмечены как прочитанные',
      updatedCount: notificationIds.length
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при обновлении уведомлений' },
      { status: 500 }
    );
  }
}
