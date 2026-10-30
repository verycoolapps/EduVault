import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, StatCard } from '../components/UI/Card';
import { BarChart } from '../components/Charts/BarChart';

const api = () => (window as any).api;
const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

export function Dashboard() {
  const { t } = useTranslation();
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    api().dashboard.getSummary().then(setSummary);
  }, []);

  if (!summary) {
    return <div className="flex items-center justify-center h-64 text-slate-400">{t('common.loading')}</div>;
  }

  const monthLabels = (t('dashboard.months', { returnObjects: true }) as string[]);
  const incomeData = summary.monthlyTrend.map((m: any) => m.income);
  const expenseData = summary.monthlyTrend.map((m: any) => m.expense);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('dashboard.totalStudents')}
          value={summary.totalStudents}
          icon="🎓"
          color="indigo"
        />
        <StatCard
          label={t('dashboard.totalEmployees')}
          value={summary.totalEmployees}
          icon="👥"
          color="violet"
        />
        <StatCard
          label={t('dashboard.monthlyIncome')}
          value={fmt(summary.monthlyIncome)}
          icon="💰"
          color="emerald"
        />
        <StatCard
          label={t('dashboard.monthlyExpense')}
          value={fmt(summary.monthlyExpense)}
          icon="💸"
          color="red"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" padding={false}>
          <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 dark:text-white text-sm">{t('dashboard.chartTitle')}</h2>
            <span className="text-xs text-slate-400">{new Date().getFullYear()}</span>
          </div>
          <div className="p-5 h-64">
            <BarChart
              labels={monthLabels}
              incomeData={incomeData}
              expenseData={expenseData}
              incomeLabel={t('dashboard.income')}
              expenseLabel={t('dashboard.expense')}
            />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 dark:text-white text-sm">Status SPP</h2>
          </div>
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <div className="text-4xl font-extrabold text-amber-500">{summary.sppArrears}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.students')} {t('dashboard.sppArrears').toLowerCase()}</div>
          </div>
        </Card>
      </div>
      <Card padding={false}>
        <div className="p-5 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-800 dark:text-white text-sm">{t('dashboard.recentTransactions')}</h2>
        </div>
        <div className="divide-y divide-slate-50 dark:divide-slate-700">
          {summary.recentTransactions.length === 0 ? (
            <div className="px-5 py-8 text-center text-slate-400 text-sm">{t('common.noData')}</div>
          ) : summary.recentTransactions.map((tx: any) => (
            <div key={tx.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
              <div>
                <div className="text-sm font-medium text-slate-800 dark:text-white">{tx.student_name}</div>
                <div className="text-xs text-slate-400">SPP — {tx.class} — {tx.month}/{tx.year}</div>
              </div>
              <div className="text-sm font-semibold text-emerald-600">{fmt(tx.amount)}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
