"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface Team {
  id: string;
  name: string;
  shortName: string;
  logoUrl?: string;
}

interface TeamPickerSelectProps {
  name: string;
  teams: Team[];
  defaultValue?: string;
  placeholder?: string;
}

function TeamCrest({ team, size = 24 }: { team: Team; size?: number }) {
  if (team.logoUrl) {
    return (
      <Image
        src={team.logoUrl}
        alt={team.name}
        width={size}
        height={size}
        className="object-contain flex-shrink-0"
        unoptimized
      />
    );
  }
  return (
    <span
      className="flex-shrink-0 rounded-full bg-[var(--border)] flex items-center justify-center text-[10px] font-bold text-[var(--muted)]"
      style={{ width: size, height: size }}
    >
      {team.shortName.slice(0, 2)}
    </span>
  );
}

export function TeamPickerSelect({
  name,
  teams,
  defaultValue = "",
  placeholder = "Sin equipo",
}: TeamPickerSelectProps) {
  const [selected, setSelected] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedTeam = teams.find((t) => t.id === selected);

  useEffect(() => {
    setSelected(defaultValue);
  }, [defaultValue]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Input oculto para el formulario */}
      <input type="hidden" name={name} value={selected} />

      {/* Botón trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)] hover:border-[var(--brand)] transition-colors text-left"
      >
        {selectedTeam ? (
          <>
            <TeamCrest team={selectedTeam} size={22} />
            <span className="flex-1 truncate">{selectedTeam.name}</span>
          </>
        ) : (
          <span className="flex-1 text-[var(--muted)]">{placeholder}</span>
        )}
        <span className="text-[var(--muted)] text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {/* Desplegable */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg overflow-hidden">
          <div className="max-h-56 overflow-y-auto">
            {/* Opción vacía */}
            <button
              type="button"
              onClick={() => { setSelected(""); setOpen(false); }}
              className={
                "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--brand-soft)] transition-colors " +
                (!selected ? "bg-[var(--brand-soft)] text-[var(--brand-strong)]" : "text-[var(--muted)]")
              }
            >
              {placeholder}
            </button>

            {teams.map((team) => (
              <button
                key={team.id}
                type="button"
                onClick={() => { setSelected(team.id); setOpen(false); }}
                className={
                  "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--brand-soft)] transition-colors " +
                  (selected === team.id ? "bg-[var(--brand-soft)] text-[var(--brand-strong)] font-medium" : "")
                }
              >
                <TeamCrest team={team} size={22} />
                <span className="truncate">{team.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
