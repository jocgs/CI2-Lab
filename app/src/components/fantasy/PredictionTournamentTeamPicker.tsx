"use client";

import type { TournamentTeam } from "@/types/picks";
import { NationalTeamHeroBanner } from "@/components/fantasy/NationalTeamHeroBanner";
import { NationalTeamPickGrid } from "@/components/fantasy/NationalTeamPickGrid";
import { TournamentTeamPickerSelect } from "@/components/fantasy/TournamentTeamPickerSelect";

interface PredictionTournamentTeamPickerProps {
  options: TournamentTeam[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  placeholder: string;
  formatOdds: (n: number) => string;
  selectName: string;
}

export function PredictionTournamentTeamPicker({
  options,
  value,
  onChange,
  disabled = false,
  placeholder,
  formatOdds,
  selectName,
}: PredictionTournamentTeamPickerProps) {
  const selected = options.find((t) => t.id === value);

  return (
    <div className="flex flex-col gap-3">
      {selected ? (
        <NationalTeamHeroBanner
          team={{ id: selected.id, name: selected.name, logoUrl: selected.crestUrl }}
          subtitle={`Cuota ${formatOdds(selected.marketOdds)}`}
          onClear={disabled ? undefined : () => onChange("")}
        />
      ) : (
        <TournamentTeamPickerSelect
          name={selectName}
          teams={options}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}

      {!disabled && (
        <NationalTeamPickGrid
          options={options.map((t) => ({
            id: t.id,
            name: t.name,
            crestUrl: t.crestUrl,
            marketOdds: t.marketOdds,
          }))}
          value={value}
          onChange={onChange}
          disabled={disabled}
          formatOdds={formatOdds}
        />
      )}
    </div>
  );
}
