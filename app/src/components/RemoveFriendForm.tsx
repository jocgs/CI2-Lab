"use client";

import { useActionState } from "react";
import { removeFriendAction } from "@/app/profile/actions";

interface RemoveFriendFormProps {
  friendUsername: string;
  redirectTo?: string;
}

export default function RemoveFriendForm({
  friendUsername,
  redirectTo = "/profile",
}: RemoveFriendFormProps) {
  const [state, action, isPending] = useActionState(removeFriendAction, null);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("¿Seguro que quieres anular la amistad?")) {
          e.preventDefault();
        }
      }}
      className="inline-flex flex-col items-start gap-1"
    >
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <input type="hidden" name="friendUsername" value={friendUsername} />
      {state?.error && <p className="text-xs text-red-200">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur transition hover:bg-red-500/80 disabled:opacity-50"
      >
        {isPending ? "Anulando…" : "Anular amistad"}
      </button>
    </form>
  );
}
