import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table } from '../../components/UI/Table';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import { Input, Select, Textarea } from '../../components/UI/Input';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../../components/UI/Card';

const api = () => (window as any).api;
const fmt = (n: number) => 'Rp ' + (n || 0).toLocaleString('id-ID');
const today = new Date().toISOString().slice(0, 10);

export function PenerimaanLain() {
  const { t } = useTranslation();
  const { addToast } = useApp();
  const [data, setData] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ account_id: '', amount: 0, date: today, description: '', notes: '' });

  const load = () => api().otherIncome.getAll().then(setData);
  useEffect(() => { load(); api().accounts.getAll().then((a: any[]) => setAccounts(a.filter(x => x.type === 'Pendapatan' || x.type === 'Revenue'))); }, []);

  const save = async () => {
    if (!form.amount || !form.description || !form.date) return;
    setLoading(true);
    const res = await api().otherIncome.add({ ...form, account_id: form.account_id ? Number(form.account_id) : null, amount: Number(form.amount) });
    setLoading(false);
    if (res.success) { addToast(t('common.success')); load(); setModalOpen(false); setForm({ account_id: '', amount: 0, date: today, description: '', notes: '' }); }
    else addToast(res.message || t('common.error'), 'error');
  };

  const total = data.reduce((s, r) => s + r.amount, 0);

  const columns = [
    { key: 'date', header: t('otherIncome.date') },
    { key: 'description', header: t('otherIncome.description') },
    { key: 'account_name', header: t('otherIncome.account') },
    { key: 'amount', header: t('otherIncome.amount'), render: (r: any) => <span className="text-emerald-600 font-semibold">{fmt(r.amount)}</span> },
    { key: 'notes', header: 'Catatan' },
  ];

  return (
    <Card padding={false}>
      <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
        <h2 className="font-semibold text-slate-800 dark:text-white">{t('otherIncome.title')}</h2>
        <Button onClick={() => setModalOpen(true)} icon={<span>+</span>}>{t('otherIncome.add')}</Button>
      </div>
      <div className="px-5 py-3 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-900/30 flex justify-between">
        <span className="text-sm text-emerald-700 dark:text-emerald-400">{t('reports.totalIncome')}</span>
        <span className="font-bold text-emerald-700 dark:text-emerald-400">{fmt(total)}</span>
      </div>
      <div className="p-5"><Table columns={columns} data={data} emptyText={t('otherIncome.noData')} /></div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t('otherIncome.add')}>
        <div className="space-y-4">
          <Select label={t('otherIncome.account')} value={form.account_id} onChange={e => setForm(f => ({ ...f, account_id: e.target.value }))}>
            <option value="">-- Pilih Akun --</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
          </Select>
          <Input label={t('otherIncome.amount')} type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} required />
          <Input label={t('otherIncome.date')} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
          <Input label={t('otherIncome.description')} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
          <Textarea label={t('otherIncome.notes')} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={save} loading={loading}>{t('common.save')}</Button>
        </div>
      </Modal>
    </Card>
  );
}
