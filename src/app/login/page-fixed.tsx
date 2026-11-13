
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UctLogo from '@/components/uct-logo';
import FaceIdModal from '@/components/face-id-modal-fixed';
import { Eye, EyeOff, User, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFaceIdModal, setShowFaceIdModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        // Перенаправление на главную страницу
        router.push('/dashboard');
      } else {
        const data = await response.json();
        setError(data.error || 'Неверное имя пользователя или пароль');
      }
    } catch (err) {
      setError('Произошла ошибка при входе. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (username: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      if (response.ok) {
        // Перенаправление на главную страницу
        router.push('/dashboard');
      } else {
        const data = await response.json();
        setError(data.error || 'Ошибка при входе в демо-режим');
      }
    } catch (err) {
      setError('Произошла ошибка при входе. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="w-full max-w-md">
          {/* Логотип */}
          <div className="flex justify-center mb-8">
            <div className="flex flex-col items-center">
              <UctLogo />
              <h1 className="mt-2 text-2xl font-bold">Университет Цифровых Технологий</h1>
              <p className="text-gray-600 text-sm">Личный кабинет студента</p>
            </div>
          </div>

          {/* Форма входа */}
          <div className="card mb-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Логин
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Введите ваш логин"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Пароль
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Введите ваш пароль"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary mb-3 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Вход...
                  </>
                ) : 'Войти'}
              </button>

              <button
                type="button"
                onClick={() => setShowFaceIdModal(true)}
                className="w-full btn-secondary flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Войти по Face ID (Демо-режим)
              </button>
            </form>
          </div>

          {/* Информация */}
          <div className="text-center text-xs text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
            <p>Концептуальный прототип для студенческого конкурса. Не является официальным сервисом вуза.</p>
            <p>Все персональные данные вымышлены.</p>
          </div>
        </div>
      </div>

      {/* Face ID Modal */}
      <FaceIdModal
        isOpen={showFaceIdModal}
        onClose={() => setShowFaceIdModal(false)}
        onSelectAccount={handleDemoLogin}
      />
    </div>
  );
}
