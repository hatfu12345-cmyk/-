'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Calendar, Clock, MapPin, User, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

interface ScheduleItem {
  id: string;
  time: string;
  subject: string;
  type: string;
  teacher: string;
  classroom: string;
  building: string; // Технический код или название из БД
  date: string;
  status: string;
  notes?: string | null;
}

const getTypeColor = (type: string): string => {
  switch (type.toUpperCase()) {
    case 'LECTURE': return 'bg-emerald-500';
    case 'PRACTICE': return 'bg-blue-500';
    case 'LAB': return 'bg-orange-500';
    case 'EXAM': return 'bg-red-500';
    case 'TEST': return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
};

const getTypeName = (type: string): string => {
  switch (type.toUpperCase()) {
    case 'LECTURE': return 'Лекция';
    case 'PRACTICE': return 'Практика';
    case 'LAB': return 'Лабораторная';
    case 'EXAM': return 'Экзамен';
    case 'TEST': return 'Зачёт';
    default: return type;
  }
};

// ОБНОВЛЕННАЯ ФУНКЦИЯ ДЛЯ КОРПУСОВ
const getBuildingName = (buildingCode: string | undefined | null): string => {
  if (!buildingCode) return '';

  const buildingsMap: Record<string, string> = {
    'MAIN': 'Главный корпус',
    'BLD_1': 'Корпус №1',
    'BLD_2': 'Корпус №2',
    'LAB': 'Лабораторный корпус',
    'SPORT': 'Спортзал',
    // Добавляйте сюда другие текстовые коды, если они есть в базе
  };

  const upperCode = buildingCode.toUpperCase();
  
  // 1. Если это текстовый код (например MAIN) - берем из словаря
  if (buildingsMap[upperCode]) {
    return buildingsMap[upperCode];
  }

  // 2. Если пришла просто цифра (как на вашем скриншоте "2"), добавляем слово "Корпус"
  if (!isNaN(Number(upperCode))) {
    return `Корпус №${upperCode}`;
  }

  // 3. В остальных случаях (если уже пришло "Корпус №2" или "Учебный корпус") возвращаем как есть
  return buildingCode; 
};

export default function SchedulePage() {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [mode, setMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 10, 1)); // Ноябрь 2026
  const [loading, setLoading] = useState(true);
  const [selectedScheduleItems, setSelectedScheduleItems] = useState<ScheduleItem[]>([]);
  
  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/schedule');
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.schedule || data.items || [];
          setItems(list);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const filteredItems = items.filter(item => item.date.split('T')[0] === dateStr);
    setSelectedScheduleItems(filteredItems);
  }, [selectedDate, items]);

  const changeMonth = (direction: number) => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const calendarData = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const firstDayOfWeek = (firstDay.getDay() + 6) % 7; 
    const lastDayOfWeek = (lastDay.getDay() + 6) % 7;
    
    const daysInMonth = lastDay.getDate();
    const calendarDays = [];
    
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push(new Date(year, month, i));
    }
    
    for (let i = lastDayOfWeek + 1; i < 7; i++) {
      calendarDays.push(null);
    }
    
    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }
    
    return { year, month, weeks, firstDay, lastDay };
  }, [selectedDate]);

  const getDayScheduleCounts = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayItems = items.filter(item => item.date.split('T')[0] === dateStr);
    
    const counts: Record<string, number> = { LECTURE: 0, PRACTICE: 0, LAB: 0, EXAM: 0, TEST: 0 };
    
    dayItems.forEach(item => {
      const type = item.type.toUpperCase();
      if (counts.hasOwnProperty(type)) {
        counts[type]++;
      }
    });
    
    return counts;
  };

  const getStatusBadge = (status: string, notes?: string | null) => {
    const upper = status.toUpperCase();
    if (upper === 'CANCELLED' || upper === 'CANCELED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          <AlertTriangle className="w-3.5 h-3.5" />
          {notes || 'Занятие отменено'}
        </span>
      );
    }
    if (upper === 'MOVED' || upper === 'RESCHEDULED' || notes) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          <AlertTriangle className="w-3.5 h-3.5" />
          {notes || 'Перенос занятия'}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto p-4 pb-24 sm:pb-8">
      {/* Шапка */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Расписание занятий
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Интерактивное расписание на ноябрь 2026 года
          </p>
        </div>
      </div>

      {/* Легенда типов занятий */}
      <div className="flex flex-wrap justify-center gap-3 mb-6 bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Лекции</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>Практики</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span>Лабораторные</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Экзамены</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <span>Зачёты</span>
        </div>
      </div>

      {/* Переключатель режимов */}
      <div className="inline-flex rounded-xl bg-slate-100 p-1 mb-6">
        <button
          onClick={() => setMode('calendar')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition min-h-[40px] ${
            mode === 'calendar'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Календарь
        </button>
        <button
          onClick={() => setMode('list')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition min-h-[40px] ${
            mode === 'list'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Весь список
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : mode === 'calendar' ? (
        <>
          {/* Календарная сетка */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={() => changeMonth(-1)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <h2 className="text-lg font-bold text-slate-900">
                {monthNames[calendarData.month]} {calendarData.year}
              </h2>
              <button 
                onClick={() => changeMonth(1)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-slate-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarData.weeks.map((week, weekIndex) => (
                week.map((date, dayIndex) => {
                  if (!date) {
                    return <div key={`${weekIndex}-${dayIndex}`} className="aspect-square" />;
                  }
                  
                  const counts = getDayScheduleCounts(date);
                  const isSelected = date.toDateString() === selectedDate.toDateString();
                  const isToday = date.toDateString() === new Date().toDateString();
                  
                  return (
                    <div 
                      key={`${weekIndex}-${dayIndex}`}
                      onClick={() => setSelectedDate(date)}
                      className={`aspect-square flex flex-col items-center justify-start p-1 rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-medium ${
                        isToday ? 'bg-blue-100 text-blue-700' : 'text-slate-700'
                      } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                        {date.getDate()}
                      </div>
                      
                      <div className="flex flex-wrap justify-center gap-0.5 mt-1 w-full px-1">
                        {counts.LECTURE > 0 && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" title={`Лекции: ${counts.LECTURE}`} />}
                        {counts.PRACTICE > 0 && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" title={`Практики: ${counts.PRACTICE}`} />}
                        {counts.LAB > 0 && <div className="w-1.5 h-1.5 rounded-full bg-orange-500" title={`Лабораторные: ${counts.LAB}`} />}
                        {counts.EXAM > 0 && <div className="w-1.5 h-1.5 rounded-full bg-red-500" title={`Экзамены: ${counts.EXAM}`} />}
                        {counts.TEST > 0 && <div className="w-1.5 h-1.5 rounded-full bg-purple-500" title={`Зачёты: ${counts.TEST}`} />}
                      </div>
                    </div>
                  );
                })
              ))}
            </div>
          </div>

          {/* Выбранный день занятий */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              {selectedDate.toLocaleDateString('ru-RU', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </h2>
            
            {selectedScheduleItems.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                На этот день занятий не запланировано
              </div>
            ) : (
              <div className="space-y-3.5">
                {selectedScheduleItems.map((item) => {
                  const badge = getStatusBadge(item.status, item.notes);
                  const isCancelled = item.status.toUpperCase().includes('CANCEL');
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border bg-white transition ${
                        badge ? 'border-amber-300 shadow-sm' : 'border-slate-200'
                      } ${isCancelled ? 'opacity-70' : ''}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                          <Clock className="w-4 h-4" />
                          <span>{item.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                            getTypeColor(item.type)
                          } text-white`}>
                            {getTypeName(item.type)}
                          </span>
                          {badge}
                        </div>
                      </div>

                      <h3
                        className={`text-base sm:text-lg font-bold text-slate-900 mb-2 ${
                          isCancelled ? 'line-through text-slate-500' : ''
                        }`}
                      >
                        {item.subject}
                      </h3>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5 text-sm text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>
                            {getBuildingName(item.building)}, ауд. {item.classroom}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>{item.teacher}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Режим списка всех занятий */
        <div className="space-y-3.5">
          {items.map((item) => {
            const badge = getStatusBadge(item.status, item.notes);
            const isCancelled = item.status.toUpperCase().includes('CANCEL');
            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl border bg-white transition ${
                  badge ? 'border-amber-300 shadow-sm' : 'border-slate-200'
                } ${isCancelled ? 'opacity-70' : ''}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                    <Clock className="w-4 h-4" />
                    <span>{item.time}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 font-normal">
                      {new Date(item.date).toLocaleDateString('ru-RU', {
                        weekday: 'short',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                      getTypeColor(item.type)
                    } text-white`}>
                      {getTypeName(item.type)}
                    </span>
                    {badge}
                  </div>
                </div>

                <h3
                  className={`text-base sm:text-lg font-bold text-slate-900 mb-2 ${
                    isCancelled ? 'line-through text-slate-500' : ''
                  }`}
                >
                  {item.subject}
                </h3>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5 text-sm text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      {getBuildingName(item.building)}, ауд. {item.classroom}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{item.teacher}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}