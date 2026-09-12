import Link from "next/link";
import type { WorkspaceAccess } from "@/workspace/core/permissions";
import { getWorkspaceNavigation } from "@/workspace/core/navigation";

export function WorkspaceShell({ access, children }: { access: WorkspaceAccess; children: React.ReactNode }) {
  const navigation = getWorkspaceNavigation(access.permissions);
  return <main className="min-h-screen bg-[#08080b] text-white">
    <div className="mx-auto grid min-h-screen max-w-[100rem] lg:grid-cols-[16rem_1fr]">
      <aside className="border-b border-white/10 bg-[#0d0d12] p-4 lg:border-b-0 lg:border-r lg:p-5">
        <div className="flex items-center justify-between gap-3"><Link href="/workspace" className="text-lg font-black tracking-[-.04em]">NOW <span className="text-[#e93585]">Workspace</span></Link><span className="rounded-full bg-white/5 px-2 py-1 text-[10px] uppercase text-white/50">V1</span></div>
        <nav aria-label="Workspace" className="mt-5 flex gap-4 overflow-x-auto lg:block lg:space-y-5">
          {navigation.map((group) => <section key={group.label} className="shrink-0"><h2 className="mb-2 text-[10px] font-bold uppercase tracking-[.18em] text-white/35">{group.label}</h2><div className="flex gap-1 lg:grid">{group.items.map((item) => <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/7 hover:text-white">{item.label}</Link>)}</div></section>)}
        </nav>
        <div className="mt-6 border-t border-white/8 pt-4 text-xs text-white/45"><strong className="block text-white/75">{access.displayName}</strong>Session sécurisée</div>
      </aside>
      <div className="min-w-0 p-4 sm:p-7 lg:p-10">{children}</div>
    </div>
  </main>;
}

export function WorkspaceHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header className="mb-7"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#f06aa7]">{eyebrow}</p><h1 className="mt-2 text-3xl font-black tracking-[-.04em] sm:text-4xl">{title}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">{description}</p></header>;
}

export function WorkspaceCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-xl border border-white/8 bg-white/[.025] p-5"><h2 className="text-sm font-bold">{title}</h2><div className="mt-3 text-sm leading-6 text-white/55">{children}</div></section>;
}
