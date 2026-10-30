import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useApp } from '../../contexts/AppContext';

interface Props {
  currentPage: string;
  pageTitle: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export function Layout({ currentPage, pageTitle, onNavigate, onLogout, children }: Props) {
  const { toasts, removeToast } = useApp();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 font-sans">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={pageTitle} onLogout={onLogout} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-[100]">
        {toasts.map(t => (
          <div
            key={t.id}
            onClick={() => removeToast(t.id)}
            className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium cursor-pointer transition-all animate-in slide-in-from-right-5 ${t.type === 'success' ? 'bg-emerald-600 text-white' : t.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-800 text-white'}`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
