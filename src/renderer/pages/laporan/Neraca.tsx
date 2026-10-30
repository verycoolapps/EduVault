import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';

const api = () => (window as any).api;
const fmt = (n: number) => 'Rp ' + (n || 0).toLocaleString('id-ID');

export function Neraca() {
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [year, setYear] = useState(new Date().getFullYear());

  const load = () => api().reports.balanceSheet({ year }).then(setData);
  useEffect(() => { load(); }, [year]);

  const Section = ({ title, rows, total, colorClass }: any) => (
    <div>
      <div className={`font-bold text-sm uppercase tracking-wide mb-3 ${colorClass}`}>{title}</div>
      {rows?.map((r: any, i: number) => (
        <div key={i} className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700/50 text-sm">
          <span className="text-slate-600 dark:text-slate-300">{r.code} — {r.name}</span>
          <span className="font-medium text-slate-800 dark:text-white">{fmt(r.balance)}</span>
        </div>
      ))}
      <div className={`flex justify-between py-2 mt-1 font-bold text-sm rounded-lg px-2 ${colorClass.includes('emerald') ? 'bg-emerald-50 dark:bg-emerald-900/20' : colorClass.includes('red') ? 'bg-red-50 dark:bg-red-900/20' : 'bg-indigo-50 dark:bg-indigo-900/20'}`}>
        <span>Total {title}</span>
        <span>{fmt(total)}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-slate-800 dark:text-white">{t('nav.balanceSheet')}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Per 31 Desember {year}</p>
          </div>
          <div className="flex gap-3">
            <select value={year} onChange={e => setYear(Number(e.target.value))} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {[year - 1, year, year + 1].map(y => <option key={y}>{y}</option>)}
            </select>
            <Button size="sm" onClick={load}>{t('reports.filter')}</Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AKTIVA */}
        <Card>
          <Section title="Aktiva" rows={data?.assets} total={data?.totalAssets || 0} colorClass="text-emerald-600 dark:text-emerald-400" />
        </Card>

        {/* KEWAJIBAN + EKUITAS */}
        <Card>
          <div className="space-y-6">
            <Section title="Kewajiban" rows={data?.liabilities} total={data?.totalLiabilities || 0} colorClass="text-red-600 dark:text-red-400" />
            <Section title="Ekuitas" rows={data?.equity} total={data?.totalEquity || 0} colorClass="text-indigo-600 dark:text-indigo-400" />
            <div className={`flex justify-between py-3 px-3 rounded-xl font-extrabold text-sm ${Math.abs((data?.totalAssets || 0) - (data?.totalLiabilities || 0) - (data?.totalEquity || 0)) < 1 ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
              <span>Total Kewajiban + Ekuitas</span>
              <span>{fmt((data?.totalLiabilities || 0) + (data?.totalEquity || 0))}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">Total Aktiva</div>
            <div className="text-2xl font-extrabold text-emerald-600">{fmt(data?.totalAssets || 0)}</div>
          </div>
          <div className="text-4xl text-slate-300 dark:text-slate-600">=</div>
          <div className="text-right">
            <div className="text-sm text-slate-500">Total Kewajiban + Ekuitas</div>
            <div className="text-2xl font-extrabold text-indigo-600">{fmt((data?.totalLiabilities || 0) + (data?.totalEquity || 0))}</div>
          </div>
          <div className={`px-4 py-2 rounded-xl font-bold text-sm ${Math.abs((data?.totalAssets || 0) - (data?.totalLiabilities || 0) - (data?.totalEquity || 0)) < 1 ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'}`}>
            {Math.abs((data?.totalAssets || 0) - (data?.totalLiabilities || 0) - (data?.totalEquity || 0)) < 1 ? '✓ Balance' : '⚠ Tidak Balance'}
          </div>
        </div>
      </Card>
    </div>
  );
}
