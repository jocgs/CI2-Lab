import Link from "next/link";
import { getCurrentUser } from "@/lib/db";
import { HERO_ASSETS } from "@/lib/constants/assets";
import {
  getGlobalFantasyTeam,
  getFantasyTeamForLeague,
  getFantasyRankingByCompetition,
  getLeaguesByUserId,
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

  const [competitionData, myLeagues] = await Promise.all([
    Promise.all(
      COMPETITIONS.map(async (comp) => {
        const myTeam = await getGlobalFantasyTeam(user.id, comp.id);
        const ranking = await getFantasyRankingByCompetition(comp.id);
        return { comp, myTeam, rankingCount: ranking.length };
      }),
    ),
    getLeaguesByUserId(user.id),
  ]);

  const leaguesWithTeams = await Promise.all(
    myLeagues.map(async (league) => ({
      league,
      myTeam: await getFantasyTeamForLeague(user.id, league.competitionId, league.id),
    })),
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <section
        className="page-hero"
        style={{ backgroundImage: `url(${HERO_ASSETS.fantasy})` }}
      >
        <div className="page-hero__content">
          <p className="text-sm font-medium opacity-80">¡Hola, {user.displayName}!</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Fantasy
          </h1>
          <p className="mt-1 text-sm">
            Crea tu equipo ideal y compite jornada a jornada.
          </p>
        </div>
      </section>

      {/* Cuadro del Mundial */}
      <section>
        <SectionTitle
          title="Cuadro del Mundial"
          subtitle="Predice la clasificación de grupos y todo el bracket eliminatorio"
        />
        <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="text-3xl" aria-hidden>
              🏆
            </span>
            <div>
              <h2 className="font-semibold">Grupos, dieciseisavos, final y 3.er puesto</h2>
              <p className="mt-0.5 text-sm text-[var(--muted)]">
                Ordena cada grupo y elige ganadores en cada cruce pulsando los escudos de las
                selecciones.
              </p>
            </div>
          </div>
          <Link
            href="/fantasy/bracket"
            className="shrink-0 rounded-xl bg-[var(--brand)] px-5 py-2.5 text-center text-sm font-medium text-white hover:opacity-90"
          >
            Ir al cuadro →
          </Link>
        </Card>
      </section>

      {/* Bola de cristal */}
      <section>
        <SectionTitle
          title="Bola de cristal"
          subtitle="Predicciones del torneo, independientes de tu plantilla Fantasy"
        />
        <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="text-3xl" aria-hidden>
              🔮
            </span>
            <div>
              <h2 className="font-semibold">Balón de oro, Bota de oro, Guante de oro y más</h2>
              <p className="mt-0.5 text-sm text-[var(--muted)]">
                Premios del torneo, fase de grupos y predicciones con escudos — independientes de tu
                plantilla Fantasy.
              </p>
            </div>
          </div>
          <Link
            href="/fantasy/bola-de-cristal"
            className="shrink-0 rounded-xl bg-violet-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:opacity-90"
          >
            Ir a Bola de cristal →
          </Link>
        </Card>
      </section>

      {/* Competitions */}
      <section>
        <SectionTitle
          title="Fantasy · Competiciones"
          subtitle="Crea tu equipo de jugadores antes del primer partido"
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
                          <p className="text-xs text-[var(--muted)]">Tu equipo global</p>
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
                            href="/fantasy/bola-de-cristal"
                            className="rounded-xl border border-violet-300 px-3 py-1.5 text-center text-xs font-medium text-violet-800 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-200 dark:hover:bg-violet-950/40"
                          >
                            Bola de cristal
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

      {/* Friend leagues */}
      <section>
        <div className="flex items-center justify-between gap-3 mb-3">
          <SectionTitle
            title="Ligas de amigos"
            subtitle="Un equipo distinto por cada liga"
          />
          <Link
            href="/fantasy/leagues"
            className="shrink-0 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--muted)] hover:bg-[var(--surface)]"
          >
            Ver todas →
          </Link>
        </div>

        {myLeagues.length === 0 ? (
          <Card className="p-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Sin ligas aún</p>
              <p className="mt-0.5 text-sm text-[var(--muted)]">
                Crea una liga privada o únete con el código de un amigo.
              </p>
            </div>
            <Link
              href="/fantasy/leagues"
              className="shrink-0 rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Empezar →
            </Link>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {leaguesWithTeams.slice(0, 3).map(({ league, myTeam }) => (
              <div
                key={league.id}
                className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                <Link
                  href={`/fantasy/leagues/${league.id}`}
                  className="flex items-center justify-between gap-3 hover:opacity-90"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{league.name}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {league.memberIds.length} participante{league.memberIds.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-[var(--brand-soft)] px-2 py-1 font-mono text-xs font-bold tracking-wider text-[var(--brand-strong)]">
                    {league.inviteCode}
                  </span>
                </Link>
                {myTeam ? (
                  <div className="flex items-center justify-between gap-2 rounded-xl bg-[var(--brand-soft)]/50 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--brand-strong)]">
                        {myTeam.teamName}
                      </p>
                      <p className="text-xs text-[var(--muted)]">{myTeam.totalPoints} pts</p>
                    </div>
                    <Link
                      href={`/fantasy/my-team?league=${league.id}`}
                      className="shrink-0 text-xs font-medium text-[var(--brand-strong)] hover:underline"
                    >
                      Ver →
                    </Link>
                  </div>
                ) : (
                  <Link
                    href={`/fantasy/builder?league=${league.id}`}
                    className="rounded-xl border border-dashed border-[var(--brand)] px-3 py-2 text-center text-xs font-medium text-[var(--brand-strong)] hover:bg-[var(--brand-soft)]"
                  >
                    Crear equipo de liga →
                  </Link>
                )}
              </div>
            ))}
            {myLeagues.length > 3 && (
              <Link
                href="/fantasy/leagues"
                className="flex items-center justify-center rounded-2xl border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)] hover:border-[var(--brand)] transition-colors"
              >
                +{myLeagues.length - 3} más →
              </Link>
            )}
          </div>
        )}
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
    desc: "Un equipo para el ranking global y otro distinto en cada liga de amigos.",
  },
  {
    step: 2,
    emoji: "🔮",
    title: "Bola de cristal",
    desc: "Campeón, revelación, decepción y MVP del torneo, en una sección aparte.",
  },
  {
    step: 3,
    emoji: "📊",
    title: "Acumula puntos",
    desc: "Goles, asistencias, portería a cero... y bonos por acertar predicciones.",
  },
  {
    step: 4,
    emoji: "🏆",
    title: "Gana la gloria",
    desc: "O al menos un título honorífico. Cada posición tiene su etiqueta especial.",
  },
];
