# Changelog / Catatan Perubahan

All notable changes to EduVault will be documented here.  
Semua perubahan penting pada EduVault dicatat di sini.

## [2.0.0] - 2025-10-30

### 🎉 Major Release — Complete Rewrite

#### ✨ New Features / Fitur Baru
- **Bilingual UI** — Toggle bahasa Indonesia ↔ English kapan saja
- **Dark Mode** — Tema gelap yang nyaman untuk penggunaan malam
- **macOS Support** — Kini tersedia untuk Mac (Apple Silicon & Intel)
- **Dashboard Modern** — KPI cards, grafik interaktif, quick actions
- **Cetak Kwitansi PDF** — Kwitansi SPP & Uang Gedung format profesional
- **Slip Gaji PDF** — Slip gaji karyawan siap cetak
- **Export Excel** — Semua laporan bisa diekspor ke .xlsx
- **Auto Backup** — Backup terjadwal otomatis
- **Audit Trail** — Semua perubahan tercatat dengan timestamp
- **Multi-User** — Role Admin dan Staff

#### 🔄 Improvements / Peningkatan
- UI/UX yang jauh lebih modern dan intuitif
- Performa database yang lebih cepat
- Error handling yang lebih baik
- Validasi input yang lebih ketat

#### 🔐 Security / Keamanan
- Password hashing dengan bcrypt (salt rounds 12)
- Context isolation Electron diaktifkan
- Input sanitization di semua form
- Tidak ada remote code execution

---

## [1.0.0] - 2025-05-29

### 🚀 Initial Release
- Windows-only desktop app
- SPP management
- Basic financial reports
- Backup & restore
