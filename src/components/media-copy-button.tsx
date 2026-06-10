"use client";

import { useState } from "react";

export function MediaCopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button type="button" onClick={copy} className="secondary-cta">
      {copied ? "URL copiée" : "Copier URL publique"}
    </button>
  );
}
