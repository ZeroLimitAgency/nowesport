import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrlFromRequest, getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { slug?: string };
    const slug = body.slug?.trim();

    if (!slug) {
      return NextResponse.json(
        { error: "Produit introuvable pour le checkout." },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: product, error } = await supabase
      .from("products")
      .select("id, slug, name, stripe_price_id")
      .eq("slug", slug)
      .eq("is_public", true)
      .maybeSingle();

    if (error || !product) {
      return NextResponse.json(
        { error: "Ce produit n'existe pas dans la base publique." },
        { status: 404 },
      );
    }

    if (!product.stripe_price_id) {
      return NextResponse.json(
        {
          error:
            "Ce produit n'est pas encore relié à un prix Stripe. Ajoute son stripe_price_id dans Supabase.",
        },
        { status: 400 },
      );
    }

    const stripe = getStripe();
    const siteUrl = getSiteUrlFromRequest(request);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ui_mode: "embedded" as never,
      redirect_on_completion: "never" as never,
      line_items: [
        {
          price: product.stripe_price_id,
          quantity: 1,
        },
      ],
      client_reference_id: product.id,
      metadata: {
        product_id: product.id,
        product_slug: product.slug,
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
