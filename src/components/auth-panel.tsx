"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup" | "reset";
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
  nextPath = "/compte",
}: {
  userEmail?: string;
  hasUser: boolean;
  nextPath?: string;
}) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function authCallback(origin: string) {
    return `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
  }

  async function handleOAuth(provider: OAuthProvider) {
    setIsLoading(true);
    setMessage("");

    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: authCallback(origin),
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
      const origin = window.location.origin;

      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
        });

        if (error) {
          throw error;
        }

        setMessage("E-mail de réinitialisation envoyé si le compte existe.");
        return;
      }

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        window.location.href = nextPath;
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: authCallback(origin),
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

      window.location.href = "/login";
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
          Ta session Supabase est active pour l&apos;espace client, le panier et
          le suivi de commandes.
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
          Connecte-toi avec ton adresse e-mail, crée un compte, ou utilise les
          providers activés dans Supabase.
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
      </div>

      <div className="rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,#131218_0%,#0b0b0d_100%)] p-6">
        <div className="flex flex-wrap gap-3">
          {[
            ["login", "Se connecter"],
            ["signup", "S'inscrire"],
            ["reset", "Mot de passe oublié"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value as AuthMode)}
              className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                mode === value
                  ? "bg-white text-black"
                  : "border border-white/10 bg-white/[0.03] text-white/70"
              }`}
            >
              {label}
            </button>
          ))}
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
          {mode !== "reset" ? (
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mot de passe"
              className="min-h-14 rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm text-white outline-none placeholder:text-white/28 focus:border-[var(--color-accent)]/60"
            />
          ) : null}
          <button type="submit" disabled={isLoading} className="primary-cta w-fit">
            {isLoading
              ? "Chargement..."
              : mode === "login"
                ? "Se connecter"
                : mode === "signup"
                  ? "Créer mon compte"
                  : "Envoyer le lien"}
          </button>
        </form>

        {message ? <p className="mt-4 text-sm text-white/58">{message}</p> : null}
      </div>
    </div>
  );
}
