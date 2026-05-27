import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/db";
import { getFantasyLeagueById, getFantasyLeagueRanking } from "@/lib/fantasy-db";
import { MOCK_USERS } from "@/lib/mocks/users";
import { FantasyRankingTable } from "@/components/fantasy/FantasyRankingTable";
import { LeagueInviteCopy } from "./LeagueInviteCopy";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function FantasyLeagueDetailPage({ params }: Props) {
  const { id } = await params;

  const user = await getCurrentUser();
  const [league, ranking] = await Promise.all([
    getFantasyLeagueById(id),
    getFantasyLeagueRanking(id),
  ]);

  if (!league) notFound();

  const isMember = league.memberIds.includes(user.id);
  const owner = MOCK_USERS.find((u) => u.id === league.ownerId);

  // Enrich with leagueRank (already set in getFantasyLeagueRanking)
  const tableEntries = ranking.map((e) => ({ ...e, rank: e.leagueRank }));

  // Members without a fantasy team yet
  const membersWithoutTeam = league.memberIds.filter(
    (uid) => !ranking.some((e) => e.userId === uid),
  );
  const membersWithoutTeamNames = membersWithoutTeam.map(
    (uid) => MOCK_USERS.find((u) => u.id === uid)?.displayName ?? uid,
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
        <Link href="/fantasy" className="hover:text-[var(--fg)]">Fantasy</Link>
        <span>/</span>
        <Link href="/fantasy/leagues" className="hover:text-[var(--fg)]">Ligas</Link>
        <span>/</span>
        <span className="text-[var(--fg)] font-medium">{league.name}</span>
      </div>

      {/* Hero */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{league.name}</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {league.memberIds.length} participante{league.memberIds.length !== 1 ? "s" : ""}
              {" · "}creada por <strong>{owner?.displayName ?? league.ownerId}</strong>
              {" · "}Mundial 2026
            </p>
          </div>

          {isMember && (
            <LeagueInviteCopy inviteCode={league.inviteCode} />
          )}
        </div>
      </div>

      {/* Ranking */}
      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
          Clasificación de la liga
        </h2>
        {tableEntries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center text-[var(--muted)]">
            <p className="text-3xl">⏳</p>
            <p className="mt-2 font-medium">Ningún participante tiene equipo aún</p>
            <p className="mt-1 text-sm">El ranking se activará cuando alguien cree su equipo Fantasy.</p>
            {!ranking.some((e) => e.userId === user.id) && (
              <Link
                href="/fantasy/builder"
                className="mt-4 inline-block rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
              >
                Crear mi equipo →
              </Link>
            )}
          </div>
        ) : (
          <FantasyRankingTable entries={tableEntries} currentUserId={user.id} />
        )}
      </section>

      {/* Members without team */}
      {membersWithoutTeamNames.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
            Esperando equipo
          </h2>
          <div className="flex flex-wrap gap-2">
            {membersWithoutTeamNames.map((name) => (
              <span
                key={name}
                className="rounded-full border border-dashed border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]"
              >
                {name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* CTA if not a member */}
      {!isMember && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/30">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            No eres miembro de esta liga. Únete desde{" "}
            <Link href="/fantasy/leagues" className="font-medium underline">
              la página de ligas
            </Link>{" "}
            usando el código <strong>{league.inviteCode}</strong>.
          </p>
        </div>
      )}
    </div>
  );
}
