-- Skema database Monitoring & Tanda Terima APD
-- Acuan: Permenaker No. 8 Tahun 2010 tentang Alat Pelindung Diri (APD)
-- Jalankan file ini sekali di Neon SQL Editor (atau via psql) sebelum aplikasi dipakai.

CREATE TABLE IF NOT EXISTS jenis_apd (
  id            SERIAL PRIMARY KEY,
  nama          TEXT NOT NULL UNIQUE,          -- mis. "Helm Safety", "Sepatu Safety"
  kategori      TEXT NOT NULL,                 -- Kepala, Mata, Tangan, Kaki, Pernapasan, Tubuh, Pendengaran
  standar       TEXT,                          -- mis. "SNI 1811:2007", "ANSI Z87.1"
  masa_pakai_bulan INTEGER NOT NULL DEFAULT 12,-- default umur pakai untuk hitung kadaluarsa
  wajib_area    TEXT,                          -- area/pekerjaan yang wajib memakai (bebas teks)
  aktif         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS penerimaan_apd (
  id                  SERIAL PRIMARY KEY,
  nama_pekerja        TEXT NOT NULL,
  nik                 TEXT NOT NULL,
  jabatan             TEXT NOT NULL,
  departemen          TEXT NOT NULL,
  jenis_apd_id        INTEGER NOT NULL REFERENCES jenis_apd(id),
  merk_spesifikasi    TEXT,
  ukuran              TEXT,
  jumlah              INTEGER NOT NULL DEFAULT 1,
  kondisi             TEXT NOT NULL DEFAULT 'Baru',   -- Baru / Bekas Layak Pakai
  nomor_batch         TEXT,
  tanggal_terima      DATE NOT NULL,
  tanggal_kadaluarsa  DATE NOT NULL,
  petugas_pemberi     TEXT NOT NULL,             -- nama petugas K3 yang menyerahkan
  paraf_pekerja       TEXT NOT NULL,              -- konfirmasi tertulis nama sbg tanda terima
  paraf_petugas       TEXT NOT NULL,
  catatan             TEXT,
  status              TEXT NOT NULL DEFAULT 'Aktif',  -- Aktif / Diganti / Hilang / Rusak
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_penerimaan_tanggal ON penerimaan_apd (tanggal_terima);
CREATE INDEX IF NOT EXISTS idx_penerimaan_kadaluarsa ON penerimaan_apd (tanggal_kadaluarsa);
CREATE INDEX IF NOT EXISTS idx_penerimaan_departemen ON penerimaan_apd (departemen);
CREATE INDEX IF NOT EXISTS idx_penerimaan_jenis ON penerimaan_apd (jenis_apd_id);

-- Data awal jenis APD (sesuai lampiran Permenaker No. 8 Tahun 2010)
INSERT INTO jenis_apd (nama, kategori, standar, masa_pakai_bulan, wajib_area) VALUES
  ('Helm Safety',        'Kepala',       'SNI 1811:2007',  24, 'Area konstruksi & produksi'),
  ('Kacamata Safety',    'Mata',         'SNI EN 166:2017',12, 'Area gerinda, las, bahan kimia'),
  ('Sarung Tangan Kain', 'Tangan',       'SNI 0111:2012',   3, 'Area produksi umum'),
  ('Sarung Tangan Karet','Tangan',       'ANSI/ISEA 105',   6, 'Area kimia & elektrikal'),
  ('Sepatu Safety',      'Kaki',         'SNI 0111:2009',  12, 'Seluruh area produksi & gudang'),
  ('Masker N95',         'Pernapasan',   'NIOSH N95',       1, 'Area debu & partikel halus'),
  ('Respirator Half Face','Pernapasan',  'SNI EN 140:2011',12, 'Area bahan kimia & cat'),
  ('Ear Plug',           'Pendengaran',  'SNI EN 352-2',    3, 'Area bising > 85 dB'),
  ('Rompi Reflektif',    'Tubuh',        'SNI 7658:2010',  12, 'Area lalu lintas kendaraan'),
  ('Full Body Harness',  'Tubuh',        'SNI ISO 10333',  36, 'Bekerja di ketinggian > 1.8 m')
ON CONFLICT (nama) DO NOTHING;
