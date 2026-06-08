"use client";

import type { CmsBlock, SiteLocale } from "@/lib/cms";

type MaintenanceControlsProps = {
  content: CmsBlock;
  locale: SiteLocale;
};

export function MaintenanceControls({ content, locale }: MaintenanceControlsProps) {
  return (
    <section
      className="relative z-10 mx-auto w-full max-w-4xl rounded-[2rem] border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.55)] p-7 text-center text-[#f5f3f7] shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:rounded-[2.5rem] sm:p-12"
      aria-labelledby="maintenance-title"
    >
      <p className="mx-auto inline-flex rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-[#ff8ec0]">
        {content.eyebrow ?? "NOW eSport"}
      </p>

      <h1
        id="maintenance-title"
        className="mt-7 text-5xl font-black uppercase leading-[0.9] tracking-[-0.08em] sm:text-7xl lg:text-8xl"
      >
        {content.title}
      </h1>

      <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/68 sm:text-lg">
        {content.body}
      </p>

      <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
        {content.ctaHref && content.ctaLabel ? (
          <a
            href={content.ctaHref}
            target="_blank"
            rel="noreferrer"
            className="primary-cta w-full sm:w-auto"
          >
            {content.ctaLabel}
          </a>
        ) : null}
        <a
          href={`/api/language?lang=${locale === "fr" ? "en" : "fr"}&next=/maintenance`}
          className="inline-flex min-h-14 w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.08] px-6 text-xs font-black uppercase tracking-[0.2em] text-white sm:w-auto"
          aria-label="Changer la langue"
        >
          FR / EN
        </a>
      </div>

      <a
        href={content.secondaryCtaHref ?? "/login?next=/"}
        className="absolute bottom-4 right-4 rounded-full border border-white/10 bg-black/30 px-3 py-2 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-white/45 hover:border-white/20 hover:text-white/75"
      >
        {content.secondaryCtaLabel ?? (locale === "fr" ? "Connexion admin" : "Admin login")}
      </a>
    </section>
  );
}
