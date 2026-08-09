import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { getOptionalSupabasePublicEnv } from "@/lib/supabase/env";
import { isMaintenanceEnabled, isPreviewDeployment, MAINTENANCE_RETRY_AFTER_SECONDS } from "@/lib/maintenance";

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
        --card: rgba(0, 0, 0, 0.55);
        --border: rgba(255, 255, 255, 0.1);
        --muted: rgba(255, 255, 255, 0.68);
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
        border: 1px solid var(--border);
        border-radius: 2.5rem;
        background: var(--card);
        box-shadow: 0 30px 90px rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(24px);
        padding: clamp(2rem, 6vw, 4.5rem);
        text-align: center;
      }

      .eyebrow {
        display: inline-flex;
        border: 1px solid var(--border);
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
        color: var(--muted);
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

      a,
      button {
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

      button {
        cursor: pointer;
      }

      .utility-actions button {
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.08);
        box-shadow: none;
        color: var(--text);
      }

      .utility-actions {
        margin-top: 1rem;
      }

      .admin-login {
        position: fixed;
        right: 1rem;
        bottom: 1rem;
        min-height: auto;
        border: 1px solid var(--border);
        background: rgba(0, 0, 0, 0.32);
        box-shadow: none;
        color: rgba(255, 255, 255, 0.45);
        font-size: 0.62rem;
        letter-spacing: 0.18em;
        padding: 0.7rem 0.85rem;
      }

      .admin-login:hover {
        color: rgba(255, 255, 255, 0.75);
      }

      @media (max-width: 640px) {
        body {
          padding: 4.5rem 1rem;
        }

        main {
          border-radius: 2rem;
        }

        a,
        button {
          width: 100%;
        }

        .admin-login {
          width: auto;
        }
      }
    </style>
  </head>
  <body>
    <main aria-labelledby="maintenance-title">
      <span class="eyebrow">NOW eSport</span>
      <h1 id="maintenance-title" data-copy="title">Site en maintenance</h1>
      <p data-copy="body">
        Nous préparons la nouvelle version du site. Il sera bientôt disponible avec toutes les pages finales.
        Merci pour votre patience.
      </p>
      <div class="actions">
        <a href="${discordTicketUrl}" target="_blank" rel="noreferrer" data-copy="contact">Nous contacter</a>
      </div>
      <div class="actions utility-actions" aria-label="Préférences d'affichage">
        <button type="button" data-action="lang" aria-label="Changer la langue">FR / EN</button>
      </div>
      <a class="admin-login" href="/login?next=/" data-copy="login">Connexion admin</a>
    </main>
    <script>
      const copies = {
        fr: {
          title: "Site en maintenance",
          body: "Nous préparons la nouvelle version du site. Les administrateurs peuvent se connecter pour prévisualiser le site.",
          login: "Connexion admin",
          contact: "Nous contacter"
        },
        en: {
          title: "Site under maintenance",
          body: "We are preparing the new site. Administrators can sign in to preview the website.",
          login: "Admin login",
          contact: "Contact us"
        }
      };
      let lang = "fr";
      const setLang = (nextLang) => {
        lang = nextLang;
        document.documentElement.lang = lang;
        document.querySelectorAll("[data-copy]").forEach((node) => {
          const key = node.getAttribute("data-copy");
          node.textContent = copies[lang][key];
        });
      };
      document.querySelector("[data-action='lang']").addEventListener("click", () => setLang(lang === "fr" ? "en" : "fr"));
    </script>
  </body>
</html>`;

const sharedHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Retry-After": String(MAINTENANCE_RETRY_AFTER_SECONDS),
};

const publicDuringMaintenance = [
  "/api",
  "/admin",
  "/auth/callback",
  "/login",
  "/admin/preview",
  "/maintenance",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
  "/workspace.webmanifest",
  "/workspace-sw.js",
  "/overlay",
  "/opengraph-image",
  "/",
];

function isPublicDuringMaintenance(pathname: string) {
  return publicDuringMaintenance.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function isStaticAsset(pathname: string) {
  return pathname.startsWith("/_next/") || pathname.startsWith("/media/");
}

function applyDeploymentRobots(response: NextResponse | Response) {
  if (isPreviewDeployment()) response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

function applyOverlayHeaders(response: NextResponse | Response, pathname: string) {
  if (!pathname.startsWith("/overlay")) return response;
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("Content-Security-Policy", "default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; media-src 'self' https:; connect-src 'self'; font-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
  return response;
}

async function getAdminBypassResponse(request: NextRequest) {
  const supabaseEnv = getOptionalSupabasePublicEnv();

  if (!supabaseEnv) {
    return null;
  }

  const hasSupabaseCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-"));

  if (!hasSupabaseCookie) {
    return null;
  }

  let response = NextResponse.next({ request });

  try {
    const supabase = createServerClient(
      supabaseEnv.url,
      supabaseEnv.publishableKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );

            response = NextResponse.next({ request });

            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    return profile?.role === "admin" ? response : null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasPreview = request.cookies.get(previewCookieName)?.value === "1";
  const maintenanceEnabled = await isMaintenanceEnabled();

  if (
    !maintenanceEnabled ||
    hasPreview ||
    isPublicDuringMaintenance(pathname) ||
    isStaticAsset(pathname)
  ) {
    return applyOverlayHeaders(applyDeploymentRobots(await updateSession(request)), pathname);
  }

  const adminResponse = await getAdminBypassResponse(request);

  if (adminResponse) {
    return applyDeploymentRobots(adminResponse);
  }

  if (request.method === "HEAD") {
    return applyDeploymentRobots(new Response(null, {
      status: 503,
      headers: {
        ...sharedHeaders,
        "Content-Type": "text/html; charset=utf-8",
      },
    }));
  }

  if (request.method !== "GET") {
    return applyDeploymentRobots(new Response("Site en maintenance", {
      status: 503,
      headers: {
        ...sharedHeaders,
        "Content-Type": "text/plain; charset=utf-8",
      },
    }));
  }

  return applyDeploymentRobots(new Response(maintenanceHtml, {
    status: 503,
    headers: {
      ...sharedHeaders,
      "Content-Type": "text/html; charset=utf-8",
    },
  }));
}

export const config = {
  matcher: ["/:path*"],
};
