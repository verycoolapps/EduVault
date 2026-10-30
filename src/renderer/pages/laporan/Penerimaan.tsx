import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table } from '../../components/UI/Table';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';

const api = () => (window as any).api;
const fmt = (n: number) => 'Rp ' + (n || 0).toLocaleString('id-ID');

export function LaporanPenerimaan() {
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(0);
  const months = t('spp.months', { returnObjects: true }) as string[];

  const load = () => api().reports.income({ year, month: month || undefined }).then(setData);
  useEffect(() => { load(); }, [year, month]);

  const totalSpp = data?.spp?.reduce((s: number, r: any) => s + r.amount, 0) || 0;
  const totalBf = data?.buildingFee?.reduce((s: number, r: any) => s + r.amount, 0) || 0;
  const totalOther = data?.other?.reduce((s: number, r: any) => s + r.amount, 0) || 0;
  const grandTotal = totalSpp + totalBf + totalOther;

  const sppCols = [
    { key: 'nis', header: 'NIS' },
    { key: 'student_name', header: t('spp.student') },
    { key: 'class', header: t('spp.class') },
    { key: 'month', header: t('spp.month'), render: (r: any) => months[r.month - 1] },
    { key: 'amount', header: t('spp.amount'), render: (r: any) => <span className="text-emerald-600 font-semibold">{fmt(r.amount)}</span> },
    { key: 'payment_method', header: t('spp.paymentMethod') },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="font-bold text-slate-800 dark:text-white">{t('nav.incomeReport')}</h2>
          <div className="flex gap-3">
            <select value={year} onChange={e => setYear(Number(e.target.value))} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {[year - 1, year, year + 1].map(y => <option key={y}>{y}</option>)}
            </select>
            <select value={month} onChange={e => setMonth(Number(e.target.value))} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value={0}>{t('reports.allMonths')}</option>
              {months.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
            <Button size="sm" onClick={load}>{t('reports.filter')}</Button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 text-center">
            <div className="text-xs text-emerald-600 mb-1">SPP</div>
            <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{fmt(totalSpp)}</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
            <div className="text-xs text-blue-600 mb-1">Uang Gedung & Pangkal</div>
            <div className="text-xl font-bold text-blue-700 dark:text-blue-300">{fmt(totalBf)}</div>
          </div>
          <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-4 text-center">
            <div className="text-xs text-violet-600 mb-1">Lain-lain</div>
            <div className="text-xl font-bold text-violet-700 dark:text-violet-300">{fmt(totalOther)}</div>
          </div>
        </div>
        <div className="mt-4 p-4 bg-indigo-600 rounded-xl flex justify-between items-center">
          <span className="text-white font-semibold">{t('reports.totalIncome')}</span>
          <span className="text-2xl font-extrabold text-white">{fmt(grandTotal)}</span>
        </div>
      </Card>
      <Card padding={false}>
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 font-semibold text-sm text-slate-800 dark:text-white">Rincian SPP ({data?.spp?.length || 0} transaksi)</div>
        <div className="p-4"><Table columns={sppCols} data={data?.spp || []} emptyText={t('common.noData')} /></div>
      </Card>
    </div>
  );
}
