import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const { isConfigured, user } = await getSessionUser();

  if (!isConfigured || !user) {
    return NextResponse.json({ items: [] });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("carts")
    .select("id, cart_items(id, quantity, unit_price_cents, product_id, product_variant_id)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ cart: data ?? null });
}
