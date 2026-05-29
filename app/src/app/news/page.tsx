import Link from "next/link";
import Image from "next/image";
import { Badge, Card, SectionTitle } from "@/components/ui";
import { MOCK_NEWS, type NewsArticle, type NewsCategory } from "@/lib/mocks/news";
import { NewsTicker } from "@/components/NewsTicker";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const CATEGORY_LABELS: Record<NewsCategory, string> = {
  selecciones: "Selecciones",
  estadios: "Estadios",
  jugadores: "Jugadores",
  organización: "Organización",
  curiosidades: "Curiosidades",
};

const CATEGORY_TONE: Record<
  NewsCategory,
  "brand" | "warning" | "muted" | "default"
> = {
  selecciones: "brand",
  estadios: "muted",
  jugadores: "warning",
  organización: "default",
  curiosidades: "muted",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewsPage() {
  const sorted = [...MOCK_NEWS].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--brand-strong)] via-[var(--brand)] to-emerald-400 p-6 text-white shadow-md sm:p-8">
        <span
          aria-hidden
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[7rem] opacity-20 sm:right-8 sm:text-[9rem]"
        >
          📰
        </span>
        <div className="relative max-w-[calc(100%-7rem)] sm:max-w-[calc(100%-9rem)]">
          <p className="text-sm font-medium opacity-80">Mundial 2026</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Noticias
          </h1>
          <p className="mt-1 text-sm text-white/90">
            Todo lo que pasa alrededor del torneo.
          </p>
        </div>
      </section>

      {/* Ticker — client component */}
      <section>
        <SectionTitle title="En directo" subtitle="Pasa el ratón para pausar" />
        <NewsTicker articles={sorted} />
      </section>

      {/* Grid completo */}
      <section>
        <SectionTitle
          title="Todas las noticias"
          subtitle={`${sorted.length} artículos de los principales diarios deportivos`}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>
    </div>
  );
}

// ─── ArticleCard ──────────────────────────────────────────────────────────────

function ArticleCard({ article }: { article: NewsArticle }) {
  return (
    <Link href={`/news/${article.id}`} className="group">
      <Card className="flex h-full flex-col overflow-hidden p-0 transition-shadow group-hover:shadow-md">
        {/* Foto */}
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* Badge del periódico sobre la imagen */}
          <span
            className="absolute bottom-2 left-2 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white shadow"
            style={{ backgroundColor: article.sourceColor }}
          >
            {article.source}
          </span>
        </div>

        {/* Contenido */}
        <div className="flex flex-1 flex-col gap-2 p-4">
          <Badge tone={CATEGORY_TONE[article.category]}>
            {CATEGORY_LABELS[article.category]}
          </Badge>

          <h3 className="flex-1 text-sm font-semibold leading-snug transition-colors group-hover:text-[var(--brand-strong)]">
            {article.title}
          </h3>

          <p className="line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">
            {article.summary}
          </p>

          <p className="text-xs text-[var(--muted)]">
            {formatDate(article.publishedAt)}
          </p>
        </div>
      </Card>
    </Link>
  );
}
