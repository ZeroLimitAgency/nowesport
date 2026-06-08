import Link from "next/link";

const adminLinks = [
  { label: "Dashboard", href: "/admin" },
  { label: "Produits", href: "/admin/products" },
  { label: "Commandes", href: "/admin/orders" },
  { label: "Utilisateurs", href: "/admin/users" },
  { label: "Événements", href: "/admin/events" },
  { label: "Partenaires", href: "/admin/partners" },
  { label: "Contenu", href: "/admin/content" },
  { label: "Paramètres", href: "/admin/settings" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <section className="mx-auto w-full max-w-[92rem] px-5 pb-12 pt-10 sm:px-8 sm:pt-14">
        <div className="rounded-[2rem] border border-white/8 bg-[linear-gradient(145deg,#171219_0%,#09090b_100%)] p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="section-kicker">Admin</p>
              <h1 className="mt-3 text-4xl font-black uppercase tracking-[-0.05em] text-white sm:text-6xl">
                Backoffice NOW
              </h1>
            </div>
            <Link href="/api/admin/preview?next=/admin" className="primary-cta">
              Preview
            </Link>
          </div>
          <nav className="mt-7 flex gap-2 overflow-x-auto pb-2">
            {adminLinks.map((link) => (
              <Link key={link.href} href={link.href} className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/68">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-6">{children}</div>
      </section>
    </main>
  );
}
