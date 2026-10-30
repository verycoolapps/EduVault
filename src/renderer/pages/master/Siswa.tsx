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

const empty = { nis: '', name: '', class: '', status: 'Aktif', address: '', phone: '' };

export function Siswa() {
  const { t } = useTranslation();
  const { addToast } = useApp();
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const load = () => api().students.getAll().then(setData);
  useEffect(() => { load(); }, []);

  const filtered = data.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.nis.includes(search) ||
    s.class.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(empty); setEditId(null); setModalOpen(true); };
  const openEdit = (row: any) => { setForm(row); setEditId(row.id); setModalOpen(true); };
  const close = () => setModalOpen(false);

  const save = async () => {
    if (!form.nis || !form.name || !form.class) return;
    setLoading(true);
    const res = editId
      ? await api().students.update({ ...form, id: editId })
      : await api().students.add(form);
    setLoading(false);
    if (res.success) { addToast(t('common.success')); load(); close(); }
    else addToast(res.message || t('common.error'), 'error');
  };

  const del = async (id: number) => {
    if (!confirm(t('students.confirmDelete'))) return;
    const res = await api().students.delete(id);
    if (res.success) { addToast(t('common.success')); load(); }
    else addToast(res.message || t('common.error'), 'error');
  };

  const statusColor = (s: string) => s === 'Aktif' || s === 'Active' ? 'green' : s === 'Lulus' || s === 'Graduated' ? 'blue' : 'red';

  const columns = [
    { key: 'nis', header: t('students.nis') },
    { key: 'name', header: t('students.name') },
    { key: 'class', header: t('students.class') },
    { key: 'phone', header: t('students.phone') },
    { key: 'status', header: t('students.status'), render: (r: any) => <Badge color={statusColor(r.status)}>{r.status}</Badge> },
    {
      key: 'actions', header: t('common.action'), render: (r: any) => (
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => openEdit(r)}>{t('common.edit')}</Button>
          <Button variant="danger" size="sm" onClick={() => del(r.id)}>{t('common.delete')}</Button>
        </div>
      )
    },
  ];

  return (
    <Card padding={false}>
      <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-700 gap-4">
        <h2 className="font-semibold text-slate-800 dark:text-white">{t('students.title')}</h2>
        <div className="flex gap-3 flex-1 max-w-sm">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('common.search')}
            className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <Button onClick={openAdd} icon={<span>+</span>}>{t('students.add')}</Button>
      </div>
      <div className="p-5">
        <Table columns={columns} data={filtered} emptyText={t('students.noData')} />
      </div>
      <Modal open={modalOpen} onClose={close} title={editId ? t('students.edit') : t('students.add')}>
        <div className="grid grid-cols-2 gap-4">
          <Input label={t('students.nis')} value={form.nis} onChange={e => setForm((f: any) => ({ ...f, nis: e.target.value }))} required />
          <Input label={t('students.name')} value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} required />
          <Input label={t('students.class')} value={form.class} onChange={e => setForm((f: any) => ({ ...f, class: e.target.value }))} required />
          <Select label={t('students.status')} value={form.status} onChange={e => setForm((f: any) => ({ ...f, status: e.target.value }))}>
            {(t('students.statusOptions', { returnObjects: true }) as string[]).map(s => <option key={s}>{s}</option>)}
          </Select>
          <Input label={t('students.phone')} value={form.phone} onChange={e => setForm((f: any) => ({ ...f, phone: e.target.value }))} />
          <div className="col-span-2">
            <Input label={t('students.address')} value={form.address} onChange={e => setForm((f: any) => ({ ...f, address: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={close}>{t('common.cancel')}</Button>
          <Button onClick={save} loading={loading}>{t('common.save')}</Button>
        </div>
      </Modal>
    </Card>
  );
}
