"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Dashboard", desc: "Monitoring pemakaian" },
  { href: "/form", label: "Tanda Terima", desc: "Formulir serah APD" },
  { href: "/riwayat", label: "Riwayat Penerima", desc: "Daftar & filter riwayat" },
];

export default function NavShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-base-700 bg-base-900 md:flex">
        <div className="stripe-triwarna" />
        <div className="flex flex-col px-4 py-6">
          <div className="mb-8 px-2">
            <div className="flex items-center gap-3">
              <img src="/logos/kpp-mining.png" alt="KPP Mining" className="h-9 w-auto" />
              <div className="h-7 w-px bg-base-700" />
              <img src="/logos/ciss.png" alt="CISS" className="h-8 w-auto" />
            </div>
            <div className="mt-3 text-base font-semibold text-base-100">Monitoring APD</div>
          </div>
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => {
              const active = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-2.5 transition-colors ${
                    active
                      ? "bg-base-800 text-base-100"
                      : "text-base-400 hover:bg-base-800/60 hover:text-base-200"
                  }`}
                >
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-base-500">{item.desc}</div>
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto px-2 pt-6 text-xs leading-relaxed text-base-500">
            Acuan regulasi:
            <br />
            Permenaker No. 8 Tahun 2010
            <br />
            tentang Alat Pelindung Diri
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="border-b border-base-700 bg-base-900/60 md:hidden">
          <div className="stripe-triwarna" />
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <img src="/logos/kpp-mining.png" alt="KPP Mining" className="h-7 w-auto" />
              <img src="/logos/ciss.png" alt="CISS" className="h-6 w-auto" />
            </div>
            <nav className="flex gap-4 text-sm">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="text-base-300">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="flex-1 bg-base-950">{children}</main>
      </div>
    </div>
  );
}
