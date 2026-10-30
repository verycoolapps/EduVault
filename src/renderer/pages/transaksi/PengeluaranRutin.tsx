import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table } from '../../components/UI/Table';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import { Input, Select } from '../../components/UI/Input';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../../components/UI/Card';

const api = () => (window as any).api;
const fmt = (n: number) => 'Rp ' + (n || 0).toLocaleString('id-ID');
const today = new Date().toISOString().slice(0, 10);

export function PengeluaranRutin() {
  const { t } = useTranslation();
  const { addToast } = useApp();
  const [data, setData] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ category: 'Listrik', amount: 0, date: today, description: '' });

  const load = () => api().routineExpense.getAll().then(setData);
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.amount || !form.category) return;
    setLoading(true);
    const res = await api().routineExpense.add({ ...form, amount: Number(form.amount) });
    setLoading(false);
    if (res.success) { addToast(t('common.success')); load(); setModalOpen(false); setForm({ category: 'Listrik', amount: 0, date: today, description: '' }); }
    else addToast(res.message || t('common.error'), 'error');
  };

  const total = data.reduce((s, r) => s + r.amount, 0);

  const columns = [
    { key: 'date', header: t('routineExpense.date') },
    { key: 'category', header: t('routineExpense.category') },
    { key: 'amount', header: t('routineExpense.amount'), render: (r: any) => <span className="text-red-500 font-semibold">{fmt(r.amount)}</span> },
    { key: 'description', header: t('routineExpense.description') },
  ];

  return (
    <Card padding={false}>
      <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
        <h2 className="font-semibold text-slate-800 dark:text-white">{t('routineExpense.title')}</h2>
        <Button onClick={() => setModalOpen(true)} icon={<span>+</span>}>{t('routineExpense.add')}</Button>
      </div>
      <div className="px-5 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/30 flex justify-between">
        <span className="text-sm text-red-700 dark:text-red-400">{t('reports.totalExpense')}</span>
        <span className="font-bold text-red-700 dark:text-red-400">{fmt(total)}</span>
      </div>
      <div className="p-5"><Table columns={columns} data={data} emptyText={t('routineExpense.noData')} /></div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t('routineExpense.add')}>
        <div className="space-y-4">
          <Select label={t('routineExpense.category')} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {(t('routineExpense.categories', { returnObjects: true }) as string[]).map(c => <option key={c}>{c}</option>)}
          </Select>
          <Input label={t('routineExpense.amount')} type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} required />
          <Input label={t('routineExpense.date')} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
          <Input label={t('routineExpense.description')} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={save} loading={loading}>{t('common.save')}</Button>
        </div>
      </Modal>
    </Card>
  );
}
