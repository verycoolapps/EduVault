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

export function Gaji() {
  const { t } = useTranslation();
  const { addToast } = useApp();
  const [data, setData] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [form, setForm] = useState({ employee_id: '', month: curMonth, year: curYear, variable_allowance: 0, loan_deduction: 0 });
  const [calc, setCalc] = useState<any>(null);
  const months = t('salary.months', { returnObjects: true }) as string[];

  const load = (y = curYear, m = 0) => api().salary.getHistory({ year: y, month: m || undefined }).then(setData);
  useEffect(() => { load(); api().employees.getAll().then(setEmployees); }, []);

  const calculate = async () => {
    if (!form.employee_id) return;
    setCalculating(true);
    const res = await api().salary.calculate({ employee_id: Number(form.employee_id), variable_allowance: Number(form.variable_allowance) });
    setCalculating(false);
    if (res.success) setCalc(res);
  };

  const save = async () => {
    if (!calc || !form.employee_id) return;
    setLoading(true);
    const res = await api().salary.save({
      employee_id: Number(form.employee_id),
      month: Number(form.month),
      year: Number(form.year),
      base_salary: calc.base_salary,
      fixed_allowance: calc.fixed_allowance,
      variable_allowance: Number(form.variable_allowance),
      pph_deduction: calc.pph,
      bpjs_deduction: calc.bpjs,
      loan_deduction: Number(form.loan_deduction),
      net_salary: calc.net - Number(form.loan_deduction),
    });
    setLoading(false);
    if (res.success) { addToast(t('common.success')); load(); setModalOpen(false); setCalc(null); }
    else addToast(res.message || t('common.error'), 'error');
  };

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const columns = [
    { key: 'employee_name', header: t('salary.employee') },
    { key: 'position', header: t('employees.position') },
    { key: 'month', header: t('salary.month'), render: (r: any) => months[r.month - 1] },
    { key: 'year', header: t('salary.year') },
    { key: 'base_salary', header: t('salary.baseSalary'), render: (r: any) => fmt(r.base_salary) },
    { key: 'variable_allowance', header: t('salary.variableAllowance'), render: (r: any) => fmt(r.variable_allowance) },
    { key: 'net_salary', header: t('salary.netSalary'), render: (r: any) => <span className="font-semibold text-indigo-600">{fmt(r.net_salary)}</span> },
  ];

  return (
    <Card padding={false}>
      <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
        <h2 className="font-semibold text-slate-800 dark:text-white">{t('salary.title')}</h2>
        <Button onClick={() => { setModalOpen(true); setCalc(null); setForm({ employee_id: '', month: curMonth, year: curYear, variable_allowance: 0, loan_deduction: 0 }); }} icon={<span>+</span>}>{t('salary.add')}</Button>
      </div>
      <div className="p-5"><Table columns={columns} data={data} emptyText={t('salary.noData')} /></div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t('salary.add')} width="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Select label={t('salary.employee')} value={form.employee_id} onChange={e => { set('employee_id', e.target.value); setCalc(null); }} required>
              <option value="">-- Pilih Karyawan --</option>
              {employees.filter(e => e.status === 'Aktif' || e.status === 'Active').map(e => (
                <option key={e.id} value={e.id}>{e.name} — {e.position}</option>
              ))}
            </Select>
          </div>
          <Select label={t('salary.month')} value={form.month} onChange={e => set('month', Number(e.target.value))}>
            {months.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </Select>
          <Input label={t('salary.year')} type="number" value={form.year} onChange={e => set('year', Number(e.target.value))} />
          <Input label={t('salary.variableAllowance')} type="number" value={form.variable_allowance} onChange={e => { set('variable_allowance', e.target.value); setCalc(null); }} />
          <Input label={t('salary.loanDeduction')} type="number" value={form.loan_deduction} onChange={e => set('loan_deduction', e.target.value)} />
          <div className="col-span-2">
            <Button variant="secondary" onClick={calculate} loading={calculating} className="w-full justify-center">{t('salary.calculate')}</Button>
          </div>
        </div>
        {calc && (
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">{t('salary.baseSalary')}</span><span>{fmt(calc.base_salary)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">{t('salary.fixedAllowance')}</span><span>{fmt(calc.fixed_allowance)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">{t('salary.variableAllowance')}</span><span>{fmt(Number(form.variable_allowance))}</span></div>
            <div className="flex justify-between font-semibold border-t dark:border-slate-600 pt-2"><span>{t('salary.grossSalary')}</span><span>{fmt(calc.gross)}</span></div>
            <div className="flex justify-between text-red-500"><span>- {t('salary.pphDeduction')}</span><span>{fmt(calc.pph)}</span></div>
            <div className="flex justify-between text-red-500"><span>- {t('salary.bpjsDeduction')}</span><span>{fmt(calc.bpjs)}</span></div>
            <div className="flex justify-between text-red-500"><span>- {t('salary.loanDeduction')}</span><span>{fmt(Number(form.loan_deduction))}</span></div>
            <div className="flex justify-between font-bold text-indigo-600 border-t dark:border-slate-600 pt-2 text-base"><span>{t('salary.netSalary')}</span><span>{fmt(calc.net - Number(form.loan_deduction))}</span></div>
          </div>
        )}
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={save} loading={loading} disabled={!calc}>{t('salary.save')}</Button>
        </div>
      </Modal>
    </Card>
  );
}
