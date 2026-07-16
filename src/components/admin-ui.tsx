import Link from "next/link";
import type { ReactNode } from "react";

export const adminInputClass = "min-h-12 w-full min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm normal-case tracking-normal text-white outline-none placeholder:text-white/30 focus:border-[var(--color-accent)]/60";
export const adminTextareaClass = `${adminInputClass} min-h-28 py-3`;

type Tone = "default" | "success" | "warning" | "danger" | "info";

const toneClasses: Record<Tone, string> = {
  default: "border-white/10 bg-white/[0.05] text-white/70",
  success: "border-emerald-300/20 bg-emerald-400/15 text-emerald-100",
  warning: "border-yellow-300/20 bg-yellow-300/15 text-yellow-100",
  danger: "border-red-300/20 bg-red-400/15 text-red-100",
  info: "border-blue-300/20 bg-blue-400/15 text-blue-100",
};

export function AdminPageHeader({ kicker, title, description, actions }: { kicker: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <section className="rounded-[1.8rem] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(255,42,109,.16),transparent_34%),linear-gradient(180deg,#151219_0%,#09090b_100%)] p-4 shadow-2xl shadow-black/20 sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="section-kicker">{kicker}</p>
          <h1 className="mt-3 text-[clamp(1.85rem,10vw,3rem)] font-black uppercase leading-none tracking-[-0.05em] text-white sm:text-5xl">{title}</h1>
          {description ? <p className="mt-3 max-w-4xl text-sm leading-6 text-white/58">{description}</p> : null}
        </div>
        {actions ? <div className="flex w-full flex-wrap gap-2 sm:w-auto">{actions}</div> : null}
      </div>
    </section>
  );
}

export function AdminSection({ kicker, title, description, children, actions }: { kicker?: string; title?: string; description?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="grid gap-5 rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,#131218_0%,#0b0b0d_100%)] p-4 shadow-2xl shadow-black/20 sm:p-6">
      {(kicker || title || description || actions) ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>{kicker ? <p className="section-kicker">{kicker}</p> : null}{title ? <h2 className="mt-2 text-2xl font-black uppercase tracking-[-0.04em] text-white sm:text-3xl">{title}</h2> : null}{description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">{description}</p> : null}</div>
          {actions ? <div className="flex w-full flex-wrap gap-2 sm:w-auto">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function AdminCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <article className={`rounded-[1.5rem] border border-white/8 bg-white/[0.035] p-5 ${className}`}>{children}</article>;
}

export function AdminToolbar({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3 rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4 sm:flex-row sm:flex-wrap sm:items-center">{children}</div>;
}

export function AdminEmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="rounded-[1.4rem] border border-dashed border-white/14 bg-white/[0.025] p-6 text-center"><h3 className="text-xl font-black text-white">{title}</h3><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/50">{description}</p>{action ? <div className="mt-4 flex justify-center">{action}</div> : null}</div>;
}

export function AdminFormGrid({ children, cols = "xl:grid-cols-4" }: { children: ReactNode; cols?: string }) {
  return <div className={`grid min-w-0 gap-3 md:grid-cols-2 ${cols}`}>{children}</div>;
}

export function AdminField({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="grid min-w-0 gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/45 sm:tracking-[0.16em]">{label}{children}{hint ? <span className="normal-case tracking-normal text-[0.68rem] leading-4 text-white/35">{hint}</span> : null}</label>;
}

export function AdminAdvancedPanel({ title = "Options avancées", children }: { title?: string; children: ReactNode }) {
  return <details className="rounded-2xl border border-white/8 bg-black/20 p-4"><summary className="cursor-pointer text-xs font-black uppercase tracking-[0.16em] text-white/45">{title}</summary><div className="mt-4 grid gap-3">{children}</div></details>;
}

export function AdminDangerZone({ children }: { children: ReactNode }) {
  return <div className="rounded-[1.4rem] border border-red-400/20 bg-red-500/[0.06] p-4"><p className="text-xs font-black uppercase tracking-[0.18em] text-red-100/80">Zone dangereuse</p><div className="mt-3 grid gap-2 sm:flex sm:flex-wrap">{children}</div></div>;
}

export function AdminStatusBadge({ children, tone = "default" }: { children: ReactNode; tone?: Tone }) {
  return <span className={`inline-flex rounded-full border px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] ${toneClasses[tone]}`}>{children}</span>;
}

export function AdminActionButton({ children, href, tone = "default", type = "button" }: { children: ReactNode; href?: string; tone?: Tone; type?: "button" | "submit" }) {
  const cls = tone === "danger" ? "secondary-cta border-red-400/30 text-red-100" : tone === "success" ? "primary-cta" : "secondary-cta";
  return href ? <Link href={href} className={cls}>{children}</Link> : <button type={type} className={cls}>{children}</button>;
}
