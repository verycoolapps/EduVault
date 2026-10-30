import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

type Page = string;

interface Props {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

interface NavItem {
  key: string;
  icon: string;
  labelKey: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { key: 'dashboard', icon: '📊', labelKey: 'nav.dashboard' },
  {
    key: 'master', icon: '🗄️', labelKey: 'nav.masterData', children: [
      { key: 'students', icon: '🎓', labelKey: 'nav.students' },
      { key: 'accounts', icon: '📋', labelKey: 'nav.accounts' },
      { key: 'employees', icon: '👥', labelKey: 'nav.employees' },
    ],
  },
  {
    key: 'income', icon: '💰', labelKey: 'nav.income', children: [
      { key: 'spp', icon: '📝', labelKey: 'nav.spp' },
      { key: 'buildingFee', icon: '🏫', labelKey: 'nav.buildingFee' },
      { key: 'otherIncome', icon: '💵', labelKey: 'nav.otherIncome' },
    ],
  },
  {
    key: 'expense', icon: '💸', labelKey: 'nav.expense', children: [
      { key: 'salary', icon: '💼', labelKey: 'nav.salary' },
      { key: 'discount', icon: '🏷️', labelKey: 'nav.discount' },
      { key: 'procurement', icon: '🛒', labelKey: 'nav.procurement' },
      { key: 'routineExpense', icon: '🔄', labelKey: 'nav.routineExpense' },
    ],
  },
  {
    key: 'reports', icon: '📈', labelKey: 'nav.reports', children: [
      { key: 'incomeReport', icon: '📥', labelKey: 'nav.incomeReport' },
      { key: 'expenseReport', icon: '📤', labelKey: 'nav.expenseReport' },
      { key: 'generalLedger', icon: '📚', labelKey: 'nav.generalLedger' },
      { key: 'trialBalance', icon: '⚖️', labelKey: 'nav.trialBalance' },
      { key: 'profitLoss', icon: '📉', labelKey: 'nav.profitLoss' },
      { key: 'balanceSheet', icon: '🏦', labelKey: 'nav.balanceSheet' },
      { key: 'cashFlow', icon: '💧', labelKey: 'nav.cashFlow' },
    ],
  },
  { key: 'settings', icon: '⚙️', labelKey: 'nav.settings' },
];

function isChildActive(item: NavItem, current: Page): boolean {
  if (item.key === current) return true;
  return item.children?.some(c => c.key === current) ?? false;
}

export function Sidebar({ currentPage, onNavigate }: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const init = new Set<string>();
    for (const item of navItems) {
      if (item.children?.some(c => c.key === currentPage)) init.add(item.key);
    }
    return init;
  });

  const toggle = (key: string) => setExpanded(prev => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });

  const renderItem = (item: NavItem, level = 0) => {
    const isActive = item.key === currentPage;
    const hasChildren = !!item.children;
    const isExpanded = expanded.has(item.key);
    const isParentActive = hasChildren && isChildActive(item, currentPage);

    return (
      <div key={item.key}>
        <button
          onClick={() => {
            if (hasChildren) toggle(item.key);
            else onNavigate(item.key);
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${level > 0 ? 'ml-4' : ''} ${isActive
            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
            : isParentActive
              ? 'text-indigo-300 bg-white/10'
              : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
        >
          <span className="text-base leading-none">{item.icon}</span>
          <span className="flex-1 truncate">{t(item.labelKey)}</span>
          {hasChildren && (
            <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-0.5">
            {item.children!.map(c => renderItem(c, 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-60 bg-[#1E1B4B] flex flex-col h-full flex-shrink-0">
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-900/50">E</div>
          <div>
            <div className="text-white font-bold text-base leading-tight">EduVault</div>
            <div className="text-indigo-300 text-xs leading-tight">v2.0</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => renderItem(item))}
      </nav>
      <div className="p-3 border-t border-white/10">
        <div className="text-xs text-slate-500 text-center">EduVault © 2025</div>
      </div>
    </div>
  );
}
