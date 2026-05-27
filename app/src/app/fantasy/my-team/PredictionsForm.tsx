"use client";

import { useState, useTransition } from "react";
import type { FantasyNationalTeam, FantasyPlayer, FantasyTeam } from "@/types/fantasy";
import { savePredictionsAction } from "./prediction-actions";

interface Props {
  team: FantasyTeam;
  nationalTeams: FantasyNationalTeam[];
  squadPlayers: FantasyPlayer[];
  competitionId: string;
}

export function PredictionsForm({ team, nationalTeams, squadPlayers, competitionId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [championTeamId, setChampionTeamId] = useState(team.championTeamId ?? "");
  const [surpriseTeamId, setSurpriseTeamId] = useState(team.surpriseTeamId ?? "");
  const [disappointmentTeamId, setDisappointmentTeamId] = useState(team.disappointmentTeamId ?? "");
  const [tournamentMvpPlayerId, setTournamentMvpPlayerId] = useState(team.tournamentMvpPlayerId ?? "");

  const allFilled = championTeamId && surpriseTeamId && disappointmentTeamId && tournamentMvpPlayerId;

  function handleSave() {
    if (!allFilled) {
      setError("Rellena todas las predicciones.");
      return;
    }
    setSaved(false);
    setError(null);
    startTransition(async () => {
      const result = await savePredictionsAction({
        competitionId,
        championTeamId,
        surpriseTeamId,
        disappointmentTeamId,
        tournamentMvpPlayerId,
      });
      if (result.error) {
        setError(result.error);
      } else {
        setSaved(true);
      }
    });
  }

  const selectClass =
    "w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] disabled:opacity-50";

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <h2 className="mb-1 text-base font-semibold">🔮 Predicciones del torneo</h2>
      <p className="mb-4 text-xs text-[var(--muted)]">
        Estas predicciones suman puntos extra al final del torneo. Puedes cambiarlas mientras el equipo no esté bloqueado.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Campeón */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--muted)]">🏆 Equipo campeón</label>
          <select
            value={championTeamId}
            onChange={(e) => setChampionTeamId(e.target.value)}
            disabled={team.locked || isPending}
            className={selectClass}
          >
            <option value="">Selecciona un equipo…</option>
            {nationalTeams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.flagUrl} {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sorpresa */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--muted)]">⭐ Equipo sorpresa</label>
          <select
            value={surpriseTeamId}
            onChange={(e) => setSurpriseTeamId(e.target.value)}
            disabled={team.locked || isPending}
            className={selectClass}
          >
            <option value="">Selecciona un equipo…</option>
            {nationalTeams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.flagUrl} {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Decepción */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--muted)]">💩 Equipo decepción</label>
          <select
            value={disappointmentTeamId}
            onChange={(e) => setDisappointmentTeamId(e.target.value)}
            disabled={team.locked || isPending}
            className={selectClass}
          >
            <option value="">Selecciona un equipo…</option>
            {nationalTeams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.flagUrl} {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* MVP */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--muted)]">🌟 MVP del torneo</label>
          <select
            value={tournamentMvpPlayerId}
            onChange={(e) => setTournamentMvpPlayerId(e.target.value)}
            disabled={team.locked || isPending}
            className={selectClass}
          >
            <option value="">Selecciona un jugador…</option>
            {squadPlayers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.nationalTeamName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      {saved && !error && (
        <p className="mt-3 text-sm text-green-600 dark:text-green-400">✓ Predicciones guardadas</p>
      )}

      {!team.locked && (
        <button
          onClick={handleSave}
          disabled={isPending || !allFilled}
          className="mt-4 rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40"
        >
          {isPending ? "Guardando…" : "Guardar predicciones"}
        </button>
      )}

      {team.locked && (
        <p className="mt-3 text-xs text-[var(--muted)]">🔒 Equipo bloqueado — las predicciones ya no pueden modificarse.</p>
      )}
    </div>
  );
}
