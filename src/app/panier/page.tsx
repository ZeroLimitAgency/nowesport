import { redirect } from "next/navigation";

export default function PanierRedirectPage() {
  redirect("/cart");
}
