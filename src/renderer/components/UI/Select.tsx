import React from 'react';

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
}

export function Select({ label, options, error, className = '', ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">{label}</label>}
      <select
        className={`w-full px-3 py-2.5 text-sm rounded-xl border transition-colors bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
          ${error
            ? 'border-red-400 focus:ring-red-400'
            : 'border-slate-200 dark:border-slate-600 focus:ring-indigo-500'
          }
          focus:outline-none focus:ring-2 focus:border-transparent ${className}`}
        {...props}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
