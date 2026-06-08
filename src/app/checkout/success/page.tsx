import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

type Verification = {
  title: string;
  message: string;
  tone: "confirmed" | "pending";
};

async function verifyPayment(sessionId?: string): Promise<Verification> {
  if (!sessionId) {
    return {
      title: "Vérification du paiement",
      message:
        "Aucun identifiant de session n'a été fourni. Si tu viens de payer, vérifie ton e-mail Stripe ou ton espace client dans quelques instants.",
      tone: "pending",
    };
  }

  try {
    const admin = createAdminClient();
    const { data: order } = await admin
      .from("orders")
      .select("id, payment_status")
      .eq("stripe_checkout_session_id", sessionId)
      .maybeSingle();

    if (order?.payment_status === "paid") {
      return {
        title: "Paiement confirmé",
        message:
          "La commande a bien été enregistrée. Tu peux retrouver son suivi dans ton espace client si l'e-mail Stripe correspond à ton compte.",
        tone: "confirmed",
      };
    }
  } catch {
    // Stripe fallback below.
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid") {
      return {
        title: "Paiement reçu",
        message:
          "Stripe indique que le paiement est reçu. La commande peut encore être en cours de synchronisation dans l'espace client.",
        tone: "confirmed",
      };
    }
  } catch {
    // Neutral fallback below.
  }

  return {
    title: "Vérification du paiement en cours",
    message:
      "Nous vérifions encore le statut du paiement. Si le débit est confirmé par Stripe, la commande apparaîtra dans l'espace client après traitement du webhook.",
    tone: "pending",
  };
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  const verification = await verifyPayment(sessionId);

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <section className="mx-auto flex w-full max-w-[56rem] px-5 py-16 sm:px-8 sm:py-24">
        <div className="w-full rounded-[2rem] border border-white/8 bg-[linear-gradient(145deg,#171219_0%,#09090b_100%)] px-6 py-10 shadow-[0_30px_120px_rgba(0,0,0,0.35)] sm:px-10">
          <p className="section-kicker">Paiement</p>
          <h1 className="mt-4 text-5xl font-black uppercase leading-[0.92] tracking-[-0.05em] text-white sm:text-7xl">
            {verification.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-white/60 sm:text-lg">
            {verification.message}
          </p>
          {verification.tone === "pending" ? (
            <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white/52">
              Ne relance pas immédiatement le paiement si Stripe affiche déjà une confirmation. Contacte le support avec ton e-mail de paiement en cas de doute.
            </p>
          ) : null}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/compte" className="primary-cta">
              Aller à mon compte
            </Link>
            <Link href="/shop" className="secondary-cta">
              Retour à la boutique
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
