import Link from "next/link";
import {
  getBetsForUser,
  getCurrentUser,
  getGroupsForUser,
  getMatchById,
  getStreakForUser,
  getTeamById,
} from "@/lib/db";
import { Badge, Card, SectionTitle } from "@/components/ui";
import { formatKickoff } from "@/lib/utils";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  const [streak, bets, groups] = await Promise.all([
    getStreakForUser(user.id),
    getBetsForUser(user.id),
    getGroupsForUser(user.id),
  ]);

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

  return (
    <div className="flex flex-col gap-8">
      <Card className="flex flex-col items-center gap-3 p-6 text-center sm:flex-row sm:text-left">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-[var(--brand)] text-2xl font-bold text-white">
          {user.displayName.charAt(0)}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">{user.displayName}</h1>
          <p className="text-sm text-[var(--muted)]">@{user.username}</p>
        </div>
      </Card>

      <section className="grid gap-3 sm:grid-cols-4">
        <Stat label="Puntos totales" value={totalPoints} accent />
        <Stat label="Aciertos" value={`${wonBets.length}/${resolvedBets.length}`} />
        <Stat label="Precisión" value={`${accuracy}%`} />
        <Stat label="Racha actual" value={streak.current} subtitle={`Mejor: ${streak.best}`} />
      </section>

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
                      Predicción: {bet.prediction}
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
