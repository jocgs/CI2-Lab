"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInAnonymously,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

type Mode = "login" | "register";

export function SignInButton() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result;

      if (mode === "register") {
        result = await createUserWithEmailAndPassword(auth, email, password);
        if (name) await updateProfile(result.user, { displayName: name });
      } else {
        result = await signInWithEmailAndPassword(auth, email, password);
      }

      const idToken = await result.user.getIdToken();
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) throw new Error("Error al crear la sesión");

      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      setError(
        code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential"
          ? "Email o contraseña incorrectos."
          : code === "auth/email-already-in-use"
            ? "Ese email ya está registrado. Inicia sesión."
            : code === "auth/weak-password"
              ? "La contraseña debe tener al menos 6 caracteres."
              : code === "auth/invalid-email"
                ? "Email no válido."
                : "Error al iniciar sesión. Inténtalo de nuevo."
      );
      setLoading(false);
    }
  }

  async function handleAnon() {
    setLoading(true);
    try {
      const result = await signInAnonymously(auth);
      const idToken = await result.user.getIdToken();
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) throw new Error();
      router.push("/");
      router.refresh();
    } catch {
      setError("Error al entrar. Inténtalo de nuevo.");
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
        />
        <input
          type="password"
          placeholder="Contraseña (mín. 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
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

      <div className="relative flex items-center gap-3">
        <div className="flex-1 border-t border-[var(--border)]" />
        <span className="text-xs text-[var(--muted)]">o</span>
        <div className="flex-1 border-t border-[var(--border)]" />
      </div>

      <button
        onClick={handleAnon}
        disabled={loading}
        className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] py-2.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-60"
      >
        <GuestIcon />
        Entrar como invitado
      </button>
    </div>
  );
}

function GuestIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}
