import type { Metadata } from "next";
import { privateRobots } from "@/lib/seo";
export const metadata: Metadata = { title: "Profil", robots: privateRobots };
export default function ProfileLayout({ children }: { children: React.ReactNode }) { return children; }
