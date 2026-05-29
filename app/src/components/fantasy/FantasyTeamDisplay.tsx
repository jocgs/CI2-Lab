import type {
  FantasyTeam,
  FantasyPlayer,
  FantasyNationalTeam,
  Position,
} from "@/types/fantasy";
import { clsx } from "@/lib/utils";
import { PlayerAvatar } from "@/components/fantasy/PlayerAvatar";

function NationalTeamSymbol({ team }: { team: FantasyNationalTeam | undefined }) {
  if (!team) return null;

  if (team.logoUrl) {
    return <img src={team.logoUrl} alt={team.name} className="h-4 w-4 object-contain" />;
  }

  return <span className="text-[10px]">{team.flagUrl}</span>;
}

interface PitchPlayerProps {
  player: FantasyPlayer | undefined;
  isCaptain?: boolean;
  label?: string;
  nationalTeams: FantasyNationalTeam[];
}

function PitchPlayer({ player, isCaptain, label, nationalTeams }: PitchPlayerProps) {
  if (!player) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="h-10 w-10 rounded-full border-2 border-dashed border-[var(--border)] bg-[var(--surface)] flex items-center justify-center text-[var(--muted)] text-xs">
          ?
        </div>
        <span className="text-xs text-[var(--muted)]">{label ?? "—"}</span>
      </div>
    );
  }

  const nt = nationalTeams.find((t) => t.id === player.nationalTeamId);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <PlayerAvatar player={player} size={40} />
        {isCaptain && (
          <span className="absolute -top-1.5 -right-1.5 text-sm leading-none">⭐</span>
        )}
      </div>
      <span className="max-w-[72px] truncate text-center text-[10px] font-medium leading-tight">
        {player.name.split(" ").slice(-1)[0]}
      </span>
      {nt && <NationalTeamSymbol team={nt} />}
    </div>
  );
}

function PitchLine({
  players,
  nationalTeams,
  captainId,
  role,
}: {
  players: Array<FantasyPlayer | undefined>;
  nationalTeams: FantasyNationalTeam[];
  captainId: string | null;
  role: "attack" | "midfield" | "defense";
}) {
  const count = players.filter(Boolean).length;
  const widthByCount: Record<number, string> = {
    1: "26%",
    2: role === "attack" ? "58%" : role === "midfield" ? "64%" : "72%",
    3: role === "attack" ? "74%" : role === "midfield" ? "82%" : "88%",
    4: role === "midfield" ? "92%" : "96%",
    5: "100%",
  };

  return (
    <div
      className="mx-auto grid gap-4"
      style={{
        width: widthByCount[count] ?? "100%",
        gridTemplateColumns: `repeat(${Math.max(players.length, 1)}, minmax(0, 1fr))`,
      }}
    >
      {players.map((player, index) => (
        <div key={player?.id ?? `empty-${index}`} className="flex justify-center">
          <PitchPlayer
            player={player}
            isCaptain={player?.id === captainId}
            nationalTeams={nationalTeams}
          />
        </div>
      ))}
    </div>
  );
}

interface FantasyTeamDisplayProps {
  fantasyTeam: FantasyTeam;
  players: FantasyPlayer[];
  nationalTeams: FantasyNationalTeam[];
  isEditable?: boolean;
}

export function FantasyTeamDisplay({
  fantasyTeam,
  players,
  nationalTeams,
}: FantasyTeamDisplayProps) {
  const pm = new Map(players.map((p) => [p.id, p]));
  const { startingEleven: se, bench, captainId } = fantasyTeam;
  const formationLabel =
    fantasyTeam.startingEleven.formation ??
    `${se.defenderIds.length}-${se.midfielderIds.length}-${se.forwardIds.length}`;

  const gk = pm.get(se.goalkeeperId);
  const defs = se.defenderIds.map((id) => pm.get(id));
  const mids = se.midfielderIds.map((id) => pm.get(id));
  const fwds = se.forwardIds.map((id) => pm.get(id));

  const benchPlayers = [
    pm.get(bench.goalkeeperId),
    pm.get(bench.defenderId),
    pm.get(bench.midfielderId),
    pm.get(bench.forwardId),
  ];

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      {/* Header */}
      <div className="border-b border-[var(--border)] bg-[var(--brand-soft)] px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-[var(--brand-strong)]">{fantasyTeam.teamName}</p>
            <p className="text-xs text-[var(--muted)]">
              {fantasyTeam.totalPoints} puntos totales
            </p>
            <p className="text-xs text-[var(--muted)]">Formación {formationLabel}</p>
          </div>
          {fantasyTeam.locked && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              🔒 Bloqueado
            </span>
          )}
        </div>
      </div>

      {/* Pitch */}
      <div className="relative bg-gradient-to-b from-emerald-800 to-emerald-700 p-4">
        <div className="relative flex flex-col gap-6 py-2">
          <PitchLine players={fwds} nationalTeams={nationalTeams} captainId={captainId} role="attack" />
          <PitchLine players={mids} nationalTeams={nationalTeams} captainId={captainId} role="midfield" />
          <PitchLine players={defs} nationalTeams={nationalTeams} captainId={captainId} role="defense" />
          <div className="flex justify-center">
            <PitchPlayer player={gk} isCaptain={gk?.id === captainId} nationalTeams={nationalTeams} />
          </div>
        </div>
      </div>

      {/* Bench */}
      <div className="border-t border-[var(--border)] px-4 py-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          — Banquillo —
        </p>
        <div className="flex justify-around">
          {benchPlayers.map((p, i) => (
            <PitchPlayer
              key={i}
              player={p}
              isCaptain={false}
              nationalTeams={nationalTeams}
            />
          ))}
        </div>
      </div>

      {/* Predictions summary */}
      <div className="border-t border-[var(--border)] px-4 py-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Predicciones del torneo
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
          <PredictionBadge label="Campeona" value={fantasyTeam.championTeamId ?? ""} nationalTeams={nationalTeams} />
          <PredictionBadge label="Sorpresa" value={fantasyTeam.surpriseTeamId ?? ""} nationalTeams={nationalTeams} />
          <PredictionBadge label="Decepción" value={fantasyTeam.disappointmentTeamId ?? ""} nationalTeams={nationalTeams} />
          <div className="rounded-lg border border-[var(--border)] p-2">
            <p className="text-[var(--muted)]">MVP</p>
            <p className="font-medium truncate">
              {fantasyTeam.tournamentMvpPlayerId
                ? (pm.get(fantasyTeam.tournamentMvpPlayerId)?.name ?? fantasyTeam.tournamentMvpPlayerId)
                : <span className="text-[var(--muted)]">—</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PredictionBadge({
  label,
  value,
  nationalTeams,
}: {
  label: string;
  value: string;
  nationalTeams: FantasyNationalTeam[];
}) {
  const nt = nationalTeams.find((t) => t.id === value);
  return (
    <div className="rounded-lg border border-[var(--border)] p-2">
      <p className="text-[var(--muted)]">{label}</p>
      <p className="font-medium truncate">
        {nt ? (
          <span className="inline-flex items-center gap-1">
            <NationalTeamSymbol team={nt} />
            <span>{nt.name}</span>
          </span>
        ) : (
          value
        )}
      </p>
    </div>
  );
}
