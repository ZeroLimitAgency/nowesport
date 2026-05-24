"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  footerLegalLinks,
  footerSocials,
  navItems,
  promoItems,
} from "@/data/site";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050507]/85 backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-[92rem] items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="logo-mark" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-white/70">NOW eSport</span>
          </Link>

          <nav className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] p-1 lg:flex">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] ${active ? "bg-white text-black" : "text-white/65 hover:text-white"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => setIsMenuOpen((v) => !v)}
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/80 lg:hidden"
          >
            Menu
          </button>
        </div>

        {isMenuOpen ? (
          <div className="mx-auto flex w-full max-w-[92rem] flex-wrap gap-2 px-5 pb-4 sm:px-8 lg:hidden">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70"
              >
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}

        <div className="marquee border-t border-white/10 py-2">
          <div className="marquee-track">
            {[...promoItems, ...promoItems].map((item, index) => (
              <span key={`${item}-${index}`} className="marquee-item">{item}</span>
            ))}
          </div>
        ) : null}
      </header>

      {children}

      <footer className="mx-auto w-full max-w-[92rem] px-5 pb-10 pt-12 sm:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#0f1016_0%,#060608_100%)] p-7 sm:p-9">
          <h2 className="text-3xl font-black uppercase tracking-[-0.04em] sm:text-5xl">Construisons la prochaine saison.</h2>
          <p className="mt-4 max-w-2xl text-white/60">Newsletter, drops, calendriers et annonces roster dans un seul flux.</p>

          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            {footerSocials.map((item) => (
              <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className="rounded-full border border-white/10 px-4 py-2 text-white/68 hover:text-white">
                {item.label}
              </a>
            ))}
          </div>

          <div className="mt-8 border-t border-white/10 pt-5 text-sm text-white/45">
            <p>© 2026 NOW eSport.</p>
            <div className="mt-3 flex flex-wrap gap-4">
              {footerLegalLinks.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-white/70">{item.label}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
