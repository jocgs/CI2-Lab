import { getPlayersByCompetition } from "@/lib/fantasy-db";
import { FantasyAdminClient } from "./FantasyAdminClient";

export default async function FantasyAdminPage() {
  const players = await getPlayersByCompetition("world_cup_2026");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Panel de administración</h1>
        <p className="text-sm text-[var(--muted)]">Fantasy Express · Mundial 2026</p>
      </div>
      <FantasyAdminClient players={players} />
    </div>
  );
}
