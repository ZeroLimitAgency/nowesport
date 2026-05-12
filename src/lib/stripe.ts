import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function getStripeSecretKey() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("La clé secrète Stripe est manquante.");
  }

  return secretKey;
}

export function getStripe() {
  if (!stripeClient) {
    stripeClient = new Stripe(getStripeSecretKey());
  }

  return stripeClient;
}

export function getSiteUrlFromRequest(request?: Request) {
  if (request) {
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const forwardedHost = request.headers.get("x-forwarded-host");
    const host = request.headers.get("host");

    if (forwardedProto && forwardedHost) {
      return `${forwardedProto}://${forwardedHost}`;
    }

    if (host) {
      const protocol = host.includes("localhost") || host.startsWith("127.0.0.1")
        ? "http"
        : "https";
      return `${protocol}://${host}`;
    }
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://127.0.0.1:3001";
}
