export type JenisApd = {
  id: number;
  nama: string;
  kategori: string;
  standar: string | null;
  masa_pakai_bulan: number;
  wajib_area: string | null;
  aktif: boolean;
};

export type Penerimaan = {
  id: number;
  nama_pekerja: string;
  nik: string;
  jabatan: string;
  departemen: string;
  jenis_apd_id: number;
  jenis_apd_nama?: string;
  merk_spesifikasi: string | null;
  ukuran: string | null;
  jumlah: number;
  kondisi: string;
  nomor_batch: string | null;
  tanggal_terima: string;
  tanggal_kadaluarsa: string;
  petugas_pemberi: string;
  paraf_pekerja: string;
  paraf_petugas: string;
  catatan: string | null;
  status: string;
  created_at: string;
};

export function tambahBulan(tanggalIso: string, bulan: number): string {
  const d = new Date(tanggalIso);
  d.setMonth(d.getMonth() + bulan);
  return d.toISOString().slice(0, 10);
}

export function formatTanggalID(tanggalIso: string): string {
  return new Date(tanggalIso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function hariMenujuKadaluarsa(tanggalKadaluarsa: string): number {
  const now = new Date();
  const target = new Date(tanggalKadaluarsa);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
