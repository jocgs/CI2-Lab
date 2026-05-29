"use client";

import { useEffect, useRef, useState } from "react";
import {
  NationalTeamCrest,
  type NationalTeamCrestTeam,
} from "@/components/fantasy/NationalTeamCrest";

interface NationalTeamPickerSelectProps {
  name: string;
  teams: NationalTeamCrestTeam[];
  defaultValue?: string;
  value?: string;
  onChange?: (teamId: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function NationalTeamPickerSelect({
  name,
  teams,
  defaultValue = "",
  value,
  onChange,
  placeholder = "Sin selección",
  disabled = false,
}: NationalTeamPickerSelectProps) {
  const [internal, setInternal] = useState(defaultValue);
  const selected = value !== undefined ? value : internal;

  useEffect(() => {
    if (value === undefined) {
      setInternal(defaultValue);
    }
  }, [defaultValue, value]);

  function pick(teamId: string) {
    if (value === undefined) setInternal(teamId);
    onChange?.(teamId);
  }
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedTeam = teams.find((t) => t.id === selected);

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
      <input type="hidden" name={name} value={selected} />

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-left text-sm outline-none transition-colors hover:border-[var(--brand)] focus:border-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {selectedTeam ? (
          <>
            <NationalTeamCrest team={selectedTeam} size={22} />
            <span className="flex-1 truncate">{selectedTeam.name}</span>
          </>
        ) : (
          <span className="flex-1 text-[var(--muted)]">{placeholder}</span>
        )}
        <span className="text-xs text-[var(--muted)]">{open ? "▲" : "▼"}</span>
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg">
          <div className="max-h-56 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                pick("");
                setOpen(false);
              }}
              className={
                "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-[var(--brand-soft)] " +
                (!selected ? "bg-[var(--brand-soft)] text-[var(--brand-strong)]" : "text-[var(--muted)]")
              }
            >
              {placeholder}
            </button>

            {teams.map((team) => (
              <button
                key={team.id}
                type="button"
                onClick={() => {
                  pick(team.id);
                  setOpen(false);
                }}
                className={
                  "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-[var(--brand-soft)] " +
                  (selected === team.id
                    ? "bg-[var(--brand-soft)] font-medium text-[var(--brand-strong)]"
                    : "")
                }
              >
                <NationalTeamCrest team={team} size={22} />
                <span className="truncate">{team.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
