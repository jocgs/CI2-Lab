import Link from "next/link";
import Image from "next/image";
import { computeMood, moodToImage } from "@/lib/mood";
import {
  getCurrentUser,
  getBetForUserAndMatch,
  getBetsForUser,
  getFinishedMatches,
  getGroupsForUser,
  getMatchById,
  getStreakForUser,
  getTeamById,
  getUpcomingMatches,
} from "@/lib/db";
import { MatchCard } from "@/components/MatchCard";
import { Badge, Card, SectionTitle } from "@/components/ui";
import { formatBetPrediction } from "@/lib/scoring";
import { formatKickoff } from "@/lib/utils";

export default async function HomePage() {
  const user = await getCurrentUser();
  const [streak, userBets, upcoming, finished, groups] = await Promise.all([
    getStreakForUser(user.id),
    getBetsForUser(user.id),
    getUpcomingMatches(),
    getFinishedMatches(),
    getGroupsForUser(user.id),
  ]);

  const recentBets = userBets
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const recent = finished.slice(-3).reverse();

  const pendingBetsCount = await Promise.all(
    upcoming.map((m) => getBetForUserAndMatch(user.id, m.id))
  ).then((bets) => bets.filter((b) => !b).length);

  const totalPoints = userBets
    .filter((b) => b.status === "WON")
    .reduce((acc, b) => acc + b.points, 0);

  const upcomingWithBets = await Promise.all(
    upcoming.slice(0, 3).map(async (match) => ({
      match,
      userBet: await getBetForUserAndMatch(user.id, match.id),
    }))
  );

  const recentWithBets = await Promise.all(
    recent.map(async (match) => ({
      match,
      userBet: await getBetForUserAndMatch(user.id, match.id),
    }))
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl shadow-md p-6 text-white sm:p-8">
        {/* Vídeo de fondo */}
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&h=500&auto=format&fit=crop&q=80"
          className="absolute inset-0 h-full w-full object-cover"
          src="https://videos.pexels.com/video-files/2657257/2657257-uhd_2560_1440_24fps.mp4"
        />
        {/* Overlay con gradiente de marca */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-strong)]/90 via-[var(--brand)]/80 to-[var(--brand-soft)]/90" />

        {/* Balón decorativo — humor según historial de porras */}
        <div
          aria-hidden
          className="hero-ball pointer-events-none absolute right-1 top-3 sm:right-6 sm:top-1/2 sm:-translate-y-1/2"
        >
          <Image
            src={moodToImage(computeMood(userBets))}
            alt=""
            width={150}
            height={150}
            className="h-24 w-24 object-contain opacity-85 sm:h-36 sm:w-36"
            priority
            unoptimized
          />
        </div>

        {/* Texto — deja hueco al balón; las stats van a ancho completo en móvil */}
        <div className="relative">
          <div className="pr-[6.5rem] sm:max-w-[calc(100%-9rem)] sm:pr-0">
            <p className="text-sm font-medium opacity-80">¡Hola, {user.displayName}!</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              {pendingBetsCount > 0
                ? <>{pendingBetsCount} {pendingBetsCount === 1 ? "nueva porra" : "nuevas porras"} disponible{pendingBetsCount === 1 ? "" : "s"}</>
                : "¡Al día con todas tus porras!"}
            </h1>
            <p className="mt-1 text-sm text-white/90">
              {streak.current > 0
                ? `Racha en marcha: ${streak.current} acierto${streak.current === 1 ? "" : "s"} seguido${streak.current === 1 ? "" : "s"}. ¡Sigue así!`
                : "No te quedes sin apostar a los próximos partidos."}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 sm:max-w-sm sm:gap-3">
            <Stat label="Puntos" value={totalPoints} />
            <Stat label="Racha" value={streak.current} />
            <Stat label="Grupos" value={groups.length} />
          </div>
        </div>
      </section>

      {/* Próximos partidos */}
      <section>
        <SectionTitle
          title="Próximos partidos"
          subtitle="Haz tu porra antes del kickoff"
          action={
            <Link
              href="/matches"
              className="text-sm font-medium text-[var(--brand-strong)] hover:underline"
            >
              Ver todos →
            </Link>
          }
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {upcomingWithBets.map(({ match, userBet }) => (
            <MatchCard key={match.id} match={match} userBet={userBet} />
          ))}
        </div>
      </section>

      {/* Últimos resultados */}
      <section>
        <SectionTitle title="Últimos resultados" subtitle="Cómo te fue en los últimos partidos" />
        <div className="grid gap-3 sm:grid-cols-2">
          {recentWithBets.map(({ match, userBet }) => (
            <MatchCard key={match.id} match={match} userBet={userBet} />
          ))}
        </div>
      </section>

      {/* Mis grupos */}
      <section>
        <SectionTitle
          title="Mis grupos"
          subtitle="Tu ranking entre amigos"
          action={
            <Link
              href="/groups"
              className="text-sm font-medium text-[var(--brand-strong)] hover:underline"
            >
              Gestionar →
            </Link>
          }
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {groups.map((group) => (
            <Link key={group.id} href={`/groups/${group.id}`}>
              <Card className="p-4 transition-shadow hover:shadow-md">
                <p className="text-sm text-[var(--muted)]">{group.memberIds.length} miembros</p>
                <p className="text-base font-semibold">{group.name}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Porras recientes */}
      {recentBets.length > 0 && (
        <section>
          <SectionTitle
            title="Tus porras recientes"
            subtitle="Últimas predicciones, ordenadas por fecha"
            action={
              <Link
                href="/profile"
                className="text-sm font-medium text-[var(--brand-strong)] hover:underline"
              >
                Ver perfil →
              </Link>
            }
          />
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
        </section>
      )}
    </div>
  );
}


function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0 rounded-xl bg-white/15 px-2 py-2 text-center backdrop-blur sm:px-3">
      <p className="truncate text-[10px] font-medium uppercase leading-tight text-white/80 sm:text-xs sm:tracking-wide">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums sm:text-xl">{value}</p>
    </div>
  );
}
