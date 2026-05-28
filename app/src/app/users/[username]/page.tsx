import Link from "next/link";
import { notFound } from "next/navigation";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { Badge, Card, EmptyState, SectionTitle } from "@/components/ui";
import {
  getBetsForUser,
  getCurrentUser,
  getFinishedMatches,
  getFriendRequestsReceived,
  getFriendRequestsSent,
  getFriendsForUser,
  getGroupsForUser,
  getMatchById,
  getTeamById,
  getUserByUsername,
  getGlobalRanking,
} from "@/lib/db";
import { buildRanking } from "@/lib/scoring";
import { getStreakForUser, getTeams } from "@/lib/db";
import { getNationalTeamsByCompetition, getFantasyTeamByUserAndCompetition } from "@/lib/fantasy-db";
import { computeUserAchievements } from "@/lib/achievements";
import { PublicAchievementsDisplay } from "@/components/AchievementsGrid";
import { acceptFriendRequestAction } from "../../profile/actions";
import AddFriendForm from "@/components/AddFriendForm";

const NATIONAL_TEAM_COMPETITION_ID = "world_cup_2026";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const user = await getUserByUsername(username);
  if (!user) notFound();

  const currentUser = await getCurrentUser();
  const [friends, groups, bets, finishedMatches, teams, nationalTeams, streak, receivedRequests, sentRequests, globalRanking, fantasyTeam] = await Promise.all([
    getFriendsForUser(user.id),
    getGroupsForUser(user.id),
    getBetsForUser(user.id),
    getFinishedMatches(),
    getTeams(),
    getNationalTeamsByCompetition(NATIONAL_TEAM_COMPETITION_ID),
    getStreakForUser(user.id),
    getFriendRequestsReceived(currentUser.id),
    getFriendRequestsSent(currentUser.id),
    getGlobalRanking(),
    getFantasyTeamByUserAndCompetition(user.id, NATIONAL_TEAM_COMPETITION_ID),
  ]);

  const profileRanking = buildRanking([user], bets, finishedMatches)[0];
  const totalPoints = profileRanking?.totalPoints ?? 0;
  const accuracy = profileRanking?.accuracy ?? 0;
  const correctBets = profileRanking?.correctBets ?? 0;
  const exactBets = profileRanking?.exactBets ?? 0;
  const totalBets = profileRanking?.totalBets ?? 0;

  // Calcular logros del usuario
  const achievements = computeUserAchievements({
    userId: user.id,
    streak,
    bets,
    matches: finishedMatches,
    friendsCount: friends.length,
    groupsCount: groups.length,
    globalRanking,
    fantasyTeam: fantasyTeam ?? null,
  });

  const recentBets = bets
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const supportedTeamIds = user.supportedTeamIds ?? [];
  const supportedTeams = teams.filter((team) => supportedTeamIds.includes(team.id));
  const supportedNationalTeam = nationalTeams.find((team) => team.id === user.supportedNationalTeamId);
  const isMe = currentUser.id === user.id;
  const isFriend = (currentUser.friendIds ?? []).includes(user.id);
  const hasIncomingRequestFromThisUser = receivedRequests.some((request) => request.id === user.id);
  const hasOutgoingRequestToThisUser = sentRequests.some((request) => request.id === user.id);

  return (
    <div className="flex flex-col gap-8">
      <Card className="overflow-hidden border-[var(--border)] bg-[var(--surface)]">
        <div className="bg-gradient-to-r from-[var(--brand)] via-cyan-500 to-emerald-400 px-6 py-8 text-white sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <ProfileAvatar avatarUrl={user.avatarUrl} displayName={user.displayName} />
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.24em] text-white/75">Perfil público</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight">{user.displayName}</h1>
              <p className="text-sm text-white/85">@{user.username}</p>
              <p className="mt-1 text-sm text-white/80">
                {isMe ? "Este eres tú" : isFriend ? "Ya sois amigos" : "Todavía no sois amigos"}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {isMe ? (
                  <Link href="/profile" className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur hover:bg-white/20">
                    Ir a mi perfil privado
                  </Link>
                ) : isFriend ? (
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                    Sois amigos
                  </span>
                ) : hasIncomingRequestFromThisUser ? (
                  <form action={acceptFriendRequestAction}>
                    <input type="hidden" name="friendUsername" value={user.username} />
                    <input type="hidden" name="redirectTo" value={`/users/${user.username}`} />
                    <button
                      type="submit"
                      className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--brand-strong)] shadow-sm transition hover:bg-white/90"
                    >
                      Aceptar solicitud
                    </button>
                  </form>
                ) : hasOutgoingRequestToThisUser ? (
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                    Solicitud enviada
                  </span>
                ) : (
                  <AddFriendForm
                    variant="inline"
                    friendUsername={user.username}
                    redirectTo={`/users/${user.username}`}
                  />
                )}

                {supportedNationalTeam ? (
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                    Selección: {supportedNationalTeam.name}
                  </span>
                ) : null}

                {supportedTeams.length > 0 ? (
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                    {supportedTeams.length} {supportedTeams.length === 1 ? "equipo favorito" : "equipos favoritos"}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-t border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Puntos totales" value={totalPoints} accent />
          <Stat label="Aciertos" value={`${correctBets}/${totalBets}`} />
          <Stat label="Exactos" value={exactBets} />
          <Stat label="Precisión" value={`${accuracy}%`} subtitle={`Racha actual: ${streak.current} · Mejor: ${streak.best}`} />
        </div>
      </Card>

      <section>
        <SectionTitle title="Logros" subtitle="Recompensas desbloqueadas" />
        <Card className="p-6">
          <PublicAchievementsDisplay achievements={achievements} />
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <SectionTitle title="Sus ligas" subtitle="Competiciones en las que participa" />
          {groups.length === 0 ? (
            <EmptyState title="Todavía no participa en ninguna liga" description="Cuando se una a más grupos aparecerán aquí." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {groups.map((group) => (
                <Link key={group.id} href={`/groups/${group.id}`}>
                  <Card className="p-4 transition-shadow hover:shadow-md">
                    <p className="text-xs text-[var(--muted)]">{group.memberIds.length} miembros</p>
                    <p className="font-semibold">{group.name}</p>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <SectionTitle title="Amigos" subtitle="Personas con las que comparte porras" />
          {friends.length === 0 ? (
            <EmptyState title="Aún no tiene amigos" description="Añádelo para compararos en el ranking." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {friends.map((friend) => (
                <Link key={friend.id} href={`/users/${friend.username}`} className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-3 transition-shadow hover:shadow-sm">
                  <div className="flex items-center gap-3">
                    <ProfileAvatar
                      avatarUrl={friend.avatarUrl}
                      displayName={friend.displayName}
                      size="sm"
                      zoomable={false}
                    />
                    <div>
                      <p className="font-medium">{friend.displayName}</p>
                      <p className="text-xs text-[var(--muted)]">@{friend.username}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </section>

      <section>
        <SectionTitle title="Porras recientes" subtitle="Últimas apuestas que ha hecho" />
        {recentBets.length === 0 ? (
          <EmptyState title="Aún no ha hecho ninguna porra" description="Cuando apueste en un partido, aparecerá aquí." />
        ) : (
          <ul className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            {await Promise.all(
              recentBets.map(async (bet, index) => {
                const match = await getMatchById(bet.matchId);
                if (!match) return null;
                const [home, away] = await Promise.all([
                  getTeamById(match.homeTeamId),
                  getTeamById(match.awayTeamId),
                ]);
                return (
                  <li
                    key={bet.id}
                    className={
                      "flex items-center justify-between gap-3 px-4 py-3 text-sm " +
                      (index !== 0 ? "border-t border-[var(--border)]" : "")
                    }
                  >
                    <Link href={`/matches/${match.id}`} className="flex-1 hover:underline">
                      <p className="font-medium">
                        {home?.shortName} vs {away?.shortName}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" }).format(new Date(match.kickoffAt))}
                      </p>
                    </Link>
                    <Badge tone={bet.status === "WON" ? "brand" : bet.status === "LOST" ? "danger" : "warning"}>
                      Predicción: {bet.prediction.outcome} · {bet.prediction.homeGoals}-{bet.prediction.awayGoals}
                      {bet.status === "WON" && ` · +${bet.points}`}
                    </Badge>
                  </li>
                );
              }),
            )}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  subtitle,
  accent,
}: {
  label: string;
  value: number | string;
  subtitle?: string;
  accent?: boolean;
}) {
  return (
    <Card
      className={
        "px-4 py-3 " +
        (accent ? "bg-gradient-to-br from-[var(--brand)] to-emerald-400 text-white" : "")
      }
    >
      <p className={"text-xs uppercase tracking-wide " + (accent ? "text-white/80" : "text-[var(--muted)]")}>
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {subtitle && (
        <p className={"text-xs " + (accent ? "text-white/80" : "text-[var(--muted)]")}>
          {subtitle}
        </p>
      )}
    </Card>
  );
}