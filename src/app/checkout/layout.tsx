import type { Metadata } from "next";
import { privateRobots } from "@/lib/seo";

export const metadata: Metadata = { title: "Paiement", robots: privateRobots };
export default function CheckoutLayout({ children }: { children: React.ReactNode }) { return children; }
