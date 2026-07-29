import type { Metadata } from "next";
import { privateRobots } from "@/lib/seo";

export const metadata: Metadata = { title: "Authentification", robots: privateRobots };
export default function AuthLayout({ children }: { children: React.ReactNode }) { return children; }
