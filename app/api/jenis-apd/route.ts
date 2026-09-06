import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await sql`
      SELECT id, nama, kategori, standar, masa_pakai_bulan, wajib_area, aktif
      FROM jenis_apd
      WHERE aktif = TRUE
      ORDER BY kategori, nama
    `;
    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Gagal mengambil data jenis APD. Pastikan DATABASE_URL sudah benar dan schema.sql sudah dijalankan." },
      { status: 500 }
    );
  }
}
