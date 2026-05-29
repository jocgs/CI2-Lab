import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/db";
import {
  getFantasyLeagueById,
  getFantasyLeagueRanking,
  getFantasyTeamForLeague,
} from "@/lib/fantasy-db";
import { MOCK_USERS } from "@/lib/mocks/users";
import { FantasyRankingTable } from "@/components/fantasy/FantasyRankingTable";
import { LeagueInviteCopy } from "./LeagueInviteCopy";

const COMPETITION_ID = "world_cup_2026";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function FantasyLeagueDetailPage({ params }: Props) {
  const { id } = await params;

  const user = await getCurrentUser();
  const [league, ranking, myLeagueTeam] = await Promise.all([
    getFantasyLeagueById(id),
    getFantasyLeagueRanking(id),
    getFantasyTeamForLeague(user.id, COMPETITION_ID, id),
  ]);

  if (!league) notFound();

  const isMember = league.memberIds.includes(user.id);
  const owner = MOCK_USERS.find((u) => u.id === league.ownerId);

  const tableEntries = ranking.map((e) => ({ ...e, rank: e.leagueRank }));

  const membersWithLeagueTeam = new Set(ranking.map((e) => e.userId));
  const membersWithoutTeam = league.memberIds.filter(
    (uid) => !membersWithLeagueTeam.has(uid),
  );
  const membersWithoutTeamNames = membersWithoutTeam.map(
    (uid) => MOCK_USERS.find((u) => u.id === uid)?.displayName ?? uid,
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
        <Link href="/fantasy" className="hover:text-[var(--fg)]">Fantasy</Link>
        <span>/</span>
        <Link href="/fantasy/leagues" className="hover:text-[var(--fg)]">Ligas</Link>
        <span>/</span>
        <span className="font-medium text-[var(--fg)]">{league.name}</span>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{league.name}</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {league.memberIds.length} participante{league.memberIds.length !== 1 ? "s" : ""}
              {" · "}creada por <strong>{owner?.displayName ?? league.ownerId}</strong>
              {" · "}Mundial 2026
            </p>
            <p className="mt-2 text-xs text-[var(--muted)]">
              Cada miembro monta su propio once solo para esta liga (independiente del ranking global).
            </p>
          </div>

          {isMember && <LeagueInviteCopy inviteCode={league.inviteCode} />}
        </div>

        {isMember && (
          <div className="mt-4 flex flex-wrap gap-2">
            {myLeagueTeam ? (
              <>
                <Link
                  href={`/fantasy/my-team?league=${id}`}
                  className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  Ver mi equipo ({myLeagueTeam.teamName})
                </Link>
                <span className="self-center text-sm text-[var(--muted)]">
                  {myLeagueTeam.totalPoints} pts
                </span>
              </>
            ) : (
              <Link
                href={`/fantasy/builder?league=${id}`}
                className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Crear mi equipo para esta liga →
              </Link>
            )}
          </div>
        )}
      </div>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
          Clasificación de la liga
        </h2>
        {tableEntries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center text-[var(--muted)]">
            <p className="text-3xl">⏳</p>
            <p className="mt-2 font-medium">Nadie tiene equipo de liga aún</p>
            <p className="mt-1 text-sm">
              El ranking usa el once creado para esta liga, no el del Fantasy global.
            </p>
            {isMember && !myLeagueTeam && (
              <Link
                href={`/fantasy/builder?league=${id}`}
                className="mt-4 inline-block rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
              >
                Crear mi equipo de liga →
              </Link>
            )}
          </div>
        ) : (
          <FantasyRankingTable entries={tableEntries} currentUserId={user.id} />
        )}
      </section>

      {membersWithoutTeamNames.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
            Sin equipo de liga
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
