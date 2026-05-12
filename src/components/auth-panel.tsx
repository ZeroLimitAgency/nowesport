"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";
type OAuthProvider = "google" | "apple";

function ProviderButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-5 text-sm font-semibold text-white/82 transition hover:border-white/20 hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {label}
    </button>
  );
}

export function AuthPanel({
  userEmail,
  hasUser,
}: {
  userEmail?: string;
  hasUser: boolean;
}) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleOAuth(provider: OAuthProvider) {
    setIsLoading(true);
    setMessage("");

    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${origin}/auth/callback?next=/compte`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Impossible de lancer la connexion sociale.",
      );
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const supabase = createClient();

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        window.location.reload();
        return;
      }

      const origin = window.location.origin;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=/compte`,
        },
      });

      if (error) {
        throw error;
      }

      setMessage(
        "Inscription lancée. Vérifie ta boîte mail pour confirmer ton compte.",
      );
      setPassword("");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Impossible de continuer.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignOut() {
    setIsLoading(true);
    setMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      window.location.reload();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Impossible de se déconnecter.",
      );
      setIsLoading(false);
    }
  }

  if (hasUser) {
    return (
      <div className="rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,#131218_0%,#0b0b0d_100%)] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
          Connecté
        </p>
        <p className="mt-4 text-lg text-white/82">{userEmail}</p>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58">
          La connexion Supabase est active. On pourra maintenant brancher
          l&apos;espace client, les commandes et ensuite Stripe sur cette base.
        </p>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isLoading}
          className="secondary-cta mt-6"
        >
          Se déconnecter
        </button>
        {message ? <p className="mt-4 text-sm text-white/58">{message}</p> : null}
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.72fr_1fr]">
      <div className="rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,#131218_0%,#0b0b0d_100%)] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
          Accès client
        </p>
        <h2 className="mt-4 text-3xl font-black uppercase tracking-[-0.04em] text-white">
          Connexion ou inscription
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/58">
          Tu peux te connecter avec ton adresse e-mail, ou créer un compte avec
          e-mail, Google ou Apple selon les providers activés dans Supabase.
        </p>

        <div className="mt-6 grid gap-3">
          <ProviderButton
            label="Continuer avec Google"
            onClick={() => handleOAuth("google")}
            disabled={isLoading}
          />
          <ProviderButton
            label="Continuer avec Apple"
            onClick={() => handleOAuth("apple")}
            disabled={isLoading}
          />
        </div>

        <p className="mt-5 text-sm leading-6 text-white/42">
          Si Google ou Apple ne répondent pas encore, il faudra simplement les
          activer dans le dashboard Supabase avant qu&apos;ils fonctionnent.
        </p>
      </div>

      <div className="rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,#131218_0%,#0b0b0d_100%)] p-6">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
              mode === "login"
                ? "bg-white text-black"
                : "border border-white/10 bg-white/[0.03] text-white/70"
            }`}
          >
            Se connecter
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
              mode === "signup"
                ? "bg-white text-black"
                : "border border-white/10 bg-white/[0.03] text-white/70"
            }`}
          >
            Pas de compte ? S&apos;inscrire
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Adresse e-mail"
            className="min-h-14 rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm text-white outline-none placeholder:text-white/28 focus:border-[var(--color-accent)]/60"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Mot de passe"
            className="min-h-14 rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm text-white outline-none placeholder:text-white/28 focus:border-[var(--color-accent)]/60"
          />
          <button type="submit" disabled={isLoading} className="primary-cta w-fit">
            {isLoading
              ? "Chargement..."
              : mode === "login"
                ? "Se connecter"
                : "Créer mon compte"}
          </button>
        </form>

        {message ? <p className="mt-4 text-sm text-white/58">{message}</p> : null}
      </div>
    </div>
  );
}
