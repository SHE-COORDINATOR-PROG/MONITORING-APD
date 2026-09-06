"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import KpiCard from "@/components/KpiCard";
import { formatTanggalID } from "@/lib/types";
import type { JenisApd } from "@/lib/types";

type Stats = {
  ringkasan: {
    bulan_ini: number;
    bulan_lalu: number;
    total_sepanjang_waktu: number;
    total_pekerja_tercatat: number;
    total_transaksi: number;
  };
  perJenis: { jenis: string; total: number }[];
  perDepartemen: { departemen: string; total: number }[];
  trenBulanan: { bulan: string; total: number }[];
  akanKadaluarsa: {
    id: number;
    nama_pekerja: string;
    nik: string;
    departemen: string;
    jenis_apd_nama: string;
    tanggal_kadaluarsa: string;
    sisa_hari: number;
  }[];
};

const CHART_TICK = { fill: "#8b98a3", fontSize: 12 };
const selectClass =
  "rounded-md border border-base-600 bg-base-800 px-3 py-2 text-sm text-base-100 focus:border-signal-amber focus:outline-none focus:ring-1 focus:ring-signal-amber";

const AUTO_REFRESH_MS = 20000;

export default function DashboardClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jenisList, setJenisList] = useState<JenisApd[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");
  const [jenisApdId, setJenisApdId] = useState("");

  useEffect(() => {
    fetch("/api/jenis-apd")
      .then((r) => r.json())
      .then((json) => setJenisList(json.data ?? []))
      .catch(() => void 0);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (dari) params.set("dari", dari);
    if (sampai) params.set("sampai", sampai);
    if (jenisApdId) params.set("jenis_apd_id", jenisApdId);
    const query = params.toString();

    let cancelled = false;

    const muatStats = async () => {
      setRefreshing(true);
      try {
        const res = await fetch(`/api/stats?${query}${query ? "&" : ""}_t=${Date.now()}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Gagal memuat data");
        if (cancelled) return;
        setStats(json);
        setError(null);
        setLastUpdated(new Date());
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Gagal memuat data");
      } finally {
        if (!cancelled) setRefreshing(false);
      }
    };

    // Muat segera saat filter berubah / pertama kali dibuka.
    muatStats();

    // Dashboard sebelumnya cuma fetch sekali dan tidak pernah update lagi
    // selama halaman dibiarkan terbuka. Sekarang di-refresh otomatis secara
    // berkala, dan segera setelah tab kembali aktif (mis. user habis isi
    // formulir di tab lain lalu balik ke tab dashboard).
    const interval = setInterval(muatStats, AUTO_REFRESH_MS);
    const onFocusOrVisible = () => {
      if (document.visibilityState === "visible") muatStats();
    };
    window.addEventListener("focus", onFocusOrVisible);
    document.addEventListener("visibilitychange", onFocusOrVisible);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener("focus", onFocusOrVisible);
      document.removeEventListener("visibilitychange", onFocusOrVisible);
    };
  }, [dari, sampai, jenisApdId]);

  const resetFilter = () => {
    setDari("");
    setSampai("");
    setJenisApdId("");
  };

  if (error) {
    return (
      <div className="m-6 rounded-lg border border-signal-red/40 bg-signal-red/10 p-4 text-sm text-base-100">
        {error}
      </div>
    );
  }

  if (!stats) {
    return <div className="p-6 text-sm text-base-400">Memuat data monitoring…</div>;
  }

  const { ringkasan, perJenis, perDepartemen, trenBulanan, akanKadaluarsa } = stats;
  const delta = ringkasan.bulan_ini - ringkasan.bulan_lalu;
  const deltaLabel =
    delta === 0
      ? "Sama seperti bulan lalu"
      : `${delta > 0 ? "+" : ""}${delta} unit vs bulan lalu`;
  const filterAktif = dari || sampai || jenisApdId;
  // recharts kadang menyimpan state hover/tooltip lama saat prop `data`
  // berubah drastis (mis. dari banyak kategori jadi satu kategori setelah
  // difilter), sehingga label/tooltip dari data sebelumnya masih nyangkut.
  // Memberi `key` yang berubah tiap kombinasi filter memaksa React
  // me-remount chart dari nol, bukan cuma update data-nya.
  const chartKey = `${dari}|${sampai}|${jenisApdId}`;

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-base-100">Monitoring Pemakaian APD</h1>
          <p className="mt-1 text-sm text-base-400">
            Ringkasan distribusi dan kepatuhan alat pelindung diri
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-base-500">
          {lastUpdated && (
            <span>
              Diperbarui {lastUpdated.toLocaleTimeString("id-ID")}
              {refreshing ? " · memuat…" : " · auto-refresh tiap 20 detik"}
            </span>
          )}
          <button
            onClick={() => {
              const params = new URLSearchParams();
              if (dari) params.set("dari", dari);
              if (sampai) params.set("sampai", sampai);
              if (jenisApdId) params.set("jenis_apd_id", jenisApdId);
              setRefreshing(true);
              fetch(`/api/stats?${params.toString()}${params.toString() ? "&" : ""}_t=${Date.now()}`, {
                cache: "no-store",
              })
                .then(async (res) => {
                  const json = await res.json();
                  if (!res.ok) throw new Error(json.error ?? "Gagal memuat data");
                  setStats(json);
                  setError(null);
                  setLastUpdated(new Date());
                })
                .catch((e) => setError(e instanceof Error ? e.message : "Gagal memuat data"))
                .finally(() => setRefreshing(false));
            }}
            disabled={refreshing}
            className="rounded-md border border-base-600 px-2 py-1 text-base-300 hover:bg-base-800 disabled:opacity-50"
          >
            {refreshing ? "Memuat…" : "Refresh sekarang"}
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border border-base-700 bg-base-900 p-3">
        <div>
          <label className="mb-1 block text-xs text-base-400">Dari tanggal</label>
          <input
            type="date"
            value={dari}
            onChange={(e) => setDari(e.target.value)}
            className={selectClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-base-400">Sampai tanggal</label>
          <input
            type="date"
            value={sampai}
            onChange={(e) => setSampai(e.target.value)}
            className={selectClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-base-400">Jenis APD</label>
          <select
            value={jenisApdId}
            onChange={(e) => setJenisApdId(e.target.value)}
            className={selectClass}
          >
            <option value="">Semua jenis</option>
            {jenisList.map((j) => (
              <option key={j.id} value={j.id}>
                {j.nama}
              </option>
            ))}
          </select>
        </div>
        {filterAktif && (
          <button
            onClick={resetFilter}
            className="rounded-md border border-base-600 px-3 py-2 text-sm text-base-300 hover:bg-base-800"
          >
            Reset filter
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <KpiCard label="Didistribusikan bulan ini" value={ringkasan.bulan_ini} sub={deltaLabel} />
        <KpiCard label="Total unit (sesuai filter)" value={ringkasan.total_sepanjang_waktu} />
        <KpiCard
          label="Jumlah transaksi (sesuai filter)"
          value={ringkasan.total_transaksi}
          sub="Cocokkan dengan total di Riwayat"
        />
        <KpiCard label="Pekerja tercatat" value={ringkasan.total_pekerja_tercatat} />
        <KpiCard
          label="Akan kadaluarsa ≤ 30 hari"
          value={akanKadaluarsa.length}
          accent={akanKadaluarsa.length > 0 ? "text-signal-amber" : "text-signal-green"}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="rounded-lg border border-base-700 bg-base-900 p-4 lg:col-span-3">
          <div className="mb-3 text-sm font-medium text-base-200">Tren distribusi (6 bulan)</div>
          <ResponsiveContainer key={chartKey} width="100%" height={220}>
            <LineChart data={trenBulanan}>
              <CartesianGrid stroke="#28323d" vertical={false} />
              <XAxis dataKey="bulan" tick={CHART_TICK} axisLine={{ stroke: "#28323d" }} tickLine={false} />
              <YAxis tick={CHART_TICK} axisLine={false} tickLine={false} width={30} />
              <Tooltip
                contentStyle={{ background: "#1c242d", border: "1px solid #28323d", fontSize: 12 }}
                labelStyle={{ color: "#e9edf0" }}
              />
              <Line type="monotone" dataKey="total" stroke="#e8a13a" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-base-700 bg-base-900 p-4 lg:col-span-2">
          <div className="mb-3 text-sm font-medium text-base-200">Distribusi per jenis APD</div>
          <ResponsiveContainer key={chartKey} width="100%" height={220}>
            <BarChart data={perJenis} layout="vertical" margin={{ left: 8 }}>
              <XAxis type="number" tick={CHART_TICK} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="jenis"
                tick={{ fill: "#8b98a3", fontSize: 11 }}
                width={110}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ background: "#1c242d", border: "1px solid #28323d", fontSize: 12 }}
                labelStyle={{ color: "#e9edf0" }}
              />
              <Bar dataKey="total" fill="#3f7ab0" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="rounded-lg border border-base-700 bg-base-900 p-4 lg:col-span-2">
          <div className="mb-3 text-sm font-medium text-base-200">Distribusi per departemen</div>
          <ResponsiveContainer key={chartKey} width="100%" height={220}>
            <BarChart data={perDepartemen}>
              <CartesianGrid stroke="#28323d" vertical={false} />
              <XAxis dataKey="departemen" tick={{ fill: "#8b98a3", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={CHART_TICK} axisLine={false} tickLine={false} width={30} />
              <Tooltip
                contentStyle={{ background: "#1c242d", border: "1px solid #28323d", fontSize: 12 }}
                labelStyle={{ color: "#e9edf0" }}
              />
              <Bar dataKey="total" fill="#4c9a6a" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-base-700 bg-base-900 p-4 lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-medium text-base-200">Perlu penggantian (≤ 30 hari)</div>
            <span className="rounded-full bg-signal-amber/15 px-2 py-0.5 text-xs text-signal-amber">
              {akanKadaluarsa.length} item
            </span>
          </div>
          <div className="scrollbar-thin max-h-[220px] overflow-y-auto">
            {akanKadaluarsa.length === 0 ? (
              <div className="py-8 text-center text-sm text-base-500">
                Tidak ada APD yang mendekati masa kadaluarsa.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-base-900 text-base-500">
                  <tr>
                    <th className="pb-2 font-normal">Pekerja</th>
                    <th className="pb-2 font-normal">Jenis APD</th>
                    <th className="pb-2 font-normal">Dept.</th>
                    <th className="pb-2 font-normal">Kadaluarsa</th>
                    <th className="pb-2 font-normal">Sisa</th>
                  </tr>
                </thead>
                <tbody>
                  {akanKadaluarsa.map((row) => (
                    <tr key={row.id} className="border-t border-base-800">
                      <td className="py-2 text-base-200">{row.nama_pekerja}</td>
                      <td className="py-2 text-base-300">{row.jenis_apd_nama}</td>
                      <td className="py-2 text-base-400">{row.departemen}</td>
                      <td className="py-2 font-mono text-base-400">
                        {formatTanggalID(row.tanggal_kadaluarsa)}
                      </td>
                      <td className="py-2">
                        <span
                          className={`font-mono ${
                            row.sisa_hari <= 7 ? "text-signal-red" : "text-signal-amber"
                          }`}
                        >
                          {row.sisa_hari} hari
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
