
'use client';

import { useState } from 'react';
import { Face, X, CheckCircle } from 'lucide-react';

interface FaceIdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (username: string) => void;
}

export default function FaceIdModal({ isOpen, onClose, onSelectAccount }: FaceIdModalProps) {
  const [scanning, setScanning] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const accounts = [
    { username: 'smirnov', name: 'Алексей Смирнов' },
    { username: 'volkova', name: 'Мария Волкова' },
    { username: 'metodist', name: 'Елена Петрова' },
  ];

  const handleFaceScan = () => {
    setScanning(true);
    setIsComplete(false);
    
    // Симуляция сканирования
    setTimeout(() => {
      setIsComplete(true);
      
      // Симуляция завершения
      setTimeout(() => {
        if (selectedAccount) {
          onSelectAccount(selectedAccount);
        }
        onClose();
        setScanning(false);
        setIsComplete(false);
      }, 1000);
    }, 1500);
  };

  const handleAccountSelect = (username: string) => {
    setSelectedAccount(username);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
        >
          <X size={20} className="text-gray-500" />
        </button>

        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-primary bg-opacity-10 p-3 rounded-full">
              <Face size={24} className="text-primary" />
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2">Вход по Face ID</h2>
          <p className="text-gray-600 text-sm">
            Демонстрация концепции биометрического входа. В боевой версии реализуется через WebAuthn / Passkeys
          </p>
        </div>

        {!scanning && (
          <div className="mb-6">
            <h3 className="font-medium mb-3">Выберите аккаунт:</h3>
            <div className="space-y-2">
              {accounts.map((account) => (
                <button
                  key={account.username}
                  onClick={() => handleAccountSelect(account.username)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedAccount === account.username ? 'border-primary bg-primary bg-opacity-5' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <div className="font-medium">{account.name}</div>
                  <div className="text-sm text-gray-500">@{account.username}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center">
          {scanning && (
            <div className="relative w-64 h-64 border-2 border-primary rounded-xl flex items-center justify-center overflow-hidden">
              {isComplete ? (
                <div className="text-center">
                  <CheckCircle size={48} className="text-success mx-auto mb-2" />
                  <p className="font-medium">Личность подтверждена</p>
                </div>
              ) : (
                <>
                  <div className="absolute top-0 left-0 right-0 h-1 bg-primary animate-scan-line"></div>
                  <div className="w-48 h-48 border-2 border-primary border-dashed rounded-lg flex items-center justify-center">
                    <div className="text-center p-4">
                      <div className="text-sm text-gray-600 mb-1">Сканирование лица...</div>
                      <div className="text-xs text-gray-500">Пожалуйста, смотрите в камеру</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {scanning && (
          <button
            onClick={handleFaceScan}
            className="w-full btn-primary mt-6 disabled:opacity-70"
            disabled={isComplete}
          >
            {isComplete ? 'Завершение...' : 'Начать сканирование'}
          </button>
        )}

        {!scanning && (
          <button
            onClick={handleFaceScan}
            disabled={!selectedAccount}
            className="w-full btn-primary mt-6 disabled:opacity-70"
          >
            Подтвердить вход
          </button>
        )}
      </div>
    </div>
  );
}
