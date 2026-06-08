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
      items?: Array<{ slug?: string; variantId?: string | null; quantity?: number }>;
    };
    const requestedItems = Array.isArray(body.items) && body.items.length
      ? body.items.map((item) => ({
          slug: item.slug ?? "",
          variantId: item.variantId,
          quantity: item.quantity,
        }))
      : [{ slug: body.slug ?? "", variantId: body.variantId, quantity: body.quantity }];

    const lines = await resolveCheckoutLines(requestedItems);
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const stripe = getStripe();
    const siteUrl = getSiteUrlFromRequest(request);
    const needsShipping = lines.some((item) => item.requiresShipping);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lines.map((item) => ({
        price: item.stripePriceId,
        quantity: item.quantity,
      })),
      customer_creation: "always",
      phone_number_collection: { enabled: needsShipping },
      ...(needsShipping
        ? { shipping_address_collection: { allowed_countries: ["FR", "BE", "CH", "LU", "MC"] } }
        : {}),
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancel`,
      client_reference_id: lines[0].productId,
      metadata: {
        product_id: lines[0].productId,
        product_slug: lines[0].productSlug,
        checkout_items: encodeCheckoutItemsMetadata(lines),
        ...(user?.id ? { supabase_user_id: user.id } : {}),
      },
      ...(user?.email ? { customer_email: user.email } : {}),
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe n'a pas renvoyé d'URL de checkout." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossible de créer la session Stripe.",
      },
      { status: 500 },
    );
  }
}
