import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { updateSession } from "@/lib/supabase/middleware";

const discordTicketUrl = "https://discord.gg/K5AxWfD7tc";
const previewCookieName = "now-preview";

const maintenanceHtml = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>Maintenance | NOW eSport</title>
    <style>
      :root {
        color-scheme: dark;
        --accent: #e93585;
        --accent-soft: #ff8ec0;
        --bg: #050505;
        --text: #f5f3f7;
      }

      * {
        box-sizing: border-box;
      }

      html,
      body {
        min-height: 100%;
        margin: 0;
      }

      body {
        display: grid;
        place-items: center;
        overflow-x: hidden;
        background:
          radial-gradient(circle at top, rgba(233, 53, 133, 0.28), transparent 34%),
          radial-gradient(circle at bottom right, rgba(255, 142, 192, 0.16), transparent 28%),
          var(--bg);
        color: var(--text);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        padding: 6rem 1.25rem;
      }

      body::before {
        content: "";
        position: fixed;
        inset: 0;
        pointer-events: none;
        background-image:
          linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
        background-size: 3rem 3rem;
        mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.72), transparent 82%);
      }

      main {
        position: relative;
        z-index: 1;
        width: min(100%, 56rem);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 2.5rem;
        background: rgba(0, 0, 0, 0.55);
        box-shadow: 0 30px 90px rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(24px);
        padding: clamp(2rem, 6vw, 4.5rem);
        text-align: center;
      }

      .eyebrow {
        display: inline-flex;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.06);
        color: var(--accent-soft);
        font-size: 0.75rem;
        font-weight: 900;
        letter-spacing: 0.28em;
        padding: 0.65rem 1rem;
        text-transform: uppercase;
      }

      h1 {
        margin: 1.75rem 0 0;
        font-size: clamp(3.25rem, 12vw, 7rem);
        font-weight: 950;
        letter-spacing: -0.08em;
        line-height: 0.9;
        text-transform: uppercase;
      }

      p {
        max-width: 42rem;
        margin: 1.5rem auto 0;
        color: rgba(255, 255, 255, 0.68);
        font-size: clamp(1rem, 2vw, 1.125rem);
        line-height: 1.75;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        margin-top: 2.25rem;
      }

      a {
        display: inline-flex;
        min-height: 3.5rem;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        background: linear-gradient(135deg, #ff8dc2 0%, var(--accent) 55%, #9f1c56 100%);
        box-shadow: 0 18px 45px rgba(233, 53, 133, 0.28);
        color: #fff;
        font-size: 0.8rem;
        font-weight: 900;
        letter-spacing: 0.2em;
        padding: 0 1.5rem;
        text-decoration: none;
        text-transform: uppercase;
      }

      @media (max-width: 640px) {
        body {
          padding: 4.5rem 1rem;
        }

        main {
          border-radius: 2rem;
        }

        a {
          width: 100%;
        }
      }
    </style>
  </head>
  <body>
    <main aria-labelledby="maintenance-title">
      <span class="eyebrow">NOW eSport</span>
      <h1 id="maintenance-title">Site en maintenance</h1>
      <p>
        Nous préparons la nouvelle version du site. Il sera bientôt disponible avec toutes les pages finales.
        Merci pour votre patience.
      </p>
      <div class="actions">
        <a href="${discordTicketUrl}" target="_blank" rel="noreferrer">Nous contacter</a>
      </div>
    </main>
  </body>
</html>`;

const sharedHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "X-Robots-Tag": "noindex, nofollow",
};

const publicDuringMaintenance = [
  "/api",
  "/auth/callback",
  "/login",
  "/admin/preview",
  "/maintenance",
  "/favicon.ico",
];

function isPublicDuringMaintenance(pathname: string) {
  return publicDuringMaintenance.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function isStaticAsset(pathname: string) {
  return pathname.startsWith("/_next/") || pathname.startsWith("/media/");
}

async function isMaintenanceEnabled() {
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        { auth: { persistSession: false } },
      );
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "maintenance_mode")
        .maybeSingle();

      if (typeof data?.value === "boolean") {
        return data.value;
      }
    } catch {
      // fallback env below
    }
  }

  return process.env.NEXT_PUBLIC_MAINTENANCE_MODE !== "off";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasPreview = request.cookies.get(previewCookieName)?.value === "1";

  if (
    !(await isMaintenanceEnabled()) ||
    hasPreview ||
    isPublicDuringMaintenance(pathname) ||
    isStaticAsset(pathname)
  ) {
    return updateSession(request);
  }

  if (request.method === "HEAD") {
    return new Response(null, {
      status: 503,
      headers: {
        ...sharedHeaders,
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }

  if (request.method !== "GET") {
    return new Response("Site en maintenance", {
      status: 503,
      headers: {
        ...sharedHeaders,
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  return new Response(maintenanceHtml, {
    status: 503,
    headers: {
      ...sharedHeaders,
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

export const config = {
  matcher: ["/:path*"],
};
