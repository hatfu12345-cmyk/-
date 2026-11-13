
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

  const korsakova = await prisma.user.create({
    data: {
      username: 'korsakova',
      password: passwordHash,
      name: 'Корсакова Анастасия',
      role: 'STUDENT',
    },
  });

  // Расписание для Смирнова на ноябрь 2026
  await prisma.scheduleItem.createMany({
    data: [
      // Алгоритмы и структуры данные
      {
        time: '09:00-10:35',
        subject: 'Алгоритмы и структуры данных',
        type: 'LECTURE',
        teacher: 'Петров В.С.',
        classroom: '201',
        building: '3',
        date: new Date(2026, 10, 1, 9, 0),
        userId: smirnov.id,
      },
      {
        time: '11:00-12:35',
        subject: 'Алгоритмы и структуры данных',
        type: 'PRACTICE',
        teacher: 'Петров В.С.',
        classroom: '304',
        building: '2',
        date: new Date(2026, 10, 1, 11, 0),
        userId: smirnov.id,
      },
      {
        time: '13:45-15:20',
        subject: 'Алгоритмы и структуры данных',
        type: 'LAB',
        teacher: 'Сидорова М.И.',
        classroom: '512',
        building: '4',
        date: new Date(2026, 10, 3, 13, 45),
        userId: smirnov.id,
      },
      
      // Введение в девопс
      {
        time: '09:00-10:35',
        subject: 'Введение в девопс',
        type: 'LECTURE',
        teacher: 'Кузнецов А.П.',
        classroom: '305',
        building: '2',
        date: new Date(2026, 10, 2, 9, 0),
        userId: smirnov.id,
      },
      {
        time: '11:00-12:35',
        subject: 'Введение в девопс',
        type: 'LAB',
        teacher: 'Кузнецов А.П.',
        classroom: '610',
        building: '3',
        date: new Date(2026, 10, 4, 11, 0),
        userId: smirnov.id,
      },
      
      // Управление данными
      {
        time: '09:00-10:35',
        subject: 'Управление данными',
        type: 'LECTURE',
        teacher: 'Иванов А.А.',
        classroom: '201',
        building: '3',
        date: new Date(2026, 10, 7, 9, 0),
        userId: smirnov.id,
      },
      {
        time: '11:00-12:35',
        subject: 'Управление данными',
        type: 'PRACTICE',
        teacher: 'Иванов А.А.',
        classroom: '304',
        building: '2',
        date: new Date(2026, 10, 9, 11, 0),
        userId: smirnov.id,
      },
      
      // Инфокоммуникационные системы и сети
      {
        time: '09:00-10:35',
        subject: 'Инфокоммуникационные системы и сети',
        type: 'LECTURE',
        teacher: 'Смирнова Е.В.',
        classroom: '405',
        building: '1',
        date: new Date(2026, 10, 8, 9, 0),
        userId: smirnov.id,
      },
      {
        time: '11:00-12:35',
        subject: 'Инфокоммуникационные системы и сети',
        type: 'LAB',
        teacher: 'Смирнова Е.В.',
        classroom: '512',
        building: '4',
        date: new Date(2026, 10, 10, 11, 0),
        userId: smirnov.id,
      },
      
      // Операционные системы
      {
        time: '09:00-10:35',
        subject: 'Операционные системы',
        type: 'LECTURE',
        teacher: 'Федоров К.Л.',
        classroom: '205',
        building: '2',
        date: new Date(2026, 10, 14, 9, 0),
        userId: smirnov.id,
      },
      {
        time: '11:00-12:35',
        subject: 'Операционные системы',
        type: 'PRACTICE',
        teacher: 'Федоров К.Л.',
        classroom: '307',
        building: '3',
        date: new Date(2026, 10, 15, 11, 0),
        userId: smirnov.id,
      },
      
      // Системы искусственного интеллекта и большие данные
      {
        time: '09:00-10:35',
        subject: 'Системы искусственного интеллекта и большие данные',
        type: 'LECTURE',
        teacher: 'Николаев А.В.',
        classroom: '408',
        building: '1',
        date: new Date(2026, 10, 16, 9, 0),
        userId: smirnov.id,
      },
      {
        time: '11:00-12:35',
        subject: 'Системы искусственного интеллекта и большие данные',
        type: 'LAB',
        teacher: 'Николаев А.В.',
        classroom: '610',
        building: '3',
        date: new Date(2026, 10, 17, 11, 0),
        userId: smirnov.id,
      },
      
      // Экзамены и зачеты
      {
        time: '09:00-10:35',
        subject: 'Алгоритмы и структуры данных',
        type: 'EXAM',
        teacher: 'Петров В.С.',
        classroom: '201',
        building: '3',
        date: new Date(2026, 10, 21, 9, 0),
        userId: smirnov.id,
      },
      {
        time: '11:00-12:35',
        subject: 'Управление данными',
        type: 'TEST',
        teacher: 'Иванов А.А.',
        classroom: '305',
        building: '2',
        date: new Date(2026, 10, 22, 11, 0),
        userId: smirnov.id,
      },
      {
        time: '13:45-15:20',
        subject: 'Инфокоммуникационные системы и сети',
        type: 'TEST',
        teacher: 'Смирнова Е.В.',
        classroom: '405',
        building: '1',
        date: new Date(2026, 10, 23, 13, 45),
        userId: smirnov.id,
      },
      {
        time: '09:00-10:35',
        subject: 'Операционные системы',
        type: 'EXAM',
        teacher: 'Федоров К.Л.',
        classroom: '205',
        building: '2',
        date: new Date(2026, 10, 28, 9, 0),
        userId: smirnov.id,
      },
      {
        time: '11:00-12:35',
        subject: 'Системы искусственного интеллекта и большие данные',
        type: 'EXAM',
        teacher: 'Николаев А.В.',
        classroom: '408',
        building: '1',
        date: new Date(2026, 10, 29, 11, 0),
        userId: smirnov.id,
      },
    ],
  });

  // Расписание для Волковой на ноябрь 2026
  await prisma.scheduleItem.createMany({
    data: [
      // Алгоритмы и структуры данные
      {
        time: '09:00-10:35',
        subject: 'Алгоритмы и структуры данных',
        type: 'LECTURE',
        teacher: 'Петров В.С.',
        classroom: '201',
        building: '3',
        date: new Date(2026, 10, 1, 9, 0),
        userId: volkova.id,
      },
      {
        time: '11:00-12:35',
        subject: 'Алгоритмы и структуры данных',
        type: 'PRACTICE',
        teacher: 'Петров В.С.',
        classroom: '304',
        building: '2',
        date: new Date(2026, 10, 1, 11, 0),
        userId: volkova.id,
      },
      
      // Введение в девопс
      {
        time: '09:00-10:35',
        subject: 'Введение в девопс',
        type: 'LECTURE',
        teacher: 'Кузнецов А.П.',
        classroom: '305',
        building: '2',
        date: new Date(2026, 10, 2, 9, 0),
        userId: volkova.id,
      },
      {
        time: '11:00-12:35',
        subject: 'Введение в девопс',
        type: 'LAB',
        teacher: 'Кузнецов А.П.',
        classroom: '610',
        building: '3',
        date: new Date(2026, 10, 4, 11, 0),
        userId: volkova.id,
      },
      
      // Управление данными
      {
        time: '09:00-10:35',
        subject: 'Управление данными',
        type: 'LECTURE',
        teacher: 'Иванов А.А.',
        classroom: '201',
        building: '3',
        date: new Date(2026, 10, 7, 9, 0),
        userId: volkova.id,
      },
      {
        time: '11:00-12:35',
        subject: 'Управление данными',
        type: 'PRACTICE',
        teacher: 'Иванов А.А.',
        classroom: '304',
        building: '2',
        date: new Date(2026, 10, 9, 11, 0),
        userId: volkova.id,
      },
      
      // Инфокоммуникационные системы и сети
      {
        time: '09:00-10:35',
        subject: 'Инфокоммуникационные системы и сети',
        type: 'LECTURE',
        teacher: 'Смирнова Е.В.',
        classroom: '405',
        building: '1',
        date: new Date(2026, 10, 8, 9, 0),
        userId: volkova.id,
      },
      {
        time: '11:00-12:35',
        subject: 'Инфокоммуникационные системы и сети',
        type: 'LAB',
        teacher: 'Смирнова Е.В.',
        classroom: '512',
        building: '4',
        date: new Date(2026, 10, 10, 11, 0),
        userId: volkova.id,
      },
      
      // Операционные системы
      {
        time: '09:00-10:35',
        subject: 'Операционные системы',
        type: 'LECTURE',
        teacher: 'Федоров К.Л.',
        classroom: '205',
        building: '2',
        date: new Date(2026, 10, 14, 9, 0),
        userId: volkova.id,
      },
      {
        time: '11:00-12:35',
        subject: 'Операционные системы',
        type: 'PRACTICE',
        teacher: 'Федоров К.Л.',
        classroom: '307',
        building: '3',
        date: new Date(2026, 10, 15, 11, 0),
        userId: volkova.id,
      },
      
      // Системы искусственного интеллекта и большие данные
      {
        time: '09:00-10:35',
        subject: 'Системы искусственного интеллекта и большие данные',
        type: 'LECTURE',
        teacher: 'Николаев А.В.',
        classroom: '408',
        building: '1',
        date: new Date(2026, 10, 16, 9, 0),
        userId: volkova.id,
      },
      {
        time: '11:00-12:35',
        subject: 'Системы искусственного интеллекта и большие данные',
        type: 'LAB',
        teacher: 'Николаев А.В.',
        classroom: '610',
        building: '3',
        date: new Date(2026, 10, 17, 11, 0),
        userId: volkova.id,
      },
      
      // Экзамены и зачеты
      {
        time: '09:00-10:35',
        subject: 'Алгоритмы и структуры данных',
        type: 'EXAM',
        teacher: 'Петров В.С.',
        classroom: '201',
        building: '3',
        date: new Date(2026, 10, 21, 9, 0),
        userId: volkova.id,
      },
      {
        time: '11:00-12:35',
        subject: 'Управление данными',
        type: 'TEST',
        teacher: 'Иванов А.А.',
        classroom: '305',
        building: '2',
        date: new Date(2026, 10, 22, 11, 0),
        userId: volkova.id,
      },
      {
        time: '13:45-15:20',
        subject: 'Инфокоммуникационные системы и сети',
        type: 'TEST',
        teacher: 'Смирнова Е.В.',
        classroom: '405',
        building: '1',
        date: new Date(2026, 10, 23, 13, 45),
        userId: volkova.id,
      },
      {
        time: '09:00-10:35',
        subject: 'Операционные системы',
        type: 'EXAM',
        teacher: 'Федоров К.Л.',
        classroom: '205',
        building: '2',
        date: new Date(2026, 10, 28, 9, 0),
        userId: volkova.id,
      },
      {
        time: '11:00-12:35',
        subject: 'Системы искусственного интеллекта и большие данные',
        type: 'EXAM',
        teacher: 'Николаев А.В.',
        classroom: '408',
        building: '1',
        date: new Date(2026, 10, 29, 11, 0),
        userId: volkova.id,
      },
      
      // Пример переноса занятия
      {
        time: '13:45-15:20',
        subject: 'Введение в девопс',
        type: 'LAB',
        teacher: 'Кузнецов А.П.',
        classroom: '610',
        building: '3',
        date: new Date(2026, 10, 18, 13, 45),
        notes: 'Перенос из ауд. 611 в 610',
        status: 'MOVED',
        userId: volkova.id,
      },
    ],
  });

  // Расписание для Корсаковой на ноябрь 2026
  await prisma.scheduleItem.createMany({
    data: [
      // Алгоритмы и структуры данные
      {
        time: '09:00-10:35',
        subject: 'Алгоритмы и структуры данных',
        type: 'LECTURE',
        teacher: 'Петров В.С.',
        classroom: '201',
        building: '3',
        date: new Date(2026, 10, 1, 9, 0),
        userId: korsakova.id,
      },
      {
        time: '11:00-12:35',
        subject: 'Алгоритмы и структуры данных',
        type: 'PRACTICE',
        teacher: 'Петров В.С.',
        classroom: '304',
        building: '2',
        date: new Date(2026, 10, 1, 11, 0),
        userId: korsakova.id,
      },

      // Введение в девопс
      {
        time: '09:00-10:35',
        subject: 'Введение в девопс',
        type: 'LECTURE',
        teacher: 'Кузнецов А.П.',
        classroom: '305',
        building: '2',
        date: new Date(2026, 10, 2, 9, 0),
        userId: korsakova.id,
      },
      {
        time: '11:00-12:35',
        subject: 'Введение в девопс',
        type: 'LAB',
        teacher: 'Кузнецов А.П.',
        classroom: '610',
        building: '3',
        date: new Date(2026, 10, 4, 11, 0),
        userId: korsakova.id,
      },

      // Управление данными
      {
        time: '09:00-10:35',
        subject: 'Управление данными',
        type: 'LECTURE',
        teacher: 'Иванов А.А.',
        classroom: '201',
        building: '3',
        date: new Date(2026, 10, 7, 9, 0),
        userId: korsakova.id,
      },
      {
        time: '11:00-12:35',
        subject: 'Управление данными',
        type: 'PRACTICE',
        teacher: 'Иванов А.А.',
        classroom: '304',
        building: '2',
        date: new Date(2026, 10, 9, 11, 0),
        userId: korsakova.id,
      },

      // Инфокоммуникационные системы и сети
      {
        time: '09:00-10:35',
        subject: 'Инфокоммуникационные системы и сети',
        type: 'LECTURE',
        teacher: 'Смирнова Е.В.',
        classroom: '405',
        building: '1',
        date: new Date(2026, 10, 8, 9, 0),
        userId: korsakova.id,
      },
      {
        time: '11:00-12:35',
        subject: 'Инфокоммуникационные системы и сети',
        type: 'LAB',
        teacher: 'Смирнова Е.В.',
        classroom: '512',
        building: '4',
        date: new Date(2026, 10, 10, 11, 0),
        userId: korsakova.id,
      },

      // Операционные системы
      {
        time: '09:00-10:35',
        subject: 'Операционные системы',
        type: 'LECTURE',
        teacher: 'Федоров К.Л.',
        classroom: '205',
        building: '2',
        date: new Date(2026, 10, 14, 9, 0),
        userId: korsakova.id,
      },
      {
        time: '11:00-12:35',
        subject: 'Операционные системы',
        type: 'PRACTICE',
        teacher: 'Федоров К.Л.',
        classroom: '307',
        building: '3',
        date: new Date(2026, 10, 15, 11, 0),
        userId: korsakova.id,
      },

      // Системы искусственного интеллекта и большие данные
      {
        time: '09:00-10:35',
        subject: 'Системы искусственного интеллекта и большие данные',
        type: 'LECTURE',
        teacher: 'Николаев А.В.',
        classroom: '408',
        building: '1',
        date: new Date(2026, 10, 16, 9, 0),
        userId: korsakova.id,
      },
      {
        time: '11:00-12:35',
        subject: 'Системы искусственного интеллекта и большие данные',
        type: 'LAB',
        teacher: 'Николаев А.В.',
        classroom: '610',
        building: '3',
        date: new Date(2026, 10, 17, 11, 0),
        userId: korsakova.id,
      },

      // Экзамены и зачеты
      {
        time: '09:00-10:35',
        subject: 'Алгоритмы и структуры данных',
        type: 'EXAM',
        teacher: 'Петров В.С.',
        classroom: '201',
        building: '3',
        date: new Date(2026, 10, 21, 9, 0),
        userId: korsakova.id,
      },
      {
        time: '11:00-12:35',
        subject: 'Управление данными',
        type: 'TEST',
        teacher: 'Иванов А.А.',
        classroom: '305',
        building: '2',
        date: new Date(2026, 10, 22, 11, 0),
        userId: korsakova.id,
      },
      {
        time: '13:45-15:20',
        subject: 'Инфокоммуникационные системы и сети',
        type: 'TEST',
        teacher: 'Смирнова Е.В.',
        classroom: '405',
        building: '1',
        date: new Date(2026, 10, 23, 13, 45),
        userId: korsakova.id,
      },
      {
        time: '09:00-10:35',
        subject: 'Операционные системы',
        type: 'EXAM',
        teacher: 'Федоров К.Л.',
        classroom: '205',
        building: '2',
        date: new Date(2026, 10, 28, 9, 0),
        userId: korsakova.id,
      },
      {
        time: '11:00-12:35',
        subject: 'Системы искусственного интеллекта и большие данные',
        type: 'EXAM',
        teacher: 'Николаев А.В.',
        classroom: '408',
        building: '1',
        date: new Date(2026, 10, 29, 11, 0),
        userId: korsakova.id,
      },
    ],
  });

  // Оценки для Корсаковой
  await prisma.grade.createMany({
    data: [
      {
        subject: 'Базы данных',
        score: 78,
        maxScore: 100,
        status: 'PASSED',
        userId: korsakova.id,
      },
      {
        subject: 'Алгоритмы и структуры данных',
        score: 85,
        maxScore: 100,
        status: 'PASSED',
        userId: korsakova.id,
      },
      {
        subject: 'Программирование на C#',
        score: 72,
        maxScore: 100,
        status: 'PASSED',
        userId: korsakova.id,
      },
      {
        subject: 'Математический анализ',
        score: 0,
        maxScore: 100,
        status: 'NOT_STARTED',
        examDate: new Date(2024, 5, 20),
        userId: korsakova.id,
      },
      {
        subject: 'Web-технологии',
        score: 0,
        maxScore: 100,
        status: 'NOT_STARTED',
        examDate: new Date(2024, 5, 25),
        userId: korsakova.id,
      },
      {
        subject: 'Операционные системы',
        score: 0,
        maxScore: 100,
        status: 'IN_PROGRESS',
        examDate: new Date(2024, 5, 30),
        userId: korsakova.id,
      },
      {
        subject: 'Системы искусственного интеллекта',
        score: 0,
        maxScore: 100,
        status: 'NOT_STARTED',
        examDate: new Date(2024, 6, 5),
        userId: korsakova.id,
      },
    ],
  });

  // Заявка от Корсаковой
  await prisma.request.create({
    data: {
      type: 'CERTIFICATE_STUDY',
      status: 'PROCESSING',
      comment: 'Нужна справка для участия в конференции',
      userId: korsakova.id,
    },
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

  await prisma.notification.create({
    data: {
      title: 'Предстоящая контрольная',
      message: '20 июня состоится контрольная работа по алгоритмам и структурам данных',
      userId: korsakova.id,
    },
  });

  await prisma.notification.create({
    data: {
      title: 'Статус заявки изменен',
      message: 'Ваша заявка на замену студенческого билета готова',
      userId: korsakova.id,
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
