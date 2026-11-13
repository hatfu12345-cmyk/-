
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Хеширование паролей
  const passwordHash = await bcrypt.hash('Pass1234!', 10);
  const adminPasswordHash = await bcrypt.hash('Admin1234!', 10);

  // Создание пользователей
  const smirnov = await prisma.user.create({
    data: {
      username: 'smirnov',
      password: passwordHash,
      name: 'Алексей Смирнов',
      role: 'STUDENT',
    },
  });

  const volkova = await prisma.user.create({
    data: {
      username: 'volkova',
      password: passwordHash,
      name: 'Мария Волкова',
      role: 'STUDENT',
    },
  });

  const metodist = await prisma.user.create({
    data: {
      username: 'metodist',
      password: adminPasswordHash,
      name: 'Елена Петрова',
      role: 'EMPLOYEE',
    },
  });

  // Расписание для Смирнова
  await prisma.scheduleItem.createMany({
    data: [
      {
        time: '09:00-10:35',
        subject: 'Базы данных',
        type: 'LECTURE',
        teacher: 'Иванов А.А.',
        classroom: '201',
        building: '3',
        date: new Date(2024, 5, 10, 9, 0),
        userId: smirnov.id,
      },
      {
        time: '11:00-12:35',
        subject: 'Алгоритмы и структуры данных',
        type: 'PRACTICE',
        teacher: 'Петров В.С.',
        classroom: '304',
        building: '2',
        date: new Date(2024, 5, 10, 11, 0),
        userId: smirnov.id,
      },
      {
        time: '13:45-15:20',
        subject: 'Программирование на C#',
        type: 'LAB',
        teacher: 'Сидорова М.И.',
        classroom: '512',
        building: '4',
        date: new Date(2024, 5, 11, 13, 45),
        userId: smirnov.id,
      },
      {
        time: '09:00-10:35',
        subject: 'Математический анализ',
        type: 'LECTURE',
        teacher: 'Козлов Д.Н.',
        classroom: '405',
        building: '1',
        date: new Date(2024, 5, 12, 9, 0),
        userId: smirnov.id,
      },
    ],
  });

  // Расписание для Волковой (с переносом)
  await prisma.scheduleItem.createMany({
    data: [
      {
        time: '09:00-10:35',
        subject: 'Математический анализ',
        type: 'LECTURE',
        teacher: 'Козлов Д.Н.',
        classroom: '405',
        building: '1',
        date: new Date(2024, 5, 10, 9, 0),
        notes: 'Перенос из ауд. 304 в 405',
        status: 'MOVED',
        userId: volkova.id,
      },
      {
        time: '11:00-12:35',
        subject: 'Линейная алгебра',
        type: 'PRACTICE',
        teacher: 'Федорова Е.П.',
        classroom: '215',
        building: '2',
        date: new Date(2024, 5, 10, 11, 0),
        userId: volkova.id,
      },
      {
        time: '13:45-15:20',
        subject: 'Дискретная математика',
        type: 'LECTURE',
        teacher: 'Николаев А.В.',
        classroom: '312',
        building: '3',
        date: new Date(2024, 5, 11, 13, 45),
        userId: volkova.id,
      },
    ],
  });

  // Оценки для Смирнова
  await prisma.grade.createMany({
    data: [
      {
        subject: 'Базы данных',
        score: 85,
        maxScore: 100,
        status: 'PASSED',
        userId: smirnov.id,
      },
      {
        subject: 'Алгоритмы и структуры данных',
        score: 92,
        maxScore: 100,
        status: 'PASSED',
        userId: smirnov.id,
      },
      {
        subject: 'Программирование на C#',
        score: 78,
        maxScore: 100,
        status: 'PASSED',
        userId: smirnov.id,
      },
      {
        subject: 'Математический анализ',
        score: 0,
        maxScore: 100,
        status: 'NOT_STARTED',
        examDate: new Date(2024, 5, 20),
        userId: smirnov.id,
      },
      {
        subject: 'Web-технологии',
        score: 0,
        maxScore: 100,
        status: 'NOT_STARTED',
        examDate: new Date(2024, 5, 25),
        userId: smirnov.id,
      },
    ],
  });

  // Оценки для Волковой
  await prisma.grade.createMany({
    data: [
      {
        subject: 'Математический анализ',
        score: 45,
        maxScore: 100,
        status: 'FAILED',
        userId: volkova.id,
      },
      {
        subject: 'Линейная алгебра',
        score: 65,
        maxScore: 100,
        status: 'PASSED',
        userId: volkova.id,
      },
      {
        subject: 'Дискретная математика',
        score: 0,
        maxScore: 100,
        status: 'IN_PROGRESS',
        examDate: new Date(2024, 5, 18),
        userId: volkova.id,
      },
    ],
  });

  // Заявки
  await prisma.request.create({
    data: {
      type: 'CERTIFICATE_STUDY',
      status: 'PROCESSING',
      comment: 'Нужна справка для поступления в магистратуру',
      userId: volkova.id,
    },
  });

  await prisma.request.create({
    data: {
      type: 'CERTIFICATE_STUDY',
      status: 'READY',
      comment: 'Справка об обучении для летней практики',
      userId: smirnov.id,
    },
  });

  // Уведомления
  await prisma.notification.create({
    data: {
      title: 'Перенос пары',
      message: 'Ваша пара по математическому анализу перенесена из ауд. 304 в ауд. 405',
      userId: volkova.id,
    },
  });

  await prisma.notification.create({
    data: {
      title: 'Предстоящая контрольная работа',
      message: '18 июня состоится контрольная работа по дискретной математике',
      userId: volkova.id,
    },
  });

  await prisma.notification.create({
    data: {
      title: 'Статус заявки изменен',
      message: 'Ваша заявка на справку об обучении готова к выдаче',
      userId: smirnov.id,
    },
  });

  await prisma.notification.create({
    data: {
      title: 'Новое объявление',
      message: 'Объявляется набор в студенческий научный кружок по базам данных',
      userId: smirnov.id,
    },
  });

  await prisma.notification.create({
    data: {
      title: 'Новая заявка от студента',
      message: 'Мария Волкова подала заявку на справку для военкомата',
      userId: metodist.id,
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
