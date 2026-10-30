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
const curYear = new Date().getFullYear();
const curMonth = new Date().getMonth() + 1;

export function SPP() {
  const { t } = useTranslation();
  const { addToast } = useApp();
  const [data, setData] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterYear, setFilterYear] = useState(curYear);
  const [filterMonth, setFilterMonth] = useState(0);
  const [form, setForm] = useState({ student_id: '', month: curMonth, year: curYear, amount: 0, payment_method: 'Tunai', ref_no: '', notes: '' });

  const months = t('spp.months', { returnObjects: true }) as string[];

  const load = () => api().spp.getAll({ year: filterYear, month: filterMonth || undefined }).then(setData);
  useEffect(() => { load(); api().students.getAll().then(setStudents); }, [filterYear, filterMonth]);

  const save = async () => {
    if (!form.student_id || !form.amount) return;
    setLoading(true);
    const res = await api().spp.add({ ...form, student_id: Number(form.student_id), amount: Number(form.amount) });
    setLoading(false);
    if (res.success) { addToast(t('common.success')); load(); setModalOpen(false); }
    else addToast(res.message || t('common.error'), 'error');
  };

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const columns = [
    { key: 'nis', header: t('students.nis') },
    { key: 'student_name', header: t('spp.student') },
    { key: 'class', header: t('spp.class') },
    { key: 'month', header: t('spp.month'), render: (r: any) => months[r.month - 1] },
    { key: 'year', header: t('spp.year') },
    { key: 'amount', header: t('spp.amount'), render: (r: any) => <span className="text-emerald-600 font-semibold">{fmt(r.amount)}</span> },
    { key: 'payment_method', header: t('spp.paymentMethod') },
    { key: 'created_at', header: t('dashboard.date'), render: (r: any) => r.created_at?.slice(0, 10) },
  ];

  const total = data.reduce((s, r) => s + r.amount, 0);

  return (
    <Card padding={false}>
      <div className="p-5 flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-slate-700 gap-4">
        <h2 className="font-semibold text-slate-800 dark:text-white">{t('spp.title')}</h2>
        <div className="flex gap-3 flex-wrap">
          <select value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {[curYear - 1, curYear, curYear + 1].map(y => <option key={y}>{y}</option>)}
          </select>
          <select value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value={0}>{t('reports.allMonths')}</option>
            {months.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <Button onClick={() => setModalOpen(true)} icon={<span>+</span>}>{t('spp.add')}</Button>
      </div>
      <div className="px-5 py-3 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between">
        <span className="text-sm text-emerald-700 dark:text-emerald-400">{t('reports.totalIncome')}</span>
        <span className="font-bold text-emerald-700 dark:text-emerald-400">{fmt(total)}</span>
      </div>
      <div className="p-5">
        <Table columns={columns} data={data} emptyText={t('spp.noData')} />
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t('spp.add')}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Select label={t('spp.student')} value={form.student_id} onChange={e => set('student_id', e.target.value)} required>
              <option value="">-- Pilih Siswa --</option>
              {students.filter(s => s.status === 'Aktif' || s.status === 'Active').map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.nis}) - {s.class}</option>
              ))}
            </Select>
          </div>
          <Select label={t('spp.month')} value={form.month} onChange={e => set('month', Number(e.target.value))}>
            {months.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </Select>
          <Input label={t('spp.year')} type="number" value={form.year} onChange={e => set('year', Number(e.target.value))} />
          <Input label={t('spp.amount')} type="number" value={form.amount} onChange={e => set('amount', e.target.value)} required />
          <Select label={t('spp.paymentMethod')} value={form.payment_method} onChange={e => set('payment_method', e.target.value)}>
            {(t('spp.methods', { returnObjects: true }) as string[]).map(m => <option key={m}>{m}</option>)}
          </Select>
          <Input label={t('spp.refNo')} value={form.ref_no} onChange={e => set('ref_no', e.target.value)} />
          <div className="col-span-2">
            <Input label={t('spp.notes')} value={form.notes} onChange={e => set('notes', e.target.value)} />
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
