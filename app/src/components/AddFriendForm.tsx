"use client";

import { useActionState } from "react";
import { sendFriendRequestAction } from "@/app/profile/actions";

export default function AddFriendForm({ redirectTo = "/profile" }: { redirectTo?: string }) {
  const [state, action, isPending] = useActionState(sendFriendRequestAction, null);

  return (
    <form action={action} className="mt-5 flex flex-col gap-3">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <input
        type="text"
        name="friendUsername"
        placeholder="Ej: marina"
        className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 outline-none focus:border-[var(--brand)]"
      />
      {state?.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]/40 disabled:opacity-50"
      >
        {isPending ? "Enviando…" : "Añadir amigo"}
      </button>
    </form>
  );
}
