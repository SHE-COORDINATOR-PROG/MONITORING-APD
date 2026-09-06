// Menjalankan db/schema.sql ke database Neon yang ditunjuk oleh DATABASE_URL.
// Pakai: DATABASE_URL="postgresql://..." npm run db:init
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL belum diset. Contoh:");
  console.error('  DATABASE_URL="postgresql://user:pass@host/db?sslmode=require" npm run db:init');
  process.exit(1);
}

const sql = neon(connectionString);
const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");

// neon() serverless driver menjalankan satu statement per panggilan,
// jadi schema.sql dipecah per ";" di luar string/komentar sederhana.
const statements = schema
  .split(/;\s*(?:\n|$)/)
  .map((s) => s.trim())
  .filter((s) => s.length > 0 && !s.startsWith("--"));

const run = async () => {
  for (const stmt of statements) {
    await sql(stmt);
  }
  console.log(`Selesai. ${statements.length} statement dijalankan ke database.`);
};

run().catch((err) => {
  console.error("Gagal menjalankan schema:", err);
  process.exit(1);
});
