import { SignInButton } from "@/components/SignInButton";

export default function LoginPage() {
  return (
    <div className="flex w-full max-w-md flex-col items-center justify-center gap-8 px-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-[var(--brand)] text-3xl font-bold text-white shadow-md">
          P
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Porrify</h1>
        <p className="max-w-xs text-sm text-[var(--muted)]">
          Haz porras de fútbol con amigos y compite por el ranking.
        </p>
      </div>

      <div className="w-full max-w-sm rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <h2 className="text-lg font-semibold">Acceder</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Crea una cuenta o entra con tu email.
        </p>
        <SignInButton />
      </div>
    </div>
  );
}
