import type { Metadata } from "next";
import { privateRobots } from "@/lib/seo";
export const metadata: Metadata = { title: "Panier", robots: privateRobots };
export default function CartLayout({ children }: { children: React.ReactNode }) { return children; }
