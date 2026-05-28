import Link from "next/link";
import Image from "next/image";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import {
  getBetsForUser,
  getFriendRequestsReceived,
  getFriendRequestsSent,
  getFriendsForUser,
  getCurrentUser,
  getGlobalRanking,
  getGroupsForUser,
  getMatchById,
  getMatches,
  getStreakForUser,
  getTeams,
  getTeamById,
} from "@/lib/db";
import { computeUserAchievements, FANTASY_COMPETITION_ID } from "@/lib/achievements";
import { getFantasyTeamByUserAndCompetition } from "@/lib/fantasy-db";
import { AchievementsGrid } from "@/components/AchievementsGrid";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import { formatBetPrediction } from "@/lib/scoring";
import { Badge, Card, EmptyState, SectionTitle } from "@/components/ui";
import { formatKickoff } from "@/lib/utils";
import { acceptFriendRequestAction } from "./actions";
import AddFriendForm from "@/components/AddFriendForm";
import { getNationalTeamsByCompetition } from "@/lib/fantasy-db";

const NATIONAL_TEAM_COMPETITION_ID = "world_cup_2026";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  const [streak, bets, groups, friends, receivedRequests, sentRequests, teams, nationalTeams, matches, globalRanking, fantasyTeam] =
    await Promise.all([
      getStreakForUser(user.id),
      getBetsForUser(user.id),
      getGroupsForUser(user.id),
      getFriendsForUser(user.id),
      getFriendRequestsReceived(user.id),
      getFriendRequestsSent(user.id),
      getTeams(),
      getNationalTeamsByCompetition(NATIONAL_TEAM_COMPETITION_ID),
      getMatches(),
      getGlobalRanking(),
      getFantasyTeamByUserAndCompetition(user.id, FANTASY_COMPETITION_ID),
    ]);

  const achievements = computeUserAchievements({
    userId: user.id,
    streak,
    bets,
    matches,
    friendsCount: friends.length,
    groupsCount: groups.length,
    globalRanking,
    fantasyTeam,
  });

  const resolvedBets = bets.filter((b) => b.status !== "PENDING");
  const wonBets = resolvedBets.filter((b) => b.status === "WON");
  const totalPoints = wonBets.reduce((sum, b) => sum + b.points, 0);
  const accuracy =
    resolvedBets.length === 0
      ? 0
      : Math.round((wonBets.length / resolvedBets.length) * 100);

  const recentBets = bets
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  const supportedTeamIds = user.supportedTeamIds ?? [];
  const supportedTeams = teams.filter((team) => supportedTeamIds.includes(team.id));
  const supportedNationalTeam = nationalTeams.find((team) => team.id === user.supportedNationalTeamId);

  return (
    <div className="flex flex-col gap-8">
      <Card className="overflow-hidden border-[var(--border)] bg-[var(--surface)]">
        <div className="bg-gradient-to-r from-[var(--brand)] via-cyan-500 to-emerald-400 px-6 py-8 text-white sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <ProfileAvatar avatarUrl={user.avatarUrl} displayName={user.displayName} />
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.24em] text-white/75">Perfil</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight">{user.displayName}</h1>
              <p className="text-sm text-white/85">@{user.username}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                  {friends.length} amigos
                </span>
                <div className="flex items-center gap-2">
                  {supportedNationalTeam ? (
                    <SupportIconPill label={supportedNationalTeam.name}>
                      <NationalTeamBadge team={supportedNationalTeam} />
                    </SupportIconPill>
                  ) : (
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                      Sin selección
                    </span>
                  )}

                  {supportedTeams.length > 0 ? (
                    <div className="flex items-center gap-2">
                      {supportedTeams.map((team) => (
                        <SupportIconPill key={team.id} label={team.name}>
                          <TeamBadge team={team} />
                        </SupportIconPill>
                      ))}
                    </div>
                  ) : (
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                      Sin equipos favoritos
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-3 border-t border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-4">
          <Stat label="Puntos totales" value={totalPoints} accent />
          <Stat label="Aciertos" value={`${wonBets.length}/${resolvedBets.length}`} />
          <Stat label="Precisión" value={`${accuracy}%`} />
          <Stat label="Racha actual" value={streak.current} subtitle={`Mejor: ${streak.best}`} />
        </div>
      </Card>

      <Card className="p-6">
        <SectionTitle
          title="Logros"
          subtitle="Desbloquea medallas por rachas, amigos, grupos, ranking y Fantasy"
        />
        <div className="mt-5">
          <AchievementsGrid achievements={achievements} />
        </div>
      </Card>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <SectionTitle
            title="Editar perfil"
            subtitle="Sube una foto, elige una selección y marca tus equipos favoritos"
          />
          <ProfileEditForm
            supportedNationalTeamId={user.supportedNationalTeamId ?? null}
            supportedTeamIds={supportedTeamIds}
            teams={teams}
            nationalTeams={nationalTeams}
          />
        </Card>

        <Card className="p-6">
          <SectionTitle title="Amigos" subtitle="Añade amigos por su nombre de usuario" />
          <AddFriendForm redirectTo="/profile" />

          <div className="mt-5">
            <p className="mb-3 text-xs uppercase tracking-wide text-[var(--muted)]">Tus amigos</p>
            {friends.length === 0 ? (
              <EmptyState
                title="Aún no tienes amigos"
                description="Añade a alguien por su usuario para empezar a compararte con él."
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {friends.map((friend) => (
                  <Link
                    key={friend.id}
                    href={`/users/${friend.username}`}
                    className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-3 transition-shadow hover:shadow-sm"
                  >
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
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Card>
      </section>

      <Card className="p-6">
        <SectionTitle
          title="Solicitudes de amistad"
          subtitle="Acepta las recibidas y revisa el estado de las que has enviado"
        />

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs uppercase tracking-wide text-[var(--muted)]">Recibidas</p>
            {receivedRequests.length === 0 ? (
              <EmptyState title="No tienes solicitudes recibidas" description="Aquí aparecerán cuando alguien quiera añadirte." />
            ) : (
              <div className="grid gap-3">
                {receivedRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-3">
                    <Link href={`/users/${request.username}`} className="flex items-center gap-3">
                      <ProfileAvatar avatarUrl={request.avatarUrl} displayName={request.displayName} size="sm" zoomable={false} />
                      <div>
                        <p className="font-medium">{request.displayName}</p>
                        <p className="text-xs text-[var(--muted)]">@{request.username}</p>
                      </div>
                    </Link>
                    <form action={acceptFriendRequestAction}>
                      <input type="hidden" name="friendUsername" value={request.username} />
                      <input type="hidden" name="redirectTo" value="/profile" />
                      <button
                        type="submit"
                        className="rounded-full bg-[var(--brand)] px-3 py-1 text-xs font-semibold text-white hover:bg-[var(--brand-strong)]"
                      >
                        Aceptar
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="mb-3 text-xs uppercase tracking-wide text-[var(--muted)]">Enviadas</p>
            {sentRequests.length === 0 ? (
              <EmptyState title="No has enviado solicitudes" description="Las solicitudes que mandes aparecerán aquí en estado pendiente." />
            ) : (
              <div className="grid gap-3">
                {sentRequests.map((request) => (
                  <Link key={request.id} href={`/users/${request.username}`} className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-3 transition-shadow hover:shadow-sm">
                    <div className="flex items-center gap-3">
                      <ProfileAvatar avatarUrl={request.avatarUrl} displayName={request.displayName} size="sm" zoomable={false} />
                      <div>
                        <p className="font-medium">{request.displayName}</p>
                        <p className="text-xs text-[var(--muted)]">@{request.username}</p>
                      </div>
                    </div>
                    <Badge tone="warning">Pendiente</Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      <section>
        <SectionTitle
          title="Tus porras recientes"
          subtitle="Últimas predicciones, ordenadas por fecha"
        />
        {recentBets.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Aún no has hecho ninguna porra.</p>
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
                      <p className="text-xs text-[var(--muted)]">{formatKickoff(match.kickoffAt)}</p>
                    </Link>
                    <Badge
                      tone={
                        bet.status === "WON"
                          ? "brand"
                          : bet.status === "LOST"
                            ? "danger"
                            : "warning"
                      }
                    >
                      Predicción: {formatBetPrediction(bet.prediction)}
                      {bet.status === "WON" && ` · +${bet.points}`}
                    </Badge>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </section>

      <section>
        <SectionTitle title="Tus grupos" />
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
      <p
        className={
          "text-xs uppercase tracking-wide " +
          (accent ? "text-white/80" : "text-[var(--muted)]")
        }
      >
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

function TeamBadge({ team }: { team: { name: string; shortName: string; logoUrl?: string } }) {
  if (team.logoUrl) {
    return (
      <span className="grid h-8 w-8 place-items-center rounded-full bg-white/90 p-1 shadow-sm">
        <Image
          src={team.logoUrl}
          alt={team.name}
          width={24}
          height={24}
          className="h-6 w-6 object-contain"
          unoptimized
        />
      </span>
    );
  }

  return (
    <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-[10px] font-semibold uppercase">
      {team.shortName}
    </span>
  );
}

function NationalTeamBadge({
  team,
}: {
  team: { name: string; flagUrl?: string; logoUrl?: string };
}) {
  if (team.logoUrl) {
    return (
      <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 p-1">
        <img src={team.logoUrl} alt={team.name} className="h-6 w-6 object-contain" />
      </span>
    );
  }

  return (
    <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-lg leading-none">
      {team.flagUrl ?? "🏳️"}
    </span>
  );
}

function SupportIconPill({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span title={label} className="inline-flex items-center rounded-full bg-white/10 p-1 backdrop-blur">
      {children}
    </span>
  );
}
