"use client";

import { useState, useEffect } from "react";
import {
  CheckSquare,
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
} from "lucide-react";

// Тип для домашнего задания
interface Homework {
  id: string;
  subject: string;
  title: string;
  description: string;
  openDate: Date;
  closeDate: Date;
  completed: boolean;
}

// Тип для статуса окна сдачи
type HomeworkStatus = "OPEN" | "CLOSING_SOON" | "CLOSED";

// Генерируем реалистичный список домашних заданий
const generateHomework = (): Homework[] => [
  {
    id: "1",
    subject: "Алгоритмы и структуры данных",
    title: "Реализация двоичного дерева поиска",
    description: "Разработать программу на C++ для работы с двоичным деревом поиска с операциями вставки, удаления и поиска.",
    openDate: new Date(2026, 10, 10, 9, 0), // 10.11.2026 09:00
    closeDate: new Date(2026, 10, 18, 23, 59), // 18.11.2026 23:59
    completed: false,
  },
  {
    id: "2",
    subject: "Введение в девопс",
    title: "CI/CD конвейер для веб-приложения",
    description: "Настроить конвейер непрерывной интеграции и доставки для простого веб-приложения с использованием GitHub Actions.",
    openDate: new Date(2026, 10, 5, 10, 0), // 05.11.2026 10:00
    closeDate: new Date(2026, 10, 15, 23, 59), // 15.11.2026 23:59
    completed: true,
  },
  {
    id: "3",
    subject: "Управление данными",
    title: "Проектирование реляционной базы данных",
    description: "Спроектировать базу данных для системы управления библиотекой, включая ER-диаграмму и SQL-скрипты создания таблиц.",
    openDate: new Date(2026, 10, 12, 9, 0), // 12.11.2026 09:00
    closeDate: new Date(2026, 10, 25, 23, 59), // 25.11.2026 23:59
    completed: false,
  },
  {
    id: "4",
    subject: "Инфокоммуникационные системы и сети",
    title: "Конфигурация сетевого оборудования",
    description: "Настроить коммутатор и маршрутизатор с использованием эмулятора Cisco Packet Tracer для создания небольшой сети.",
    openDate: new Date(2026, 10, 8, 9, 0), // 08.11.2026 09:00
    closeDate: new Date(2026, 10, 20, 23, 59), // 20.11.2026 23:59
    completed: true,
  },
  {
    id: "5",
    subject: "Операционные системы",
    title: "Системные вызовы в Linux",
    description: "Написать программу на C, демонстрирующую работу системных вызовов для создания процессов, управления файлами и межпроцессного взаимодействия.",
    openDate: new Date(2026, 10, 15, 9, 0), // 15.11.2026 09:00
    closeDate: new Date(2026, 10, 28, 23, 59), // 28.11.2026 23:59
    completed: false,
  },
  {
    id: "6",
    subject: "Системы искусственного интеллекта",
    title: "Машинное обучение для классификации изображений",
    description: "Реализовать нейронную сеть для классификации изображений из набора данных CIFAR-10 с использованием TensorFlow.",
    openDate: new Date(2026, 10, 18, 9, 0), // 18.11.2026 09:00
    closeDate: new Date(2026, 10, 30, 23, 59), // 30.11.2026 23:59
    completed: false,
  },
  {
    id: "7",
    subject: "Алгоритмы и структуры данных",
    title: "Хэш-таблица с разрешением коллизий",
    description: "Реализовать хэш-таблицу с методом цепочек для разрешения коллизий и провести сравнительный анализ производительности.",
    openDate: new Date(2026, 10, 20, 9, 0), // 20.11.2026 09:00
    closeDate: new Date(2026, 11, 2, 23, 59), // 02.12.2026 23:59
    completed: false,
  },
];

// Функция для определения статуса домашнего задания
const getHomeworkStatus = (homework: Homework): HomeworkStatus => {
  const now = new Date();
  const timeToClose = homework.closeDate.getTime() - now.getTime();
  const daysToClose = timeToClose / (1000 * 60 * 60 * 24);

  if (now < homework.openDate) {
    return "CLOSED"; // Еще не открыто
  } else if (daysToClose <= 2) {
    return "CLOSING_SOON"; // Закрывается скоро
  } else if (now > homework.closeDate) {
    return "CLOSED"; // Закрыто
  } else {
    return "OPEN"; // Открыто
  }
};

// Функция для получения цвета статуса
const getStatusColor = (status: HomeworkStatus): string => {
  switch (status) {
    case "OPEN":
      return "bg-green-100 text-green-800";
    case "CLOSING_SOON":
      return "bg-yellow-100 text-yellow-800";
    case "CLOSED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Функция для получения текста статуса
const getStatusText = (status: HomeworkStatus): string => {
  switch (status) {
    case "OPEN":
      return "Открыто";
    case "CLOSING_SOON":
      return "Скоро закрывается";
    case "CLOSED":
      return "Закрыто";
    default:
      return "Неизвестно";
  }
};

export default function HomeworkPage() {
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [filter, setFilter] = useState<"ALL" | "COMPLETED" | "INCOMPLETE">("ALL");
  const [loading, setLoading] = useState(true);

  // Загрузка данных из localStorage при монтировании компонента
  useEffect(() => {
    const savedHomework = localStorage.getItem("homeworkStatus");
    if (savedHomework) {
      try {
        const parsed = JSON.parse(savedHomework);
        const homeworkWithDates = generateHomework().map(hw => ({
          ...hw,
          openDate: new Date(hw.openDate),
          closeDate: new Date(hw.closeDate),
          completed: parsed[hw.id]?.completed || hw.completed
        }));
        setHomeworkList(homeworkWithDates);
      } catch (e) {
        console.error("Ошибка при загрузке данных из localStorage", e);
        setHomeworkList(generateHomework());
      }
    } else {
      setHomeworkList(generateHomework());
    }
    setLoading(false);
  }, []);

  // Сохранение состояния в localStorage при изменении
  useEffect(() => {
    if (homeworkList.length > 0) {
      const homeworkStatus: Record<string, { completed: boolean }> = {};
      homeworkList.forEach(hw => {
        homeworkStatus[hw.id] = { completed: hw.completed };
      });
      localStorage.setItem("homeworkStatus", JSON.stringify(homeworkStatus));
    }
  }, [homeworkList]);

  // Переключение статуса выполнения задания
  const toggleHomeworkStatus = (id: string) => {
    setHomeworkList(prevList =>
      prevList.map(hw =>
        hw.id === id ? { ...hw, completed: !hw.completed } : hw
      )
    );
  };

  // Фильтрация заданий
  const filteredHomework = homeworkList.filter(hw => {
    if (filter === "COMPLETED") return hw.completed;
    if (filter === "INCOMPLETE") return !hw.completed;
    return true;
  });

  // Расчет прогресса выполнения
  const completedCount = homeworkList.filter(hw => hw.completed).length;
  const totalCount = homeworkList.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Форматирование даты и времени
  const formatDateTime = (date: Date): string => {
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 sm:pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-blue-600" />
          Дедлайны ДЗ
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Список домашних заданий и лабораторных работ с дедлайнами
        </p>
      </div>

      {/* Прогресс-бар выполнения */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700">
            Прогресс выполнения: {completedCount} из {totalCount}
          </span>
          <span className="text-sm font-medium text-blue-600">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { id: "ALL", label: "Все" },
          { id: "INCOMPLETE", label: "Невыполненные" },
          { id: "COMPLETED", label: "Выполненные" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as "ALL" | "COMPLETED" | "INCOMPLETE")}
            className={`px-4 py-2 rounded-xl text-sm font-medium min-h-[40px] ${
              filter === tab.id
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Список домашних заданий */}
      <div className="space-y-4">
        {filteredHomework.map((homework) => {
          const status = getHomeworkStatus(homework);
          return (
            <div
              key={homework.id}
              className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-sm ${
                homework.completed ? "border-green-200 bg-green-50/50" : "border-slate-200"
              }`}
            >
              <div className="flex flex-wrap justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-base">
                      {homework.title}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        status
                      )}`}
                    >
                      <Clock className="w-3 h-3" />
                      {getStatusText(status)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{homework.description}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {homework.openDate < new Date()
                          ? `Открыто с ${formatDateTime(homework.openDate)}`
                          : `Откроется ${formatDateTime(homework.openDate)}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {homework.closeDate < new Date()
                          ? `Закрылось ${formatDateTime(homework.closeDate)}`
                          : `Закрывается ${formatDateTime(homework.closeDate)}`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => toggleHomeworkStatus(homework.id)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium min-h-[40px] ${
                      homework.completed
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {homework.completed ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Выполнено
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        Не выполнено
                      </>
                    )}
                  </button>
                  <span className="text-xs font-medium text-slate-500">
                    {homework.subject}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
