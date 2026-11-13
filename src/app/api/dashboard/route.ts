
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
        createdAt: true,
        updatedAt: true,
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

  // Получаем данные для дашборда
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Получаем ближайшую пару
  const nearestLesson = await prisma.scheduleItem.findFirst({
    where: {
      userId: user.id,
      date: {
        gte: today,
        lt: tomorrow
      }
    },
    orderBy: {
      date: 'asc'
    }
  });
  
  // Получаем прогресс к сессии
  const grades = await prisma.grade.findMany({
    where: {
      userId: user.id,
      status: 'PASSED'
    }
  });
  
  const totalSubjects = await prisma.grade.groupBy({
    by: ['subject'],
    where: {
      userId: user.id
    },
    _count: {
      subject: true
    }
  });
  
  const passedSubjects = grades.length;
  const totalSubjectsCount = totalSubjects.length;
  const progress = totalSubjectsCount > 0 ? (passedSubjects / totalSubjectsCount) * 100 : 0;
  
  // Получаем количество непрочитанных уведомлений
  const unreadNotifications = await prisma.notification.count({
    where: {
      userId: user.id,
      read: false
    }
  });
  
  // Получаем количество заявок в обработке
  const pendingRequests = await prisma.request.count({
    where: {
      userId: user.id,
      status: {
        in: ['PROCESSING', 'READY']
      }
    }
  });
  
  return NextResponse.json({
    user,
    nearestLesson,
    sessionProgress: {
      progress,
      passedSubjects,
      totalSubjects: totalSubjectsCount
    },
    unreadNotifications,
    pendingRequests
  });
}
