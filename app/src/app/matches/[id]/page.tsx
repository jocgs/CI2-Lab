import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getBetForUserAndMatch,
  getBetsForMatch,
  getCompetitionById,
  getCurrentUser,
  getMatchById,
  getTeamById,
  getUserById,
} from "@/lib/db";
import { Badge, Card } from "@/components/ui";
import { formatKickoff } from "@/lib/utils";
import { placeBetAction } from "./actions";
import type { Outcome, Team } from "@/types/domain";

function flagEmoji(countryCode: string): string {
  return countryCode
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

function TeamCrest({ team, size = 64 }: { team: Team; size?: number }) {
  if (team.logoUrl) {
    return (
      <div className="relative mx-auto" style={{ width: size, height: size }}>
        <Image
          src={team.logoUrl}
          alt={team.shortName}
          fill
          className="object-contain drop-shadow"
          unoptimized
        />
      </div>
    );
  }
  return (
    <span className="block text-center leading-none" style={{ fontSize: size * 0.8 }}>
      {flagEmoji(team.country)}
    </span>
  );
}

const OUTCOME_LABELS: { value: Outcome; label: string; helper: string }[] = [
  { value: "1", label: "1", helper: "Local" },
  { value: "X", label: "X", helper: "Empate" },
  { value: "2", label: "2", helper: "Visitante" },
];

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [match, user] = await Promise.all([
    getMatchById(id),
    getCurrentUser(),
  ]);

  if (!match) notFound();

  const [home, away, competition, userBet, allBets] = await Promise.all([
    getTeamById(match.homeTeamId),
    getTeamById(match.awayTeamId),
    getCompetitionById(match.competitionId),
    getBetForUserAndMatch(user.id, match.id),
    getBetsForMatch(match.id),
  ]);

  const canBet = match.status === "SCHEDULED";

  return (
    <div className="flex flex-col gap-6">
      <Link href="/matches" className="text-sm text-[var(--brand-strong)] hover:underline">
        ← Volver a partidos
      </Link>

      <Card className="p-6">
        <div className="flex items-center justify-between text-xs text-[var(--muted)]">
          <span>
            {competition?.name} · {competition?.season}
          </span>
          <span>{formatKickoff(match.kickoffAt)}</span>
        </div>

        <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            {home && <TeamCrest team={home} size={64} />}
            <p className="text-center text-base font-semibold leading-tight">{home?.name}</p>
            <p className="text-xs text-[var(--muted)]">Local</p>
          </div>
          <div className="rounded-xl bg-[var(--background)] px-5 py-3 text-2xl font-semibold tabular-nums">
            {match.status === "FINISHED" && match.result
              ? `${match.result.homeGoals} – ${match.result.awayGoals}`
              : match.status === "LIVE"
                ? "EN JUEGO"
                : "vs"}
          </div>
          <div className="flex flex-col items-center gap-2">
            {away && <TeamCrest team={away} size={64} />}
            <p className="text-center text-base font-semibold leading-tight">{away?.name}</p>
            <p className="text-xs text-[var(--muted)]">Visitante</p>
          </div>
        </div>

        {match.status === "FINISHED" && match.result && (
          <p className="mt-4 text-center text-sm text-[var(--muted)]">
            Resultado oficial: <strong>{match.result.outcome}</strong>
          </p>
        )}
      </Card>

      {/* Sección de porra */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold">Tu porra</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Elige el resultado: 1 (gana local), X (empate) o 2 (gana visitante).
        </p>

        {!canBet && match.status === "FINISHED" && (
          <div className="mt-4 rounded-xl bg-[var(--background)] p-4">
            {userBet ? (
              <p className="text-sm">
                Apostaste por <strong>{userBet.prediction}</strong> ·{" "}
                {userBet.status === "WON" ? (
                  <Badge tone="brand">¡Acertaste! +{userBet.points} pts</Badge>
                ) : (
                  <Badge tone="danger">Fallo</Badge>
                )}
              </p>
            ) : (
              <p className="text-sm text-[var(--muted)]">No hiciste porra para este partido.</p>
            )}
          </div>
        )}

        {!canBet && match.status === "LIVE" && (
          <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
            El partido ya ha empezado: las porras están cerradas.
            {userBet && (
              <>
                {" "}
                Tu porra: <strong>{userBet.prediction}</strong>
              </>
            )}
          </div>
        )}

        {canBet && (
          <form action={placeBetAction} className="mt-4 grid grid-cols-3 gap-3">
            <input type="hidden" name="matchId" value={match.id} />
            {OUTCOME_LABELS.map(({ value, label, helper }) => {
              const isSelected = userBet?.prediction === value;
              return (
                <button
                  key={value}
                  type="submit"
                  name="prediction"
                  value={value}
                  className={
                    "flex flex-col items-center gap-1 rounded-2xl border px-4 py-4 text-base font-semibold transition-all " +
                    (isSelected
                      ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-strong)] shadow-sm"
                      : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]/40")
                  }
                >
                  <span className="text-2xl">{label}</span>
                  <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                    {helper}
                  </span>
                </button>
              );
            })}
          </form>
        )}

        {canBet && userBet && (
          <p className="mt-3 text-xs text-[var(--muted)]">
            Tu porra actual: <strong>{userBet.prediction}</strong>. Puedes cambiarla hasta el inicio del partido.
          </p>
        )}
      </Card>

      {/* Porras de otros usuarios */}
      {allBets.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold">Porras de la comunidad</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {allBets.length} {allBets.length === 1 ? "persona ha apostado" : "personas han apostado"} en este partido.
          </p>
          <ul className="mt-4 divide-y divide-[var(--border)]">
            {await Promise.all(
              allBets.map(async (bet) => {
                const u = await getUserById(bet.userId);
                return (
                  <li key={bet.id} className="flex items-center justify-between py-2 text-sm">
                    <span>{u?.displayName ?? "Desconocido"}</span>
                    <Badge
                      tone={
                        bet.status === "WON"
                          ? "brand"
                          : bet.status === "LOST"
                            ? "danger"
                            : "muted"
                      }
                    >
                      {bet.prediction}
                    </Badge>
                  </li>
                );
              })
            )}
          </ul>
        </Card>
      )}
    </div>
  );
}
