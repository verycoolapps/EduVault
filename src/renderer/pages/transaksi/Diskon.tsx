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

export function Diskon() {
  const { t } = useTranslation();
  const { addToast } = useApp();
  const [data, setData] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ type: 'SPP', amount: 0, reason: '' });

  const load = () => api().discount.getAll().then(setData);
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.amount) return;
    setLoading(true);
    const res = await api().discount.add({ ...form, amount: Number(form.amount) });
    setLoading(false);
    if (res.success) { addToast(t('common.success')); load(); setModalOpen(false); setForm({ type: 'SPP', amount: 0, reason: '' }); }
    else addToast(res.message || t('common.error'), 'error');
  };

  const columns = [
    { key: 'created_at', header: t('dashboard.date'), render: (r: any) => r.created_at?.slice(0, 10) },
    { key: 'type', header: t('discount.type') },
    { key: 'amount', header: t('discount.amount'), render: (r: any) => <span className="text-red-500 font-semibold">{fmt(r.amount)}</span> },
    { key: 'reason', header: t('discount.reason') },
  ];

  return (
    <Card padding={false}>
      <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
        <h2 className="font-semibold text-slate-800 dark:text-white">{t('discount.title')}</h2>
        <Button onClick={() => setModalOpen(true)} icon={<span>+</span>}>{t('discount.add')}</Button>
      </div>
      <div className="p-5"><Table columns={columns} data={data} emptyText={t('discount.noData')} /></div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t('discount.add')}>
        <div className="space-y-4">
          <Select label={t('discount.type')} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            {(t('discount.types', { returnObjects: true }) as string[]).map(tp => <option key={tp}>{tp}</option>)}
          </Select>
          <Input label={t('discount.amount')} type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} required />
          <Input label={t('discount.reason')} value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={save} loading={loading}>{t('common.save')}</Button>
        </div>
      </Modal>
    </Card>
  );
}
