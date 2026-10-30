import React, { useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Login } from './pages/Login';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Siswa } from './pages/master/Siswa';
import { Akun } from './pages/master/Akun';
import { Karyawan } from './pages/master/Karyawan';
import { SPP } from './pages/transaksi/SPP';
import { UangGedung } from './pages/transaksi/UangGedung';
import { PenerimaanLain } from './pages/transaksi/PenerimaanLain';
import { Gaji } from './pages/transaksi/Gaji';
import { Diskon } from './pages/transaksi/Diskon';
import { Pengadaan } from './pages/transaksi/Pengadaan';
import { PengeluaranRutin } from './pages/transaksi/PengeluaranRutin';
import { LaporanPenerimaan } from './pages/laporan/Penerimaan';
import { LaporanPengeluaran } from './pages/laporan/Pengeluaran';
import { BukuBesar } from './pages/laporan/BukuBesar';
import { NeracaSaldo } from './pages/laporan/NeracaSaldo';
import { LabaRugi } from './pages/laporan/LabaRugi';
import { Neraca } from './pages/laporan/Neraca';
import { ArusKas } from './pages/laporan/ArusKas';
import { Pengaturan } from './pages/Pengaturan';

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  students: 'Data Siswa',
  accounts: 'Kategori Akun',
  employees: 'Data Karyawan',
  spp: 'Penerimaan SPP',
  buildingFee: 'Uang Gedung & Pangkal',
  otherIncome: 'Penerimaan Lain-lain',
  salary: 'Pengeluaran Gaji',
  discount: 'Diskon',
  procurement: 'Pengadaan',
  routineExpense: 'Pengeluaran Rutin',
  incomeReport: 'Laporan Penerimaan',
  expenseReport: 'Laporan Pengeluaran',
  generalLedger: 'Buku Besar',
  trialBalance: 'Neraca Saldo',
  profitLoss: 'Laba / Rugi',
  balanceSheet: 'Neraca',
  cashFlow: 'Arus Kas',
  settings: 'Pengaturan',
};

const pageMap: Record<string, React.ReactNode> = {
  dashboard: <Dashboard />,
  students: <Siswa />,
  accounts: <Akun />,
  employees: <Karyawan />,
  spp: <SPP />,
  buildingFee: <UangGedung />,
  otherIncome: <PenerimaanLain />,
  salary: <Gaji />,
  discount: <Diskon />,
  procurement: <Pengadaan />,
  routineExpense: <PengeluaranRutin />,
  incomeReport: <LaporanPenerimaan />,
  expenseReport: <LaporanPengeluaran />,
  generalLedger: <BukuBesar />,
  trialBalance: <NeracaSaldo />,
  profitLoss: <LabaRugi />,
  balanceSheet: <Neraca />,
  cashFlow: <ArusKas />,
  settings: <Pengaturan />,
};

function AppInner() {
  const { user, setUser, toasts, removeToast } = useApp();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="relative">
      <Layout currentPage={currentPage} pageTitle={pageTitles[currentPage] || 'EduVault'} onNavigate={setCurrentPage} onLogout={() => setUser(null)}>
        {pageMap[currentPage] ?? <Dashboard />}
      </Layout>
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            onClick={() => removeToast(t.id)}
            className={`pointer-events-auto px-4 py-3 rounded-xl shadow-lg text-sm font-medium cursor-pointer transition-all animate-in fade-in slide-in-from-right-4 duration-300 ${
              t.type === 'success'
                ? 'bg-emerald-500 text-white'
                : t.type === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-indigo-500 text-white'
            }`}
          >
            {t.type === 'success' ? '✅ ' : t.type === 'error' ? '❌ ' : 'ℹ️ '}{t.message}
          </div>
        ))}
      </div>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppInner />
      </AppProvider>
    </ThemeProvider>
  );
}
