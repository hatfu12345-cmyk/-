
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

  // Получаем оценки пользователя
  const grades = await prisma.grade.findMany({
    where: {
      userId: user.id
    },
    orderBy: {
      examDate: 'desc'
    }
  });

  // Получаем уникальные предметы
  const subjects = await prisma.grade.groupBy({
    by: ['subject'],
    where: {
      userId: user.id
    },
    _avg: {
      score: true
    },
    _max: {
      maxScore: true
    },
    _count: {
      _all: true
    },
    orderBy: {
      subject: 'asc'
    }
  });

  // Форматируем результат
  const formattedSubjects = subjects.map(subject => {
    const gradesForSubject = grades.filter(grade => grade.subject === subject.subject);
    
    return {
      subject: subject.subject,
      averageScore: subject._avg.score,
      maxScore: subject._max.maxScore || 100,
      totalGrades: subject._count._all,
      passedGrades: gradesForSubject.filter(grade => grade.status === 'PASSED').length,
      grades: gradesForSubject.map(grade => ({
        id: grade.id,
        score: grade.score,
        maxScore: grade.maxScore,
        status: grade.status,
        examDate: grade.examDate,
        createdAt: grade.createdAt
      }))
    };
  });

  // Считаем общую статистику
  const totalSubjects = subjects.length;
  const passedSubjects = formattedSubjects.reduce((sum, subject) => sum + subject.passedGrades, 0);
  const averageProgress = totalSubjects > 0 ? (passedSubjects / totalSubjects) * 100 : 0;

  return NextResponse.json({
    subjects: formattedSubjects,
    statistics: {
      totalSubjects,
      passedSubjects,
      averageProgress
    }
  });
}
