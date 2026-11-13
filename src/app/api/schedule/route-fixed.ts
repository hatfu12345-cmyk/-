
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

  // Получаем параметры из запроса
  const { searchParams } = new URL(request.url);
  const viewMode = searchParams.get('viewMode') || 'today'; // 'today' или 'week'
  
  // Определяем даты для запроса
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let startDate = new Date(today);
  let endDate = new Date(today);
  
  if (viewMode === 'today') {
    endDate.setDate(endDate.getDate() + 1);
  } else if (viewMode === 'week') {
    // Начало недели (понедельник)
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startDate.setDate(today.getDate() + mondayOffset);
    
    // Конец недели (воскресенье)
    endDate.setDate(startDate.getDate() + 7);
  }
  
  // Получаем расписание
  const schedule = await prisma.scheduleItem.findMany({
    where: {
      userId: user.id,
      date: {
        gte: startDate,
        lt: endDate
      }
    },
    orderBy: {
      date: 'asc',
      time: 'asc'
    }
  });

  // Группируем расписание по дням
  const scheduleByDay: Record<string, typeof schedule> = {};
  
  schedule.forEach(item => {
    const dateStr = item.date.toISOString().split('T')[0];
    if (!scheduleByDay[dateStr]) {
      scheduleByDay[dateStr] = [];
    }
    scheduleByDay[dateStr].push(item);
  });
  
  // Получаем названия дней недели
  const getDayName = (date: Date) => {
    const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    return days[date.getDay()];
  };
  
  // Форматируем результат
  const formattedSchedule = Object.entries(scheduleByDay).map(([dateStr, items]) => ({
    date: dateStr,
    dayName: getDayName(new Date(dateStr)),
    items: items.map(item => ({
      id: item.id,
      time: item.time,
      subject: item.subject,
      type: item.type,
      teacher: item.teacher,
      classroom: item.classroom,
      building: item.building,
      status: item.status,
      notes: item.notes
    }))
  }));

  return NextResponse.json({
    schedule: formattedSchedule,
    viewMode,
    dateRange: {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    }
  });
}
