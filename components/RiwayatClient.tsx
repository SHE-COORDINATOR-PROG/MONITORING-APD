"use client";

import { useEffect, useState } from "react";
import type { JenisApd, Penerimaan } from "@/lib/types";
import { formatTanggalID } from "@/lib/types";

const inputClass =
  "w-full rounded-md border border-base-600 bg-base-800 px-3 py-2 text-sm text-base-100 placeholder:text-base-500 focus:border-signal-amber focus:outline-none focus:ring-1 focus:ring-signal-amber";

const STATUS_WARNA: Record<string, string> = {
  Aktif: "text-signal-green",
  Diganti: "text-base-400",
  Hilang: "text-signal-red",
  Rusak: "text-signal-red",
};

export default function RiwayatClient() {
  const [data, setData] = useState<Penerimaan[]>([]);
  const [jenisList, setJenisList] = useState<JenisApd[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [nama, setNama] = useState("");
  const [nik, setNik] = useState("");
  const [jenisApdId, setJenisApdId] = useState("");
  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");

  useEffect(() => {
    fetch("/api/jenis-apd")
      .then((r) => r.json())
      .then((json) => setJenisList(json.data ?? []))
      .catch(() => void 0);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams();
      if (nama) params.set("nama", nama);
      if (nik) params.set("nik", nik);
      if (jenisApdId) params.set("jenis_apd_id", jenisApdId);
      if (dari) params.set("dari", dari);
      if (sampai) params.set("sampai", sampai);
      params.set("limit", "100");

      fetch(`/api/penerimaan?${params.toString()}`, { cache: "no-store" })
        .then(async (res) => {
          const json = await res.json();
          if (!res.ok) throw new Error(json.error ?? "Gagal memuat data");
          setData(json.data ?? []);
          setError(null);
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 350);

    return () => clearTimeout(timeout);
  }, [nama, nik, jenisApdId, dari, sampai]);

  const resetFilter = () => {
    setNama("");
    setNik("");
    setJenisApdId("");
    setDari("");
    setSampai("");
  };

  const filterAktif = nama || nik || jenisApdId || dari || sampai;

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-xl font-semibold text-base-100">Riwayat Penerima APD</h1>
      <p className="mt-1 text-sm text-base-400">
        Daftar seluruh tanda terima APD yang tercatat. Gunakan filter untuk menelusuri
        berdasarkan pekerja, jenis APD, atau periode waktu.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-base-700 bg-base-900 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="mb-1 block text-xs text-base-400">Nama pekerja</label>
          <input
            className={inputClass}
            placeholder="Cari nama…"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-base-400">NRP / NIK</label>
          <input
            className={inputClass}
            placeholder="Cari NRP/NIK…"
            value={nik}
            onChange={(e) => setNik(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-base-400">Jenis APD</label>
          <select
            className={inputClass}
            value={jenisApdId}
            onChange={(e) => setJenisApdId(e.target.value)}
          >
            <option value="">Semua jenis</option>
            {jenisList.map((j) => (
              <option key={j.id} value={j.id}>
                {j.nama}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-base-400">Dari tanggal</label>
          <input
            type="date"
            className={inputClass}
            value={dari}
            onChange={(e) => setDari(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-base-400">Sampai tanggal</label>
          <input
            type="date"
            className={inputClass}
            value={sampai}
            onChange={(e) => setSampai(e.target.value)}
          />
        </div>
      </div>

      {filterAktif && (
        <button
          onClick={resetFilter}
          className="mt-3 rounded-md border border-base-600 px-3 py-1.5 text-xs text-base-300 hover:bg-base-800"
        >
          Reset filter
        </button>
      )}

      <div className="mt-4 rounded-lg border border-base-700 bg-base-900">
        {error ? (
          <div className="p-4 text-sm text-signal-red">{error}</div>
        ) : loading ? (
          <div className="p-6 text-sm text-base-400">Memuat data…</div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-sm text-base-500">
            Tidak ada data yang cocok dengan filter.
          </div>
        ) : (
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-xs">
              <thead className="border-b border-base-700 text-base-500">
                <tr>
                  <th className="px-4 py-3 font-normal">Nama</th>
                  <th className="px-4 py-3 font-normal">NRP/NIK</th>
                  <th className="px-4 py-3 font-normal">Jabatan</th>
                  <th className="px-4 py-3 font-normal">Departemen</th>
                  <th className="px-4 py-3 font-normal">Jenis APD</th>
                  <th className="px-4 py-3 font-normal">Ukuran</th>
                  <th className="px-4 py-3 font-normal">Jml</th>
                  <th className="px-4 py-3 font-normal">Tgl Terima</th>
                  <th className="px-4 py-3 font-normal">Tgl Kadaluarsa</th>
                  <th className="px-4 py-3 font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.id} className="border-b border-base-800 last:border-0">
                    <td className="px-4 py-2.5 text-base-200">{row.nama_pekerja}</td>
                    <td className="px-4 py-2.5 font-mono text-base-400">{row.nik}</td>
                    <td className="px-4 py-2.5 text-base-300">{row.jabatan}</td>
                    <td className="px-4 py-2.5 text-base-300">{row.departemen}</td>
                    <td className="px-4 py-2.5 text-base-300">{row.jenis_apd_nama}</td>
                    <td className="px-4 py-2.5 text-base-400">{row.ukuran ?? "-"}</td>
                    <td className="px-4 py-2.5 font-mono text-base-300">{row.jumlah}</td>
                    <td className="px-4 py-2.5 font-mono text-base-400">
                      {formatTanggalID(row.tanggal_terima)}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-base-400">
                      {formatTanggalID(row.tanggal_kadaluarsa)}
                    </td>
                    <td className={`px-4 py-2.5 font-medium ${STATUS_WARNA[row.status] ?? "text-base-300"}`}>
                      {row.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {!loading && data.length > 0 && (
        <p className="mt-2 text-xs text-base-500">
          Menampilkan {data.length} data terbaru (maks. 100 baris per filter).
        </p>
      )}
    </div>
  );
}
