import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';

const api = () => (window as any).api;
const fmt = (n: number) => 'Rp ' + (n || 0).toLocaleString('id-ID');

export function LabaRugi() {
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [year, setYear] = useState(new Date().getFullYear());

  const load = () => api().reports.profitLoss({ year }).then(setData);
  useEffect(() => { load(); }, [year]);

  if (!data) return <div className="text-slate-400 text-center py-20">{t('common.loading')}</div>;

  const isProfit = data.netProfit >= 0;

  return (
    <Card>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="font-bold text-slate-800 dark:text-white text-lg">{t('nav.profitLoss')} {year}</h2>
        <div className="flex gap-3">
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {[year - 1, year, year + 1].map(y => <option key={y}>{y}</option>)}
          </select>
          <Button size="sm" onClick={load}>{t('reports.filter')}</Button>
        </div>
      </div>
      <div className="space-y-4 max-w-lg mx-auto">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
          <h3 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-3 text-sm uppercase tracking-wide">{t('reports.totalIncome')}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">Penerimaan SPP</span><span>{fmt(data.sppInc)}</span></div>
            <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">Uang Gedung & Pangkal</span><span>{fmt(data.bfInc)}</span></div>
            <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">Penerimaan Lain-lain</span><span>{fmt(data.otherInc)}</span></div>
            <div className="flex justify-between font-bold border-t dark:border-emerald-800 pt-2 text-emerald-700 dark:text-emerald-300"><span>Total Penerimaan</span><span>{fmt(data.totalIncome)}</span></div>
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
          <h3 className="font-semibold text-red-800 dark:text-red-300 mb-3 text-sm uppercase tracking-wide">{t('reports.totalExpense')}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">Gaji Karyawan</span><span>{fmt(data.salExp)}</span></div>
            <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">Pengadaan</span><span>{fmt(data.procExp)}</span></div>
            <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">Pengeluaran Rutin</span><span>{fmt(data.routExp)}</span></div>
            <div className="flex justify-between font-bold border-t dark:border-red-900 pt-2 text-red-700 dark:text-red-300"><span>Total Pengeluaran</span><span>{fmt(data.totalExpense)}</span></div>
          </div>
        </div>
        <div className={`rounded-xl p-5 text-center ${isProfit ? 'bg-emerald-600' : 'bg-red-600'}`}>
          <div className="text-sm font-medium text-white/80 mb-1">{t('reports.netProfit')}</div>
          <div className="text-3xl font-extrabold text-white">{fmt(Math.abs(data.netProfit))}</div>
          <div className="text-sm text-white/70 mt-1">{isProfit ? '✅ Laba' : '❌ Rugi'}</div>
        </div>
      </div>
    </Card>
  );
}
