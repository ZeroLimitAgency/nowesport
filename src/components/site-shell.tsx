"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { CmsContent, SiteLocale } from "@/lib/cms";

type SiteShellProps = {
  children: React.ReactNode;
  cms: CmsContent;
};

function languageHref(language: SiteLocale, pathname: string) {
  return `/api/language?lang=${language}&next=${encodeURIComponent(pathname || "/")}`;
}

export function SiteShell({ children, cms }: SiteShellProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 36);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = "dark";
    document.documentElement.lang = cms.locale;
  }, [cms.locale]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isMenuOpen]);

  if (pathname === "/login") {
    return <>{children}</>;
  }

  const footer = cms.blocks["footer.main"];

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)] ${
          isScrolled
            ? "border-b border-white/10 bg-black"
            : "border-b border-white/20 bg-white/[0.08] backdrop-blur-2xl"
        }`}
      >
        <div className="mx-auto flex w-full max-w-[92rem] items-center justify-between gap-3 px-4 py-3 text-white sm:px-8 sm:py-5">
          <Link href="/" className="flex min-w-0 items-center gap-2 text-white sm:gap-3">
            <span className="logo-mark" aria-hidden="true" />
            <span className="truncate text-[0.68rem] font-bold uppercase tracking-[0.18em] text-white/90 sm:text-xs sm:tracking-[0.28em]">
              NOW ESPORT
            </span>
          </Link>

          <nav className="hidden items-center gap-10 lg:flex">
            {cms.navigation.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={`${item.href}-${item.label}`}
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
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            className="min-h-11 shrink-0 rounded-full border border-white/20 bg-black/45 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white lg:hidden"
          >
            {cms.locale === "fr" ? "Menu" : "Menu"}
          </button>
        </div>

        {isMenuOpen && (
          <div className="fixed inset-0 top-[4.25rem] z-40 bg-black/70 backdrop-blur-sm lg:hidden" onClick={() => setIsMenuOpen(false)}>
            <nav
              id="mobile-navigation"
              aria-label="Navigation mobile"
              className="mx-3 max-h-[calc(100dvh-5.5rem)] overflow-y-auto rounded-[1.5rem] border border-white/10 bg-[#08080a] p-3 shadow-2xl supports-[padding:max(0px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="grid gap-2">
                {cms.navigation.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={`${item.href}-${item.label}-mobile`}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex min-h-12 items-center justify-between rounded-2xl border px-4 text-sm font-bold uppercase tracking-[0.12em] ${active ? "border-[var(--color-accent)]/40 bg-[var(--color-accent)]/14 text-white" : "border-white/8 bg-white/[0.03] text-white/76"}`}
                    >
                      {item.label}
                      <span aria-hidden="true">→</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        )}
      </header>

      {children}

      <footer className="mx-auto w-full max-w-[92rem] px-4 pb-8 pt-10 sm:px-8 sm:pb-10 sm:pt-12">
        <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,#0f1016_0%,#060608_100%)] p-5 sm:rounded-[2rem] sm:p-9">
          <h2 className="text-[clamp(1.75rem,10vw,3rem)] font-black uppercase leading-none tracking-[-0.04em] sm:text-5xl">
            {footer.title}
          </h2>
          <p className="mt-4 max-w-2xl text-white/60">{footer.body}</p>

          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            {cms.socialLinks.map((item) => (
              <a
                key={`${item.platform}-${item.href}`}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/10 px-4 py-2 text-white/68 hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5 text-sm text-white/45">
            <div className="flex rounded-full border border-white/15 p-1">
              <Link
                href={languageHref("fr", pathname)}
                className={`rounded-full px-3 py-1.5 ${cms.locale === "fr" ? "bg-white text-black" : "text-white/75"}`}
              >
                FR
              </Link>
              <Link
                href={languageHref("en", pathname)}
                className={`rounded-full px-3 py-1.5 ${cms.locale === "en" ? "bg-white text-black" : "text-white/75"}`}
              >
                EN
              </Link>
            </div>
          </div>

          <div className="mt-6 text-sm text-white/45">
            <p>© 2026 NOW eSport.</p>
            <div className="mt-3 flex flex-wrap gap-4">
              {cms.legalNavigation.map((item) => (
                <Link key={`${item.href}-${item.label}`} href={item.href} className="hover:text-white/70">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
