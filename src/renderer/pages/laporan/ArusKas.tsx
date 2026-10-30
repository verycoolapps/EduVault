import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';

const api = () => (window as any).api;
const fmt = (n: number) => 'Rp ' + (n || 0).toLocaleString('id-ID');

export function ArusKas() {
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [year, setYear] = useState(new Date().getFullYear());

  const load = () => api().reports.cashFlow({ year }).then(setData);
  useEffect(() => { load(); }, [year]);

  const net = (data?.netOperating || 0) + (data?.netInvesting || 0) + (data?.netFinancing || 0);

  const Section = ({ title, items, net: sectionNet, colorPos, colorNeg }: any) => (
    <Card>
      <h3 className="font-bold text-slate-700 dark:text-white mb-4">{title}</h3>
      <div className="space-y-2">
        {items?.map((item: any, i: number) => (
          <div key={i} className="flex justify-between items-center py-1.5 border-b border-slate-50 dark:border-slate-700/50 text-sm">
            <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
            <span className={`font-medium ${item.amount >= 0 ? colorPos : colorNeg}`}>{item.amount >= 0 ? '' : '('}{fmt(Math.abs(item.amount))}{item.amount < 0 ? ')' : ''}</span>
          </div>
        ))}
      </div>
      <div className={`flex justify-between pt-3 mt-3 border-t-2 border-slate-200 dark:border-slate-600 font-bold text-sm`}>
        <span className="text-slate-700 dark:text-slate-200">Net {title}</span>
        <span className={sectionNet >= 0 ? colorPos : colorNeg}>{sectionNet >= 0 ? '' : '('}{fmt(Math.abs(sectionNet))}{sectionNet < 0 ? ')' : ''}</span>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-slate-800 dark:text-white">{t('nav.cashFlow')}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Tahun {year}</p>
          </div>
          <div className="flex gap-3">
            <select value={year} onChange={e => setYear(Number(e.target.value))} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {[year - 1, year, year + 1].map(y => <option key={y}>{y}</option>)}
            </select>
            <Button size="sm" onClick={load}>{t('reports.filter')}</Button>
          </div>
        </div>
      </Card>

      <Section
        title="Arus Kas Operasi"
        items={data?.operating || []}
        net={data?.netOperating || 0}
        colorPos="text-emerald-600 dark:text-emerald-400"
        colorNeg="text-red-500 dark:text-red-400"
      />
      <Section
        title="Arus Kas Investasi"
        items={data?.investing || []}
        net={data?.netInvesting || 0}
        colorPos="text-blue-600 dark:text-blue-400"
        colorNeg="text-red-500 dark:text-red-400"
      />
      <Section
        title="Arus Kas Pendanaan"
        items={data?.financing || []}
        net={data?.netFinancing || 0}
        colorPos="text-violet-600 dark:text-violet-400"
        colorNeg="text-red-500 dark:text-red-400"
      />

      <Card>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Net Arus Kas Operasi</span>
            <span className={`font-medium ${(data?.netOperating || 0) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{fmt(data?.netOperating || 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Net Arus Kas Investasi</span>
            <span className={`font-medium ${(data?.netInvesting || 0) >= 0 ? 'text-blue-600' : 'text-red-500'}`}>{fmt(data?.netInvesting || 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Net Arus Kas Pendanaan</span>
            <span className={`font-medium ${(data?.netFinancing || 0) >= 0 ? 'text-violet-600' : 'text-red-500'}`}>{fmt(data?.netFinancing || 0)}</span>
          </div>
          <div className="flex justify-between pt-3 border-t-2 border-slate-200 dark:border-slate-600 font-extrabold text-base">
            <span className="text-slate-800 dark:text-white">KENAIKAN / (PENURUNAN) KAS BERSIH</span>
            <span className={net >= 0 ? 'text-emerald-600' : 'text-red-600'}>{net >= 0 ? '' : '('}{fmt(Math.abs(net))}{net < 0 ? ')' : ''}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Saldo Kas Awal Tahun</span>
            <span className="font-medium text-slate-700 dark:text-slate-200">{fmt(data?.openingBalance || 0)}</span>
          </div>
          <div className="flex justify-between py-2 px-3 rounded-xl bg-indigo-600 font-bold text-white">
            <span>Saldo Kas Akhir Tahun</span>
            <span>{fmt((data?.openingBalance || 0) + net)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
