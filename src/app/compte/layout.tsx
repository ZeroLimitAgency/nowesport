import type { Metadata } from "next";
import { privateRobots } from "@/lib/seo";
export const metadata: Metadata = { title: "Compte", robots: privateRobots };
export default function AccountLayout({ children }: { children: React.ReactNode }) { return children; }
