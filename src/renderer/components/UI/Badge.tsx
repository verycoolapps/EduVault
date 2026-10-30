import React from 'react';

type Color = 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'indigo';

const colorMap: Record<Color, string> = {
  green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  red: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  yellow: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  gray: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
  indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
};

export function Badge({ children, color = 'gray' }: { children: React.ReactNode; color?: Color }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorMap[color]}`}>
      {children}
    </span>
  );
}
