import Link from "next/link";

export function ProfileBackNav({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Link
        href="/profile"
        className="inline-flex w-fit items-center gap-1 text-sm font-medium text-[var(--brand-strong)] hover:underline"
      >
        ← Perfil
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {subtitle ? <p className="text-sm text-[var(--muted)]">{subtitle}</p> : null}
    </div>
  );
}
