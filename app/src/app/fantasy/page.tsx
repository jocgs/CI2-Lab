import Link from "next/link";
import { getCurrentUser } from "@/lib/db";
import {
  getFantasyTeamByUserAndCompetition,
  getFantasyRankingByCompetition,
} from "@/lib/fantasy-db";
import { Card, SectionTitle } from "@/components/ui";

const COMPETITIONS = [
  {
    id: "world_cup_2026",
    name: "Mundial 2026",
    emoji: "🌍",
    description: "USA · Canadá · México — 48 selecciones, 104 partidos, un campeón.",
  },
];

export default async function FantasyPage() {
  const user = await getCurrentUser();

  const competitionData = await Promise.all(
    COMPETITIONS.map(async (comp) => {
      const myTeam = await getFantasyTeamByUserAndCompetition(user.id, comp.id);
      const ranking = await getFantasyRankingByCompetition(comp.id);
      return { comp, myTeam, rankingCount: ranking.length };
    }),
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <section className="rounded-3xl bg-gradient-to-br from-violet-600 via-[var(--brand)] to-emerald-400 p-6 text-white shadow-md sm:p-8">
        <p className="text-sm font-medium opacity-80">¡Hola, {user.displayName}!</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Fantasy Express ⚡
        </h1>
        <p className="mt-1 max-w-md text-sm text-white/90">
          Elige tu once, predice el campeón y demuestra que sabes más que el
          seleccionador. O al menos que Google.
        </p>
      </section>

      {/* Competitions */}
      <section>
        <SectionTitle
          title="Competiciones disponibles"
          subtitle="Crea tu equipo antes del primer partido"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {competitionData.map(({ comp, myTeam, rankingCount }) => (
            <Card key={comp.id} className="p-5">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{comp.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold">{comp.name}</h2>
                  <p className="mt-0.5 text-sm text-[var(--muted)]">
                    {comp.description}
                  </p>

                  {myTeam ? (
                    <div className="mt-3 rounded-xl bg-[var(--brand-soft)] p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-[var(--muted)]">Tu equipo</p>
                          <p className="font-semibold text-[var(--brand-strong)]">
                            {myTeam.teamName}
                          </p>
                          <p className="text-sm text-[var(--muted)]">
                            {myTeam.totalPoints} puntos
                            {myTeam.locked && " · 🔒 Bloqueado"}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Link
                            href="/fantasy/my-team"
                            className="rounded-xl bg-[var(--brand)] px-3 py-1.5 text-center text-xs font-medium text-white hover:opacity-90"
                          >
                            Ver mi equipo
                          </Link>
                          <Link
                            href="/fantasy/ranking"
                            className="rounded-xl border border-[var(--brand)] px-3 py-1.5 text-center text-xs font-medium text-[var(--brand-strong)] hover:bg-[var(--brand-soft)]"
                          >
                            Ranking ({rankingCount})
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 flex gap-2">
                      <Link
                        href={`/fantasy/builder?competition=${comp.id}`}
                        className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                      >
                        Crear equipo →
                      </Link>
                      {rankingCount > 0 && (
                        <Link
                          href="/fantasy/ranking"
                          className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--muted)] hover:bg-[var(--surface)]"
                        >
                          Ranking ({rankingCount})
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Rules */}
      <section>
        <SectionTitle
          title="¿Cómo funciona?"
          subtitle="Por si llevas 20 años sin leer unas instrucciones"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((step) => (
            <Card key={step.step} className="p-4">
              <span className="text-2xl">{step.emoji}</span>
              <p className="mt-2 font-semibold text-sm">{step.title}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{step.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

const HOW_IT_WORKS = [
  {
    step: 1,
    emoji: "🏗️",
    title: "Elige tu 11",
    desc: "1 portero, 4 defensas, 3 centros, 3 delanteros. Pon al capitán (×2 puntos).",
  },
  {
    step: 2,
    emoji: "🔮",
    title: "Predice el torneo",
    desc: "Campeón, sorpresa, decepción y MVP. Los bonos pueden disparar tu ranking.",
  },
  {
    step: 3,
    emoji: "📊",
    title: "Acumula puntos",
    desc: "Goles, asistencias, portería a cero... y goles del portero (raro pero pasa).",
  },
  {
    step: 4,
    emoji: "🏆",
    title: "Gana la gloria",
    desc: "O al menos un título honorífico. Cada posición tiene su etiqueta especial.",
  },
];
