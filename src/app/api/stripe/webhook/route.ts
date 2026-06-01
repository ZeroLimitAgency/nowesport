import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

async function upsertOrderFromSession(session: Stripe.Checkout.Session) {
  const stripe = getStripe();
  const admin = createAdminClient();
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
    expand: ["data.price.product"],
  });

  const subtotalCents = session.amount_subtotal ?? 0;
  const totalCents = session.amount_total ?? 0;
  const shippingCents =
    session.total_details?.amount_shipping ??
    Math.max(totalCents - subtotalCents - (session.total_details?.amount_tax ?? 0), 0);
  const taxCents = session.total_details?.amount_tax ?? 0;
  const customerEmail =
    session.customer_details?.email ?? session.customer_email ?? "client@nowesport.invalid";
  const supabaseUserId =
    typeof session.metadata?.supabase_user_id === "string"
      ? session.metadata.supabase_user_id
      : null;

  const orderPayload = {
    user_id: supabaseUserId,
    email: customerEmail,
    status: "paid",
    payment_status: "paid",
    currency: (session.currency ?? "eur").toUpperCase(),
    subtotal_cents: subtotalCents,
    shipping_cents: shippingCents,
    tax_cents: taxCents,
    total_cents: totalCents,
    shipping_name: session.customer_details?.name ?? null,
    shipping_phone: session.customer_details?.phone ?? null,
    shipping_line1: session.customer_details?.address?.line1 ?? null,
    shipping_line2: session.customer_details?.address?.line2 ?? null,
    shipping_postal_code: session.customer_details?.address?.postal_code ?? null,
    shipping_city: session.customer_details?.address?.city ?? null,
    shipping_country: session.customer_details?.address?.country ?? null,
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null,
  };

  const { data: existingOrder } = await admin
    .from("orders")
    .select("id")
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();

  let orderId = existingOrder?.id as string | undefined;

  if (orderId) {
    const { error } = await admin
      .from("orders")
      .update(orderPayload)
      .eq("id", orderId);

    if (error) {
      throw error;
    }

    const { error: deleteError } = await admin
      .from("order_items")
      .delete()
      .eq("order_id", orderId);

    if (deleteError) {
      throw deleteError;
    }
  } else {
    const { data, error } = await admin
      .from("orders")
      .insert(orderPayload)
      .select("id")
      .single();

    if (error || !data) {
      throw error ?? new Error("Impossible de creer la commande Stripe.");
    }

    orderId = data.id;
  }

  const lineItemPayloads = await Promise.all(
    lineItems.data.map(async (item) => {
      const stripePriceId =
        typeof item.price === "string" ? item.price : item.price?.id ?? null;
      let productId: string | null = null;

      if (stripePriceId) {
        const { data: product } = await admin
          .from("products")
          .select("id")
          .eq("stripe_price_id", stripePriceId)
          .maybeSingle();

        productId = product?.id ?? null;
      }

      return {
        order_id: orderId!,
        product_id: productId,
        product_variant_id: null,
        product_name: item.description,
        variant_name: null,
        quantity: item.quantity ?? 1,
        unit_price_cents: item.amount_subtotal && item.quantity
          ? Math.round(item.amount_subtotal / item.quantity)
          : 0,
        total_price_cents: item.amount_total ?? item.amount_subtotal ?? 0,
        custom_name: null,
        custom_number: null,
        flocking: null,
      };
    }),
  );

  if (lineItemPayloads.length) {
    const { error } = await admin.from("order_items").insert(lineItemPayloads);

    if (error) {
      throw error;
    }
  }
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Configuration webhook Stripe manquante." },
      { status: 400 },
    );
  }

  const body = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Signature webhook Stripe invalide.",
      },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        await upsertOrderFromSession(event.data.object as Stripe.Checkout.Session);
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await createAdminClient()
          .from("orders")
          .update({
            status: "refunded",
            payment_status: "failed",
          })
          .eq("stripe_checkout_session_id", session.id);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors du traitement du webhook Stripe.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
