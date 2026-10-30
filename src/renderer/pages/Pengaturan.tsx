import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { useApp } from '../contexts/AppContext';

const api = () => (window as any).api;

export function Pengaturan() {
  const { t } = useTranslation();
  const { user, addToast } = useApp();

  const [info, setInfo] = useState({ schoolName: '', address: '', phone: '', email: '', principal: '', year: '' });
  const [pw, setPw] = useState({ old: '', new: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    api().settings.get().then((d: any) => {
      setInfo({
        schoolName: d.school_name || d.schoolName || '',
        address: d.address || '',
        phone: d.phone || '',
        email: d.email || '',
        principal: d.principal || '',
        year: d.year || '',
      });
    });
  }, []);

  const saveInfo = async () => {
    setSaving(true);
    try {
      await api().settings.set({ school_name: info.schoolName, address: info.address, phone: info.phone, email: info.email, principal: info.principal, year: info.year });
      addToast(t('common.success'), 'success');
    } catch {
      addToast(t('common.error'), 'error');
    } finally { setSaving(false); }
  };

  const savePassword = async () => {
    if (pw.new !== pw.confirm) { addToast(t('settings.passwordMismatch'), 'error'); return; }
    if (pw.new.length < 6) { addToast('Password minimal 6 karakter', 'error'); return; }
    setPwSaving(true);
    try {
      const res = await api().auth.changePassword({ username: user?.username, oldPass: pw.old, newPass: pw.new });
      if (res.success) {
        addToast(t('settings.passwordChanged'), 'success');
        setPw({ old: '', new: '', confirm: '' });
      } else {
        addToast(res.message || 'Password lama salah', 'error');
      }
    } catch { addToast(t('common.error'), 'error'); }
    finally { setPwSaving(false); }
  };

  const backup = async () => {
    try {
      await api().backup.create();
      addToast(t('settings.backupSuccess'), 'success');
    } catch { addToast(t('common.error'), 'error'); }
  };

  const restore = async () => {
    if (!window.confirm('Restore akan mengganti database saat ini. Lanjutkan?')) return;
    try {
      await api().backup.restore();
      addToast(t('settings.restoreSuccess'), 'info');
    } catch { addToast(t('common.error'), 'error'); }
  };

  const field = (label: string, key: keyof typeof info, type = 'text') => (
    <div>
      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">{label}</label>
      <input
        type={type}
        value={info[key]}
        onChange={e => setInfo(p => ({ ...p, [key]: e.target.value }))}
        className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
    </div>
  );

  const pwField = (label: string, key: keyof typeof pw) => (
    <div>
      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">{label}</label>
      <input
        type="password"
        value={pw[key]}
        onChange={e => setPw(p => ({ ...p, [key]: e.target.value }))}
        className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      {/* School Info */}
      <Card>
        <h2 className="font-bold text-slate-800 dark:text-white mb-5">{t('settings.title')} — Informasi Sekolah</h2>
        <div className="space-y-4">
          {field(t('settings.schoolName'), 'schoolName')}
          {field(t('settings.address'), 'address')}
          <div className="grid grid-cols-2 gap-4">
            {field(t('settings.phone'), 'phone', 'tel')}
            {field(t('settings.email'), 'email', 'email')}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {field(t('settings.principal'), 'principal')}
            {field(t('settings.year'), 'year')}
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={saveInfo} disabled={saving}>
              {saving ? t('common.loading') : t('settings.save')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Change Password */}
      <Card>
        <h2 className="font-bold text-slate-800 dark:text-white mb-5">{t('settings.changePassword')}</h2>
        <div className="space-y-4">
          {pwField(t('settings.oldPassword'), 'old')}
          {pwField(t('settings.newPassword'), 'new')}
          {pwField(t('settings.confirmPassword'), 'confirm')}
          <div className="flex justify-end pt-2">
            <Button onClick={savePassword} disabled={pwSaving} variant="secondary">
              {pwSaving ? t('common.loading') : t('settings.changePassword')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Backup & Restore */}
      <Card>
        <h2 className="font-bold text-slate-800 dark:text-white mb-5">Backup & Restore</h2>
        <div className="flex gap-4">
          <Button onClick={backup} className="flex-1">
            💾 {t('settings.backup')}
          </Button>
          <Button onClick={restore} variant="secondary" className="flex-1">
            📂 {t('settings.restore')}
          </Button>
        </div>
        <p className="text-xs text-slate-400 mt-3">Backup menyimpan file database ke lokasi yang Anda pilih. Restore mengganti database saat ini dengan file backup.</p>
      </Card>

      {/* App Info */}
      <Card>
        <h2 className="font-bold text-slate-800 dark:text-white mb-3">Tentang EduVault</h2>
        <div className="space-y-1 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex justify-between"><span>Versi</span><span className="font-mono text-indigo-600 dark:text-indigo-400">2.0.0</span></div>
          <div className="flex justify-between"><span>Lisensi</span><span>MIT Open Source</span></div>
          <div className="flex justify-between"><span>Platform</span><span>{navigator.platform}</span></div>
        </div>
      </Card>
    </div>
  );
}
