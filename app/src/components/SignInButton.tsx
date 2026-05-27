"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "login" | "register";

export function SignInButton() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const body =
        mode === "register"
          ? { action: "register", email, displayName, password }
          : { email, password };

      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al iniciar sesión");

      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      {/* Tabs login / registro */}
      <div className="flex rounded-xl border border-[var(--border)] p-1 text-sm">
        {(["login", "register"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setError(null); }}
            className={
              "flex-1 rounded-lg py-1.5 font-medium transition-colors " +
              (mode === m
                ? "bg-[var(--brand)] text-white"
                : "text-[var(--muted)] hover:text-[var(--foreground)]")
            }
          >
            {m === "login" ? "Entrar" : "Registrarse"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {mode === "register" && (
          <input
            type="text"
            placeholder="Tu nombre"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
          />
        )}
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
        />
        <input
          type="password"
          placeholder="Contraseña (mín. 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[var(--brand)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-strong)] disabled:opacity-60"
        >
          {loading ? "Entrando…" : mode === "login" ? "Entrar" : "Crear cuenta"}
        </button>
      </form>

      {error && <p className="text-center text-xs text-red-500">{error}</p>}

      {mode === "login" && (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)] px-4 py-3 text-xs text-[var(--muted)]">
          <p className="mb-1 font-medium">Cuentas de prueba (contraseña: <span className="font-mono">porrify</span>)</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            <span>clara@porrify.app</span>
            <span>marina@porrify.app</span>
            <span>pablo@porrify.app</span>
            <span>lucia@porrify.app</span>
            <span>diego@porrify.app</span>
          </div>
        </div>
      )}
    </div>
  );
}
