"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw error;
      }

      setPassword("");
      setMessage("Mot de passe mis à jour. Tu peux revenir à ton compte.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Mise à jour impossible.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-xl rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,#131218_0%,#0b0b0d_100%)] p-6">
      <label className="grid gap-2 text-sm text-white/58">
        Nouveau mot de passe
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="min-h-14 rounded-full border border-white/10 bg-white/[0.04] px-5 text-white outline-none focus:border-[var(--color-accent)]/60"
        />
      </label>
      <button type="submit" disabled={isLoading} className="primary-cta mt-6">
        {isLoading ? "Mise à jour..." : "Mettre à jour"}
      </button>
      {message ? <p className="mt-4 text-sm text-white/58">{message}</p> : null}
    </form>
  );
}
