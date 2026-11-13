
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Calendar, 
  Clock, 
  BookOpen, 
  Bell, 
  FileText,
  BarChart3,
  Home,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Star,
  LogOut,
  MapPin
} from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  name: string;
  role: string;
}

interface NearestLesson {
  id: string;
  time: string;
  subject: string;
  type: string;
  teacher: string;
  classroom: string;
  building: string;
  date: string;
}

interface SessionProgress {
  progress: number;
  passedSubjects: number;
  totalSubjects: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // Если пользователь - сотрудник деканата, перенаправляем на страницу заявок
  useEffect(() => {
    if (user && user.role === 'STAFF') {
      router.replace('/dashboard/requests');
    }
  }, [user, router]);
  const [nearestLesson, setNearestLesson] = useState<NearestLesson | null>(null);
  const [sessionProgress, setSessionProgress] = useState<SessionProgress>({ 
    progress: 0, 
    passedSubjects: 0, 
    totalSubjects: 0 
  });
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Получаем данные дашборда
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) {
          throw new Error('Ошибка при загрузке данных');
        }
        
        const data = await response.json();
        setUser(data.user);
        setNearestLesson(data.nearestLesson);
        setSessionProgress(data.sessionProgress);
        setUnreadNotifications(data.unreadNotifications);
        setPendingRequests(data.pendingRequests);
      } catch (err) {
        setError('Не удалось загрузить данные дашборда');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Функция для форматирования времени
  const formatTime = (timeString: string) => {
    return timeString;
  };
  
  // Функция для выхода из системы
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST'
      });
      router.replace('/');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      router.replace('/');
    }
  };

  // Функция для получения типа занятия
  const getLessonType = (type: string) => {
    switch (type) {
      case 'LECTURE':
        return 'Лекция';
      case 'PRACTICE':
        return 'Практика';
      case 'LAB':
        return 'Лабораторная';
      case 'SEMINAR':
        return 'Семинар';
      default:
        return type;
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
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
  
  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Шапка с кнопкой выхода */}
      <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg shadow">
        <h1 className="text-xl font-bold">Цифровой деканат УЦТ</h1>
        <button 
          onClick={handleLogout}
          className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Выйти
        </button>
      </div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Личный кабинет</h1>
        <p className="text-gray-600">Добро пожаловать, {user?.name}!</p>
      </div>
      
      {/* Карточка профиля */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start">
          <div className="bg-primary bg-opacity-10 p-4 rounded-full mb-4 md:mb-0 md:mr-6">
            <User className="h-12 w-12 text-primary" />
          </div>
          
          <div className="text-center md:text-left flex-1">
            <h2 className="text-xl font-bold mb-2">{user?.name}</h2>
            <p className="text-gray-600 mb-4">@{user?.username}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                {user?.role === 'STUDENT' ? 'Студент' : 'Сотрудник деканата'}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                ID: {user?.id}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ближайшая пара */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Calendar className="h-6 w-6 text-primary mr-2" />
            <h3 className="text-lg font-bold">Ближайшая пара</h3>
          </div>
          
          {nearestLesson ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">{nearestLesson.subject}</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {getLessonType(nearestLesson.type)}
                </span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                <span>{formatTime(nearestLesson.time)}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <User className="h-4 w-4 mr-1" />
                <span>{nearestLesson.teacher}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Star className="h-4 w-4 mr-1" />
                <span>Ауд. {nearestLesson.classroom}, корп. {nearestLesson.building}</span>
                <button 
                  onClick={() => router.push(`/dashboard/map?building=${nearestLesson.building}&classroom=${nearestLesson.classroom}`)}
                  className="ml-2 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  Показать на карте
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <Calendar className="mx-auto h-10 w-10 text-gray-300 mb-2" />
              <p>Ближайших пар не найдено</p>
            </div>
          )}
        </div>
        
        {/* Пульс семестра */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-6 w-6 text-primary mr-2" />
            <h3 className="text-lg font-bold">Пульс семестра</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Прогресс к сессии</span>
                <span className="text-sm font-medium">{sessionProgress.progress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${sessionProgress.progress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex justify-between text-sm text-gray-600">
              <span>Зачтено: {sessionProgress.passedSubjects}</span>
              <span>Всего: {sessionProgress.totalSubjects}</span>
            </div>
            
            <div className="pt-2">
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                <span>{sessionProgress.passedSubjects} предметов зачтено</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <AlertCircle className="h-4 w-4 text-yellow-500 mr-1" />
                <span>{sessionProgress.totalSubjects - sessionProgress.passedSubjects} предметов осталось</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Уведомления */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Bell className="h-6 w-6 text-primary mr-2" />
              <h3 className="text-lg font-bold">Уведомления</h3>
            </div>
            
            {unreadNotifications > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                {unreadNotifications} новых
              </span>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Перенос пары</p>
                <p className="text-sm text-gray-600">Ваша пара по математическому анализу перенесена</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Заявка готова</p>
                <p className="text-sm text-gray-600">Ваша заявка на справку готова к выдаче</p>
              </div>
            </div>
            
            <Link href="/dashboard/notifications" className="flex items-center text-primary text-sm mt-2">
              Все уведомления <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
        
        {/* Заявки */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-primary mr-2" />
              <h3 className="text-lg font-bold">Заявки</h3>
            </div>
            
            {pendingRequests > 0 && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                {pendingRequests} в обработке
              </span>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="bg-purple-100 p-2 rounded-full mr-3">
                <FileText className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Справка об обучении</p>
                <p className="text-sm text-gray-600">Статус: В обработке</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-purple-100 p-2 rounded-full mr-3">
                <FileText className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Для военкомата</p>
                <p className="text-sm text-gray-600">Статус: Готово</p>
              </div>
            </div>
            
            <Link href="/dashboard/requests" className="flex items-center text-primary text-sm mt-2">
              Все заявки <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Быстрые действия */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Быстрые действия</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/dashboard/schedule" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Calendar className="h-8 w-8 text-primary mb-2" />
            <span className="text-sm font-medium">Расписание</span>
          </Link>
          
          <Link href="/dashboard/grades" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <BarChart3 className="h-8 w-8 text-primary mb-2" />
            <span className="text-sm font-medium">Успеваемость</span>
          </Link>
          
          <Link href="/dashboard/map" className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200">
            <MapPin className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium">Карта корпусов</span>
          </Link>

          <Link href="/dashboard/requests" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <FileText className="h-8 w-8 text-primary mb-2" />
            <span className="text-sm font-medium">Заявки</span>
          </Link>
          
          <Link href="/dashboard/notifications" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell className="h-8 w-8 text-primary mb-2" />
            <span className="text-sm font-medium">Уведомления</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
