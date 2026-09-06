-- Jalankan di Neon SQL Editor untuk mengganti daftar jenis APD lama
-- dengan daftar baru: Helm Safety, Tali Helm, Kacamata Safety, Sepatu Safety,
-- Ear Plug, Rompi Reflektif.
--
-- PERHATIAN: karena penerimaan_apd.jenis_apd_id mengacu ke jenis_apd,
-- jalankan ini HANYA jika belum ada data tanda terima yang penting untuk
-- disimpan (mis. masih tahap uji coba). Kalau sudah ada data produksi asli,
-- beri tahu saya dulu supaya jenis lama tidak dihapus, cukup ditambah.

TRUNCATE penerimaan_apd RESTART IDENTITY;
DELETE FROM jenis_apd;
ALTER SEQUENCE jenis_apd_id_seq RESTART WITH 1;

INSERT INTO jenis_apd (nama, kategori, standar, masa_pakai_bulan, wajib_area) VALUES
  ('Helm Safety',     'Kepala',      'SNI 1811:2007',   24, 'Area konstruksi & produksi'),
  ('Tali Helm',       'Kepala',      'SNI 1811:2007',   12, 'Dipakai bersama Helm Safety'),
  ('Kacamata Safety', 'Mata',        'SNI EN 166:2017', 12, 'Area gerinda, las, bahan kimia'),
  ('Sepatu Safety',   'Kaki',        'SNI 0111:2009',   12, 'Seluruh area produksi & gudang'),
  ('Ear Plug',        'Pendengaran', 'SNI EN 352-2',     3, 'Area bising > 85 dB'),
  ('Rompi Reflektif', 'Tubuh',       'SNI 7658:2010',   12, 'Area lalu lintas kendaraan');
