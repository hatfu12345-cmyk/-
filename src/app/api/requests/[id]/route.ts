
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

// PATCH - изменение статуса заявки
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUserFromToken(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Не авторизован' },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const status = formData.get('status') as string;
    const comment = formData.get('comment') as string;
    const file = formData.get('attachment') as File;
    const requestId = params.id;
    
    // Валидация данных
    if (!status) {
      return NextResponse.json(
        { error: 'Статус обязателен' },
        { status: 400 }
      );
    }
    
    // Для сотрудника деканата комментарий обязателен при принятии или отклонении
    const isStaff = user.role === 'STAFF';
    if (isStaff && (status === 'APPROVED' || status === 'REJECTED') && !comment.trim()) {
      return NextResponse.json(
        { error: 'Комментарий обязателен' },
        { status: 400 }
      );
    }
    
    // Получаем заявку для проверки прав доступа
    const existingRequest = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        user: true
      }
    });
    
    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Заявка не найдена' },
        { status: 404 }
      );
    }
    
    // Проверка прав доступа: только сотрудник деканата может менять статус,
    // и только свои заявки может менять студент
    const isOwner = existingRequest.userId === user.id;
    if (!isStaff && !isOwner) {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }
    
    // Студент может только переводить заявку в статус "Готово"
    if (isOwner && status !== 'READY') {
      return NextResponse.json(
        { error: 'Вы можете только перевести заявку в статус "Готово"' },
        { status: 403 }
      );
    }
    
    // Сотрудник деканата может менять статус на любой, кроме "PROCESSING" (только для новых)
    if (isStaff && status === 'PROCESSING' && existingRequest.status !== 'PROCESSING') {
      return NextResponse.json(
        { error: 'Нельзя перевести заявку в статус "В обработке"' },
        { status: 403 }
      );
    }
    
    // Подготавливаем данные для обновления заявки
    const updateData: any = { status };
    
    // Если есть комментарий, добавляем его
    if (comment) {
      updateData.staffComment = comment;
    }
    
    // Если есть файл, сохраняем его
    if (file && isStaff) {
      // Преобразуем файл в base64
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString('base64');
      
      updateData.attachmentName = file.name;
      updateData.attachmentData = `data:${file.type};base64,${base64}`;
    }
    
    // Обновляем заявку
    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
      data: updateData
    });
    
    // Если заявка переведена в статус "Одобрено" или "Отклонено" сотрудником деканата,
    // создаем уведомление для студента
    if ((status === 'APPROVED' || status === 'REJECTED') && isStaff) {
      await prisma.notification.create({
        data: {
          title: `Заявка ${status === 'APPROVED' ? 'одобрена' : 'отклонена'}`,
          message: `Ваша заявка "${existingRequest.type}" ${status === 'APPROVED' ? 'одобрена' : 'отклонена'}. ${comment ? 'Комментарий: ' + comment : ''}`,
          userId: existingRequest.userId
        }
      });
    }
    
    // Если заявка переведена в статус "Готово" и не была создана методом,
    // создаем уведомление для студента
    if (status === 'READY' && isStaff) {
      await prisma.notification.create({
        data: {
          title: 'Заявка готова',
          message: `Ваша заявка "${existingRequest.type}" готова к выдаче`,
          userId: existingRequest.userId
        }
      });
    }
    
    return NextResponse.json(updatedRequest);
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при обновлении заявки' },
      { status: 500 }
    );
  }
}
