import { ipcMain, dialog, app } from 'electron';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
import { getDb } from './database';

export function registerIpcHandlers(): void {
  const db = () => getDb();

  // Auth
  ipcMain.handle('auth:login', (_e, { username, password }: { username: string; password: string }) => {
    const user = db().prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
    if (!user) return { success: false, message: 'User not found' };
    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) return { success: false, message: 'Invalid password' };
    return { success: true, user: { id: user.id, username: user.username, role: user.role } };
  });

  ipcMain.handle('auth:changePassword', (_e, { username, oldPass, newPass }: any) => {
    const user = db().prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
    if (!user) return { success: false, message: 'User not found' };
    if (!bcrypt.compareSync(oldPass, user.password_hash)) return { success: false, message: 'Password lama salah' };
    const hash = bcrypt.hashSync(newPass, 10);
    db().prepare('UPDATE users SET password_hash = ? WHERE username = ?').run(hash, username);
    return { success: true };
  });

  // Settings / School Info
  ipcMain.handle('settings:get', () => {
    const rows = db().prepare('SELECT key, value FROM school_info').all() as any[];
    return rows.reduce((acc: any, r: any) => { acc[r.key] = r.value; return acc; }, {});
  });

  ipcMain.handle('settings:set', (_e, data: Record<string, string>) => {
    const stmt = db().prepare('INSERT OR REPLACE INTO school_info (key, value) VALUES (?, ?)');
    for (const [k, v] of Object.entries(data)) stmt.run(k, v);
    return { success: true };
  });

  // Students
  ipcMain.handle('students:getAll', () => {
    return db().prepare('SELECT * FROM students ORDER BY name').all();
  });

  ipcMain.handle('students:add', (_e, s: any) => {
    try {
      const r = db().prepare('INSERT INTO students (nis, name, class, status, address, phone) VALUES (?, ?, ?, ?, ?, ?)').run(s.nis, s.name, s.class, s.status || 'Aktif', s.address || '', s.phone || '');
      return { success: true, id: r.lastInsertRowid };
    } catch (e: any) { return { success: false, message: e.message }; }
  });

  ipcMain.handle('students:update', (_e, s: any) => {
    try {
      db().prepare('UPDATE students SET nis=?, name=?, class=?, status=?, address=?, phone=? WHERE id=?').run(s.nis, s.name, s.class, s.status, s.address, s.phone, s.id);
      return { success: true };
    } catch (e: any) { return { success: false, message: e.message }; }
  });

  ipcMain.handle('students:delete', (_e, id: number) => {
    const txCount = (db().prepare('SELECT COUNT(*) as c FROM spp_transactions WHERE student_id = ?').get(id) as any).c;
    if (txCount > 0) return { success: false, message: 'Siswa memiliki riwayat transaksi, tidak dapat dihapus' };
    db().prepare('DELETE FROM students WHERE id = ?').run(id);
    return { success: true };
  });

  // Employees
  ipcMain.handle('employees:getAll', () => db().prepare('SELECT * FROM employees ORDER BY name').all());

  ipcMain.handle('employees:add', (_e, e: any) => {
    try {
      const r = db().prepare('INSERT INTO employees (nip, name, position, base_salary, fixed_allowance, bank_account, status) VALUES (?, ?, ?, ?, ?, ?, ?)').run(e.nip, e.name, e.position, e.base_salary || 0, e.fixed_allowance || 0, e.bank_account || '', e.status || 'Aktif');
      return { success: true, id: r.lastInsertRowid };
    } catch (err: any) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('employees:update', (_e, e: any) => {
    try {
      db().prepare('UPDATE employees SET nip=?, name=?, position=?, base_salary=?, fixed_allowance=?, bank_account=?, status=? WHERE id=?').run(e.nip, e.name, e.position, e.base_salary, e.fixed_allowance, e.bank_account, e.status, e.id);
      return { success: true };
    } catch (err: any) { return { success: false, message: err.message }; }
  });

  // Accounts
  ipcMain.handle('accounts:getAll', () => db().prepare('SELECT * FROM account_categories ORDER BY code').all());

  ipcMain.handle('accounts:add', (_e, a: any) => {
    try {
      const r = db().prepare('INSERT INTO account_categories (code, name, type, grp, normal_balance) VALUES (?, ?, ?, ?, ?)').run(a.code, a.name, a.type, a.grp, a.normal_balance || 'debit');
      return { success: true, id: r.lastInsertRowid };
    } catch (err: any) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('accounts:update', (_e, a: any) => {
    try {
      db().prepare('UPDATE account_categories SET code=?, name=?, type=?, grp=?, normal_balance=? WHERE id=?').run(a.code, a.name, a.type, a.grp, a.normal_balance, a.id);
      return { success: true };
    } catch (err: any) { return { success: false, message: err.message }; }
  });

  // SPP
  ipcMain.handle('spp:getAll', (_e, filters: any) => {
    let q = `SELECT st.*, s.name as student_name, s.class, s.nis
             FROM spp_transactions st JOIN students s ON s.id = st.student_id WHERE 1=1`;
    const params: any[] = [];
    if (filters?.year) { q += ' AND st.year = ?'; params.push(filters.year); }
    if (filters?.month) { q += ' AND st.month = ?'; params.push(filters.month); }
    q += ' ORDER BY st.created_at DESC';
    return db().prepare(q).all(...params);
  });

  ipcMain.handle('spp:getByStudent', (_e, studentId: number) => {
    return db().prepare('SELECT * FROM spp_transactions WHERE student_id = ? ORDER BY year DESC, month DESC').all(studentId);
  });

  ipcMain.handle('spp:add', (_e, t: any) => {
    try {
      const r = db().prepare('INSERT INTO spp_transactions (student_id, month, year, amount, payment_method, ref_no, notes) VALUES (?, ?, ?, ?, ?, ?, ?)').run(t.student_id, t.month, t.year, t.amount, t.payment_method || 'Tunai', t.ref_no || '', t.notes || '');
      return { success: true, id: r.lastInsertRowid };
    } catch (err: any) { return { success: false, message: err.message }; }
  });

  // Building Fee
  ipcMain.handle('buildingFee:getAll', () => {
    return db().prepare(`SELECT bfb.*, s.name as student_name, s.nis, s.class,
      (SELECT COALESCE(SUM(amount),0) FROM building_fee_payments WHERE bill_id = bfb.id) as paid_amount
      FROM building_fee_bills bfb JOIN students s ON s.id = bfb.student_id ORDER BY bfb.created_at DESC`).all();
  });

  ipcMain.handle('buildingFee:add', (_e, b: any) => {
    try {
      const r = db().prepare('INSERT INTO building_fee_bills (student_id, type, total_amount, installments) VALUES (?, ?, ?, ?)').run(b.student_id, b.type, b.total_amount, b.installments || 1);
      return { success: true, id: r.lastInsertRowid };
    } catch (err: any) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('buildingFee:pay', (_e, p: any) => {
    try {
      db().prepare('INSERT INTO building_fee_payments (bill_id, installment_no, amount, payment_method, ref_no) VALUES (?, ?, ?, ?, ?)').run(p.bill_id, p.installment_no, p.amount, p.payment_method || 'Tunai', p.ref_no || '');
      db().prepare('UPDATE building_fee_bills SET paid_installments = paid_installments + 1 WHERE id = ?').run(p.bill_id);
      return { success: true };
    } catch (err: any) { return { success: false, message: err.message }; }
  });

  // Other Income
  ipcMain.handle('otherIncome:getAll', () => {
    return db().prepare(`SELECT oi.*, ac.name as account_name FROM other_income oi
      LEFT JOIN account_categories ac ON ac.id = oi.account_id ORDER BY oi.date DESC`).all();
  });

  ipcMain.handle('otherIncome:add', (_e, o: any) => {
    try {
      const r = db().prepare('INSERT INTO other_income (account_id, amount, date, description, notes) VALUES (?, ?, ?, ?, ?)').run(o.account_id, o.amount, o.date, o.description, o.notes || '');
      return { success: true, id: r.lastInsertRowid };
    } catch (err: any) { return { success: false, message: err.message }; }
  });

  // Salary
  ipcMain.handle('salary:calculate', (_e, { employee_id, variable_allowance }: any) => {
    const emp = db().prepare('SELECT * FROM employees WHERE id = ?').get(employee_id) as any;
    if (!emp) return { success: false };
    const gross = emp.base_salary + emp.fixed_allowance + (variable_allowance || 0);
    const pph = gross > 4500000 ? gross * 0.05 : 0;
    const bpjs = (emp.base_salary * 0.04);
    const net = gross - pph - bpjs;
    return { success: true, gross, pph, bpjs, net, base_salary: emp.base_salary, fixed_allowance: emp.fixed_allowance };
  });

  ipcMain.handle('salary:save', (_e, s: any) => {
    try {
      const r = db().prepare('INSERT INTO salary_transactions (employee_id, month, year, base_salary, fixed_allowance, variable_allowance, pph_deduction, bpjs_deduction, loan_deduction, net_salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(s.employee_id, s.month, s.year, s.base_salary, s.fixed_allowance, s.variable_allowance || 0, s.pph_deduction, s.bpjs_deduction, s.loan_deduction || 0, s.net_salary);
      return { success: true, id: r.lastInsertRowid };
    } catch (err: any) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('salary:getHistory', (_e, filters: any) => {
    let q = `SELECT st.*, e.name as employee_name, e.position FROM salary_transactions st JOIN employees e ON e.id = st.employee_id WHERE 1=1`;
    const params: any[] = [];
    if (filters?.year) { q += ' AND st.year = ?'; params.push(filters.year); }
    if (filters?.month) { q += ' AND st.month = ?'; params.push(filters.month); }
    q += ' ORDER BY st.created_at DESC';
    return db().prepare(q).all(...params);
  });

  // Discount
  ipcMain.handle('discount:getAll', () => db().prepare('SELECT * FROM discounts ORDER BY created_at DESC').all());
  ipcMain.handle('discount:add', (_e, d: any) => {
    try {
      const r = db().prepare('INSERT INTO discounts (type, reference_id, amount, reason) VALUES (?, ?, ?, ?)').run(d.type, d.reference_id || null, d.amount, d.reason || '');
      return { success: true, id: r.lastInsertRowid };
    } catch (err: any) { return { success: false, message: err.message }; }
  });

  // Procurement
  ipcMain.handle('procurement:getAll', () => db().prepare('SELECT * FROM procurement ORDER BY date DESC').all());
  ipcMain.handle('procurement:add', (_e, p: any) => {
    try {
      const r = db().prepare('INSERT INTO procurement (vendor, items, amount, date, description) VALUES (?, ?, ?, ?, ?)').run(p.vendor, p.items, p.amount, p.date, p.description || '');
      return { success: true, id: r.lastInsertRowid };
    } catch (err: any) { return { success: false, message: err.message }; }
  });

  // Routine Expenses
  ipcMain.handle('routineExpense:getAll', () => {
    return db().prepare(`SELECT re.*, ac.name as account_name FROM routine_expenses re
      LEFT JOIN account_categories ac ON ac.id = re.account_id ORDER BY re.date DESC`).all();
  });
  ipcMain.handle('routineExpense:add', (_e, r: any) => {
    try {
      const res = db().prepare('INSERT INTO routine_expenses (account_id, category, amount, date, description) VALUES (?, ?, ?, ?, ?)').run(r.account_id || null, r.category, r.amount, r.date, r.description || '');
      return { success: true, id: res.lastInsertRowid };
    } catch (err: any) { return { success: false, message: err.message }; }
  });

  // Dashboard
  ipcMain.handle('dashboard:getSummary', () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const totalStudents = (db().prepare("SELECT COUNT(*) as c FROM students WHERE status='Aktif'").get() as any).c;
    const totalEmployees = (db().prepare("SELECT COUNT(*) as c FROM employees WHERE status='Aktif'").get() as any).c;

    const sppMonth = (db().prepare("SELECT COALESCE(SUM(amount),0) as total FROM spp_transactions WHERE month=? AND year=?").get(month, year) as any).total;
    const salaryMonth = (db().prepare("SELECT COALESCE(SUM(net_salary),0) as total FROM salary_transactions WHERE month=? AND year=?").get(month, year) as any).total;
    const procurementTotal = (db().prepare(`SELECT COALESCE(SUM(amount),0) as total FROM procurement WHERE strftime('%Y', date) = ?`).get(String(year)) as any).total;
    const routineTotal = (db().prepare(`SELECT COALESCE(SUM(amount),0) as total FROM routine_expenses WHERE strftime('%Y', date) = ?`).get(String(year)) as any).total;
    const otherIncomeMonth = (db().prepare(`SELECT COALESCE(SUM(amount),0) as total FROM other_income WHERE strftime('%Y-%m', date) = ?`).get(`${year}-${String(month).padStart(2, '0')}`) as any).total;
    const buildingFeeMonth = (db().prepare(`SELECT COALESCE(SUM(amount),0) as total FROM building_fee_payments WHERE strftime('%Y-%m', paid_at) = ?`).get(`${year}-${String(month).padStart(2, '0')}`) as any).total;

    const monthlyTrend: any[] = [];
    for (let m = 1; m <= 12; m++) {
      const inc = (db().prepare("SELECT COALESCE(SUM(amount),0) as t FROM spp_transactions WHERE month=? AND year=?").get(m, year) as any).t
        + (db().prepare(`SELECT COALESCE(SUM(amount),0) as t FROM other_income WHERE strftime('%Y-%m', date)=?`).get(`${year}-${String(m).padStart(2, '0')}`) as any).t
        + (db().prepare(`SELECT COALESCE(SUM(amount),0) as t FROM building_fee_payments WHERE strftime('%Y-%m', paid_at)=?`).get(`${year}-${String(m).padStart(2, '0')}`) as any).t;
      const exp = (db().prepare("SELECT COALESCE(SUM(net_salary),0) as t FROM salary_transactions WHERE month=? AND year=?").get(m, year) as any).t
        + (db().prepare(`SELECT COALESCE(SUM(amount),0) as t FROM procurement WHERE strftime('%Y-%m', date)=?`).get(`${year}-${String(m).padStart(2, '0')}`) as any).t
        + (db().prepare(`SELECT COALESCE(SUM(amount),0) as t FROM routine_expenses WHERE strftime('%Y-%m', date)=?`).get(`${year}-${String(m).padStart(2, '0')}`) as any).t;
      monthlyTrend.push({ month: m, income: inc, expense: exp });
    }

    const recentSpp = db().prepare(`SELECT st.*, s.name as student_name FROM spp_transactions st JOIN students s ON s.id = st.student_id ORDER BY st.created_at DESC LIMIT 5`).all();

    const sppArrears = (db().prepare(`SELECT COUNT(DISTINCT student_id) as c FROM students s WHERE s.status='Aktif' AND s.id NOT IN (SELECT student_id FROM spp_transactions WHERE month=? AND year=?)`).get(month, year) as any).c;

    return {
      totalStudents,
      totalEmployees,
      monthlyIncome: sppMonth + otherIncomeMonth + buildingFeeMonth,
      monthlyExpense: salaryMonth,
      annualExpense: procurementTotal + routineTotal,
      sppArrears,
      monthlyTrend,
      recentTransactions: recentSpp,
    };
  });

  // Reports
  ipcMain.handle('reports:income', (_e, { year, month }: any) => {
    let q = 'SELECT st.*, s.name as student_name, s.class FROM spp_transactions st JOIN students s ON s.id = st.student_id WHERE st.year = ?';
    const p: any[] = [year];
    if (month) { q += ' AND st.month = ?'; p.push(month); }
    const spp = db().prepare(q).all(...p);
    const otherQ = `SELECT oi.*, ac.name as account_name FROM other_income oi LEFT JOIN account_categories ac ON ac.id = oi.account_id WHERE strftime('%Y', oi.date) = ?`;
    const other = db().prepare(otherQ).all(String(year));
    const bf = db().prepare(`SELECT bfp.*, bfb.type, s.name as student_name FROM building_fee_payments bfp JOIN building_fee_bills bfb ON bfb.id = bfp.bill_id JOIN students s ON s.id = bfb.student_id WHERE strftime('%Y', bfp.paid_at) = ?`).all(String(year));
    return { spp, other, buildingFee: bf };
  });

  ipcMain.handle('reports:expense', (_e, { year, month }: any) => {
    let salQ = 'SELECT st.*, e.name as employee_name FROM salary_transactions st JOIN employees e ON e.id = st.employee_id WHERE st.year = ?';
    const sp: any[] = [year];
    if (month) { salQ += ' AND st.month = ?'; sp.push(month); }
    const salary = db().prepare(salQ).all(...sp);
    const proc = db().prepare(`SELECT * FROM procurement WHERE strftime('%Y', date) = ?`).all(String(year));
    const routine = db().prepare(`SELECT re.*, ac.name as account_name FROM routine_expenses re LEFT JOIN account_categories ac ON ac.id = re.account_id WHERE strftime('%Y', re.date) = ?`).all(String(year));
    const discount = db().prepare(`SELECT * FROM discounts WHERE strftime('%Y', created_at) = ?`).all(String(year));
    return { salary, procurement: proc, routine, discount };
  });

  ipcMain.handle('reports:trialBalance', (_e, { year }: any) => {
    const accounts = db().prepare('SELECT * FROM account_categories ORDER BY code').all() as any[];
    const result = accounts.map((acc: any) => {
      let debit = 0, credit = 0;
      if (acc.code === '1-1000' || acc.code === '1-1100') {
        const sppInc = (db().prepare('SELECT COALESCE(SUM(amount),0) as t FROM spp_transactions WHERE year=?').get(year) as any).t;
        debit = sppInc;
      }
      return { ...acc, debit, credit, balance: acc.normal_balance === 'debit' ? debit - credit : credit - debit };
    });
    return result;
  });

  ipcMain.handle('reports:profitLoss', (_e, { year }: any) => {
    const sppInc = (db().prepare('SELECT COALESCE(SUM(amount),0) as t FROM spp_transactions WHERE year=?').get(year) as any).t;
    const otherInc = (db().prepare(`SELECT COALESCE(SUM(amount),0) as t FROM other_income WHERE strftime('%Y', date)=?`).get(String(year)) as any).t;
    const bfInc = (db().prepare(`SELECT COALESCE(SUM(amount),0) as t FROM building_fee_payments WHERE strftime('%Y', paid_at)=?`).get(String(year)) as any).t;
    const salExp = (db().prepare('SELECT COALESCE(SUM(net_salary),0) as t FROM salary_transactions WHERE year=?').get(year) as any).t;
    const procExp = (db().prepare(`SELECT COALESCE(SUM(amount),0) as t FROM procurement WHERE strftime('%Y', date)=?`).get(String(year)) as any).t;
    const routExp = (db().prepare(`SELECT COALESCE(SUM(amount),0) as t FROM routine_expenses WHERE strftime('%Y', date)=?`).get(String(year)) as any).t;
    const totalIncome = sppInc + otherInc + bfInc;
    const totalExpense = salExp + procExp + routExp;
    return { sppInc, otherInc, bfInc, totalIncome, salExp, procExp, routExp, totalExpense, netProfit: totalIncome - totalExpense };
  });

  ipcMain.handle('reports:generalLedger', (_e, { accountId, year }: any) => {
    // Build ledger rows from all transaction tables for a given account
    const rows: any[] = [];
    if (!accountId) return rows;
    const acc = db().prepare('SELECT * FROM account_categories WHERE id = ?').get(accountId) as any;
    if (!acc) return rows;
    const yStr = String(year || new Date().getFullYear());
    // SPP income (credit Pendapatan, debit Kas)
    if (acc.code === '1-1000' || acc.code === '4-1000') {
      const spps = db().prepare(`SELECT st.created_at as date, s.name || ' SPP ' || st.month || '/' || st.year as description, st.amount FROM spp_transactions st JOIN students s ON s.id = st.student_id WHERE st.year = ?`).all(Number(yStr)) as any[];
      for (const r of spps) {
        rows.push({ date: r.date?.slice(0, 10), description: r.description, debit: acc.code === '1-1000' ? r.amount : 0, credit: acc.code === '4-1000' ? r.amount : 0 });
      }
    }
    // Salary expense
    if (acc.code === '5-1000' || acc.code === '1-1000') {
      const sals = db().prepare(`SELECT st.created_at as date, e.name || ' Gaji ' || st.month || '/' || st.year as description, st.net_salary as amount FROM salary_transactions st JOIN employees e ON e.id = st.employee_id WHERE st.year = ?`).all(Number(yStr)) as any[];
      for (const r of sals) {
        rows.push({ date: r.date?.slice(0, 10), description: r.description, debit: acc.code === '5-1000' ? r.amount : 0, credit: acc.code === '1-1000' ? r.amount : 0 });
      }
    }
    // Procurement
    if (acc.code === '5-3000' || acc.code === '1-1000') {
      const procs = db().prepare(`SELECT date, 'Pengadaan: ' || vendor || ' - ' || items as description, amount FROM procurement WHERE strftime('%Y',date)=?`).all(yStr) as any[];
      for (const r of procs) {
        rows.push({ date: r.date, description: r.description, debit: acc.code === '5-3000' ? r.amount : 0, credit: acc.code === '1-1000' ? r.amount : 0 });
      }
    }
    return rows.sort((a, b) => a.date > b.date ? 1 : -1);
  });

  ipcMain.handle('reports:cashFlow', (_e, { year }: any) => {
    const y = year || new Date().getFullYear();
    const yStr = String(y);
    const sppTotal = (db().prepare('SELECT COALESCE(SUM(amount),0) as t FROM spp_transactions WHERE year=?').get(y) as any).t;
    const otherTotal = (db().prepare(`SELECT COALESCE(SUM(amount),0) as t FROM other_income WHERE strftime('%Y',date)=?`).get(yStr) as any).t;
    const bfTotal = (db().prepare(`SELECT COALESCE(SUM(amount),0) as t FROM building_fee_payments WHERE strftime('%Y',paid_at)=?`).get(yStr) as any).t;
    const salTotal = (db().prepare('SELECT COALESCE(SUM(net_salary),0) as t FROM salary_transactions WHERE year=?').get(y) as any).t;
    const procTotal = (db().prepare(`SELECT COALESCE(SUM(amount),0) as t FROM procurement WHERE strftime('%Y',date)=?`).get(yStr) as any).t;
    const routTotal = (db().prepare(`SELECT COALESCE(SUM(amount),0) as t FROM routine_expenses WHERE strftime('%Y',date)=?`).get(yStr) as any).t;
    const operating = [
      { label: 'Penerimaan SPP', amount: sppTotal },
      { label: 'Penerimaan Uang Gedung & Pangkal', amount: bfTotal },
      { label: 'Penerimaan Lain-lain', amount: otherTotal },
      { label: 'Pembayaran Gaji Karyawan', amount: -salTotal },
      { label: 'Pengeluaran Rutin', amount: -routTotal },
    ];
    const investing = [
      { label: 'Pengadaan Barang & Jasa', amount: -procTotal },
    ];
    const financing: any[] = [];
    return {
      operating,
      investing,
      financing,
      netOperating: sppTotal + bfTotal + otherTotal - salTotal - routTotal,
      netInvesting: -procTotal,
      netFinancing: 0,
      openingBalance: 0,
    };
  });

  ipcMain.handle('reports:balanceSheet', (_e, { year }: any) => {
    const y = year || new Date().getFullYear();
    const yStr = String(y);
    const sppInc = (db().prepare('SELECT COALESCE(SUM(amount),0) as t FROM spp_transactions WHERE year<=?').get(y) as any).t;
    const otherInc = (db().prepare(`SELECT COALESCE(SUM(amount),0) as t FROM other_income WHERE strftime('%Y',date)<=?`).get(yStr) as any).t;
    const bfInc = (db().prepare(`SELECT COALESCE(SUM(amount),0) as t FROM building_fee_payments WHERE strftime('%Y',paid_at)<=?`).get(yStr) as any).t;
    const salExp = (db().prepare('SELECT COALESCE(SUM(net_salary),0) as t FROM salary_transactions WHERE year<=?').get(y) as any).t;
    const procExp = (db().prepare(`SELECT COALESCE(SUM(amount),0) as t FROM procurement WHERE strftime('%Y',date)<=?`).get(yStr) as any).t;
    const routExp = (db().prepare(`SELECT COALESCE(SUM(amount),0) as t FROM routine_expenses WHERE strftime('%Y',date)<=?`).get(yStr) as any).t;
    const cash = Math.max(0, sppInc + otherInc + bfInc - salExp - procExp - routExp);
    const retained = sppInc + otherInc + bfInc - salExp - procExp - routExp;
    return {
      assets: [{ code: '1-1000', name: 'Kas & Bank', balance: cash }],
      totalAssets: cash,
      liabilities: [],
      totalLiabilities: 0,
      equity: [{ code: '3-1000', name: 'Modal & Laba Ditahan', balance: retained }],
      totalEquity: retained,
    };
  });

  // Backup & Restore
  ipcMain.handle('backup:create', async (_e) => {
    const { filePath } = await dialog.showSaveDialog({ defaultPath: `eduvault-backup-${Date.now()}.db`, filters: [{ name: 'Database', extensions: ['db'] }] });
    if (!filePath) return { success: false, message: 'Cancelled' };
    const srcPath = path.join(app.getPath('userData'), 'eduvault.db');
    fs.copyFileSync(srcPath, filePath);
    return { success: true, path: filePath };
  });

  ipcMain.handle('backup:restore', async (_e) => {
    const { filePaths } = await dialog.showOpenDialog({ filters: [{ name: 'Database', extensions: ['db'] }], properties: ['openFile'] });
    if (!filePaths[0]) return { success: false, message: 'Cancelled' };
    const destPath = path.join(app.getPath('userData'), 'eduvault.db');
    fs.copyFileSync(filePaths[0], destPath);
    return { success: true };
  });
}
