"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import type { JenisApd } from "@/lib/types";

type FormValues = {
  nama_pekerja: string;
  nik: string;
  jabatan: string;
  departemen: string;
  jenis_apd_id: string;
  merk_spesifikasi: string;
  ukuran: string;
  jumlah: number;
  kondisi: "Baru" | "Bekas Layak Pakai";
  nomor_batch: string;
  tanggal_terima: string;
  petugas_pemberi: string;
  paraf_pekerja: string;
  paraf_petugas: string;
  catatan: string;
  pernyataan: boolean;
};

const todayIso = () => new Date().toISOString().slice(0, 10);

function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm text-base-300">{label}</span>
      <div className="mt-1">{children}</div>
      {hint && !error && <span className="mt-1 block text-xs text-base-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-signal-red">{error}</span>}
    </label>
  );
}

const inputClass =
  "w-full rounded-md border border-base-600 bg-base-800 px-3 py-2 text-sm text-base-100 placeholder:text-base-500 focus:border-signal-amber focus:outline-none focus:ring-1 focus:ring-signal-amber";

export default function FormTandaTerima() {
  const [jenisList, setJenisList] = useState<JenisApd[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ id: number; tanggal_kadaluarsa: string } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  export default function FormTandaTerima() {
  const router = useRouter();
  const [jenisList, setJenisList] = useState<JenisApd[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { tanggal_terima: todayIso(), jumlah: 1, kondisi: "Baru" },
  });

  useEffect(() => {
    fetch("/api/jenis-apd")
      .then((r) => r.json())
      .then((json) => setJenisList(json.data ?? []))
      .catch(() => setServerError("Gagal memuat daftar jenis APD."));
  }, []);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
        setServerError(null);
    try {
      const res = await fetch("/api/penerimaan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "Gagal menyimpan data");
      }
      setResult(json.data);
      reset({ tanggal_terima: todayIso(), jumlah: 1, kondisi: "Baru" });
      router.refresh();
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="mx-auto max-w-lg p-4 md:p-8">
        <div className="rounded-lg border border-signal-green/40 bg-signal-green/10 p-6 text-center">
          <div className="text-signal-green">Tanda terima tersimpan</div>
          <div className="mt-2 font-mono text-2xl text-base-100">#{result.id}</div>
          <p className="mt-2 text-sm text-base-300">
            APD berlaku sampai{" "}
            <span className="font-mono text-base-100">
              {new Date(result.tanggal_kadaluarsa).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
            . Setelah tanggal ini, APD wajib diganti sesuai Permenaker No. 8 Tahun 2010.
          </p>
          <button
            onClick={() => setResult(null)}
            className="mt-6 rounded-md bg-signal-amber px-4 py-2 text-sm font-medium text-base-950"
          >
            Isi tanda terima baru
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-8">
      <h1 className="text-xl font-semibold text-base-100">Formulir Tanda Terima APD</h1>
      <p className="mt-1 text-sm text-base-400">
        Bukti serah terima alat pelindung diri sesuai Permenaker No. 8 Tahun 2010. Pastikan data
        diisi oleh petugas K3 dan dikonfirmasi langsung oleh pekerja penerima.
      </p>

      {serverError && (
        <div className="mt-4 rounded-md border border-signal-red/40 bg-signal-red/10 p-3 text-sm text-base-100">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
        <div className="rounded-lg border border-base-700 bg-base-900 p-4">
          <div className="mb-3 text-sm font-medium text-base-200">Data Pekerja</div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nama pekerja" error={errors.nama_pekerja?.message}>
              <input className={inputClass} {...register("nama_pekerja", { required: "Wajib diisi" })} />
            </Field>
            <Field label="NIK / No. induk karyawan" error={errors.nik?.message}>
              <input className={inputClass} {...register("nik", { required: "Wajib diisi" })} />
            </Field>
            <Field label="Jabatan" error={errors.jabatan?.message}>
              <input className={inputClass} {...register("jabatan", { required: "Wajib diisi" })} />
            </Field>
            <Field label="Departemen / unit kerja" error={errors.departemen?.message}>
              <input className={inputClass} {...register("departemen", { required: "Wajib diisi" })} />
            </Field>
          </div>
        </div>

        <div className="rounded-lg border border-base-700 bg-base-900 p-4">
          <div className="mb-3 text-sm font-medium text-base-200">Detail APD</div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Jenis APD" error={errors.jenis_apd_id?.message}>
              <select
                className={inputClass}
                {...register("jenis_apd_id", { required: "Wajib dipilih" })}
                defaultValue=""
              >
                <option value="" disabled>
                  Pilih jenis APD
                </option>
                {jenisList.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.nama} ({j.kategori})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Merk / spesifikasi" hint="Opsional">
              <input className={inputClass} {...register("merk_spesifikasi")} />
            </Field>
            <Field label="Ukuran" hint="Opsional, mis. M / L / 42">
              <input className={inputClass} {...register("ukuran")} />
            </Field>
            <Field label="Jumlah" error={errors.jumlah?.message}>
              <input
                type="number"
                min={1}
                className={inputClass}
                {...register("jumlah", { required: true, min: 1, valueAsNumber: true })}
              />
            </Field>
            <Field label="Kondisi">
              <select className={inputClass} {...register("kondisi")}>
                <option value="Baru">Baru</option>
                <option value="Bekas Layak Pakai">Bekas Layak Pakai</option>
              </select>
            </Field>
            <Field label="Nomor batch / lot" hint="Opsional, untuk ketertelusuran">
              <input className={inputClass} {...register("nomor_batch")} />
            </Field>
            <Field label="Tanggal diterima" error={errors.tanggal_terima?.message}>
              <input
                type="date"
                className={inputClass}
                {...register("tanggal_terima", { required: "Wajib diisi" })}
              />
            </Field>
          </div>
        </div>

        <div className="rounded-lg border border-base-700 bg-base-900 p-4">
          <div className="mb-3 text-sm font-medium text-base-200">Serah Terima</div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Petugas K3 yang menyerahkan" error={errors.petugas_pemberi?.message}>
              <input className={inputClass} {...register("petugas_pemberi", { required: "Wajib diisi" })} />
            </Field>
            <Field
              label="Konfirmasi nama pekerja (paraf digital)"
              error={errors.paraf_pekerja?.message}
              hint="Pekerja mengetik ulang namanya sebagai bukti persetujuan"
            >
              <input className={inputClass} {...register("paraf_pekerja", { required: "Wajib diisi" })} />
            </Field>
            <Field
              label="Konfirmasi nama petugas (paraf digital)"
              error={errors.paraf_petugas?.message}
            >
              <input className={inputClass} {...register("paraf_petugas", { required: "Wajib diisi" })} />
            </Field>
            <Field label="Catatan" hint="Opsional">
              <input className={inputClass} {...register("catatan")} />
            </Field>
          </div>

          <label className="mt-4 flex items-start gap-2 text-xs text-base-400">
            <input
              type="checkbox"
              className="mt-0.5"
              {...register("pernyataan", { required: "Pernyataan wajib dicentang" })}
            />
            <span>
              Pekerja menyatakan telah menerima APD dalam kondisi baik dan berkomitmen
              menggunakannya sesuai prosedur K3 yang berlaku, sebagaimana diatur dalam Permenaker
              No. 8 Tahun 2010 Pasal 6.
            </span>
          </label>
          {errors.pernyataan && (
            <span className="mt-1 block text-xs text-signal-red">{errors.pernyataan.message}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-signal-amber py-2.5 text-sm font-medium text-base-950 disabled:opacity-60"
        >
          {submitting ? "Menyimpan…" : "Simpan Tanda Terima"}
        </button>
      </form>
    </div>
  );
}
