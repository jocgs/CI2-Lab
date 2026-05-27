import Link from "next/link";
import { notFound } from "next/navigation";
import { MOCK_NEWS, type NewsCategory } from "@/lib/mocks/news";
import { Badge, Card } from "@/components/ui";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
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

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = MOCK_NEWS.find((n) => n.id === id);
  if (!article) notFound();

  const related = MOCK_NEWS.filter(
    (n) => n.id !== article.id && n.category === article.category,
  ).slice(0, 3);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      {/* Back */}
      <Link
        href="/news"
        className="text-sm text-[var(--brand-strong)] hover:underline"
      >
        ← Volver a noticias
      </Link>

      {/* Article */}
      <Card className="p-6">
        {/* Emoji hero */}
        <div className="mb-6 flex h-28 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-7xl">
          {article.emoji}
        </div>

        {/* Meta */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge tone={CATEGORY_TONE[article.category]}>
            {CATEGORY_LABELS[article.category]}
          </Badge>
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-[var(--brand-strong)] hover:underline"
          >
            {article.source} ↗
          </a>
          <span className="text-xs text-[var(--muted)]">
            {formatDate(article.publishedAt)}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold leading-snug tracking-tight sm:text-2xl">
          {article.title}
        </h1>

        {/* Body */}
        <div className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-[var(--foreground)]">
          <p className="font-medium text-[var(--muted)]">{article.summary}</p>
          <p>{article.body}</p>
        </div>
      </Card>

      {/* Related */}
      {related.length > 0 && (
        <section>
          <h2 className="mb-3 text-base font-semibold">Más sobre {CATEGORY_LABELS[article.category]}</h2>
          <div className="flex flex-col gap-3">
            {related.map((r) => (
              <Link key={r.id} href={`/news/${r.id}`}>
                <Card className="flex items-center gap-4 p-4 transition-shadow hover:shadow-md">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-xl">
                    {r.emoji}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{r.title}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {r.source} · {formatDate(r.publishedAt)}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
