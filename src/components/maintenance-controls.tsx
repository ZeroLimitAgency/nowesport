"use client";

import { useState } from "react";

const copy = {
  fr: {
    title: "Site en maintenance",
    body: "Nous préparons la nouvelle version du site. Les administrateurs peuvent se connecter pour prévisualiser le site.",
    login: "Connexion admin",
    contact: "Nous contacter",
    theme: "Clair / sombre",
  },
  en: {
    title: "Site under maintenance",
    body: "We are preparing the new site. Administrators can sign in to preview the website.",
    login: "Admin login",
    contact: "Contact us",
    theme: "Light / dark",
  },
} as const;

type MaintenanceControlsProps = {
  contactUrl: string;
};

export function MaintenanceControls({ contactUrl }: MaintenanceControlsProps) {
  const [lang, setLang] = useState<keyof typeof copy>("fr");
  const [isLight, setIsLight] = useState(false);
  const currentCopy = copy[lang];

  return (
    <section
      data-theme={isLight ? "light" : "dark"}
      className="relative z-10 mx-auto w-full max-w-4xl rounded-[2rem] border border-[var(--maintenance-border)] bg-[var(--maintenance-card)] p-7 text-center text-[var(--maintenance-text)] shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl [--maintenance-border:rgba(255,255,255,0.1)] [--maintenance-card:rgba(0,0,0,0.55)] [--maintenance-muted:rgba(255,255,255,0.68)] [--maintenance-text:#f5f3f7] data-[theme=light]:[--maintenance-border:rgba(18,18,24,0.1)] data-[theme=light]:[--maintenance-card:rgba(255,255,255,0.82)] data-[theme=light]:[--maintenance-muted:rgba(18,18,24,0.68)] data-[theme=light]:[--maintenance-text:#151018] sm:rounded-[2.5rem] sm:p-12"
      aria-labelledby="maintenance-title"
    >
      <p className="mx-auto inline-flex rounded-full border border-[var(--maintenance-border)] bg-white/[0.06] px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-[#ff8ec0]">
        NOW eSport
      </p>

      <h1
        id="maintenance-title"
        className="mt-7 text-5xl font-black uppercase leading-[0.9] tracking-[-0.08em] sm:text-7xl lg:text-8xl"
      >
        {currentCopy.title}
      </h1>

      <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[var(--maintenance-muted)] sm:text-lg">
        {currentCopy.body}
      </p>

      <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <a href="/login?next=/" className="primary-cta w-full sm:w-auto">
          {currentCopy.login}
        </a>
        <a
          href={contactUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-14 w-full items-center justify-center rounded-full border border-[var(--maintenance-border)] bg-white/[0.08] px-6 text-center text-xs font-black uppercase tracking-[0.2em] text-[var(--maintenance-text)] sm:w-auto"
        >
          {currentCopy.contact}
        </a>
      </div>

      <div className="mt-4 flex flex-col items-center justify-center gap-4 sm:flex-row" aria-label="Préférences d'affichage">
        <button
          type="button"
          onClick={() => setLang(lang === "fr" ? "en" : "fr")}
          className="inline-flex min-h-14 w-full items-center justify-center rounded-full border border-[var(--maintenance-border)] bg-white/[0.08] px-6 text-xs font-black uppercase tracking-[0.2em] text-[var(--maintenance-text)] sm:w-auto"
        >
          FR / EN
        </button>
        <button
          type="button"
          onClick={() => setIsLight((value) => !value)}
          className="inline-flex min-h-14 w-full items-center justify-center rounded-full border border-[var(--maintenance-border)] bg-white/[0.08] px-6 text-xs font-black uppercase tracking-[0.2em] text-[var(--maintenance-text)] sm:w-auto"
        >
          {currentCopy.theme}
        </button>
      </div>
    </section>
  );
}
