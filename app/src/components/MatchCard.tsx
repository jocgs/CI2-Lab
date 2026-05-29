import Link from "next/link";
import Image from "next/image";
import type { Bet, Match, Team } from "@/types/domain";
import { getTeamById, getCompetitionById } from "@/lib/db";
import { Badge } from "@/components/ui";
import { formatKickoff, type FormEntry } from "@/lib/utils";
import { formatBetPrediction } from "@/lib/scoring";

/** Convierte un código ISO 3166-1 alpha-2 en emoji de bandera. */
function flagEmoji(countryCode: string): string {
  return countryCode
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

export async function MatchCard({
  match,
  userBet,
  homeForm,
  awayForm,
}: {
  match: Match;
  userBet?: Bet;
  homeForm?: FormEntry[];
  awayForm?: FormEntry[];
}) {
  const [home, away, competition] = await Promise.all([
    getTeamById(match.homeTeamId),
    getTeamById(match.awayTeamId),
    getCompetitionById(match.competitionId),
  ]);

  return (
    <Link
      href={`/matches/${match.id}`}
      className="block rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-3 flex items-center justify-between text-xs text-[var(--muted)]">
        <span>{competition?.shortName ?? "—"}</span>
        <StatusBadge match={match} />
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <TeamCell team={home} align="right" form={homeForm} />
        <ScoreCell match={match} />
        <TeamCell team={away} align="left" form={awayForm} />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-[var(--muted)]">
        <span>{formatKickoff(match.kickoffAt)}</span>
        {userBet ? (
          <Badge tone={betTone(userBet)}>
            Tu porra: {formatBetPrediction(userBet.prediction)}
            {userBet.status === "WON" && ` · +${userBet.points}`}
            {userBet.status === "LOST" && " · 0"}
          </Badge>
        ) : match.status === "SCHEDULED" ? (
          <Badge tone="brand">Pendiente de tu porra</Badge>
        ) : null}
      </div>
    </Link>
  );
}

function TeamCrest({ team }: { team: Team }) {
  if (team.logoUrl) {
    return (
      <div className="relative h-10 w-10 flex-shrink-0">
        <Image
          src={team.logoUrl}
          alt={team.shortName}
          fill
          className="object-contain drop-shadow-sm"
          unoptimized
        />
      </div>
    );
  }
  return (
    <span className="text-3xl leading-none" title={team.name}>
      {flagEmoji(team.country)}
    </span>
  );
}

function TeamCell({ team, align, form }: { team: Team | undefined; align: "left" | "right"; form?: FormEntry[] }) {
  const isRight = align === "right";

  if (!team) {
    return (
      <div className={`flex flex-col items-${isRight ? "end" : "start"} gap-1`}>
        <div className="h-10 w-10 rounded-full bg-[var(--background)]" />
        <span className="text-sm font-medium text-[var(--muted)]">?</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-1.5 ${isRight ? "items-end text-right" : "items-start text-left"}`}>
      <TeamCrest team={team} />
      <span className="text-sm font-medium leading-tight">{team.name}</span>
      {form && form.length > 0 && (
        <div className={`flex gap-0.5 ${isRight ? "flex-row-reverse" : "flex-row"}`}>
          {form.map((entry, i) => (
            <span
              key={i}
              title={entry === "W" ? "Victoria" : entry === "D" ? "Empate" : "Derrota"}
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                entry === "W" ? "bg-green-500" : entry === "D" ? "bg-amber-500" : "bg-red-500"
              }`}
            >
              {entry === "W" ? "V" : entry === "D" ? "E" : "D"}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ScoreCell({ match }: { match: Match }) {
  if (match.status === "FINISHED" && match.result) {
    return (
      <div className="rounded-lg bg-[var(--background)] px-3 py-1 text-base font-semibold tabular-nums">
        {match.result.homeGoals} – {match.result.awayGoals}
      </div>
    );
  }
  if (match.status === "LIVE") {
    return (
      <div className="rounded-lg bg-red-100 px-3 py-1 text-xs font-semibold uppercase text-red-700">
        En juego
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-[var(--border)] px-3 py-1 text-sm text-[var(--muted)]">
      vs
    </div>
  );
}

function StatusBadge({ match }: { match: Match }) {
  switch (match.status) {
    case "FINISHED":
      return <Badge tone="muted">Finalizado</Badge>;
    case "LIVE":
      return <Badge tone="danger">En directo</Badge>;
    default:
      return <Badge tone="brand">Próximo</Badge>;
  }
}

function betTone(bet: Bet): "brand" | "danger" | "warning" {
  if (bet.status === "WON") return "brand";
  if (bet.status === "LOST") return "danger";
  return "warning";
}
