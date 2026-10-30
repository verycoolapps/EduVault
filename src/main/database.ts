import Database from 'better-sqlite3';
import * as bcrypt from 'bcryptjs';
import * as path from 'path';
import { app } from 'electron';

let db: Database.Database;

export function getDb(): Database.Database {
  return db;
}

export function initDatabase(): void {
  const dbPath = path.join(app.getPath('userData'), 'eduvault.db');
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  createTables();
  seedDefaults();
}

function createTables(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS school_info (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nis TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      class TEXT NOT NULL,
      status TEXT DEFAULT 'Aktif',
      address TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS account_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      grp TEXT NOT NULL,
      normal_balance TEXT DEFAULT 'debit'
    );

    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nip TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      position TEXT NOT NULL,
      base_salary REAL DEFAULT 0,
      fixed_allowance REAL DEFAULT 0,
      bank_account TEXT,
      status TEXT DEFAULT 'Aktif',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS spp_rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_name TEXT NOT NULL,
      monthly_amount REAL NOT NULL,
      year INTEGER NOT NULL,
      UNIQUE(class_name, year)
    );

    CREATE TABLE IF NOT EXISTS spp_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT DEFAULT 'Tunai',
      ref_no TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id),
      UNIQUE(student_id, month, year)
    );

    CREATE TABLE IF NOT EXISTS building_fee_bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      total_amount REAL NOT NULL,
      installments INTEGER DEFAULT 1,
      paid_installments INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id)
    );

    CREATE TABLE IF NOT EXISTS building_fee_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bill_id INTEGER NOT NULL,
      installment_no INTEGER NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT DEFAULT 'Tunai',
      ref_no TEXT,
      paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (bill_id) REFERENCES building_fee_bills(id)
    );

    CREATE TABLE IF NOT EXISTS other_income (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS salary_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      base_salary REAL NOT NULL,
      fixed_allowance REAL DEFAULT 0,
      variable_allowance REAL DEFAULT 0,
      pph_deduction REAL DEFAULT 0,
      bpjs_deduction REAL DEFAULT 0,
      loan_deduction REAL DEFAULT 0,
      net_salary REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id),
      UNIQUE(employee_id, month, year)
    );

    CREATE TABLE IF NOT EXISTS discounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      reference_id INTEGER,
      amount REAL NOT NULL,
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS procurement (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vendor TEXT NOT NULL,
      items TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS routine_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS journal_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ref_no TEXT,
      date TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS journal_lines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_id INTEGER NOT NULL,
      account_id INTEGER NOT NULL,
      debit REAL DEFAULT 0,
      credit REAL DEFAULT 0,
      FOREIGN KEY (entry_id) REFERENCES journal_entries(id)
    );
  `);
}

function seedDefaults(): void {
  const userCount = (db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }).c;
  if (userCount === 0) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run('admin', hash, 'admin');
  }

  const infoCount = (db.prepare('SELECT COUNT(*) as c FROM school_info').get() as { c: number }).c;
  if (infoCount === 0) {
    const defaults = [
      ['school_name', 'SMA Negeri 1 Indonesia'],
      ['address', 'Jl. Pendidikan No. 1, Jakarta'],
      ['phone', '021-1234567'],
      ['email', 'admin@smanegeri1.sch.id'],
      ['principal', 'Dr. Kepala Sekolah, M.Pd'],
      ['year', '2025'],
    ];
    const stmt = db.prepare('INSERT INTO school_info (key, value) VALUES (?, ?)');
    for (const [k, v] of defaults) stmt.run(k, v);
  }

  const accCount = (db.prepare('SELECT COUNT(*) as c FROM account_categories').get() as { c: number }).c;
  if (accCount === 0) {
    const accounts = [
      ['1-1000', 'Kas', 'Aktiva', 'Kas', 'debit'],
      ['1-1100', 'Bank BCA', 'Aktiva', 'Bank', 'debit'],
      ['1-1200', 'Piutang SPP', 'Aktiva', 'Piutang', 'debit'],
      ['1-1300', 'Piutang Uang Gedung', 'Aktiva', 'Piutang', 'debit'],
      ['1-2000', 'Peralatan', 'Aktiva', 'Aset Tetap', 'debit'],
      ['2-1000', 'Utang Gaji', 'Kewajiban', 'Utang Jk. Pendek', 'credit'],
      ['2-2000', 'Utang Pajak', 'Kewajiban', 'Utang Jk. Pendek', 'credit'],
      ['3-1000', 'Modal Sekolah', 'Ekuitas', 'Modal', 'credit'],
      ['4-1000', 'Pendapatan SPP', 'Pendapatan', 'Pend. Operasional', 'credit'],
      ['4-1100', 'Pendapatan Uang Gedung', 'Pendapatan', 'Pend. Operasional', 'credit'],
      ['4-1200', 'Pendapatan Uang Pangkal', 'Pendapatan', 'Pend. Operasional', 'credit'],
      ['4-2000', 'Pendapatan Hibah', 'Pendapatan', 'Pend. Non-Operasional', 'credit'],
      ['4-2100', 'Pendapatan Sponsor', 'Pendapatan', 'Pend. Non-Operasional', 'credit'],
      ['4-2200', 'Bunga Bank', 'Pendapatan', 'Pend. Non-Operasional', 'credit'],
      ['5-1000', 'Biaya Gaji', 'Biaya', 'Biaya Operasional', 'debit'],
      ['5-2000', 'Biaya Listrik', 'Biaya', 'Biaya Operasional', 'debit'],
      ['5-2100', 'Biaya Air', 'Biaya', 'Biaya Operasional', 'debit'],
      ['5-2200', 'Biaya Telepon', 'Biaya', 'Biaya Operasional', 'debit'],
      ['5-2300', 'Biaya ATK', 'Biaya', 'Biaya Operasional', 'debit'],
      ['5-2400', 'Biaya Kebersihan', 'Biaya', 'Biaya Operasional', 'debit'],
      ['5-2500', 'Biaya Keamanan', 'Biaya', 'Biaya Operasional', 'debit'],
      ['5-3000', 'Biaya Pengadaan', 'Biaya', 'Biaya Operasional', 'debit'],
      ['5-4000', 'PPH 21', 'Biaya', 'Pajak', 'debit'],
      ['5-4100', 'BPJS', 'Biaya', 'Pajak', 'debit'],
    ];
    const stmt = db.prepare('INSERT INTO account_categories (code, name, type, grp, normal_balance) VALUES (?, ?, ?, ?, ?)');
    for (const a of accounts) stmt.run(...a);
  }
}
