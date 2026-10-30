import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table } from '../../components/UI/Table';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';

const api = () => (window as any).api;
const fmt = (n: number) => 'Rp ' + (n || 0).toLocaleString('id-ID');

export function LaporanPengeluaran() {
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(0);
  const months = t('spp.months', { returnObjects: true }) as string[];

  const load = () => api().reports.expense({ year, month: month || undefined }).then(setData);
  useEffect(() => { load(); }, [year, month]);

  const totalSalary = data?.salary?.reduce((s: number, r: any) => s + r.net_salary, 0) || 0;
  const totalProcurement = data?.procurement?.reduce((s: number, r: any) => s + r.amount, 0) || 0;
  const totalRoutine = data?.routine?.reduce((s: number, r: any) => s + r.amount, 0) || 0;
  const grandTotal = totalSalary + totalProcurement + totalRoutine;

  const salaryCols = [
    { key: 'employee_name', header: t('employees.name') },
    { key: 'month', header: t('salary.month'), render: (r: any) => months[r.month - 1] },
    { key: 'base_salary', header: t('salary.baseSalary'), render: (r: any) => fmt(r.base_salary) },
    { key: 'net_salary', header: t('salary.netSalary'), render: (r: any) => <span className="text-red-600 font-semibold">{fmt(r.net_salary)}</span> },
  ];

  const procurementCols = [
    { key: 'vendor', header: t('procurement.vendor') },
    { key: 'items', header: t('procurement.items') },
    { key: 'date', header: t('procurement.date') },
    { key: 'amount', header: t('procurement.amount'), render: (r: any) => <span className="text-red-600 font-semibold">{fmt(r.amount)}</span> },
  ];

  const routineCols = [
    { key: 'category', header: t('routineExpense.category') },
    { key: 'description', header: t('routineExpense.description') },
    { key: 'date', header: t('routineExpense.date') },
    { key: 'amount', header: t('routineExpense.amount'), render: (r: any) => <span className="text-red-600 font-semibold">{fmt(r.amount)}</span> },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="font-bold text-slate-800 dark:text-white">{t('nav.expenseReport')}</h2>
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
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center">
            <div className="text-xs text-red-600 mb-1">{t('nav.salary')}</div>
            <div className="text-xl font-bold text-red-700 dark:text-red-300">{fmt(totalSalary)}</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 text-center">
            <div className="text-xs text-orange-600 mb-1">{t('nav.procurement')}</div>
            <div className="text-xl font-bold text-orange-700 dark:text-orange-300">{fmt(totalProcurement)}</div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 text-center">
            <div className="text-xs text-amber-600 mb-1">{t('nav.routineExpense')}</div>
            <div className="text-xl font-bold text-amber-700 dark:text-amber-300">{fmt(totalRoutine)}</div>
          </div>
        </div>
        <div className="mt-4 p-4 bg-red-600 rounded-xl flex justify-between items-center">
          <span className="text-white font-semibold">{t('reports.totalExpense')}</span>
          <span className="text-2xl font-extrabold text-white">{fmt(grandTotal)}</span>
        </div>
      </Card>
      <Card padding={false}>
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 font-semibold text-sm text-slate-800 dark:text-white">Pengeluaran Gaji ({data?.salary?.length || 0})</div>
        <div className="p-4"><Table columns={salaryCols} data={data?.salary || []} emptyText={t('common.noData')} /></div>
      </Card>
      <Card padding={false}>
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 font-semibold text-sm text-slate-800 dark:text-white">Pengadaan ({data?.procurement?.length || 0})</div>
        <div className="p-4"><Table columns={procurementCols} data={data?.procurement || []} emptyText={t('common.noData')} /></div>
      </Card>
      <Card padding={false}>
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 font-semibold text-sm text-slate-800 dark:text-white">Pengeluaran Rutin ({data?.routine?.length || 0})</div>
        <div className="p-4"><Table columns={routineCols} data={data?.routine || []} emptyText={t('common.noData')} /></div>
      </Card>
    </div>
  );
}
