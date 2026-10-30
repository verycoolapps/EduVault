import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table } from '../../components/UI/Table';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import { Input, Select } from '../../components/UI/Input';
import { Badge } from '../../components/UI/Badge';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../../components/UI/Card';

const api = () => (window as any).api;
const empty = { code: '', name: '', type: 'Aktiva', grp: '', normal_balance: 'debit' };

const typeColor: Record<string, any> = { Aktiva: 'indigo', Kewajiban: 'red', Ekuitas: 'violet', Pendapatan: 'green', Biaya: 'yellow', Asset: 'indigo', Liability: 'red', Equity: 'violet', Revenue: 'green', Expense: 'yellow' };

export function Akun() {
  const { t } = useTranslation();
  const { addToast } = useApp();
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const load = () => api().accounts.getAll().then(setData);
  useEffect(() => { load(); }, []);

  const filtered = data.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.code.includes(search)
  );

  const save = async () => {
    if (!form.code || !form.name || !form.type) return;
    setLoading(true);
    const res = editId ? await api().accounts.update({ ...form, id: editId }) : await api().accounts.add(form);
    setLoading(false);
    if (res.success) { addToast(t('common.success')); load(); setModalOpen(false); }
    else addToast(res.message || t('common.error'), 'error');
  };

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const columns = [
    { key: 'code', header: t('accounts.code') },
    { key: 'name', header: t('accounts.name') },
    { key: 'type', header: t('accounts.type'), render: (r: any) => <Badge color={typeColor[r.type] || 'gray'}>{r.type}</Badge> },
    { key: 'grp', header: t('accounts.group') },
    { key: 'normal_balance', header: t('accounts.normalBalance'), render: (r: any) => <Badge color={r.normal_balance === 'debit' ? 'blue' : 'indigo'}>{r.normal_balance}</Badge> },
    {
      key: 'actions', header: t('common.action'), render: (r: any) => (
        <Button variant="secondary" size="sm" onClick={() => { setForm(r); setEditId(r.id); setModalOpen(true); }}>{t('common.edit')}</Button>
      )
    },
  ];

  return (
    <Card padding={false}>
      <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-700 gap-4">
        <h2 className="font-semibold text-slate-800 dark:text-white">{t('accounts.title')}</h2>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('common.search')}
          className="flex-1 max-w-xs px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <Button onClick={() => { setForm(empty); setEditId(null); setModalOpen(true); }} icon={<span>+</span>}>{t('accounts.add')}</Button>
      </div>
      <div className="p-5">
        <Table columns={columns} data={filtered} emptyText={t('accounts.noData')} />
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? t('accounts.edit') : t('accounts.add')}>
        <div className="grid grid-cols-2 gap-4">
          <Input label={t('accounts.code')} value={form.code} onChange={e => set('code', e.target.value)} required placeholder="1-1000" />
          <Input label={t('accounts.name')} value={form.name} onChange={e => set('name', e.target.value)} required />
          <Select label={t('accounts.type')} value={form.type} onChange={e => set('type', e.target.value)}>
            {(t('accounts.typeOptions', { returnObjects: true }) as string[]).map(s => <option key={s}>{s}</option>)}
          </Select>
          <Input label={t('accounts.group')} value={form.grp} onChange={e => set('grp', e.target.value)} />
          <Select label={t('accounts.normalBalance')} value={form.normal_balance} onChange={e => set('normal_balance', e.target.value)}>
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
          </Select>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={save} loading={loading}>{t('common.save')}</Button>
        </div>
      </Modal>
    </Card>
  );
}
