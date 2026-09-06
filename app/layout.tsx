import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import NavShell from "@/components/NavShell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jbmono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jbmono" });

export const metadata: Metadata = {
  title: "Monitoring APD | K3",
  description:
    "Dashboard monitoring pemakaian APD dan formulir tanda terima APD sesuai Permenaker No. 8 Tahun 2010.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${jbmono.variable} font-sans antialiased`}>
        <NavShell>{children}</NavShell>
      </body>
    </html>
  );
}
