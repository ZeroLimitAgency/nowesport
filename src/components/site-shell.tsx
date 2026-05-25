"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { footerLegalLinks, footerSocials, navItems } from "@/data/site";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const [language, setLanguage] = useState<"fr" | "en">("fr");

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 36);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = isLight ? "light" : "dark";
  }, [isLight]);

  const displayNavItems = navItems.map((item) => ({
    ...item,
    label:
      language === "en"
        ? ({"Accueil":"Home","Boutique":"Shop","Équipes":"Teams","Partenaires":"Partners","Événements":"Events","News":"News"}[item.label] ?? item.label)
        : item.label,
  }));

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "border-b border-white/10 bg-black"
            : "border-b border-white/20 bg-white/[0.08] backdrop-blur-2xl"
        }`}
      >
        <div className="mx-auto flex w-full max-w-[92rem] items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3 text-white">
            <span className="logo-mark" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-[0.28em] text-white/90">
              NOW ESPORT
            </span>
          </Link>

          <nav className="hidden items-center gap-10 lg:flex">
            {displayNavItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-semibold uppercase tracking-[0.16em] transition ${
                    active ? "text-white" : "text-white/74 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => setIsMenuOpen((v) => !v)}
            className="rounded-full border border-white/20 bg-black/25 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white lg:hidden"
          >
            Menu
          </button>
        </div>

        {isMenuOpen && (
          <div className="mx-auto flex w-full max-w-[92rem] flex-wrap gap-4 border-t border-white/10 px-5 pb-4 pt-4 sm:px-8 lg:hidden">
            {displayNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-xs font-semibold uppercase tracking-[0.16em] text-white/82"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {children}

      <footer className="mx-auto w-full max-w-[92rem] px-5 pb-10 pt-12 sm:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#0f1016_0%,#060608_100%)] p-7 sm:p-9">
          <h2 className="text-3xl font-black uppercase tracking-[-0.04em] sm:text-5xl">{language === "fr" ? "NOW eSport" : "NOW eSport"}</h2>
          <p className="mt-4 max-w-2xl text-white/60">{language === "fr" ? "Actus, boutique et équipes." : "News, shop and teams."}</p>

          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            {footerSocials.map((item) => (
              <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className="rounded-full border border-white/10 px-4 py-2 text-white/68 hover:text-white">{item.label}</a>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5 text-sm text-white/45">
            <button type="button" onClick={() => setIsLight((v) => !v)} className="rounded-full border border-white/15 px-4 py-2 text-white/70 hover:text-white">
              {isLight ? "Mode sombre" : "Mode clair"}
            </button>
            <div className="flex rounded-full border border-white/15 p-1">
              <button type="button" onClick={() => setLanguage("fr")} className={`rounded-full px-3 py-1.5 ${language === "fr" ? "bg-white text-black" : "text-white/75"}`}>FR</button>
              <button type="button" onClick={() => setLanguage("en")} className={`rounded-full px-3 py-1.5 ${language === "en" ? "bg-white text-black" : "text-white/75"}`}>EN</button>
            </div>
          </div>

          <div className="mt-6 text-sm text-white/45">
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
