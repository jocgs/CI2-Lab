"use client";

import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="rounded-full px-3 py-1.5 text-sm text-[var(--muted)] transition-colors hover:bg-red-50 hover:text-red-600"
    >
      Salir
    </button>
  );
}
