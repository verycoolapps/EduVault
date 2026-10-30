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

export function UangGedung() {
  const { t } = useTranslation();
  const { addToast } = useApp();
  const [data, setData] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [addBillOpen, setAddBillOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [billForm, setBillForm] = useState({ student_id: '', type: 'Uang Gedung', total_amount: 0, installments: 1 });
  const [payForm, setPayForm] = useState({ installment_no: 1, amount: 0, payment_method: 'Tunai', ref_no: '' });

  const load = () => api().buildingFee.getAll().then(setData);
  useEffect(() => { load(); api().students.getAll().then(setStudents); }, []);

  const saveBill = async () => {
    if (!billForm.student_id || !billForm.total_amount) return;
    setLoading(true);
    const res = await api().buildingFee.add({ ...billForm, student_id: Number(billForm.student_id), total_amount: Number(billForm.total_amount), installments: Number(billForm.installments) });
    setLoading(false);
    if (res.success) { addToast(t('common.success')); load(); setAddBillOpen(false); }
    else addToast(res.message || t('common.error'), 'error');
  };

  const savePay = async () => {
    if (!selectedBill || !payForm.amount) return;
    setLoading(true);
    const res = await api().buildingFee.pay({ bill_id: selectedBill.id, ...payForm, installment_no: Number(payForm.installment_no), amount: Number(payForm.amount) });
    setLoading(false);
    if (res.success) { addToast(t('common.success')); load(); setPayOpen(false); }
    else addToast(res.message || t('common.error'), 'error');
  };

  const columns = [
    { key: 'student_name', header: t('buildingFee.student') },
    { key: 'nis', header: t('students.nis') },
    { key: 'type', header: t('buildingFee.type') },
    { key: 'total_amount', header: t('buildingFee.totalAmount'), render: (r: any) => fmt(r.total_amount) },
    { key: 'paid_amount', header: t('buildingFee.paidAmount'), render: (r: any) => <span className="text-emerald-600 font-semibold">{fmt(r.paid_amount)}</span> },
    { key: 'remaining', header: t('buildingFee.remainingAmount'), render: (r: any) => { const rem = r.total_amount - r.paid_amount; return <span className={rem > 0 ? 'text-red-500' : 'text-emerald-600'}>{fmt(rem)}</span>; } },
    { key: 'status', header: 'Status', render: (r: any) => <Badge color={r.paid_amount >= r.total_amount ? 'green' : 'yellow'}>{r.paid_amount >= r.total_amount ? 'Lunas' : 'Belum Lunas'}</Badge> },
    {
      key: 'actions', header: t('common.action'), render: (r: any) => (
        r.paid_amount < r.total_amount && <Button size="sm" onClick={() => { setSelectedBill(r); setPayForm({ installment_no: r.paid_installments + 1, amount: 0, payment_method: 'Tunai', ref_no: '' }); setPayOpen(true); }}>{t('buildingFee.pay')}</Button>
      )
    },
  ];

  return (
    <Card padding={false}>
      <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
        <h2 className="font-semibold text-slate-800 dark:text-white">{t('buildingFee.title')}</h2>
        <Button onClick={() => { setBillForm({ student_id: '', type: 'Uang Gedung', total_amount: 0, installments: 1 }); setAddBillOpen(true); }} icon={<span>+</span>}>{t('buildingFee.addBill')}</Button>
      </div>
      <div className="p-5"><Table columns={columns} data={data} emptyText={t('buildingFee.noData')} /></div>
      <Modal open={addBillOpen} onClose={() => setAddBillOpen(false)} title={t('buildingFee.addBill')}>
        <div className="space-y-4">
          <Select label={t('buildingFee.student')} value={billForm.student_id} onChange={e => setBillForm(f => ({ ...f, student_id: e.target.value }))} required>
            <option value="">-- Pilih Siswa --</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.nis})</option>)}
          </Select>
          <Select label={t('buildingFee.type')} value={billForm.type} onChange={e => setBillForm(f => ({ ...f, type: e.target.value }))}>
            {(t('buildingFee.types', { returnObjects: true }) as string[]).map(tp => <option key={tp}>{tp}</option>)}
          </Select>
          <Input label={t('buildingFee.totalAmount')} type="number" value={billForm.total_amount} onChange={e => setBillForm(f => ({ ...f, total_amount: Number(e.target.value) }))} />
          <Input label={t('buildingFee.installments')} type="number" min={1} value={billForm.installments} onChange={e => setBillForm(f => ({ ...f, installments: Number(e.target.value) }))} />
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={() => setAddBillOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={saveBill} loading={loading}>{t('common.save')}</Button>
        </div>
      </Modal>
      <Modal open={payOpen} onClose={() => setPayOpen(false)} title={t('buildingFee.pay')}>
        {selectedBill && (
          <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg text-sm space-y-1">
            <div><span className="text-slate-500">{t('buildingFee.student')}:</span> <strong>{selectedBill.student_name}</strong></div>
            <div><span className="text-slate-500">{t('buildingFee.totalAmount')}:</span> <strong>{fmt(selectedBill.total_amount)}</strong></div>
            <div><span className="text-slate-500">{t('buildingFee.remainingAmount')}:</span> <strong className="text-red-500">{fmt(selectedBill.total_amount - selectedBill.paid_amount)}</strong></div>
          </div>
        )}
        <div className="space-y-4">
          <Input label={t('buildingFee.installmentNo')} type="number" value={payForm.installment_no} onChange={e => setPayForm(f => ({ ...f, installment_no: Number(e.target.value) }))} />
          <Input label={t('buildingFee.payAmount')} type="number" value={payForm.amount} onChange={e => setPayForm(f => ({ ...f, amount: Number(e.target.value) }))} required />
          <Select label={t('buildingFee.paymentMethod')} value={payForm.payment_method} onChange={e => setPayForm(f => ({ ...f, payment_method: e.target.value }))}>
            <option>Tunai</option><option>Transfer</option>
          </Select>
          <Input label={t('buildingFee.refNo')} value={payForm.ref_no} onChange={e => setPayForm(f => ({ ...f, ref_no: e.target.value }))} />
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={() => setPayOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={savePay} loading={loading}>{t('common.save')}</Button>
        </div>
      </Modal>
    </Card>
  );
}
