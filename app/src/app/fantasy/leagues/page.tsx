import { getCurrentUser } from "@/lib/db";
import { getLeaguesByUserId } from "@/lib/fantasy-db";
import { CreateLeagueForm, JoinLeagueForm, LeagueCard } from "./LeaguesClient";
import Link from "next/link";

export default async function FantasyLeaguesPage() {
  const user = await getCurrentUser();
  const leagues = await getLeaguesByUserId(user.id);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/fantasy"
          className="text-sm text-[var(--muted)] hover:text-[var(--fg)]"
        >
          ← Fantasy
        </Link>
        <span className="text-[var(--muted)]">/</span>
        <h1 className="text-2xl font-semibold tracking-tight">Mis ligas de amigos</h1>
      </div>

      {/* My leagues */}
      {leagues.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm font-medium text-[var(--muted)] uppercase tracking-wide">
            Tus ligas ({leagues.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {leagues.map((league) => (
              <LeagueCard key={league.id} league={league} currentUserId={user.id} />
            ))}
          </div>
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center text-[var(--muted)]">
          <p className="text-4xl">🏆</p>
          <p className="mt-2 font-medium">Aún no estás en ninguna liga</p>
          <p className="mt-1 text-sm">Crea una nueva o únete con el código de un amigo.</p>
        </div>
      )}

      {/* Create / Join */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Create */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="mb-1 text-base font-semibold">➕ Crear liga</h2>
          <p className="mb-4 text-xs text-[var(--muted)]">
            Crea una liga privada y comparte el código con tus amigos.
          </p>
          <CreateLeagueForm competitionId="world_cup_2026" />
        </div>

        {/* Join */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="mb-1 text-base font-semibold">🔑 Unirse a una liga</h2>
          <p className="mb-4 text-xs text-[var(--muted)]">
            Introduce el código que te ha dado el creador de la liga.
          </p>
          <JoinLeagueForm />
        </div>
      </div>
    </div>
  );
}
