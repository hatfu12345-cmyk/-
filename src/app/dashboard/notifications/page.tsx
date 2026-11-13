'use client';

import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2, AlertCircle, Info, Calendar, FileText, Check } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type?: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : data.notifications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const markOneRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const getIcon = (type?: string) => {
    switch (type) {
      case 'SCHEDULE':
        return <Calendar className="w-5 h-5 text-amber-600" />;
      case 'REQUEST':
        return <FileText className="w-5 h-5 text-emerald-600" />;
      case 'WARNING':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const filtered =
    filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto p-4 pb-24 sm:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            Уведомления
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Важные объявления деканата, статусы справок и переносы занятий
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-medium transition min-h-[44px]"
          >
            <Check className="w-4 h-4" />
            Прочитать все ({unreadCount})
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition min-h-[44px] ${
            filter === 'all'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Все ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition min-h-[44px] ${
            filter === 'unread'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Непрочитанные ({unreadCount})
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="font-semibold text-slate-900">Уведомлений нет</h3>
          <p className="text-sm text-slate-500 mt-1">
            {filter === 'unread'
              ? 'Вы прочитали все входящие сообщения.'
              : 'Здесь появятся новости деканата и статусы ваших справок.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => !item.isRead && markOneRead(item.id)}
              className={`p-4 rounded-2xl border transition cursor-pointer ${
                item.isRead
                  ? 'bg-white border-slate-200'
                  : 'bg-blue-50/60 border-blue-200 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-white border border-slate-100 shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
                      {item.title}
                    </h3>
                    {!item.isRead && (
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    {item.message}
                  </p>
                  <div className="text-xs text-slate-400 mt-2">
                    {new Date(item.createdAt).toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
