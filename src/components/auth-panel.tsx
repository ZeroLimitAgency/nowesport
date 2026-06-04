"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "reset";

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
    <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(19,18,24,0.96)_0%,rgba(8,8,10,0.98)_100%)] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.45)] sm:p-8">
      <div className="text-center">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--color-accent-soft)]">
          Accès sécurisé
        </p>
        <h2 className="mt-4 text-3xl font-black uppercase leading-none tracking-[-0.05em] text-white sm:text-5xl">
          {mode === "reset" ? "Réinitialiser" : "Connexion"}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/58">
          {mode === "reset"
            ? "Indique ton adresse e-mail pour recevoir un lien de réinitialisation."
            : "Connecte-toi avec ton adresse e-mail et ton mot de passe pour accéder à ton espace client ou admin."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Adresse e-mail"
          className="min-h-14 rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm text-white outline-none placeholder:text-white/28 focus:border-[var(--color-accent)]/60"
        />
        {mode === "login" ? (
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

        <div className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <button type="submit" disabled={isLoading} className="primary-cta w-full sm:w-auto">
            {isLoading
              ? "Chargement..."
              : mode === "login"
                ? "Se connecter"
                : "Envoyer le lien"}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "reset" : "login")}
            className="min-h-12 rounded-full border border-white/10 bg-white/[0.03] px-5 text-sm font-bold text-white/82 hover:border-white/20 hover:text-white"
          >
            {mode === "login" ? "Mot de passe oublié ?" : "Retour connexion"}
          </button>
        </div>
      </form>

      {message ? <p className="mt-5 text-center text-sm text-white/58">{message}</p> : null}
    </div>
  );
}
