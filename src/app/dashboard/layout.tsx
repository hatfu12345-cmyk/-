'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  LogOut,
  MapPin,
  FileText,
  Bell,
  Menu,
  X,
  Home,
  Calendar,
  BarChart3,
  CheckSquare
} from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  name: string;
  role: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) {
          throw new Error('Ошибка при загрузке данных');
        }

        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        console.error(err);
        router.replace('/');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const isEmployee = Boolean(
    user &&
      (user.role === 'STAFF' ||
        user.role === 'EMPLOYEE' ||
        user.username === 'metodist')
  );

  // Защита от попадания методиста в студенческие разделы
  useEffect(() => {
    if (!user || !isEmployee) return;
    const forbiddenForStaff = [
      '/dashboard',
      '/dashboard/schedule',
      '/dashboard/grades',
      '/dashboard/homework',
    ];
    if (forbiddenForStaff.includes(pathname)) {
      router.replace('/dashboard/requests');
    }
  }, [user, isEmployee, pathname, router]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 max-w-4xl mx-auto">
          <div className="h-12 bg-gray-200 rounded mb-6"></div>
          <div className="h-64 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const studentMenuItems = [
    { href: '/dashboard', icon: Home, label: 'Личный кабинет' },
    { href: '/dashboard/schedule', icon: Calendar, label: 'Расписание' },
    { href: '/dashboard/map', icon: MapPin, label: 'Карта корпусов' },
    { href: '/dashboard/grades', icon: BarChart3, label: 'Успеваемость' },
    { href: '/dashboard/requests', icon: FileText, label: 'Заявки' },
    { href: '/dashboard/notifications', icon: Bell, label: 'Уведомления' },
    { href: '/dashboard/homework', icon: CheckSquare, label: 'Дедлайны ДЗ' },
  ];

  const staffMenuItems = [
    { href: '/dashboard/requests', icon: FileText, label: 'Ответ на заявки' },
    { href: '/dashboard/notifications', icon: Bell, label: 'Уведомления' },
    { href: '/dashboard/map', icon: MapPin, label: 'Карта корпусов' },
  ];

  const menuItems = isEmployee ? staffMenuItems : studentMenuItems;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-800">Цифровой деканат УЦТ</h1>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Выйти
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <nav className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="mb-6">
                <div className="flex items-center">
                  <div className="bg-primary bg-opacity-10 p-2 rounded-full mr-3">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">@{user.username}</p>
                  </div>
                </div>
              </div>

              <ul className="space-y-1">
                {menuItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <main className="flex-1">
            {children}
          </main>

          <div
            className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
            style={{ display: isMobileMenuOpen ? 'block' : 'none' }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 flex justify-between items-center border-b">
                <h2 className="text-lg font-bold">Меню</h2>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-4 border-t">
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Выйти
                </button>
              </div>

              <div className="p-4">
                <div className="mb-6">
                  <div className="flex items-center">
                    <div className="bg-primary bg-opacity-10 p-2 rounded-full mr-3">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-600">@{user.username}</p>
                    </div>
                  </div>
                </div>

                <ul className="space-y-1">
                  {menuItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon className="h-5 w-5 mr-3" />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <button
            className="md:hidden fixed bottom-4 right-4 bg-white p-3 rounded-full shadow-lg"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
