import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
} as const;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dari = searchParams.get("dari"); // YYYY-MM-DD
    const sampai = searchParams.get("sampai"); // YYYY-MM-DD
    const jenisApdId = searchParams.get("jenis_apd_id");

    const [ringkasan] = await sql`
      SELECT
        COALESCE(SUM(jumlah) FILTER (WHERE date_trunc('month', tanggal_terima) = date_trunc('month', CURRENT_DATE)), 0) AS bulan_ini,
        COALESCE(SUM(jumlah) FILTER (WHERE date_trunc('month', tanggal_terima) = date_trunc('month', CURRENT_DATE - INTERVAL '1 month')), 0) AS bulan_lalu,
        COALESCE(SUM(jumlah), 0) AS total_sepanjang_waktu,
        COUNT(DISTINCT nik) AS total_pekerja_tercatat,
        COUNT(*) AS total_transaksi
      FROM penerimaan_apd
      WHERE
        (${dari}::date IS NULL OR tanggal_terima >= ${dari}::date)
        AND (${sampai}::date IS NULL OR tanggal_terima <= ${sampai}::date)
        AND (${jenisApdId}::int IS NULL OR jenis_apd_id = ${jenisApdId}::int)
    `;

    const perJenis = await sql`
      SELECT j.nama AS jenis, COALESCE(SUM(p.jumlah), 0) AS total
      FROM jenis_apd j
      LEFT JOIN penerimaan_apd p ON p.jenis_apd_id = j.id
        AND (${dari}::date IS NULL OR p.tanggal_terima >= ${dari}::date)
        AND (${sampai}::date IS NULL OR p.tanggal_terima <= ${sampai}::date)
      WHERE j.aktif = TRUE
        AND (${jenisApdId}::int IS NULL OR j.id = ${jenisApdId}::int)
      GROUP BY j.nama
      ORDER BY total DESC
    `;

    const perDepartemen = await sql`
      SELECT departemen, COALESCE(SUM(jumlah), 0) AS total
      FROM penerimaan_apd
      WHERE
        (${dari}::date IS NULL OR tanggal_terima >= ${dari}::date)
        AND (${sampai}::date IS NULL OR tanggal_terima <= ${sampai}::date)
        AND (${jenisApdId}::int IS NULL OR jenis_apd_id = ${jenisApdId}::int)
      GROUP BY departemen
      ORDER BY total DESC
      LIMIT 10
    `;

    const trenBulananRaw = await sql`
      SELECT
        bulan AS bulan_urut,
        to_char(bulan, 'Mon YYYY') AS bulan,
        COALESCE(total, 0) AS total
      FROM generate_series(
        date_trunc('month', CURRENT_DATE - INTERVAL '5 month'),
        date_trunc('month', CURRENT_DATE),
        INTERVAL '1 month'
      ) AS bulan
      LEFT JOIN (
        SELECT date_trunc('month', tanggal_terima) AS bulan, SUM(jumlah) AS total
        FROM penerimaan_apd
        WHERE (${jenisApdId}::int IS NULL OR jenis_apd_id = ${jenisApdId}::int)
        GROUP BY 1
      ) t USING (bulan)
      ORDER BY bulan_urut
    `;
    // urutan kronologis dijaga lewat kolom bantu bulan_urut, lalu dibuang dari response
    const trenBulanan = trenBulananRaw.map(({ bulan, total }) => ({ bulan, total }));

    const akanKadaluarsa = await sql`
      SELECT p.id, p.nama_pekerja, p.nik, p.departemen, j.nama AS jenis_apd_nama,
             p.tanggal_kadaluarsa,
             (p.tanggal_kadaluarsa - CURRENT_DATE) AS sisa_hari
      FROM penerimaan_apd p
      JOIN jenis_apd j ON j.id = p.jenis_apd_id
      WHERE p.status = 'Aktif'
        AND p.tanggal_kadaluarsa <= CURRENT_DATE + INTERVAL '30 day'
        AND (${jenisApdId}::int IS NULL OR p.jenis_apd_id = ${jenisApdId}::int)
      ORDER BY p.tanggal_kadaluarsa ASC
      LIMIT 25
    `;

    return NextResponse.json(
      {
        ringkasan,
        perJenis,
        perDepartemen,
        trenBulanan,
        akanKadaluarsa,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Gagal mengambil statistik. Pastikan database sudah di-setup (lihat README)." },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
