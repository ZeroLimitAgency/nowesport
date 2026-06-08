import { NextResponse } from "next/server";
import { encodeCheckoutItemsMetadata, resolveCheckoutLines } from "@/lib/checkout";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrlFromRequest, getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      slug?: string;
      variantId?: string | null;
      quantity?: number;
    };
    const slug = body.slug?.trim();

    if (!slug) {
      return NextResponse.json(
        { error: "Produit introuvable pour le checkout." },
        { status: 400 },
      );
    }

    const lines = await resolveCheckoutLines([
      { slug, variantId: body.variantId, quantity: body.quantity },
    ]);
    const line = lines[0];
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const stripe = getStripe();
    const siteUrl = getSiteUrlFromRequest(request);
    const needsShipping = lines.some((item) => item.requiresShipping);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ui_mode: "embedded" as never,
      redirect_on_completion: "never" as never,
      line_items: lines.map((item) => ({
        price: item.stripePriceId,
        quantity: item.quantity,
      })),
      customer_creation: "always",
      phone_number_collection: { enabled: needsShipping },
      ...(needsShipping
        ? { shipping_address_collection: { allowed_countries: ["FR", "BE", "CH", "LU", "MC"] } }
        : {}),
      client_reference_id: line.productId,
      metadata: {
        product_id: line.productId,
        product_slug: line.productSlug,
        variant_id: line.variantId ?? "",
        quantity: String(line.quantity),
        checkout_items: encodeCheckoutItemsMetadata(lines),
        ...(user?.id ? { supabase_user_id: user.id } : {}),
      },
      ...(user?.email ? { customer_email: user.email } : {}),
      return_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    });

    if (!session.client_secret) {
      return NextResponse.json(
        { error: "Stripe n'a pas renvoyé de client secret." },
        { status: 500 },
      );
    }

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossible de créer la session Stripe intégrée.",
      },
      { status: 500 },
    );
  }
}
