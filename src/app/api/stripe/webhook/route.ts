import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { parseCheckoutItemsMetadata } from "@/lib/checkout";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

async function decrementVariantStock({
  admin,
  variantId,
  quantity,
  orderId,
}: {
  admin: ReturnType<typeof createAdminClient>;
  variantId: string;
  quantity: number;
  orderId: string;
}) {
  const { data: variant, error: readError } = await admin
    .from("product_variants")
    .select("stock_quantity")
    .eq("id", variantId)
    .maybeSingle();

  if (readError) {
    throw readError;
  }

  const currentStock = variant?.stock_quantity ?? 0;
  const nextStock = currentStock - quantity;

  if (nextStock < 0) {
    throw new Error("Stock insuffisant pour finaliser la commande Stripe.");
  }

  const { data: updatedVariant, error: updateError } = await admin
    .from("product_variants")
    .update({ stock_quantity: nextStock })
    .eq("id", variantId)
    .gte("stock_quantity", quantity)
    .select("id")
    .maybeSingle();

  if (updateError) {
    throw updateError;
  }

  if (!updatedVariant) {
    throw new Error("Stock insuffisant pour finaliser la commande Stripe.");
  }

  const { error: movementError } = await admin.from("inventory_movements").insert({
    product_variant_id: variantId,
    quantity_delta: -quantity,
    reason: "stripe_checkout_paid",
    order_id: orderId,
  });

  if (movementError) {
    throw movementError;
  }
}

async function upsertOrderFromSession(session: Stripe.Checkout.Session) {
  const stripe = getStripe();
  const admin = createAdminClient();
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
    expand: ["data.price.product"],
  });
  const metadataLines = parseCheckoutItemsMetadata(session.metadata?.checkout_items);

  const subtotalCents = session.amount_subtotal ?? 0;
  const totalCents = session.amount_total ?? 0;
  const shippingCents =
    session.total_details?.amount_shipping ??
    Math.max(totalCents - subtotalCents - (session.total_details?.amount_tax ?? 0), 0);
  const taxCents = session.total_details?.amount_tax ?? 0;
  const customerEmail = session.customer_details?.email ?? session.customer_email;

  if (!customerEmail) {
    throw new Error("Stripe n'a pas renvoye d'e-mail client pour la commande.");
  }

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
    notes: supabaseUserId
      ? null
      : "Commande invitee rattachee par e-mail client Stripe.",
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
    lineItems.data.map(async (item, index) => {
      const stripePriceId =
        typeof item.price === "string" ? item.price : item.price?.id ?? null;
      const metadataLine = metadataLines[index] ?? metadataLines.find((line) => line.stripe_price_id === stripePriceId);
      let productId: string | null = metadataLine?.product_id ?? null;
      let variantId: string | null = metadataLine?.variant_id ?? null;

      if (!variantId && stripePriceId) {
        const { data: variant } = await admin
          .from("product_variants")
          .select("id, product_id")
          .eq("stripe_price_id", stripePriceId)
          .maybeSingle();

        variantId = variant?.id ?? null;
        productId = productId ?? variant?.product_id ?? null;
      }

      if (!productId && stripePriceId) {
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
        product_variant_id: variantId,
        product_name: metadataLine?.product_name || item.description || "Produit NOW eSport",
        variant_name: metadataLine?.variant_name ?? null,
        quantity: item.quantity ?? metadataLine?.quantity ?? 1,
        unit_price_cents: item.amount_subtotal && item.quantity
          ? Math.round(item.amount_subtotal / item.quantity)
          : 0,
        total_price_cents: item.amount_total ?? item.amount_subtotal ?? 0,
        custom_name: null,
        custom_number: null,
        flocking: null,
        product_type: metadataLine?.product_type,
      };
    }),
  );

  if (lineItemPayloads.length) {
    const { error } = await admin.from("order_items").insert(
      lineItemPayloads.map((item) => ({
        order_id: item.order_id,
        product_id: item.product_id,
        product_variant_id: item.product_variant_id,
        product_name: item.product_name,
        variant_name: item.variant_name,
        quantity: item.quantity,
        unit_price_cents: item.unit_price_cents,
        total_price_cents: item.total_price_cents,
        custom_name: item.custom_name,
        custom_number: item.custom_number,
        flocking: item.flocking,
      })),
    );

    if (error) {
      throw error;
    }
  }

  await Promise.all(
    lineItemPayloads
      .filter((item) => item.product_type !== "digital" && item.product_variant_id)
      .map(async (item) => {
        const { data: existingMovement } = await admin
          .from("inventory_movements")
          .select("id")
          .eq("order_id", orderId!)
          .eq("product_variant_id", item.product_variant_id!)
          .eq("reason", "stripe_checkout_paid")
          .maybeSingle();

        if (existingMovement) {
          return;
        }

        await decrementVariantStock({
          admin,
          variantId: item.product_variant_id!,
          quantity: item.quantity,
          orderId: orderId!,
        });
      }),
  );
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
            status: "pending",
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
