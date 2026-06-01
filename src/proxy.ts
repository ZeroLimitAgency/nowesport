import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
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
        --card: rgba(0, 0, 0, 0.55);
        --border: rgba(255, 255, 255, 0.1);
        --muted: rgba(255, 255, 255, 0.68);
        --text: #f5f3f7;
      }

      html[data-theme="light"] {
        color-scheme: light;
        --bg: #fbf7fb;
        --card: rgba(255, 255, 255, 0.82);
        --border: rgba(18, 18, 24, 0.1);
        --muted: rgba(18, 18, 24, 0.68);
        --text: #151018;
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

      .secondary,
      .utility-actions button {
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.08);
        box-shadow: none;
        color: var(--text);
      }

      .utility-actions {
        margin-top: 1rem;
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
        <a href="/login?next=/" data-copy="login">Connexion admin</a>
        <a class="secondary" href="${discordTicketUrl}" target="_blank" rel="noreferrer" data-copy="contact">Nous contacter</a>
      </div>
      <div class="actions utility-actions" aria-label="Préférences d'affichage">
        <button type="button" data-action="lang" aria-label="Changer la langue">FR / EN</button>
        <button type="button" data-action="theme" aria-label="Changer le thème">Clair / sombre</button>
      </div>
    </main>
    <script>
      const copies = {
        fr: {
          title: "Site en maintenance",
          body: "Nous préparons la nouvelle version du site. Les administrateurs peuvent se connecter pour prévisualiser le site.",
          login: "Connexion admin",
          contact: "Nous contacter",
          theme: "Clair / sombre"
        },
        en: {
          title: "Site under maintenance",
          body: "We are preparing the new site. Administrators can sign in to preview the website.",
          login: "Admin login",
          contact: "Contact us",
          theme: "Light / dark"
        }
      };
      let lang = "fr";
      let theme = "dark";
      const setLang = (nextLang) => {
        lang = nextLang;
        document.documentElement.lang = lang;
        document.querySelectorAll("[data-copy]").forEach((node) => {
          const key = node.getAttribute("data-copy");
          node.textContent = copies[lang][key];
        });
        document.querySelector("[data-action='theme']").textContent = copies[lang].theme;
      };
      const setTheme = (nextTheme) => {
        theme = nextTheme;
        document.documentElement.dataset.theme = theme;
      };
      document.querySelector("[data-action='lang']").addEventListener("click", () => setLang(lang === "fr" ? "en" : "fr"));
      document.querySelector("[data-action='theme']").addEventListener("click", () => setTheme(theme === "dark" ? "light" : "dark"));
    </script>
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
      const supabase = createSupabaseClient(
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

async function getAdminBypassResponse(request: NextRequest) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
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
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
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
    return updateSession(request);
  }

  const adminResponse = await getAdminBypassResponse(request);

  if (adminResponse) {
    return adminResponse;
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
