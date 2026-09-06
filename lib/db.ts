import { neon } from "@neondatabase/serverless";

// DATABASE_URL diambil dari Neon connection string, di-set sebagai environment
// variable di Vercel Project Settings > Environment Variables.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Dilempar saat runtime request, bukan saat build, supaya `next build`
  // tetap bisa jalan tanpa DATABASE_URL (mis. saat CI check di GitHub).
  console.warn(
    "DATABASE_URL belum diset. Set di file .env.local (lokal) atau di Vercel Environment Variables (production)."
  );
}

// Fallback placeholder dipakai HANYA supaya `next build` tidak gagal saat
// mengumpulkan data halaman API route ketika DATABASE_URL belum di-set
// (mis. di CI). Query nyata tetap akan gagal dengan error yang jelas kalau
// env var ini tidak diisi saat runtime/production.
export const sql = neon(connectionString || "postgresql://user:pass@localhost/db");
