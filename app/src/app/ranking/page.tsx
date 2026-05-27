import { getGlobalRanking } from "@/lib/db";
import { RankingTable } from "@/components/RankingTable";

export default async function RankingPage() {
  const ranking = await getGlobalRanking();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Ranking global</h1>
        <p className="text-sm text-[var(--muted)]">
          Todos los usuarios ordenados por puntos acumulados.
        </p>
      </header>

      <RankingTable entries={ranking} />
    </div>
  );
}
