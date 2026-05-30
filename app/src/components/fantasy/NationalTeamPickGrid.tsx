"use client";

import { NationalTeamCrestImage } from "@/components/fantasy/NationalTeamCrestImage";
import { getNationalTeamCrestUrl } from "@/lib/national-team-crests";
import { clsx } from "@/lib/utils";

interface PickOption {
  id: string;
  name: string;
  logoUrl?: string;
  crestUrl?: string;
  marketOdds?: number;
}

interface NationalTeamPickGridProps {
  options: PickOption[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  formatOdds?: (n: number) => string;
}

function teamCrestSrc(team: PickOption): string | undefined {
  return team.logoUrl ?? team.crestUrl ?? getNationalTeamCrestUrl(team.id);
}

export function NationalTeamPickGrid({
  options,
  value,
  onChange,
  disabled = false,
  formatOdds = (n) => String(n),
}: NationalTeamPickGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {options.map((t) => {
        const isSelected = t.id === value;
        const src = teamCrestSrc(t);

        return (
          <button
            key={t.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(t.id === value ? "" : t.id)}
            title={t.name}
            className={clsx(
              "relative aspect-[4/5] overflow-hidden rounded-xl border transition-all",
              isSelected
                ? "border-[var(--brand)] ring-2 ring-[var(--brand)]/30"
                : "border-[var(--border)] hover:border-[var(--brand)]",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--surface)] to-[var(--background)]" />
            <div className="absolute inset-2 bottom-10 flex items-center justify-center">
              <NationalTeamCrestImage
                teamId={t.id}
                teamName={t.name}
                src={src}
                imgClassName="max-h-full max-w-full"
                fallbackClassName="text-lg"
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-black/55 px-1 py-1.5 text-center">
              <p className="line-clamp-2 text-[9px] font-medium leading-tight text-white">
                {t.name}
              </p>
              {t.marketOdds !== undefined && (
                <p className="text-[9px] tabular-nums text-white/75">
                  {formatOdds(t.marketOdds)}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
