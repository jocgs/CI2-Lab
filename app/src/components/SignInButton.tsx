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
  const [showPassword, setShowPassword] = useState(false);
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
            onClick={() => { setMode(m); setError(null); setShowPassword(false); }}
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
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña (mín. 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-2 pl-3 pr-11 text-sm outline-none focus:border-[var(--brand)]"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--brand-soft)] hover:text-[var(--brand-strong)]"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
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

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}
