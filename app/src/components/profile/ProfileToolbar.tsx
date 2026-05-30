import Link from "next/link";
import { clsx } from "@/lib/utils";

function EnvelopeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 7 10-7" />
    </svg>
  );
}

export function ProfileToolbar({
  pendingRequestsCount,
}: {
  pendingRequestsCount: number;
}) {
  const hasPending = pendingRequestsCount > 0;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href="/profile/edit"
        className="rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
      >
        Editar perfil
      </Link>

      <div className="ml-auto flex items-center gap-2">
        <Link
          href="/profile/friend-requests"
          title="Solicitudes de amistad"
          aria-label={
            hasPending
              ? `Solicitudes de amistad (${pendingRequestsCount} pendientes)`
              : "Solicitudes de amistad"
          }
          className={clsx(
            "relative grid h-11 w-11 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--fg)] transition hover:bg-[var(--background)]",
          )}
        >
          <EnvelopeIcon className="h-5 w-5" />
          {hasPending ? (
            <span
              className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[var(--surface)]"
              aria-hidden
            />
          ) : null}
        </Link>
      </div>
    </div>
  );
}
