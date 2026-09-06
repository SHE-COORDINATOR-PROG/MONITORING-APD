import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { tambahBulan } from "@/lib/types";

export const dynamic = "force-dynamic";

const payloadSchema = z.object({
  nama_pekerja: z.string().min(2, "Nama pekerja wajib diisi"),
  nik: z.string().min(3, "NIK/No. induk karyawan wajib diisi"),
  jabatan: z.string().min(2, "Jabatan wajib diisi"),
  departemen: z.string().min(2, "Departemen wajib diisi"),
  jenis_apd_id: z.coerce.number().int().positive("Jenis APD wajib dipilih"),
  merk_spesifikasi: z.string().optional().nullable(),
  ukuran: z.string().optional().nullable(),
  jumlah: z.coerce.number().int().min(1, "Jumlah minimal 1"),
  kondisi: z.enum(["Baru", "Bekas Layak Pakai"]),
  nomor_batch: z.string().optional().nullable(),
  tanggal_terima: z.string().min(1, "Tanggal terima wajib diisi"),
  petugas_pemberi: z.string().min(2, "Nama petugas pemberi wajib diisi"),
  paraf_pekerja: z.string().min(2, "Konfirmasi nama/paraf pekerja wajib diisi"),
  paraf_petugas: z.string().min(2, "Konfirmasi nama/paraf petugas wajib diisi"),
  catatan: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const departemen = searchParams.get("departemen");
    const jenis = searchParams.get("jenis_apd_id");
    const cari = searchParams.get("q");
    const limit = Math.min(Number(searchParams.get("limit") ?? 50), 200);

    const rows = await sql`
      SELECT p.*, j.nama AS jenis_apd_nama
      FROM penerimaan_apd p
      JOIN jenis_apd j ON j.id = p.jenis_apd_id
      WHERE
        (${departemen}::text IS NULL OR p.departemen = ${departemen})
        AND (${jenis}::int IS NULL OR p.jenis_apd_id = ${jenis}::int)
        AND (
          ${cari}::text IS NULL
          OR p.nama_pekerja ILIKE '%' || ${cari} || '%'
          OR p.nik ILIKE '%' || ${cari} || '%'
        )
      ORDER BY p.tanggal_terima DESC, p.id DESC
      LIMIT ${limit}
    `;
    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Gagal mengambil data penerimaan APD." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = payloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid", detail: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const d = parsed.data;

    const jenisRows = await sql`
      SELECT masa_pakai_bulan FROM jenis_apd WHERE id = ${d.jenis_apd_id}
    `;
    if (jenisRows.length === 0) {
      return NextResponse.json({ error: "Jenis APD tidak ditemukan" }, { status: 400 });
    }
    const masaPakaiBulan = jenisRows[0].masa_pakai_bulan as number;
    const tanggalKadaluarsa = tambahBulan(d.tanggal_terima, masaPakaiBulan);

    const inserted = await sql`
      INSERT INTO penerimaan_apd (
        nama_pekerja, nik, jabatan, departemen, jenis_apd_id, merk_spesifikasi,
        ukuran, jumlah, kondisi, nomor_batch, tanggal_terima, tanggal_kadaluarsa,
        petugas_pemberi, paraf_pekerja, paraf_petugas, catatan
      ) VALUES (
        ${d.nama_pekerja}, ${d.nik}, ${d.jabatan}, ${d.departemen}, ${d.jenis_apd_id},
        ${d.merk_spesifikasi ?? null}, ${d.ukuran ?? null}, ${d.jumlah}, ${d.kondisi},
        ${d.nomor_batch ?? null}, ${d.tanggal_terima}, ${tanggalKadaluarsa},
        ${d.petugas_pemberi}, ${d.paraf_pekerja}, ${d.paraf_petugas}, ${d.catatan ?? null}
      )
      RETURNING id, tanggal_kadaluarsa
    `;

    return NextResponse.json({ data: inserted[0] }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Gagal menyimpan tanda terima APD." },
      { status: 500 }
    );
  }
}
