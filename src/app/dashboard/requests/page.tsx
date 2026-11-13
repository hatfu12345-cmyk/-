'use client';

import React, { useEffect, useState } from 'react';
import {
  FileText,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Send,
  User,
  Paperclip,
} from 'lucide-react';

const REQUEST_TYPES = [
  { value: 'CERTIFICATE_STUDY', label: 'Справка об обучении' },
  { value: 'MILITARY_OFFICE', label: 'Справка для военкомата (риложение 4)' },
  { value: 'TUITION_RECEIPT', label: 'Составление квитанции на оплату обучения' },
  { value: 'FINANCIAL_AID', label: 'Заявление на материальную помощь' },
];

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [role, setRole] = useState('STUDENT');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const [newType, setNewType] = useState('CERTIFICATE_STUDY');
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyStatus, setReplyStatus] = useState('APPROVED');
  const [replyComment, setReplyComment] = useState('');
  const [replyFileName, setReplyFileName] = useState('');
  const [replyFileData, setReplyFileData] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const meRes = await fetch('/api/dashboard');
      if (meRes.ok) {
        const meData = await meRes.json();
        setRole(meData.user?.role || meData.role || 'STUDENT');
      }
      const reqRes = await fetch('/api/requests');
      if (reqRes.ok) {
        const data = await reqRes.json();
        setRequests(Array.isArray(data) ? data : data.requests || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: newType, comment: newComment }),
      });
      if (res.ok) {
        setNewComment('');
        await loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files.item(0);
    if (!file) return;
    setReplyFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setReplyFileData(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleStaffDecision = async (id) => {
    try {
      await fetch(`/api/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: replyStatus,
          staffComment: replyComment,
          attachmentName: replyFileName,
          attachmentData: replyFileData,
        }),
      });
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: replyStatus,
                staffComment: replyComment || r.staffComment,
                attachmentName: replyFileName || r.attachmentName,
                attachmentData: replyFileData || r.attachmentData,
              }
            : r
        )
      );
      setActiveReplyId(null);
      setReplyComment('');
      setReplyFileName('');
      setReplyFileData('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = (base64Data, fileName) => {
    const link = document.createElement('a');
    link.href = base64Data;
    link.download = fileName || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTypeLabel = (type) => {
    const found = REQUEST_TYPES.find((t) => t.value === type);
    return found ? found.label : type;
  };

  const getStatusBadge = (status) => {
    const up = String(status || '').toUpperCase();
    if (up === 'APPROVED' || up === 'READY' || up === 'DONE') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="w-3.5 h-3.5" /> Принято / Готово
        </span>
      );
    }
    if (up === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          <XCircle className="w-3.5 h-3.5" /> Отклонено
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
        <Clock className="w-3.5 h-3.5" /> На рассмотрении
      </span>
    );
  };

  const isStaff = role === 'STAFF' || role === 'EMPLOYEE';;
  const filteredRequests = requests.filter((r) => {
    const up = String(r.status || '').toUpperCase();
    if (filter === 'APPROVED') return up === 'APPROVED' || up === 'READY';
    if (filter === 'REJECTED') return up === 'REJECTED';
    if (filter === 'PENDING') return up !== 'APPROVED' && up !== 'READY' && up !== 'REJECTED';
    return true;
  });
  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 sm:pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          {isStaff ? 'Ответ на заявки студентов' : 'Заявки, справки и квитанции'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {isStaff
            ? 'Рассмотрение обращений студентов, отправка комментариев и готовых документов'
            : 'Заказ справок из деканата и составление квитанции на оплату обучения онлайн'}
        </p>
      </div>

      {!isStaff && (
        <form onSubmit={handleCreateRequest} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm mb-6">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" /> Новая заявка в деканат
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Тип документа</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 min-h-[44px]"
              >
                {REQUEST_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Комментарий</label>
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Например: за осенний семестр 2026 года"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 min-h-[44px]"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 min-h-[44px]"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Отправка...' : 'Отправить заявку'}
          </button>
        </form>
      )}

      {isStaff && (
        <div className="flex flex-wrap gap-2 mb-5">
          {[
            { id: 'ALL', label: 'Все заявки' },
            { id: 'PENDING', label: 'Новые /   В работе' },
            { id: 'APPROVED', label: 'Принятые' },
            { id: 'REJECTED', label: 'Отклонённые' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium min-h-[40px] ${
                filter === tab.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          <div className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <FileText className="w-9 h-9 text-slate-300 mx-auto mb-2" />
          <h3 className="font-semibold text-slate-900">Заявок пока нет</h3>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredRequests.map((req) => (
            <div key={req.id} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{getTypeLabel(req.type)}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                      <User className="w-3.5 h-3.5" />
                      {req.user?.name || 'Студент'} {req.user?.group ? `(${req.user.group})` : ''}
                    </span>
                    <span>•</span>
                    <span>{new Date(req.createdAt).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
                {getStatusBadge(req.status)}
              </div>

              {req.comment && (
                <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 mt-2">
                  Комментарий студента: {req.comment}
                </p>
              )}

              {(req.staffComment || req.attachmentName) && (
                <div className="mt-3 p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-sm">
                  <div className="font-semibold text-blue-900 mb-1">Ответ деканата:</div>
                  {req.staffComment && <p className="text-slate-700 mb-2">{req.staffComment}</p>}
                  {req.attachmentName && (
                    <button
                      type="button"
                      onClick={() => handleDownload(req.attachmentData || '', req.attachmentName || 'document')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-700 text-xs font-medium"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Скачать: {req.attachmentName}
                    </button>
                  )}
                </div>
              )}

              {isStaff && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  {activeReplyId === req.id ? (
                    <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-800">
                          {replyStatus === 'APPROVED' ? 'Подтверждение и отправка файла' : 'Отклонение заявки'}
                        </span>
                        <button type="button" onClick={() => setActiveReplyId(null)} className="text-xs text-slate-500">
                          Отмена
                        </button>
                      </div>
                      <input
                        type="text"
                        value={replyComment}
                        onChange={(e) => setReplyComment(e.target.value)}
                        placeholder={replyStatus === 'APPROVED' ? 'Комментарий к справке / квитанции' : 'Причина отклонения'}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                      />
                      {replyStatus === 'APPROVED' && (
                        <div>
                          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-blue-400 bg-white text-xs font-medium text-blue-700 cursor-pointer">
                            <Paperclip className="w-4 h-4" />
                            <span>{replyFileName || 'Прикрепить фото справки / квитанции'}</span>
                            <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
                          </label>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleStaffDecision(req.id)}
                        className={`px-4 py-2 rounded-xl text-white text-sm font-medium ${
                          replyStatus === 'APPROVED' ? 'bg-emerald-600' : 'bg-red-600'
                        }`}
                      >
                        {replyStatus === 'APPROVED' ? 'Подтвердить и отправить' : 'Отклонить заявку'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveReplyId(req.id);
                          setReplyStatus('APPROVED');
                          setReplyComment('');
                          setReplyFileName('');
                          setReplyFileData('');
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-medium min-h-[40px]"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Принять
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveReplyId(req.id);
                          setReplyStatus('REJECTED');
                          setReplyComment('');
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs sm:text-sm font-medium min-h-[40px]"
                      >
                        <XCircle className="w-4 h-4" /> Отклонить
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
