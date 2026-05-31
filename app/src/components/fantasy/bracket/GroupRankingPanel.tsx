"use client";

import type { BracketTeamInfo } from "@/types/bracket-prediction";
import type { GroupStandings } from "@/types/bracket-prediction";
import { TeamCrestButton } from "@/components/fantasy/bracket/TeamCrestButton";
import { clsx } from "@/lib/utils";

interface GroupRankingPanelProps {
  group: string;
  teams: BracketTeamInfo[];
  order: string[];
  onChange: (order: string[]) => void;
  disabled?: boolean;
}

const POSITION_LABELS = ["1º", "2º", "3º", "4º"];

export function GroupRankingPanel({
  group,
  teams,
  order,
  onChange,
  disabled = false,
}: GroupRankingPanelProps) {
  const isComplete = order.length === 4;

  function handleTeamClick(teamId: string) {
    if (disabled) return;
    const idx = order.indexOf(teamId);
    if (idx >= 0) {
      onChange(order.filter((id) => id !== teamId));
      return;
    }
    if (order.length >= 4) return;
    onChange([...order, teamId]);
  }

  function positionBadge(teamId: string): string | undefined {
    const idx = order.indexOf(teamId);
    return idx >= 0 ? POSITION_LABELS[idx] : undefined;
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">Grupo {group}</h3>
        <span
          className={clsx(
            "text-xs font-medium",
            isComplete ? "text-emerald-600" : "text-[var(--muted)]",
          )}
        >
          {isComplete ? "Completo" : `${order.length}/4`}
        </span>
      </div>

      <p className="mb-3 text-xs text-[var(--muted)]">
        Pulsa en orden: 1º, 2º, 3º y 4º.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {teams.map((team) => (
          <div key={team.id} className="flex flex-col items-center gap-1.5">
            <TeamCrestButton
              teamId={team.id}
              teamName={team.name}
              crestUrl={team.crestUrl}
              badge={positionBadge(team.id)}
              selected={order.includes(team.id)}
              disabled={disabled || (!order.includes(team.id) && order.length >= 4)}
              size="md"
              onClick={() => handleTeamClick(team.id)}
            />
            <span className="line-clamp-2 max-w-full text-center text-[10px] leading-tight text-[var(--muted)]">
              {team.name}
            </span>
          </div>
        ))}
      </div>

      {order.length > 0 && !disabled && (
        <button
          type="button"
          onClick={() => onChange([])}
          className="mt-3 w-full text-center text-xs text-[var(--muted)] hover:text-[var(--fg)]"
        >
          Reiniciar grupo
        </button>
      )}
    </div>
  );
}

interface GroupRankingGridProps {
  groups: Record<string, BracketTeamInfo[]>;
  standings: GroupStandings;
  onStandingsChange: (standings: GroupStandings) => void;
  disabled?: boolean;
}

export function GroupRankingGrid({
  groups,
  standings,
  onStandingsChange,
  disabled = false,
}: GroupRankingGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Object.entries(groups)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([group, teams]) => (
          <GroupRankingPanel
            key={group}
            group={group}
            teams={teams}
            order={standings[group] ?? []}
            onChange={(order) =>
              onStandingsChange({ ...standings, [group]: order as [string, string, string, string] })
            }
            disabled={disabled}
          />
        ))}
    </div>
  );
}
