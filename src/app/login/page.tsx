'use client';

import { useState } from 'react';
import UctLogo from '@/components/uct-logo';
import FaceIdModal from '@/components/face-id-modal';
import { Eye, EyeOff, User, Lock, ScanFace } from 'lucide-react';

export default function LoginPage() {
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
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (response.ok) {
        window.location.href = '/dashboard';
        return;
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.error || 'Неверное имя пользователя или пароль');
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
            <div className="flex flex-col items-center text-center">
              <UctLogo />
              <h1 className="mt-2 text-2xl font-bold text-slate-900">
                Университет Цифровых Технологий
              </h1>
              <p className="text-gray-600 text-sm">Личный кабинет студента и деканата</p>
            </div>
          </div>

          {/* Форма входа */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 mb-6">
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
                    className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
                    placeholder="Например: user"
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
                    className="pl-10 pr-10 w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
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
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition mb-3 flex items-center justify-center min-h-[44px] disabled:opacity-50"
              >
                {isLoading ? 'Вход...' : 'Войти'}
              </button>

              <button
                type="button"
                onClick={() => setShowFaceIdModal(true)}
                className="w-full py-2.5 px-4 rounded-xl border-2 border-blue-600 bg-blue-50/70 text-blue-700 font-semibold hover:bg-blue-100 transition flex items-center justify-center gap-2 min-h-[44px]"
              >
                <ScanFace className="h-5 w-5" />
                Войти по Face ID
              </button>
            </form>
          </div>

          {/* Информация */}
          <div className="text-center text-xs text-gray-600 bg-white/90 p-3 rounded-xl border border-gray-200">
            <p>Концептуальный прототип для студенческого конкурса. Не является официальным сервисом вуза.</p>
            <p>Все персональные данные вымышлены.</p>
          </div>
        </div>
      </div>

      {/* Face ID Modal */}
      <FaceIdModal
        isOpen={showFaceIdModal}
        onClose={() => setShowFaceIdModal(false)}
      />
    </div>
  );
}
