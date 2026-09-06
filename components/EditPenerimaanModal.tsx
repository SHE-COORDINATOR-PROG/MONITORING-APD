"use client";

import { useState } from "react";
import type { JenisApd, Penerimaan } from "@/lib/types";

const inputClass =
  "w-full rounded-md border border-base-600 bg-base-800 px-3 py-2 text-sm text-base-100 placeholder:text-base-500 focus:border-signal-amber focus:outline-none focus:ring-1 focus:ring-signal-amber";

export default function EditPenerimaanModal({
  row,
  jenisList,
  onClose,
  onSaved,
}: {
  row: Penerimaan;
  jenisList: JenisApd[];
  onClose: () => void;
  onSaved: (updated: Penerimaan) => void;
}) {
  const [jenisApdId, setJenisApdId] = useState(String(row.jenis_apd_id));
  const [ukuran, setUkuran] = useState(row.ukuran ?? "");
  const [jumlah, setJumlah] = useState(row.jumlah);
  const [kondisi, setKondisi] = useState(row.kondisi);
  const [status, setStatus] = useState(row.status);
  const [catatan, setCatatan] = useState(row.catatan ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/penerimaan/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jenis_apd_id: Number(jenisApdId),
          ukuran: ukuran || null,
          jumlah,
          kondisi,
          status,
          catatan: catatan || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Gagal menyimpan perubahan");
      onSaved(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-lg border border-base-700 bg-base-900 p-5">
        <div className="mb-4">
          <div className="text-sm font-medium text-base-100">
            Edit tanda terima #{row.id}
          </div>
          <div className="mt-0.5 text-xs text-base-400">
            {row.nama_pekerja} · {row.nik}
          </div>
        </div>

        {error && (
          <div className="mb-3 rounded-md border border-signal-red/40 bg-signal-red/10 p-2 text-xs text-base-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm text-base-300">Jenis APD</span>
            <select
              className={`mt-1 ${inputClass}`}
              value={jenisApdId}
              onChange={(e) => setJenisApdId(e.target.value)}
            >
              {jenisList.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nama} ({j.kategori})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-base-300">Ukuran</span>
            <input
              className={`mt-1 ${inputClass}`}
              value={ukuran}
              onChange={(e) => setUkuran(e.target.value)}
              placeholder="Opsional, mis. M / L / 42"
            />
          </label>

          <label className="block">
            <span className="text-sm text-base-300">Jumlah</span>
            <input
              type="number"
              min={1}
              className={`mt-1 ${inputClass}`}
              value={jumlah}
              onChange={(e) => setJumlah(Number(e.target.value))}
            />
          </label>

          <label className="block">
            <span className="text-sm text-base-300">Kondisi</span>
            <select
              className={`mt-1 ${inputClass}`}
              value={kondisi}
              onChange={(e) => setKondisi(e.target.value as Penerimaan["kondisi"])}
            >
              <option value="Baru">Baru</option>
              <option value="Bekas Layak Pakai">Bekas Layak Pakai</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-base-300">Status</span>
            <select
              className={`mt-1 ${inputClass}`}
              value={status}
              onChange={(e) => setStatus(e.target.value as Penerimaan["status"])}
            >
              <option value="Aktif">Aktif</option>
              <option value="Diganti">Diganti</option>
              <option value="Hilang">Hilang</option>
              <option value="Rusak">Rusak</option>
            </select>
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm text-base-300">Catatan</span>
            <input
              className={`mt-1 ${inputClass}`}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Opsional"
            />
          </label>
        </div>

        <p className="mt-3 text-xs text-base-500">
          Kalau jenis APD diganti, tanggal kadaluarsa dihitung ulang otomatis dari
          tanggal terima + masa pakai jenis APD yang baru.
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-md border border-base-600 px-3 py-2 text-sm text-base-300 hover:bg-base-800 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="rounded-md bg-signal-amber px-4 py-2 text-sm font-medium text-base-100 disabled:opacity-60"
          >
            {submitting ? "Menyimpan…" : "Simpan perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}
