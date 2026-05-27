"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRedirectResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { USE_MOCKS } from "@/lib/runtime";

/**
 * Se monta en la página de login y recoge el resultado de
 * signInWithRedirect cuando Google redirige de vuelta.
 */
export function AuthRedirectHandler() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (USE_MOCKS) return;

    getRedirectResult(auth)
      .then(async (result) => {
        if (!result) return; // No había redirect pendiente — carga normal

        setStatus("loading");
        const idToken = await result.user.getIdToken();

        const res = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Error al crear la sesión");
        }

        router.push("/");
        router.refresh();
      })
      .catch((err: { message?: string; code?: string }) => {
        console.error("AuthRedirectHandler error:", err);
        setErrorMsg(err.message ?? "Error desconocido");
        setStatus("error");
      });
  }, [router]);

  if (status === "loading") {
    return (
      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[var(--muted)]">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--brand)] border-t-transparent" />
        Verificando cuenta…
      </div>
    );
  }

  if (status === "error") {
    return (
      <p className="mt-4 text-center text-xs text-red-500">
        Error al iniciar sesión: {errorMsg}
      </p>
    );
  }

  return null;
}
