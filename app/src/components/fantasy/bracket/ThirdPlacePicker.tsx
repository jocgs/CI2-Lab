"use client";

import type { GroupStandings } from "@/types/bracket-prediction";
import { TeamCrestButton } from "@/components/fantasy/bracket/TeamCrestButton";
import { getThirdPlaceCandidates } from "@/lib/world-cup-bracket";
import { lookupThirdPlaceSlots } from "@/lib/world-cup-third-place-combinations";
import { clsx } from "@/lib/utils";

interface ThirdPlacePickerProps {
  standings: GroupStandings;
  selectedGroups: string[];
  onChange: (groups: string[]) => void;
  disabled?: boolean;
}

export function ThirdPlacePicker({
  standings,
  selectedGroups,
  onChange,
  disabled = false,
}: ThirdPlacePickerProps) {
  const candidates = getThirdPlaceCandidates(standings);
  const isValidCombo = selectedGroups.length === 8 && lookupThirdPlaceSlots(selectedGroups) !== null;

  function toggleGroup(group: string) {
    if (disabled) return;
    if (selectedGroups.includes(group)) {
      onChange(selectedGroups.filter((g) => g !== group));
      return;
    }
    if (selectedGroups.length >= 8) return;
    onChange([...selectedGroups, group]);
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div>
        <h2 className="text-lg font-semibold">Mejores terceros</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Solo 8 de los 12 terceros clasificados pasan a dieciseisavos. Elige cuáles lo logran
          pulsando los escudos (exactamente 8).
        </p>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className={clsx("font-medium", selectedGroups.length === 8 ? "text-emerald-600" : "text-[var(--muted)]")}>
          {selectedGroups.length}/8 seleccionados
        </span>
        {selectedGroups.length === 8 && !isValidCombo && (
          <span className="text-xs text-amber-700">Combinación no válida — prueba otra selección</span>
        )}
        {isValidCombo && <span className="text-xs text-emerald-600">Cuadro listo para eliminatorias</span>}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {candidates.map(({ group, team }) => {
          const isSelected = selectedGroups.includes(group);
          return (
            <div key={group} className="flex flex-col items-center gap-1.5">
              <TeamCrestButton
                teamId={team.id}
                teamName={team.name}
                crestUrl={team.crestUrl}
                selected={isSelected}
                disabled={disabled || (!isSelected && selectedGroups.length >= 8)}
                badge={isSelected ? "✓" : `3º ${group}`}
                size="md"
                onClick={() => toggleGroup(group)}
              />
              <span className="max-w-full truncate text-center text-[10px] font-medium">
                {team.name}
              </span>
              <span className="text-[9px] text-[var(--muted)]">Grupo {group}</span>
            </div>
          );
        })}
      </div>

      {selectedGroups.length > 0 && !disabled && (
        <button
          type="button"
          onClick={() => onChange([])}
          className="self-start text-xs text-[var(--muted)] hover:text-[var(--fg)]"
        >
          Reiniciar selección
        </button>
      )}
    </section>
  );
}
