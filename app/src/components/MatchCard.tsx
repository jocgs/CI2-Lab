import Link from "next/link";
import Image from "next/image";
import type { Bet, Match, Team } from "@/types/domain";
import { getTeamById, getCompetitionById } from "@/lib/db";
import { Badge } from "@/components/ui";
import { formatKickoff } from "@/lib/utils";

const OUTCOME_LABEL: Record<string, string> = { "1": "1", X: "X", "2": "2" };

/** Convierte un código ISO 3166-1 alpha-2 en emoji de bandera. */
function flagEmoji(countryCode: string): string {
  return countryCode
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

export async function MatchCard({ match, userBet }: { match: Match; userBet?: Bet }) {
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
        <TeamCell team={home} align="right" />
        <ScoreCell match={match} />
        <TeamCell team={away} align="left" />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-[var(--muted)]">
        <span>{formatKickoff(match.kickoffAt)}</span>
        {userBet ? (
          <Badge tone={betTone(userBet)}>
            Tu porra: {OUTCOME_LABEL[userBet.prediction]}
            {userBet.status === "WON" && " · +3"}
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

function TeamCell({ team, align }: { team: Team | undefined; align: "left" | "right" }) {
  if (!team) {
    return (
      <div className={`flex flex-col items-${align === "right" ? "end" : "start"} gap-1`}>
        <div className="h-10 w-10 rounded-full bg-[var(--background)]" />
        <span className="text-sm font-medium text-[var(--muted)]">?</span>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col gap-1.5 ${align === "right" ? "items-end text-right" : "items-start text-left"}`}
    >
      <TeamCrest team={team} />
      <span className="text-sm font-medium leading-tight">{team.name}</span>
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
