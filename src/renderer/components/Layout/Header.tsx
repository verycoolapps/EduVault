import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../UI/Button';

interface Props {
  title: string;
  onLogout: () => void;
}

export function Header({ title, onLogout }: Props) {
  const { i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useApp();

  const toggleLang = () => {
    const newLang = i18n.language === 'id' ? 'en' : 'id';
    i18n.changeLanguage(newLang);
    localStorage.setItem('eduvault_lang', newLang);
  };

  return (
    <header className="h-14 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center px-5 gap-4 flex-shrink-0">
      <h1 className="flex-1 font-semibold text-slate-800 dark:text-white text-base truncate">{title}</h1>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleLang}
          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
        >
          {i18n.language === 'id' ? 'EN' : 'ID'}
        </button>
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
          title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-700">
          <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            {user?.username?.[0]?.toUpperCase() || 'A'}
          </div>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{user?.username || 'Admin'}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onLogout}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </Button>
      </div>
    </header>
  );
}
