import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';

const api = () => (window as any).api;
const fmt = (n: number) => n ? 'Rp ' + n.toLocaleString('id-ID') : '-';

export function NeracaSaldo() {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());

  const load = () => api().reports.trialBalance({ year }).then(setData);
  useEffect(() => { load(); }, [year]);

  const totalDebit = data.reduce((s, r) => s + (r.debit || 0), 0);
  const totalCredit = data.reduce((s, r) => s + (r.credit || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 1;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-bold text-slate-800 dark:text-white">{t('nav.trialBalance')}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Per 31 Desember {year}</p>
          </div>
          <div className="flex gap-3 items-center">
            <select value={year} onChange={e => setYear(Number(e.target.value))} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {[year - 1, year, year + 1].map(y => <option key={y}>{y}</option>)}
            </select>
            <Button size="sm" onClick={load}>{t('reports.filter')}</Button>
            {isBalanced
              ? <span className="px-3 py-1.5 text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-lg font-medium">✓ Balance</span>
              : <span className="px-3 py-1.5 text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-lg font-medium">⚠ Tidak Balance</span>
            }
          </div>
        </div>
      </Card>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Kode Akun</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Akun</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipe</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Debet (Rp)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Kredit (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {data.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">{t('common.noData')}</td></tr>
              ) : data.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20">
                  <td className="px-4 py-2.5 font-mono text-slate-500 dark:text-slate-400">{row.code}</td>
                  <td className="px-4 py-2.5 text-slate-700 dark:text-slate-200 font-medium">{row.name}</td>
                  <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{row.type}</td>
                  <td className="px-4 py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-medium">{fmt(row.debit)}</td>
                  <td className="px-4 py-2.5 text-right text-red-500 dark:text-red-400 font-medium">{fmt(row.credit)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 dark:bg-slate-800 border-t-2 border-slate-300 dark:border-slate-600">
                <td colSpan={3} className="px-4 py-3 font-bold text-slate-700 dark:text-slate-200">TOTAL</td>
                <td className="px-4 py-3 text-right font-extrabold text-emerald-700 dark:text-emerald-300">Rp {totalDebit.toLocaleString('id-ID')}</td>
                <td className="px-4 py-3 text-right font-extrabold text-red-600 dark:text-red-400">Rp {totalCredit.toLocaleString('id-ID')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}
