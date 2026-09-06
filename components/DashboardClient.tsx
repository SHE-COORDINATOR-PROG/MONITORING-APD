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

export default function DashboardClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Gagal memuat data");
        setStats(json);
      })
      .catch((e) => setError(e.message));
  }, []);

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

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <h1 className="text-xl font-semibold text-base-100">Monitoring Pemakaian APD</h1>
          <p className="mt-1 text-sm text-base-400">
            Ringkasan distribusi dan kepatuhan alat pelindung diri
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Didistribusikan bulan ini" value={ringkasan.bulan_ini} sub={deltaLabel} />
        <KpiCard label="Total unit sepanjang waktu" value={ringkasan.total_sepanjang_waktu} />
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
          <ResponsiveContainer width="100%" height={220}>
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
          <ResponsiveContainer width="100%" height={220}>
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
          <ResponsiveContainer width="100%" height={220}>
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
