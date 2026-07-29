import type { Metadata } from "next";
import { privateRobots } from "@/lib/seo";

export const metadata: Metadata = { title: "Connexion", robots: privateRobots };
export default function LoginLayout({ children }: { children: React.ReactNode }) { return children; }
