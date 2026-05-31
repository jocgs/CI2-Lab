"use client";

import { useMemo } from "react";
import type { ReactElement } from "react";
import type { ResolvedBracketMatch } from "@/types/bracket-prediction";
import { BRACKET_ROUND_LABELS } from "@/types/bracket-prediction";
import { NationalTeamCrestImage } from "@/components/fantasy/NationalTeamCrestImage";
import {
  BRACKET_FEED,
  computeBracketLayout,
  R32_BRACKET_ORDER,
} from "@/lib/world-cup-bracket";

const ROW_HEIGHT = 58;
const COL_WIDTH = 168;
const MATCH_HEIGHT = 52;
const CONNECTOR_WIDTH = 44;
const COLUMN_HEADER_HEIGHT = 22;

interface BracketTreeVisualizationProps {
  matches: ResolvedBracketMatch[];
}

const TREE_ROUNDS = [
  "round_of_32",
  "round_of_16",
  "quarter_finals",
  "semi_finals",
  "final",
] as const;

function matchCenterY(layout: Map<string, number>, matchId: string): number {
  return COLUMN_HEADER_HEIGHT + (layout.get(matchId) ?? 0) * ROW_HEIGHT + MATCH_HEIGHT / 2;
}

function columnLeft(colIndex: number): number {
  return colIndex * (COL_WIDTH + CONNECTOR_WIDTH);
}

/** Llaves clásicas: dos horizontales + vertical + enlace al hijo. */
function renderBracketConnector(
  xParentRight: number,
  xChildLeft: number,
  yTop: number,
  yBottom: number,
): ReactElement {
  const xMid = xParentRight + (xChildLeft - xParentRight) / 2;
  const yChild = (yTop + yBottom) / 2;
  const yMin = Math.min(yTop, yBottom);
  const yMax = Math.max(yTop, yBottom);

  return (
    <>
      <path d={`M ${xParentRight} ${yTop} H ${xMid}`} />
      <path d={`M ${xParentRight} ${yBottom} H ${xMid}`} />
      <path d={`M ${xMid} ${yMin} V ${yMax}`} />
      <path d={`M ${xMid} ${yChild} H ${xChildLeft}`} />
    </>
  );
}

function TeamSlot({
  team,
  isWinner,
  isLoser,
}: {
  team: NonNullable<ResolvedBracketMatch["home"]> | null;
  isWinner: boolean;
  isLoser: boolean;
}) {
  if (!team) {
    return (
      <div className="flex h-6 items-center rounded border border-dashed border-[var(--border)] px-2 text-[10px] text-[var(--muted)]">
        —
      </div>
    );
  }

  return (
    <div
      className={`flex h-6 items-center gap-1.5 rounded px-1.5 ${
        isWinner
          ? "bg-[var(--brand-soft)] font-semibold ring-1 ring-[var(--brand)]"
          : isLoser
            ? "opacity-35"
            : "bg-[var(--surface)]"
      }`}
    >
      <NationalTeamCrestImage
        teamId={team.id}
        teamName={team.name}
        src={team.crestUrl}
        imgClassName="h-4 w-4 shrink-0 object-contain"
        fallbackClassName="text-[10px]"
      />
      <span className="truncate text-[10px]">{team.name}</span>
    </div>
  );
}

function MatchBox({ match }: { match: ResolvedBracketMatch }) {
  const winnerId = match.winnerId;
  return (
    <div className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-1.5 shadow-sm">
      <TeamSlot
        team={match.home}
        isWinner={winnerId === match.home?.id}
        isLoser={Boolean(winnerId && winnerId !== match.home?.id)}
      />
      <TeamSlot
        team={match.away}
        isWinner={winnerId === match.away?.id}
        isLoser={Boolean(winnerId && winnerId !== match.away?.id)}
      />
    </div>
  );
}

/** Cuadro escalonado con conectores entre rondas. */
export function BracketTreeVisualization({ matches }: BracketTreeVisualizationProps) {
  const layout = useMemo(() => computeBracketLayout(), []);
  const matchById = useMemo(() => new Map(matches.map((m) => [m.id, m])), [matches]);

  const maxRow = R32_BRACKET_ORDER.length - 1;
  const totalHeight = COLUMN_HEADER_HEIGHT + maxRow * ROW_HEIGHT + MATCH_HEIGHT + 24;
  const thirdMatch = matchById.get("m103");
  const finalMatch = matchById.get("m104");

  const columns = TREE_ROUNDS.map((round) => ({
    round,
    label: BRACKET_ROUND_LABELS[round],
    matchIds: matches.filter((m) => m.round === round).map((m) => m.id),
  }));

  const svgWidth = columns.length * (COL_WIDTH + CONNECTOR_WIDTH);

  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="relative min-w-max" style={{ width: svgWidth, height: totalHeight + 80 }}>
        <svg
          className="pointer-events-none absolute inset-0 text-[var(--border)]"
          width={svgWidth}
          height={totalHeight}
          aria-hidden
        >
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          >
            {Object.entries(BRACKET_FEED).map(([childId, [leftId, rightId]]) => {
              const childMatch = matchById.get(childId);
              if (!childMatch || childMatch.round === "third_place") return null;

              const childCol = TREE_ROUNDS.indexOf(
                childMatch.round as (typeof TREE_ROUNDS)[number],
              );
              if (childCol <= 0) return null;

              const yTop = matchCenterY(layout, leftId);
              const yBottom = matchCenterY(layout, rightId);
              const xParentRight = columnLeft(childCol - 1) + COL_WIDTH;
              const xChildLeft = columnLeft(childCol);

              return (
                <g key={childId}>
                  {renderBracketConnector(xParentRight, xChildLeft, yTop, yBottom)}
                </g>
              );
            })}
          </g>
        </svg>

        {columns.map(({ round, label, matchIds }, colIndex) => (
          <div
            key={round}
            className="absolute top-0"
            style={{ left: columnLeft(colIndex), width: COL_WIDTH }}
          >
            <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
              {label}
            </p>
            {matchIds.map((id) => {
              const match = matchById.get(id);
              if (!match) return null;
              const top = COLUMN_HEADER_HEIGHT + (layout.get(id) ?? 0) * ROW_HEIGHT;
              return (
                <div
                  key={id}
                  className="absolute left-0 w-full"
                  style={{ top }}
                >
                  <MatchBox match={match} />
                </div>
              );
            })}
          </div>
        ))}

        {thirdMatch && finalMatch && (
          <div
            className="absolute flex gap-6"
            style={{
              top: totalHeight + 8,
              left: columnLeft(TREE_ROUNDS.length - 2),
            }}
          >
            <div style={{ width: COL_WIDTH }}>
              <p className="mb-1 text-center text-[10px] font-semibold uppercase text-[var(--muted)]">
                {BRACKET_ROUND_LABELS.third_place}
              </p>
              <MatchBox match={thirdMatch} />
            </div>
            <div style={{ width: COL_WIDTH }}>
              <p className="mb-1 text-center text-[10px] font-semibold uppercase text-[var(--muted)]">
                {BRACKET_ROUND_LABELS.final}
              </p>
              <MatchBox match={finalMatch} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Resumen del campeón y podio. */
export function BracketPodiumSummary({ matches }: { matches: ResolvedBracketMatch[] }) {
  const final = matches.find((m) => m.id === "m104");
  const third = matches.find((m) => m.id === "m103");

  const champion = final?.winnerId
    ? final.home?.id === final.winnerId
      ? final.home
      : final.away
    : null;
  const thirdPlace = third?.winnerId
    ? third.home?.id === third.winnerId
      ? third.home
      : third.away
    : null;
  const runnerUp =
    champion && final
      ? final.home?.id === champion.id
        ? final.away
        : final.home
      : null;

  if (!champion) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {thirdPlace && (
        <div className="rounded-2xl border border-amber-700/30 bg-amber-50/50 p-4 text-center dark:bg-amber-950/20">
          <p className="text-xs font-medium text-amber-800 dark:text-amber-300">🥉 3.er puesto</p>
          <p className="mt-2 font-semibold">{thirdPlace.name}</p>
        </div>
      )}
      <div className="rounded-2xl border border-[var(--brand)] bg-[var(--brand-soft)] p-4 text-center">
        <p className="text-xs font-medium text-[var(--brand-strong)]">🏆 Campeón</p>
        <p className="mt-2 text-lg font-semibold">{champion.name}</p>
      </div>
      {runnerUp && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center">
          <p className="text-xs font-medium text-[var(--muted)]">🥈 Subcampeón</p>
          <p className="mt-2 font-semibold">{runnerUp.name}</p>
        </div>
      )}
    </div>
  );
}

/** Panel de puntuación por aciertos. */
export function BracketScorePanel({
  score,
}: {
  score: {
    totalPoints: number;
    maxPoints: number;
    groupPoints: number;
    thirdPickPoints: number;
    knockoutPoints: number;
    correctGroupSlots: number;
    gradableGroupSlots: number;
    correctKnockoutMatches: number;
    gradableKnockoutMatches: number;
    correctThirdGroups: number;
    gradableThirdGroups: number;
    hasOfficialData: boolean;
  };
}) {
  if (!score.hasOfficialData) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h3 className="font-semibold">Puntuación</h3>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Los puntos se calcularán cuando el torneo avance y haya resultados oficiales. Sistema:
          1º/2º/3º en grupos, mejores terceros y ganadores de cada ronda eliminatoria.
        </p>
        <ul className="mt-3 space-y-1 text-xs text-[var(--muted)]">
          <li>· 1º en grupo: 3 pts · 2º: 2 pts · 3º clasificado: 2 pts</li>
          <li>· Mejor tercero acertado: 1 pt c/u</li>
          <li>· Dieciseisavos: 1 · Octavos: 2 · Cuartos: 4 · Semis: 6 · 3.er puesto: 5 · Final: 10</li>
        </ul>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--brand)]/40 bg-[var(--brand-soft)]/40 p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-semibold">Tu puntuación</h3>
          <p className="mt-1 text-3xl font-bold tabular-nums text-[var(--brand-strong)]">
            {score.totalPoints}
            <span className="text-base font-normal text-[var(--muted)]"> / {score.maxPoints} pts</span>
          </p>
        </div>
      </div>
      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-[var(--muted)]">Grupos</dt>
          <dd className="font-medium">
            {score.groupPoints} pts ({score.correctGroupSlots}/{score.gradableGroupSlots} posiciones)
          </dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">Mejores terceros</dt>
          <dd className="font-medium">
            {score.thirdPickPoints} pts ({score.correctThirdGroups}/{score.gradableThirdGroups})
          </dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">Eliminatorias</dt>
          <dd className="font-medium">
            {score.knockoutPoints} pts ({score.correctKnockoutMatches}/{score.gradableKnockoutMatches})
          </dd>
        </div>
      </dl>
    </div>
  );
}

// Re-export tree as default BracketVisualization replacement
export { BracketTreeVisualization as BracketVisualization };
