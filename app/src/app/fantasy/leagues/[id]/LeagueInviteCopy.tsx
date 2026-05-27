"use client";

import { useState } from "react";

export function LeagueInviteCopy({ inviteCode }: { inviteCode: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-sm font-medium hover:bg-[var(--surface)] transition-colors"
    >
      <span className="font-mono tracking-widest text-[var(--brand-strong)]">{inviteCode}</span>
      <span className="text-[var(--muted)]">{copied ? "✓ Copiado" : "Copiar código"}</span>
    </button>
  );
}
