import type { FantasyTeam, FantasyPlayer } from "@/types/fantasy";
import { getFormationRequirements } from "@/lib/fantasy-formations";

export interface ValidationError {
  field: string;
  message: string;
}

export function getMaxPlayersFromSameTeam(
  allPlayerIds: string[],
  players: FantasyPlayer[],
): { teamId: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const id of allPlayerIds) {
    const player = players.find((p) => p.id === id);
    if (!player) continue;
    counts.set(player.nationalTeamId, (counts.get(player.nationalTeamId) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([teamId, count]) => ({ teamId, count }))
    .sort((a, b) => b.count - a.count);
}

export function validateFantasyTeam(
  team: Partial<FantasyTeam>,
  players: FantasyPlayer[],
  locked: boolean,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (locked) {
    errors.push({
      field: "locked",
      message: "El equipo está bloqueado y no puede modificarse.",
    });
    return errors;
  }

  // Team name
  if (!team.teamName || team.teamName.trim().length === 0) {
    errors.push({ field: "teamName", message: "El nombre del equipo es obligatorio." });
  }

  const se = team.startingEleven;
  const bench = team.bench;

  if (!se) {
    errors.push({ field: "startingEleven", message: "El once titular no está definido." });
    return errors;
  }

  if (!se.formation) {
    errors.push({ field: "startingEleven.formation", message: "Debes elegir una formación." });
    return errors;
  }

  const requirements = getFormationRequirements(se.formation);

  // Check exactly 1 GK and the counts required by the selected formation
  const { goalkeeperId, defenderIds, midfielderIds, forwardIds } = se;

  if (!goalkeeperId) {
    errors.push({ field: "startingEleven.goalkeeperId", message: "Debes seleccionar un portero titular." });
  }

  if (!defenderIds || defenderIds.length !== requirements.defenders || defenderIds.some((id) => !id)) {
    errors.push({ field: "startingEleven.defenderIds", message: `Debes seleccionar exactamente ${requirements.defenders} defensas.` });
  }

  if (!midfielderIds || midfielderIds.length !== requirements.midfielders || midfielderIds.some((id) => !id)) {
    errors.push({ field: "startingEleven.midfielderIds", message: `Debes seleccionar exactamente ${requirements.midfielders} centrocampistas.` });
  }

  if (!forwardIds || forwardIds.length !== requirements.forwards || forwardIds.some((id) => !id)) {
    errors.push({ field: "startingEleven.forwardIds", message: `Debes seleccionar exactamente ${requirements.forwards} delanteros.` });
  }

  if (!bench) {
    errors.push({ field: "bench", message: "El banquillo no está definido." });
    return errors;
  }

  const { goalkeeperId: bGK, defenderId: bDEF, midfielderId: bMID, forwardId: bFWD } = bench;

  if (!bGK) errors.push({ field: "bench.goalkeeperId", message: "Debes seleccionar un portero de reserva." });
  if (!bDEF) errors.push({ field: "bench.defenderId", message: "Debes seleccionar un defensa de reserva." });
  if (!bMID) errors.push({ field: "bench.midfielderId", message: "Debes seleccionar un centrocampista de reserva." });
  if (!bFWD) errors.push({ field: "bench.forwardId", message: "Debes seleccionar un delantero de reserva." });

  // No duplicates between starters and bench
  const starterIds = [
    goalkeeperId,
    ...(defenderIds ?? []),
    ...(midfielderIds ?? []),
    ...(forwardIds ?? []),
  ].filter(Boolean);

  const benchIds = [bGK, bDEF, bMID, bFWD].filter(Boolean);
  const allIds = [...starterIds, ...benchIds];

  const duplicatesInStarters = starterIds.filter(
    (id, i) => id && starterIds.indexOf(id) !== i,
  );
  if (duplicatesInStarters.length > 0) {
    errors.push({ field: "startingEleven", message: "No puedes repetir jugadores en el once titular." });
  }

  const overlap = starterIds.filter((id) => id && benchIds.includes(id));
  if (overlap.length > 0) {
    errors.push({ field: "bench", message: "Un jugador no puede estar en el once y en el banquillo a la vez." });
  }

  // Max 3 players from same national team (starters only)
  const teamCounts = getMaxPlayersFromSameTeam(starterIds, players);
  for (const { teamId, count } of teamCounts) {
    if (count > 3) {
      errors.push({
        field: "startingEleven",
        message: `Máximo 3 jugadores del mismo equipo (${teamId} tiene ${count}).`,
      });
    }
  }

  // Captain must be in starting XI
  if (team.captainId && !starterIds.includes(team.captainId)) {
    errors.push({ field: "captainId", message: "El capitán debe ser un jugador titular." });
  }
  if (!team.captainId) {
    errors.push({ field: "captainId", message: "Debes elegir un capitán." });
  }

  // All 15 players must exist and be active
  for (const id of allIds) {
    if (!id) continue;
    const player = players.find((p) => p.id === id);
    if (!player) {
      errors.push({ field: "players", message: `Jugador con id "${id}" no encontrado.` });
    } else if (!player.isActive) {
      errors.push({ field: "players", message: `${player.name} no está activo.` });
    }
  }

  return errors;
}

export function validateFantasyPredictions(team: Partial<FantasyTeam>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!team.championTeamId)
    errors.push({ field: "championTeamId", message: "Debes seleccionar un equipo campeón." });
  if (!team.disappointmentTeamId)
    errors.push({ field: "disappointmentTeamId", message: "Debes seleccionar un equipo decepción." });
  if (!team.tournamentMvpPlayerId)
    errors.push({ field: "tournamentMvpPlayerId", message: "Debes seleccionar el MVP del torneo." });

  // Unicidad: campeón ≠ decepción
  if (team.championTeamId && team.disappointmentTeamId && team.championTeamId === team.disappointmentTeamId) {
    errors.push({
      field: "predictions",
      message: "No puedes elegir el mismo equipo como campeón y como decepción.",
    });
  }

  return errors;
}
