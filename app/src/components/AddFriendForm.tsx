"use client";

import { useActionState } from "react";
import { sendFriendRequestAction } from "@/app/profile/actions";

interface AddFriendFormProps {
  redirectTo?: string;
  /** Si se indica, no muestra el campo de texto (p. ej. perfil público). */
  friendUsername?: string;
  variant?: "default" | "inline";
}

export default function AddFriendForm({
  redirectTo = "/profile",
  friendUsername,
  variant = "default",
}: AddFriendFormProps) {
  const [state, action, isPending] = useActionState(sendFriendRequestAction, null);

  const isInline = variant === "inline";

  return (
    <form
      action={action}
      className={isInline ? "inline-flex flex-col items-start gap-1" : "mt-5 flex flex-col gap-3"}
    >
      <input type="hidden" name="redirectTo" value={redirectTo} />
      {friendUsername ? (
        <input type="hidden" name="friendUsername" value={friendUsername} />
      ) : (
        <input
          type="text"
          name="friendUsername"
          placeholder="Ej: marina"
          className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 outline-none focus:border-[var(--brand)]"
        />
      )}
      {state?.error && (
        <p
          className={
            isInline
              ? "text-xs text-red-200"
              : "rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400"
          }
        >
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className={
          isInline
            ? "rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--brand-strong)] shadow-sm transition hover:bg-white/90 disabled:opacity-50"
            : "rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]/40 disabled:opacity-50"
        }
      >
        {isPending ? "Enviando…" : friendUsername ? "Solicitar amistad" : "Añadir amigo"}
      </button>
    </form>
  );
}
