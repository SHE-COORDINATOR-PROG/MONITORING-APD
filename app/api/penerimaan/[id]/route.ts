import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { tambahBulan } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
} as const;

const updateSchema = z.object({
  jenis_apd_id: z.coerce.number().int().positive("Jenis APD wajib dipilih"),
  ukuran: z.string().optional().nullable(),
  jumlah: z.coerce.number().int().min(1, "Jumlah minimal 1"),
  kondisi: z.enum(["Baru", "Bekas Layak Pakai"]),
  status: z.enum(["Aktif", "Diganti", "Hilang", "Rusak"]),
  catatan: z.string().optional().nullable(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "ID tanda terima tidak valid" },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid", detail: parsed.error.flatten().fieldErrors },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }
    const d = parsed.data;

    const existingRows = await sql`
      SELECT tanggal_terima FROM penerimaan_apd WHERE id = ${id}
    `;
    if (existingRows.length === 0) {
      return NextResponse.json(
        { error: "Data tanda terima tidak ditemukan" },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    const jenisRows = await sql`
      SELECT masa_pakai_bulan FROM jenis_apd WHERE id = ${d.jenis_apd_id}
    `;
    if (jenisRows.length === 0) {
      return NextResponse.json(
        { error: "Jenis APD tidak ditemukan" },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // Kalau jenis APD diganti, masa pakainya beda, jadi tanggal kadaluarsa
    // dihitung ulang dari tanggal terima yang sudah ada + masa pakai jenis
    // APD yang baru dipilih. Ini supaya tanggal kadaluarsa tidak nyangkut
    // memakai masa pakai jenis APD yang lama.
    const masaPakaiBulan = jenisRows[0].masa_pakai_bulan as number;
    const tanggalTerima = existingRows[0].tanggal_terima as string;
    const tanggalKadaluarsa = tambahBulan(tanggalTerima, masaPakaiBulan);

    const updated = await sql`
      UPDATE penerimaan_apd SET
        jenis_apd_id = ${d.jenis_apd_id},
        ukuran = ${d.ukuran ?? null},
        jumlah = ${d.jumlah},
        kondisi = ${d.kondisi},
        status = ${d.status},
        catatan = ${d.catatan ?? null},
        tanggal_kadaluarsa = ${tanggalKadaluarsa}
      WHERE id = ${id}
      RETURNING *
    `;

    const [row] = await sql`
      SELECT p.*, j.nama AS jenis_apd_nama
      FROM penerimaan_apd p
      JOIN jenis_apd j ON j.id = p.jenis_apd_id
      WHERE p.id = ${id}
    `;

    return NextResponse.json({ data: row }, { headers: NO_CACHE_HEADERS });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Gagal memperbarui tanda terima APD." },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
