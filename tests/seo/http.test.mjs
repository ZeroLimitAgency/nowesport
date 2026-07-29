import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";

async function startServer(maintenance, port) {
  const env = { ...process.env, NEXT_PUBLIC_MAINTENANCE_MODE: maintenance ? "on" : "off", PORT: String(port) };
  for (const key of Object.keys(env)) if (key.includes("SUPABASE")) delete env[key];
  const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
    cwd: process.cwd(), env, stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.on("data", (chunk) => { output += chunk; });
  child.stderr.on("data", (chunk) => { output += chunk; });
  const origin = `http://127.0.0.1:${port}`;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`Serveur arrêté: ${output}`);
    try { if ((await fetch(origin)).status) return { child, origin }; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  child.kill("SIGTERM");
  throw new Error(`Serveur indisponible: ${output}`);
}

async function stopServer(child) {
  child.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => child.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 2000)),
  ]);
}

function hasPrivateUrl(xml) {
  return /\/(?:admin|api|login|auth|account|compte|profile|profil|cart|panier|checkout)(?:\/|<)/.test(xml);
}

test("HTTP hors maintenance", async () => {
  const { child, origin } = await startServer(false, 3111);
  try {
    const home = await fetch(`${origin}/`);
    const homeHtml = await home.text();
    const head = homeHtml.match(/<head>(.*?)<\/head>/s)?.[1] ?? "";
    assert.equal(home.status, 200);
    assert.match(homeHtml, /<link rel="canonical" href="https:\/\/nowesport\.org"/);
    assert.match(homeHtml, /Organization/);
    assert.match(homeHtml, /WebSite/);
    assert.doesNotMatch(head, /undefined|vercel\.app|localhost/);

    const robots = await (await fetch(`${origin}/robots.txt`)).text();
    assert.match(robots, /Sitemap: https:\/\/nowesport\.org\/sitemap\.xml/);
    assert.doesNotMatch(robots, /Disallow: \/\s*(?:\n|$)/);

    const sitemapResponse = await fetch(`${origin}/sitemap.xml`);
    const sitemap = await sitemapResponse.text();
    assert.equal(sitemapResponse.status, 200);
    assert.match(sitemap, /<loc>https:\/\/nowesport\.org\/<\/loc>/);
    assert.equal(hasPrivateUrl(sitemap), false);
    assert.doesNotMatch(sitemap, /localhost|vercel\.app/);
    assert.equal(new Set([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1])).size, (sitemap.match(/<loc>/g) ?? []).length);

    const login = await fetch(`${origin}/login`);
    assert.match(await login.text(), /name="robots" content="noindex, nofollow, noarchive"/);
    const alias = await fetch(`${origin}/account`, { redirect: "manual" });
    assert.equal(alias.status, 308);
    assert.equal(alias.headers.get("location"), "/compte");
    assert.equal((await fetch(`${origin}/shop/inexistant`)).status, 404);
    assert.equal((await fetch(`${origin}/roster/inexistant`)).status, 404);

    for (const path of ["/shop", "/roster", "/events", "/partners", "/legal/mentions-legales"]) {
      const response = await fetch(`${origin}${path}`);
      const page = await response.text();
      const pageHead = page.match(/<head>(.*?)<\/head>/s)?.[1] ?? "";
      assert.equal(response.status, 200, path);
      assert.match(pageHead, /<title>[^<]+ \| NOW Esport<\/title>/, path);
      assert.match(pageHead, /<meta name="description" content="[^"]+"/, path);
      assert.match(pageHead, new RegExp(`<link rel="canonical" href="https://nowesport\\.org${path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`), path);
      assert.match(pageHead, /property="og:image" content="https:\/\/nowesport\.org\//, path);
      assert.match(pageHead, /name="twitter:card" content="summary_large_image"/, path);
      assert.doesNotMatch(pageHead, /undefined|vercel\.app|localhost|NOW Esport \| NOW Esport/, path);
    }
  } finally { await stopServer(child); }
});

test("HTTP pendant la maintenance", async () => {
  const { child, origin } = await startServer(true, 3112);
  try {
    const home = await fetch(`${origin}/`);
    const html = await home.text();
    assert.equal(home.status, 200);
    assert.match(html, /<h1[^>]*>[^<]*(?:maintenance|bientôt)/i);
    assert.match(html, /<meta name="robots" content="index, follow"/);
    assert.match(html, /https:\/\/nowesport\.org/);
    assert.match(html, /Organization/);
    assert.match(html, /WebSite/);
    assert.doesNotMatch(html, /href="\/(?:shop|roster|events|partners|cart|compte)"/);

    const robots = await (await fetch(`${origin}/robots.txt`)).text();
    assert.match(robots, /Allow: \//);
    assert.doesNotMatch(robots, /Disallow: \/\s*(?:\n|$)/);
    assert.match(robots, /Disallow: \/admin/);

    const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
    assert.deepEqual([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]), ["https://nowesport.org/"]);

    for (const path of ["/shop", "/roster", "/events", "/partners"]) {
      const response = await fetch(`${origin}${path}`);
      assert.equal(response.status, 503, path);
      assert.equal(response.headers.get("retry-after"), "3600", path);
      assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow, noarchive", path);
    }
    const admin = await fetch(`${origin}/admin`, { redirect: "manual" });
    assert.equal(admin.status, 307);
    assert.match(admin.headers.get("location") ?? "", /^\/login\?next=/);
  } finally { await stopServer(child); }
});
