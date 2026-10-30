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
const fmt = (n: number) => 'Rp ' + (n || 0).toLocaleString('id-ID');
const empty = { nip: '', name: '', position: '', base_salary: 0, fixed_allowance: 0, bank_account: '', status: 'Aktif' };

export function Karyawan() {
  const { t } = useTranslation();
  const { addToast } = useApp();
  const [data, setData] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const load = () => api().employees.getAll().then(setData);
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditId(null); setModalOpen(true); };
  const openEdit = (row: any) => { setForm(row); setEditId(row.id); setModalOpen(true); };

  const save = async () => {
    if (!form.nip || !form.name || !form.position) return;
    setLoading(true);
    const payload = { ...form, base_salary: Number(form.base_salary), fixed_allowance: Number(form.fixed_allowance) };
    const res = editId ? await api().employees.update({ ...payload, id: editId }) : await api().employees.add(payload);
    setLoading(false);
    if (res.success) { addToast(t('common.success')); load(); setModalOpen(false); }
    else addToast(res.message || t('common.error'), 'error');
  };

  const columns = [
    { key: 'nip', header: t('employees.nip') },
    { key: 'name', header: t('employees.name') },
    { key: 'position', header: t('employees.position') },
    { key: 'base_salary', header: t('employees.baseSalary'), render: (r: any) => fmt(r.base_salary) },
    { key: 'fixed_allowance', header: t('employees.fixedAllowance'), render: (r: any) => fmt(r.fixed_allowance) },
    { key: 'status', header: t('employees.status'), render: (r: any) => <Badge color={r.status === 'Aktif' || r.status === 'Active' ? 'green' : 'gray'}>{r.status}</Badge> },
    {
      key: 'actions', header: t('common.action'), render: (r: any) => (
        <Button variant="secondary" size="sm" onClick={() => openEdit(r)}>{t('common.edit')}</Button>
      )
    },
  ];

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <Card padding={false}>
      <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
        <h2 className="font-semibold text-slate-800 dark:text-white">{t('employees.title')}</h2>
        <Button onClick={openAdd} icon={<span>+</span>}>{t('employees.add')}</Button>
      </div>
      <div className="p-5">
        <Table columns={columns} data={data} emptyText={t('employees.noData')} />
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? t('employees.edit') : t('employees.add')} width="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label={t('employees.nip')} value={form.nip} onChange={e => set('nip', e.target.value)} required />
          <Input label={t('employees.name')} value={form.name} onChange={e => set('name', e.target.value)} required />
          <Input label={t('employees.position')} value={form.position} onChange={e => set('position', e.target.value)} required />
          <Select label={t('employees.status')} value={form.status} onChange={e => set('status', e.target.value)}>
            {(t('employees.statusOptions', { returnObjects: true }) as string[]).map(s => <option key={s}>{s}</option>)}
          </Select>
          <Input label={t('employees.baseSalary')} type="number" value={form.base_salary} onChange={e => set('base_salary', e.target.value)} />
          <Input label={t('employees.fixedAllowance')} type="number" value={form.fixed_allowance} onChange={e => set('fixed_allowance', e.target.value)} />
          <div className="col-span-2">
            <Input label={t('employees.bankAccount')} value={form.bank_account} onChange={e => set('bank_account', e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={save} loading={loading}>{t('common.save')}</Button>
        </div>
      </Modal>
    </Card>
  );
}
