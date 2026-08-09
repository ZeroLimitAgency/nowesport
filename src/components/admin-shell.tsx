"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const adminLinks = [
  { label: "Dashboard", href: "/admin" },
  { label: "Produits", href: "/admin/products" },
  { label: "Commandes", href: "/admin/orders" },
  { label: "Utilisateurs", href: "/admin/users" },
  { label: "Roster", href: "/admin/roster" },
  { label: "Événements", href: "/admin/events" },
  { label: "Partenaires", href: "/admin/partners" },
  { label: "Contenu", href: "/admin/content" },
  { label: "Médias", href: "/admin/media" },
  { label: "Paramètres", href: "/admin/settings" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.body.style.overflow = isOpen ? "hidden" : "";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <section className="mx-auto w-full max-w-[92rem] px-4 pb-10 pt-4 sm:px-8 sm:pb-12 sm:pt-14">
        <div className="rounded-[1.5rem] border border-white/8 bg-[linear-gradient(145deg,#171219_0%,#09090b_100%)] p-4 sm:rounded-[2rem] sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="section-kicker">Admin</p>
              <h1 className="mt-2 text-[clamp(2rem,12vw,3.75rem)] font-black uppercase leading-none tracking-[-0.055em] text-white">
                Backoffice NOW
              </h1>
            </div>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls="admin-mobile-navigation"
              onClick={() => setIsOpen(true)}
              className="secondary-cta !w-auto shrink-0 lg:hidden"
            >
              Menu
            </button>
            <div className="hidden shrink-0 gap-2 lg:flex"><Link href="/workspace" className="secondary-cta !w-auto">NOW Workspace</Link><Link href="/api/admin/preview?next=/admin" className="primary-cta !w-auto">Preview</Link></div>
          </div>

          <nav className="mt-5 hidden gap-2 overflow-x-auto pb-2 lg:flex" aria-label="Navigation admin">
            {adminLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] ${active ? "border-[var(--color-accent)]/40 bg-[var(--color-accent)]/14 text-white" : "border-white/10 bg-white/[0.03] text-white/68"}`}>
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {isOpen ? (
          <div className="fixed inset-0 z-[70] bg-black/70 p-3 backdrop-blur-sm lg:hidden" onClick={() => setIsOpen(false)}>
            <nav
              id="admin-mobile-navigation"
              aria-label="Navigation admin mobile"
              className="ml-auto flex h-[calc(100dvh-1.5rem)] w-full max-w-sm flex-col overflow-y-auto rounded-[1.5rem] border border-white/10 bg-[#08080a] p-4 shadow-2xl supports-[padding:max(0px)]:pb-[max(1rem,env(safe-area-inset-bottom))]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/50">Admin NOW</p>
                <button type="button" onClick={() => setIsOpen(false)} className="min-h-11 rounded-full border border-white/10 px-4 text-sm font-bold text-white/80">
                  Fermer
                </button>
              </div>
              <div className="grid gap-2">
                <Link href="/workspace" onClick={() => setIsOpen(false)} className="secondary-cta mb-2">NOW Workspace</Link>
                {adminLinks.map((link) => {
                  const active = pathname === link.href;
                  return (
                    <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className={`flex min-h-12 items-center rounded-2xl border px-4 text-sm font-bold uppercase tracking-[0.12em] ${active ? "border-[var(--color-accent)]/40 bg-[var(--color-accent)]/14 text-white" : "border-white/8 bg-white/[0.03] text-white/76"}`}>
                      {link.label}
                    </Link>
                  );
                })}
                <Link href="/api/admin/preview?next=/admin" onClick={() => setIsOpen(false)} className="primary-cta mt-2">
                  Preview
                </Link>
              </div>
            </nav>
          </div>
        ) : null}

        <div className="mt-5 sm:mt-6">{children}</div>
      </section>
    </main>
  );
}
