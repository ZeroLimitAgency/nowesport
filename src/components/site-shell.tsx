"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  footerLegalLinks,
  footerSocials,
  navItems,
  promoItems,
} from "@/data/site";

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m16 16 4 4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5.5 19c1.4-3 3.567-4.5 6.5-4.5S17.1 16 18.5 19"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M6 9h12l-1 10H7L6 9Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M9 9a3 3 0 1 1 6 0"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M4 7h16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="M4 12h16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="M4 17h16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="m7 10 5 5 5-5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const menuItems = navItems.filter((item) => item.href !== pathname);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/8 bg-black/75 backdrop-blur-xl">
        <div className="mx-auto grid w-full max-w-[92rem] grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="logo-mark" aria-hidden="true" />
            <span className="sr-only">NOW eSport</span>
          </Link>

          <nav className="hidden items-center justify-center gap-7 text-sm font-semibold uppercase tracking-[0.18em] text-white/68 xl:flex">
            {navItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition hover:text-white ${active ? "text-white" : ""}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex justify-center xl:hidden">
            <div className="group relative w-fit pb-3">
              <button
                type="button"
                aria-label="Menu"
                className="inline-flex min-h-[2.35rem] items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/80"
              >
                <MenuIcon />
                <span>Menu</span>
                <ChevronIcon />
              </button>

              <div className="pointer-events-none absolute inset-x-[-0.5rem] top-full h-5 group-hover:pointer-events-auto group-focus-within:pointer-events-auto" />

              <div className="pointer-events-none absolute left-1/2 top-[calc(100%+0.65rem)] z-30 hidden min-w-[15rem] -translate-x-1/2 rounded-[1.4rem] border border-white/10 bg-[#0c0b0e]/96 p-3 shadow-[0_25px_80px_rgba(0,0,0,0.35)] group-hover:block group-hover:pointer-events-auto group-focus-within:block group-focus-within:pointer-events-auto">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-xl px-3 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white/68 transition hover:bg-white/[0.04] hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-white/80">
            <button type="button" className="icon-pill" aria-label="Rechercher">
              <SearchIcon />
            </button>
            <Link href="/compte" className="icon-pill" aria-label="Profil client">
              <UserIcon />
            </Link>
            <Link href="/shop" className="icon-pill" aria-label="Panier">
              <BagIcon />
            </Link>
          </div>
        </div>

        <div className="border-t border-b border-white/6 py-3">
          <div className="marquee">
            <div className="marquee-track">
              {[...promoItems, ...promoItems, ...promoItems].map((item, index) => (
                <span key={`${item}-${index}`} className="marquee-item">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      {children}

      <footer className="relative z-10 mx-auto w-full max-w-[92rem] bg-[var(--color-bg)] px-5 pb-10 pt-10 sm:px-8">
        <div className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,#120f14_0%,#070708_100%)] px-6 py-7 sm:px-8 sm:py-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="section-kicker">Newsletter</p>
              <h2 className="section-title">Rejoins notre mailing list</h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-white/55">
                Reçois les nouveaux drops, les prochaines activations et les
                annonces roster sans dépendre d&apos;une plateforme fermée.
              </p>
            </div>

            <form className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Adresse e-mail"
                className="min-h-14 flex-1 rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm text-white outline-none placeholder:text-white/28 focus:border-[var(--color-accent)]/60"
              />
              <button
                type="submit"
                className="min-h-14 rounded-full bg-white px-6 text-sm font-bold uppercase tracking-[0.2em] text-black transition hover:scale-[1.01]"
              >
                S&apos;inscrire
              </button>
            </form>
          </div>

          <div className="mt-10 flex flex-col gap-6 border-t border-white/8 pt-5 text-sm text-white/38 xl:flex-row xl:items-center xl:justify-between">
            <p>© 2026 NOW eSport. Commerce électronique conçu sur un front maison.</p>

            <div className="group relative w-fit pb-3">
              <button
                type="button"
                className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/60 transition hover:border-white/20 hover:text-white"
              >
                Conditions générales et politiques
              </button>
              <div className="pointer-events-none absolute inset-x-[-0.5rem] bottom-full h-5 group-hover:pointer-events-auto group-focus-within:pointer-events-auto" />
              <div className="pointer-events-none absolute bottom-[calc(100%+0.65rem)] left-1/2 z-20 hidden min-w-[20rem] -translate-x-1/2 rounded-[1.4rem] border border-white/10 bg-[#0c0b0e]/95 p-3 text-left shadow-[0_25px_80px_rgba(0,0,0,0.35)] group-hover:block group-hover:pointer-events-auto group-focus-within:block group-focus-within:pointer-events-auto">
                {footerLegalLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-xl px-3 py-2 text-sm text-white/62 transition hover:bg-white/[0.04] hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-5">
              {footerSocials.map((item) => (
                <a key={item} href="#" className="transition hover:text-white/70">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
