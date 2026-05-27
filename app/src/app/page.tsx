import Link from "next/link";
import {
  getCurrentUser,
  getBetForUserAndMatch,
  getBetsForUser,
  getFinishedMatches,
  getGroupsForUser,
  getStreakForUser,
  getUpcomingMatches,
} from "@/lib/db";
import { MatchCard } from "@/components/MatchCard";
import { Card, SectionTitle } from "@/components/ui";

export default async function HomePage() {
  const user = await getCurrentUser();
  const [streak, userBets, upcoming, finished, groups] = await Promise.all([
    getStreakForUser(user.id),
    getBetsForUser(user.id),
    getUpcomingMatches(),
    getFinishedMatches(),
    getGroupsForUser(user.id),
  ]);

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
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--brand-strong)] via-[var(--brand)] to-emerald-400 p-6 text-white shadow-md sm:p-8">
        {/* Balón decorativo */}
        <span
          aria-hidden
          className="hero-ball pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[7rem] opacity-30 sm:right-8 sm:text-[9rem]"
        >
          ⚽
        </span>

        {/* Contenido — max-w para que no solape con el balón */}
        <div className="relative max-w-[calc(100%-7rem)] sm:max-w-[calc(100%-9rem)]">
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

          <div className="mt-5 grid grid-cols-3 gap-3 sm:max-w-sm">
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
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/15 px-3 py-2 backdrop-blur">
      <p className="text-xs uppercase tracking-wide text-white/80">{label}</p>
      <p className="text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
