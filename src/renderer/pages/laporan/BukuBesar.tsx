import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';

const api = () => (window as any).api;
const fmt = (n: number) => n ? 'Rp ' + n.toLocaleString('id-ID') : '-';

export function BukuBesar() {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    api().accounts.getAll().then((a: any[]) => {
      setAccounts(a);
      if (a.length > 0) setSelectedAccount(String(a[0].id));
    });
  }, []);

  const load = () => {
    if (!selectedAccount) return;
    api().reports.generalLedger({ accountId: Number(selectedAccount), year }).then(setData);
  };

  useEffect(() => { if (selectedAccount) load(); }, [selectedAccount, year]);

  const acc = accounts.find(a => String(a.id) === selectedAccount);
  let runningBalance = 0;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <h2 className="font-bold text-slate-800 dark:text-white">{t('nav.generalLedger')}</h2>
          <div className="flex gap-3">
            <select value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-48">
              {accounts.map(a => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
            </select>
            <select value={year} onChange={e => setYear(Number(e.target.value))} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {[year - 1, year, year + 1].map(y => <option key={y}>{y}</option>)}
            </select>
            <Button size="sm" onClick={load}>{t('reports.filter')}</Button>
          </div>
        </div>
        {acc && (
          <div className="flex gap-4 text-sm mt-2">
            <span className="px-2 py-1 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-mono">{acc.code}</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{acc.name}</span>
            <span className="text-slate-500">| {acc.type} | {acc.grp}</span>
          </div>
        )}
      </Card>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Keterangan</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Debet</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Kredit</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {data.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">{t('common.noData')}</td></tr>
              ) : data.map((row, i) => {
                runningBalance += (row.debit || 0) - (row.credit || 0);
                return (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20">
                    <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.date}</td>
                    <td className="px-4 py-2.5 text-slate-700 dark:text-slate-200">{row.description}</td>
                    <td className="px-4 py-2.5 text-right text-emerald-600 font-medium">{fmt(row.debit)}</td>
                    <td className="px-4 py-2.5 text-right text-red-500 font-medium">{fmt(row.credit)}</td>
                    <td className={`px-4 py-2.5 text-right font-semibold ${runningBalance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {fmt(Math.abs(runningBalance))}{runningBalance < 0 ? ' (K)' : ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
