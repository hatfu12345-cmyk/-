'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ScanFace, CheckCircle2, X, User, ShieldCheck, Camera } from 'lucide-react';

interface FaceIdModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEMO_USERS = [
  {
    username: 'smirnov',
    name: 'Алексей Смирнов',
    role: 'Студент • 3 курс, ИВТ-31',
    badge: 'Отличник',
  },
  {
    username: 'volkova',
    name: 'Мария Волкова',
    role: 'Студент • 2 курс, ПМИ-22',
    badge: 'Долги и переносы',
  },
  {
    username: 'metodist',
    name: 'Елена Петрова',
    role: 'Сотрудник деканата',
    badge: 'Методист',
  },
  {
    username: 'korsakova',
    name: 'Корсакова Анастасия',
    role: 'Студент • 2 курс, ЦТ-21',
    badge: 'Личный Face ID',
  },
];

export function FaceIdModal({ isOpen, onClose }: FaceIdModalProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [step, setStep] = useState<'select' | 'scanning' | 'success' | 'register'>('select');
  const [selectedName, setSelectedName] = useState('');
  const [scanStatus, setScanStatus] = useState('Инициализация камеры...');
  const [hasCamera, setHasCamera] = useState(true);
  const [error, setError] = useState('');
  const [selectedUsername, setSelectedUsername] = useState('');

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setStep('select');
      setError('');
    }
    return () => stopCamera();
  }, [isOpen]);

  // 1. Получение слепка лица (матрица 24x24 пикселя из центра)
  const getFaceSignature = (): number[] | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Проверка, что видео загружено
    if (!ctx || video.videoWidth === 0 || video.readyState !== 4) return null;

    // Берем центральную область (40% от минимальной стороны)
    const size = Math.min(video.videoWidth, video.videoHeight) * 0.4;
    const startX = (video.videoWidth - size) / 2;
    const startY = (video.videoHeight - size) / 2;

    // Рисуем только эту область в canvas 24x24
    canvas.width = 24;
    canvas.height = 24;
    ctx.drawImage(video, startX, startY, size, size, 0, 0, 24, 24);

    const imageData = ctx.getImageData(0, 0, 24, 24);
    const data = imageData.data;
    const signature: number[] = [];

    // Собираем RGB-значения каждого пикселя
    for (let i = 0; i < data.length; i += 4) {
      signature.push(data[i], data[i + 1], data[i + 2]);
    }

    return signature;
  };

  // 2. Сравнение двух слепков
  const compareSignatures = (sig1: number[], sig2: number[]): boolean => {
    if (sig1.length !== sig2.length) return false;
    let totalDiff = 0;

    // Считаем среднее абсолютное отклонение по каждому каналу
    for (let i = 0; i < sig1.length; i++) {
      totalDiff += Math.abs(sig1[i] - sig2[i]);
    }

    const avgDiff = totalDiff / sig1.length;
    console.log('Среднее отклонение лица:', avgDiff.toFixed(2)); // Для отладки в консоли

    // Порог чувствительности (чем ниже, тем строже проверка)
    // 35-40 обычно хорошо работает при стабильном освещении
    return avgDiff < 35; 
  };

  // 3. Регистрация лица (сохранение эталона)
  const registerFace = () => {
    const signature = getFaceSignature();
    if (signature) {
      localStorage.setItem(`face_sig_${selectedUsername}`, JSON.stringify(signature));
      // Сразу логиним, так как лицо только что зафиксировано
      handleLogin(selectedUsername);
    } else {
      setError('Не удалось получить слепок лица. Убедитесь, что камера работает.');
    }
  };

  // 4. Проверка лица при входе
  const checkFaceMatch = () => {
    const currentSignature = getFaceSignature();
    if (!currentSignature) {
      setError('Камера не готова. Попробуйте снова.');
      setStep('select');
      stopCamera();
      return;
    }

    const storedSignatureStr = localStorage.getItem(`face_sig_${selectedUsername}`);
    
    if (!storedSignatureStr) {
      // Если эталона нет — переходим на экран регистрации
      setStep('register');
      setScanStatus('Зарегистрируйте своё лицо');
      return;
    }

    const storedSignature = JSON.parse(storedSignatureStr);

    // Имитация задержки для красивого UX
    setTimeout(() => {
      const isMatch = compareSignatures(currentSignature, storedSignature);
      
      if (isMatch) {
        handleLogin(selectedUsername);
      } else {
        setError('Лицо не совпадает с владельцем аккаунта. Попробуйте ещё раз.');
        setStep('select');
        stopCamera();
      }
    }, 1500);
  };

  if (!isOpen) return null;

  const handleSelectProfile = async (username: string, name: string) => {
    setSelectedUsername(username);
    setSelectedName(name);
    setError('');
    setStep('scanning');
    setHasCamera(true);
    setScanStatus('Инициализация камеры...');

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } else {
        setHasCamera(false);
      }
    } catch {
      setHasCamera(false);
      setScanStatus('Камера недоступна — эмуляция биометрии...');
    }

    if (username === 'korsakova') {
      // Даем 2.5 секунды, чтобы камера прогрелась и показала видео
      setTimeout(() => {
        checkFaceMatch();
      }, 2500);
    } else {
      // Для остальных пользователей (жюри) — быстрый демо-вход
      try {
        await new Promise((resolve) => setTimeout(resolve, 1100));
        setScanStatus('Проверка геометрии лица...');
        await new Promise((resolve) => setTimeout(resolve, 1100));

        const res = await fetch('/api/auth/demo-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Ошибка биометрического входа');
        }

        stopCamera();
        setStep('success');
        await new Promise((resolve) => setTimeout(resolve, 800));
        onClose();
        setStep('select');
        window.location.href = '/dashboard';
        router.refresh();
      } catch (err: any) {
        stopCamera();
        setError(err.message || 'Не удалось выполнить вход');
        setStep('select');
      }
    }
  };

  const handleLogin = async (username: string) => {
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Ошибка биометрического входа');
      }

      stopCamera();
      setStep('success');
      await new Promise((resolve) => setTimeout(resolve, 800));
      onClose();
      setStep('select');
      window.location.href = '/dashboard';
      router.refresh();
    } catch (err: any) {
      stopCamera();
      setError(err.message || 'Не удалось выполнить вход');
      setStep('select');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/75 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-blue-600 font-semibold">
            <ScanFace className="w-6 h-6" />
            <span>Биометрия УЦТ • Face ID</span>
          </div>
          <button
            onClick={() => {
              stopCamera();
              setStep('select');
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-100">
            {error}
          </div>
        )}

        {/* Скрытый Canvas для считывания пикселей */}
        <canvas ref={canvasRef} className="hidden" />

        {step === 'select' && (
          <div>
            <p className="text-sm text-slate-600 mb-4">
              Выберите профиль для сканирования лица через фронтальную камеру:
            </p>
            <div className="space-y-2.5">
              {DEMO_USERS.map((user) => (
                <button
                  key={user.username}
                  onClick={() => handleSelectProfile(user.username, user.name)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition text-left min-h-[56px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 text-sm">{user.name}</div>
                      <div className="text-xs text-slate-500">{user.role}</div>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {user.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Сканирование и Регистрация (общий экран с камерой) */}
        {(step === 'scanning' || step === 'register') && (
          <div className="py-4 flex flex-col items-center text-center">
            <div className={`relative w-48 h-60 rounded-[999px] overflow-hidden border-4 shadow-lg bg-slate-900 flex items-center justify-center mb-4 ${step === 'register' ? 'border-amber-500' : 'border-blue-500'}`}>
              {hasCamera ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="flex flex-col items-center text-blue-400">
                  <ScanFace className="w-16 h-16 animate-pulse" />
                </div>
              )}

              {/* Овальная рамка и биометрическая сетка */}
              <div className={`absolute inset-2 rounded-[999px] border-2 border-dashed pointer-events-none ${step === 'register' ? 'border-amber-400/80' : 'border-emerald-400/80'}`} />
              <div className={`absolute inset-x-0 top-1/2 h-0.5 shadow-[0_0_12px_#34d399] animate-bounce pointer-events-none ${step === 'register' ? 'bg-amber-400' : 'bg-emerald-400'}`} />

              {hasCamera && (
                <div className="absolute bottom-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/60 text-white text-[10px]">
                  <Camera className={`w-3 h-3 ${step === 'register' ? 'text-amber-400' : 'text-emerald-400'}`} />
                  <span>Камера активна</span>
                </div>
              )}
            </div>

            <div className="font-semibold text-slate-900">{scanStatus}</div>
            <div className="text-sm text-slate-500 mt-1 mb-4">{selectedName}</div>

            {/* Кнопка регистрации (появляется, если нет слепка) */}
            {step === 'register' && (
              <button
                onClick={registerFace}
                className="w-full mt-2 px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
              >
                {localStorage.getItem(`face_sig_${selectedUsername}`) 
                  ? 'Обновить слепок лица' 
                  : 'Зарегистрировать моё лицо'}
              </button>
            )}
          </div>
        )}

        {step === 'success' && (
          <div className="py-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-11 h-11" />
            </div>
            <div className="font-semibold text-emerald-700 text-lg">Личность подтверждена</div>
            <div className="text-sm text-slate-500 mt-1">Входим в личный кабинет...</div>
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
          <span>
            Видео с камеры обрабатывается локально в браузере и не передаётся на сервер. В боевой версии применяется WebAuthn / Passkeys.
          </span>
        </div>
      </div>
    </div>
  );
}

export default FaceIdModal;