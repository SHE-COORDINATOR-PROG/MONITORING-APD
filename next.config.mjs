/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Next.js 14 menyimpan cache halaman di sisi client selama 30 detik
    // (default staleTimes.dynamic) meski route sudah "force-dynamic".
    // Ini membuat Dashboard/Riwayat tampil data lama saat berpindah halaman
    // lewat navigasi client-side. Set ke 0 supaya selalu fetch ulang.
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },
};

export default nextConfig;
