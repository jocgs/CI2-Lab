import { getCurrentUser, getUsers } from "@/lib/db";
import { getUserTournamentPicks, getAllPicksByTournament } from "@/lib/picks-db";
import { MOCK_TOURNAMENT, MOCK_TOURNAMENT_TEAMS } from "@/lib/mocks/tournament-teams";
import {
  isTournamentLocked,
  getEligibleRevelationTeams,
  getEligibleDisappointmentTeams,
  calculateSpecialPicksTotal,
} from "@/lib/tournament-picks";
import { SpecialPicksForm } from "@/components/SpecialPicksForm";

export default async function PicksPage() {
  const user = await getCurrentUser();
  const tournament = MOCK_TOURNAMENT;
  const locked = isTournamentLocked(tournament);

  const [myPicks, allPicks, allUsers] = await Promise.all([
    getUserTournamentPicks(user.id, tournament.id),
    getAllPicksByTournament(tournament.id),
    getUsers(),
  ]);
  const userMap = new Map(allUsers.map((u) => [u.id, u]));

  const revelationTeams = getEligibleRevelationTeams(MOCK_TOURNAMENT_TEAMS);
  const disappointmentTeams = getEligibleDisappointmentTeams(MOCK_TOURNAMENT_TEAMS);

  const teamMap = new Map(MOCK_TOURNAMENT_TEAMS.map((t) => [t.id, t]));

  // Leaderboard: users who have already picked
  const picksLeaderboard = allPicks.map((p) => {
    const u = userMap.get(p.userId);
    const rev = teamMap.get(p.revelationTeamId ?? "");
    const pts = calculateSpecialPicksTotal(rev?.finalStage, undefined);
    return { userId: p.userId, displayName: u?.displayName ?? p.userId, rev, pts };
  });

  const startDate = new Date(tournament.startsAt).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-8">
      {/* ── Hero ── */}
      <section className="rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-500 p-6 text-white sm:p-8">
        <p className="text-sm font-medium opacity-80">¡Hola, {user.displayName}!</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          🎯 Mis selecciones especiales
        </h1>
        <p className="mt-1 max-w-lg text-sm text-white/90">
          Elige la selección que llegará más lejos de lo esperado y la favorita que crees que decepcionará.
          Las cuotas están congeladas antes del inicio del torneo.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          <span className="rounded-full bg-white/20 px-3 py-1">
            📅 Torneo: {startDate}
          </span>
          <span className={`rounded-full px-3 py-1 font-medium ${locked ? "bg-red-500/80" : "bg-green-500/80"}`}>
            {locked ? "🔒 Cerrado" : "🟢 Abierto para selecciones"}
          </span>
          <span className="rounded-full bg-white/20 px-3 py-1">
            ⭐ Tapadas elegibles: {revelationTeams.length}
          </span>
          <span className="rounded-full bg-white/20 px-3 py-1">
            💣 Decepciones elegibles: {disappointmentTeams.length}
          </span>
        </div>
      </section>

      {/* ── Special picks form ── */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            {tournament.name} · Selecciones especiales
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Una revelación (cuota ≥ 40) y una decepción (cuota ≤ 25). Sin repetir.
          </p>
        </div>
        <SpecialPicksForm
          teams={MOCK_TOURNAMENT_TEAMS}
          existingPicks={myPicks}
          tournamentId={tournament.id}
          isLocked={locked}
        />
      </section>

      {/* ── Community picks board ── */}
      {picksLeaderboard.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Lo que han apostado los demás
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface)] text-xs uppercase tracking-wide text-[var(--muted)]">
                  <th className="px-4 py-3 text-left">Usuario</th>
                  <th className="px-4 py-3 text-left">⭐ Revelación</th>
                  <th className="px-4 py-3 text-right">Puntos</th>
                </tr>
              </thead>
              <tbody>
                {picksLeaderboard.map((entry, i) => {
                  const isMe = entry.userId === user.id;
                  return (
                    <tr
                      key={entry.userId}
                      className={`border-b border-[var(--border)] last:border-0 ${
                        isMe ? "bg-[var(--brand-soft)] font-medium" : i % 2 === 0 ? "bg-[var(--surface)]" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span>{entry.displayName}</span>
                        {isMe && (
                          <span className="ml-2 rounded-full bg-[var(--brand)] px-1.5 py-0.5 text-[10px] font-medium text-white">
                            Tú
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {entry.rev ? (
                          <span>{entry.rev.flag} {entry.rev.name}</span>
                        ) : (
                          <span className="text-[var(--muted)]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-[var(--brand-strong)]">
                        {entry.pts}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
