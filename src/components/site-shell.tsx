"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { CmsContent, SiteLocale } from "@/lib/cms";

type SiteShellProps = {
  children: React.ReactNode;
  cms: CmsContent;
};

function languageHref(language: SiteLocale, pathname: string) {
  return `/api/language?lang=${language}&next=${encodeURIComponent(pathname || "/")}`;
}

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteShell({ children, cms }: SiteShellProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const wasMenuOpen = useRef(false);

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

  useEffect(() => {
    if (!isMenuOpen) {
      if (wasMenuOpen.current) menuButtonRef.current?.focus();
      wasMenuOpen.current = false;
      return;
    }

    wasMenuOpen.current = true;
    const menu = menuRef.current;
    const focusable = menu?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
    focusable?.[0]?.focus();

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", trapFocus);
    return () => window.removeEventListener("keydown", trapFocus);
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
              const active = isActivePath(pathname, item.href);
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
            ref={menuButtonRef}
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
          <div role="dialog" aria-modal="true" aria-label="Navigation" className="fixed inset-0 top-[4.25rem] z-40 bg-black/70 backdrop-blur-sm lg:hidden" onClick={() => setIsMenuOpen(false)}>
            <nav
              ref={menuRef}
              id="mobile-navigation"
              aria-label="Navigation mobile"
              className="mx-3 max-h-[calc(100dvh-5.5rem)] overflow-y-auto rounded-[1.5rem] border border-white/10 bg-[#08080a] p-3 shadow-2xl supports-[padding:max(0px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="grid gap-2">
                {cms.navigation.map((item) => {
                  const active = isActivePath(pathname, item.href);
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
                <button type="button" onClick={() => setIsMenuOpen(false)} className="min-h-12 rounded-2xl border border-white/15 bg-white/[0.06] px-4 text-sm font-bold uppercase tracking-[0.12em] text-white">
                  {cms.locale === "fr" ? "Fermer" : "Close"}
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {children}

      <footer className="border-t border-white/10 bg-[#080808] px-4 py-7 sm:px-8">
        <div className="mx-auto w-full max-w-[92rem]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3"><span className="logo-mark" aria-hidden="true" /><div><h2 className="text-sm font-black uppercase tracking-[0.18em]">{footer.title}</h2><p className="mt-1 text-xs text-white/45">{footer.body}</p></div></div>
          <div className="flex flex-wrap gap-2 text-xs">
            {cms.socialLinks.map((item) => (
              <a
                key={`${item.platform}-${item.href}`}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/10 px-3 py-2 text-white/68 hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </div></div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5 text-xs text-white/45">
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
            <div className="flex flex-wrap items-center gap-4"><p>© {new Date().getFullYear()} NOW eSport.</p>
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
