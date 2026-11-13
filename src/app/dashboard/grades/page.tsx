
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Award, 
  FileText, 
  Download,
  AlertCircle,
  CheckCircle,
  BarChart3,
  CalendarDays
} from 'lucide-react';

interface Grade {
  id: string;
  score: number;
  maxScore: number;
  status: 'PASSED' | 'FAILED' | 'IN_PROGRESS' | 'NOT_STARTED';
  examDate?: Date;
  createdAt: Date;
}

interface Subject {
  subject: string;
  averageScore?: number;
  maxScore: number;
  totalGrades: number;
  passedGrades: number;
  grades: Grade[];
}

interface Statistics {
  totalSubjects: number;
  passedSubjects: number;
  averageProgress: number;
}

export default function GradesPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({ 
    totalSubjects: 0, 
    passedSubjects: 0, 
    averageProgress: 0 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  
  // Получаем данные успеваемости
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await fetch('/api/grades');
        if (!response.ok) {
          throw new Error('Ошибка при загрузке успеваемости');
        }
        
        const data = await response.json();
        setSubjects(data.subjects);
        setStatistics(data.statistics);
      } catch (err) {
        setError('Не удалось загрузить данные успеваемости');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGrades();
  }, []);
  
  // Функция для экспорта в iCalendar
  const exportToCalendar = (subject: Subject, reminderType: '3days' | '1day' | '2hours' | 'none') => {
    if (!subject.grades[0]?.examDate) return;
    
    const examDate = new Date(subject.grades[0].examDate);
    const formatDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    // Вычисляем время напоминания
    let alarmDate = new Date(examDate);
    
    switch (reminderType) {
      case '3days':
        alarmDate.setDate(alarmDate.getDate() - 3);
        break;
      case '1day':
        alarmDate.setDate(alarmDate.getDate() - 1);
        break;
      case '2hours':
        alarmDate.setHours(alarmDate.getHours() - 2);
        break;
      case 'none':
        // Напоминание не добавляем
        break;
    }
    
    // Создаем iCal контент
    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Университет Цифровых Технологий//Конкурсный прототип//RU',
      'BEGIN:VEVENT',
      `UID:${Date.now()}-${subject.subject}@uct.ru`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(examDate)}`,
      `DTEND:${formatDate(new Date(examDate.getTime() + 90 * 60000))}`, // 90 минут
      `SUMMARY:${subject.subject} - Экзамен/Зачет`,
      `DESCRIPTION:Экзамен/Зачет по предмету ${subject.subject}. Место: Аудитория будет указана позже.`,
      `LOCATION:Аудитория будет указана позже`,
      reminderType !== 'none' ? `BEGIN:VALARM` : '',
      reminderType !== 'none' ? `TRIGGER;RELATED=START:-PT${reminderType === '3days' ? '72' : reminderType === '1day' ? '24' : '2'}H` : '',
      reminderType !== 'none' ? `ACTION:DISPLAY` : '',
      reminderType !== 'none' ? `DESCRIPTION:Напоминание: ${subject.subject} - Экзамен/Зачет завтра!` : '',
      reminderType !== 'none' ? `END:VALARM` : '',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');
    
    // Создаем и скачиваем файл
    const blob = new Blob([icalContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${subject.subject.replace(/\s+/g, '_')}_exam.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Функция для экспорта всей сессии
  const exportFullSession = () => {
    const exams = subjects.filter(s => s.grades.some(g => g.status === 'NOT_STARTED' || g.status === 'IN_PROGRESS'));
    
    if (exams.length === 0) {
      alert('Нет предстоящих экзаменов для экспорта');
      return;
    }
    
    // Создаем iCal контент
    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID://Университет Цифровых Технологий//Конкурсный прототип//RU',
      ...exams.map(exam => {
        if (!exam.grades[0]?.examDate) return '';
        
        const examDate = new Date(exam.grades[0].examDate);
        const formatDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        
        return [
          'BEGIN:VEVENT',
          `UID:${Date.now()}-${exam.subject}@uct.ru`,
          `DTSTAMP:${formatDate(new Date())}`,
          `DTSTART:${formatDate(examDate)}`,
          `DTEND:${formatDate(new Date(examDate.getTime() + 90 * 60000))}`, // 90 минут
          `SUMMARY:${exam.subject} - Экзамен/Зачет`,
          `DESCRIPTION:Экзамен/Зачет по предмету ${exam.subject}. Место: Аудитория будет указана позже.`,
          `LOCATION:Аудитория будет указана позже`,
          'BEGIN:VALARM',
          'TRIGGER;RELATED=START:-PT24H',
          'ACTION:DISPLAY',
          `DESCRIPTION:Напоминание: ${exam.subject} - Экзамен/Зачет завтра!`,
          'END:VALARM',
          'END:VEVENT'
        ].join('\n');
      }).filter(Boolean),
      'END:VCALENDAR'
    ].join('\n');
    
    // Создаем и скачиваем файл
    const blob = new Blob([icalContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'full_session.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Получаем статус для отображения
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'PASSED':
        return { text: 'Зачтено', icon: CheckCircle, color: 'text-green-600' };
      case 'FAILED':
        return { text: 'Не зачтено', icon: AlertCircle, color: 'text-red-600' };
      case 'IN_PROGRESS':
        return { text: 'В процессе', icon: Clock, color: 'text-yellow-600' };
      case 'NOT_STARTED':
        return { text: 'Не начато', icon: Calendar, color: 'text-gray-600' };
      default:
        return { text: status, icon: AlertCircle, color: 'text-gray-600' };
    }
  };
  
  // Рендерим скелетон при загрузке
  if (loading) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded w-full mb-6"></div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Рендерим ошибку
  if (error) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Ошибка загрузки</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => router.reload()} 
            className="btn-primary"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }
  
  // Рендерим пустое состояние
  if (subjects.length === 0) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-bold mb-2">Нет данных успеваемости</h2>
          <p className="text-gray-600 mb-4">У вас пока нет оценок или зачетов</p>
          <button 
            onClick={() => router.push('/dashboard')} 
            className="btn-primary"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Успеваемость</h1>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BarChart3 className="h-5 w-5 text-primary mr-2" />
            <span className="text-gray-600">
              Прогресс: {statistics.averageProgress.toFixed(1)}% ({statistics.passedSubjects} из {statistics.totalSubjects} предметов)
            </span>
          </div>
          <button 
            onClick={exportFullSession}
            className="flex items-center btn-secondary"
          >
            <Download className="h-4 w-4 mr-2" />
            Экспортировать всю сессию (.ics)
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.map((subject) => {
          const status = getStatusDisplay(subject.grades[0]?.status || 'NOT_STARTED');
          const Icon = status.icon;
          
          return (
            <div 
              key={subject.subject} 
              className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedSubject(subject)}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg">{subject.subject}</h3>
                <div className="flex items-center">
                  <Icon className={`h-5 w-5 ${status.color} mr-1`} />
                  <span className={`font-medium ${status.color}`}>{status.text}</span>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Средний балл</span>
                  <span>{subject.averageScore?.toFixed(1) || 'N/A'}/{subject.maxScore}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${(subject.averageScore || 0) / subject.maxScore * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Зачеты: {subject.passedGrades}/{subject.totalGrades}</span>
                {subject.grades[0]?.examDate && (
                  <span className="text-gray-600">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    {new Date(subject.grades[0].examDate).toLocaleDateString('ru-RU')}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Модальное окно с деталями предмета */}
      {selectedSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedSubject.subject}</h2>
              <button 
                onClick={() => setSelectedSubject(null)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span>Средний балл</span>
                <span>{selectedSubject.averageScore?.toFixed(1) || 'N/A'}/{selectedSubject.maxScore}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${(selectedSubject.averageScore || 0) / selectedSubject.maxScore * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium mb-3">Оценки</h3>
              <div className="space-y-2">
                {selectedSubject.grades.map((grade) => {
                  const status = getStatusDisplay(grade.status);
                  const Icon = status.icon;
                  
                  return (
                    <div key={grade.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Icon className={`h-5 w-5 ${status.color} mr-2`} />
                        <span className="font-medium">{status.text}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{grade.score}/{grade.maxScore}</div>
                        {grade.examDate && (
                          <div className="text-sm text-gray-500">
                            {new Date(grade.examDate).toLocaleDateString('ru-RU')}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium mb-3">Напоминания в календарь</h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => exportToCalendar(selectedSubject, '3days')}
                  className="btn-secondary flex flex-col items-center p-3"
                >
                  <CalendarDays className="h-6 w-6 mb-1" />
                  <span>За 3 дня</span>
                </button>
                <button 
                  onClick={() => exportToCalendar(selectedSubject, '1day')}
                  className="btn-secondary flex flex-col items-center p-3"
                >
                  <CalendarDays className="h-6 w-6 mb-1" />
                  <span>За 1 день</span>
                </button>
                <button 
                  onClick={() => exportToCalendar(selectedSubject, '2hours')}
                  className="btn-secondary flex flex-col items-center p-3"
                >
                  <Clock className="h-6 w-6 mb-1" />
                  <span>За 2 часа</span>
                </button>
                <button 
                  onClick={() => exportToCalendar(selectedSubject, 'none')}
                  className="btn-secondary flex flex-col items-center p-3"
                >
                  <FileText className="h-6 w-6 mb-1" />
                  <span>Без напоминаний</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
