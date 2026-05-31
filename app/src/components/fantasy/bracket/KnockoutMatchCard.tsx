"use client";

import type { ResolvedBracketMatch } from "@/types/bracket-prediction";
import { TeamCrestButton } from "@/components/fantasy/bracket/TeamCrestButton";
import { BRACKET_ROUND_LABELS } from "@/types/bracket-prediction";

interface KnockoutMatchCardProps {
  match: ResolvedBracketMatch;
  winnerId: string | null;
  onPickWinner: (teamId: string) => void;
  disabled?: boolean;
}

export function KnockoutMatchCard({
  match,
  winnerId,
  onPickWinner,
  disabled = false,
}: KnockoutMatchCardProps) {
  const canPick = Boolean(match.home && match.away && !disabled);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
      <p className="mb-2 text-center text-[10px] font-medium text-[var(--muted)]">
        {match.label}
      </p>
      <div className="flex items-center justify-center gap-3">
        {match.home ? (
          <div className="flex flex-col items-center gap-1">
            <TeamCrestButton
              teamId={match.home.id}
              teamName={match.home.name}
              crestUrl={match.home.crestUrl}
              selected={winnerId === match.home.id}
              dimmed={Boolean(winnerId && winnerId !== match.home.id)}
              disabled={!canPick}
              onClick={() => onPickWinner(match.home!.id)}
            />
            <span className="max-w-[72px] truncate text-center text-[9px]">
              {match.home.name}
            </span>
          </div>
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-[var(--border)] text-xs text-[var(--muted)]">
            ?
          </div>
        )}

        <span className="text-xs font-semibold text-[var(--muted)]">vs</span>

        {match.away ? (
          <div className="flex flex-col items-center gap-1">
            <TeamCrestButton
              teamId={match.away.id}
              teamName={match.away.name}
              crestUrl={match.away.crestUrl}
              selected={winnerId === match.away.id}
              dimmed={Boolean(winnerId && winnerId !== match.away.id)}
              disabled={!canPick}
              onClick={() => onPickWinner(match.away!.id)}
            />
            <span className="max-w-[72px] truncate text-center text-[9px]">
              {match.away.name}
            </span>
          </div>
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-[var(--border)] text-xs text-[var(--muted)]">
            ?
          </div>
        )}
      </div>
    </div>
  );
}

interface KnockoutRoundSectionProps {
  round: ResolvedBracketMatch["round"];
  matches: ResolvedBracketMatch[];
  winners: Record<string, string>;
  onPickWinner: (matchId: string, teamId: string) => void;
  disabled?: boolean;
}

export function KnockoutRoundSection({
  round,
  matches,
  winners,
  onPickWinner,
  disabled = false,
}: KnockoutRoundSectionProps) {
  const roundMatches = matches.filter((m) => m.round === round);
  if (roundMatches.length === 0) return null;

  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold">{BRACKET_ROUND_LABELS[round]}</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {roundMatches.map((match) => (
          <KnockoutMatchCard
            key={match.id}
            match={match}
            winnerId={winners[match.id] ?? null}
            onPickWinner={(teamId) => onPickWinner(match.id, teamId)}
            disabled={disabled}
          />
        ))}
      </div>
    </section>
  );
}
