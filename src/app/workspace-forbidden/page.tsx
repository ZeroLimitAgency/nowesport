import type { Metadata } from "next";
import { privateRobots } from "@/lib/seo";
export const metadata: Metadata = { title: "Accès refusé", robots: privateRobots };
export default function Page() { return <main className="grid min-h-screen place-items-center bg-[#08080b] p-6 text-center text-white"><div><p className="text-xs uppercase tracking-[.2em] text-[#e93585]">403</p><h1 className="mt-3 text-3xl font-black">Accès non autorisé</h1><p className="mt-2 text-white/50">Votre compte ne dispose pas des permissions Workspace nécessaires.</p></div></main>; }
