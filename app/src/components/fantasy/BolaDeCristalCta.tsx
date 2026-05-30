import Link from "next/link";
import { bolaDeCristalHref } from "@/lib/fantasy-routes";

interface BolaDeCristalCtaProps {
  leagueId?: string | null;
  /** Si hay alguna predicción guardada, el botón puede mostrarse como secundario. */
  hasAnyPrediction?: boolean;
}

export function BolaDeCristalCta({ leagueId, hasAnyPrediction }: BolaDeCristalCtaProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-[var(--muted)]">
        {hasAnyPrediction
          ? "Puedes cambiar tus elecciones hasta el inicio del torneo."
          : "Aún no has completado tus predicciones del torneo."}
      </p>
      <Link
        href={bolaDeCristalHref(leagueId)}
        className="shrink-0 rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
      >
        {hasAnyPrediction ? "Editar predicciones" : "Hacer predicciones"}
      </Link>
    </div>
  );
}
