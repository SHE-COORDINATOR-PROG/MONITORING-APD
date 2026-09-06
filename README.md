# Monitoring APD

Aplikasi web untuk **monitoring pemakaian APD** dan **formulir tanda terima APD**,
mengacu pada **Permenaker No. 8 Tahun 2010 tentang Alat Pelindung Diri (APD)**.

Stack: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Neon (Postgres serverless).
Deploy target: GitHub (kode) → Vercel (hosting) → Neon (database).

## Fitur

- **Dashboard monitoring** (`/dashboard`): total distribusi bulan berjalan, tren 6 bulan,
  distribusi per jenis APD, distribusi per departemen, dan daftar APD yang mendekati
  masa kadaluarsa (≤ 30 hari) yang perlu diganti.
- **Formulir tanda terima APD** (`/form`): data pekerja, jenis & spesifikasi APD, kondisi,
  nomor batch untuk ketertelusuran, tanggal terima (masa kadaluarsa dihitung otomatis dari
  masa pakai jenis APD), tanda tangan digital (konfirmasi nama) petugas dan pekerja, serta
  pernyataan komitmen K3 sesuai Pasal 6 Permenaker No. 8/2010.
- Master data jenis APD sudah diisi dengan 10 jenis umum beserta standar (SNI/ANSI) dan
  masa pakai default — bisa ditambah langsung di tabel `jenis_apd`.

## 1. Siapkan database di Neon

1. Buat akun/proyek baru di [neon.tech](https://neon.tech) (gratis).
2. Di dashboard proyek, buka **Connection Details**, pilih **Pooled connection**, dan salin
   connection string-nya (format `postgresql://user:pass@ep-xxxx-pooler.../neondb?sslmode=require`).
3. Jalankan skema database dengan salah satu cara berikut:
   - **Lewat Neon SQL Editor** (paling mudah): buka tab *SQL Editor* di dashboard Neon,
     tempel seluruh isi file `db/schema.sql`, lalu jalankan (Run).
   - **Lewat terminal**, setelah `npm install`:
     ```bash
     DATABASE_URL="postgresql://...connection-string-anda..." npm run db:init
     ```

## 2. Jalankan di lokal (opsional, untuk pengecekan sebelum deploy)

```bash
npm install
cp .env.example .env.local
# isi DATABASE_URL di .env.local dengan connection string Neon
npm run dev
```

Buka `http://localhost:3000` (otomatis diarahkan ke `/dashboard`).

## 3. Push kode ke GitHub

```bash
git init
git add .
git commit -m "Inisialisasi aplikasi monitoring APD"
git branch -M main
git remote add origin https://github.com/<username-anda>/<nama-repo>.git
git push -u origin main
```

> `.env.local` sudah masuk `.gitignore` sehingga connection string tidak ikut ter-push.

## 4. Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com) → **Add New Project** → pilih repo GitHub di atas.
2. Vercel otomatis mendeteksi framework Next.js — biarkan pengaturan build default
   (`next build`).
3. Sebelum klik Deploy, buka **Environment Variables** dan tambahkan:
   - `DATABASE_URL` = connection string Neon (yang sama dengan langkah 1).
4. Klik **Deploy**. Setelah selesai, aplikasi bisa diakses di domain `*.vercel.app`
   yang diberikan Vercel.
5. Setiap `git push` ke branch `main` selanjutnya akan otomatis men-deploy ulang.

## Struktur data

- `jenis_apd` — master jenis APD, kategori, standar (SNI/ANSI), dan masa pakai default (bulan).
- `penerimaan_apd` — setiap baris adalah satu transaksi tanda terima APD oleh seorang
  pekerja, lengkap dengan tanggal kadaluarsa terhitung otomatis (`tanggal_terima` +
  `masa_pakai_bulan` dari jenis APD terkait).

## Menyesuaikan dengan kebutuhan internal

- **Menambah jenis APD**: tambah baris baru ke tabel `jenis_apd` (lewat SQL Editor Neon atau
  buat endpoint admin sendiri).
- **Menambah field wajib** (mis. nomor SO/PO, lokasi kerja spesifik): tambahkan kolom di
  `db/schema.sql`, lalu sesuaikan `app/api/penerimaan/route.ts` dan
  `components/FormTandaTerima.tsx`.
- **Autentikasi**: versi ini belum memiliki login. Untuk penggunaan internal perusahaan,
  disarankan menambahkan autentikasi (mis. NextAuth dengan SSO perusahaan) sebelum
  digunakan secara luas, terutama karena data berisi NIK pekerja.

## Lisensi data & privasi

Data yang dikumpulkan formulir ini (nama, NIK, jabatan) adalah data pribadi pekerja.
Pastikan akses ke dashboard Vercel/Neon dan URL aplikasi dibatasi hanya untuk pihak
yang berwenang (tim K3/HR), sesuai kebijakan perlindungan data internal perusahaan.
