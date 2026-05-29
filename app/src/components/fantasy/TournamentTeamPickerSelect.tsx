"use client";

import type { TournamentTeam } from "@/types/picks";
import { NationalTeamPickerSelect } from "@/components/fantasy/NationalTeamPickerSelect";
import type { NationalTeamCrestTeam } from "@/components/fantasy/NationalTeamCrest";

function toPickerTeam(team: TournamentTeam): NationalTeamCrestTeam {
  return {
    id: team.id,
    name: team.name,
    logoUrl: team.crestUrl,
  };
}

interface TournamentTeamPickerSelectProps {
  name: string;
  teams: TournamentTeam[];
  value?: string;
  defaultValue?: string;
  onChange?: (teamId: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function TournamentTeamPickerSelect({
  teams,
  ...props
}: TournamentTeamPickerSelectProps) {
  return (
    <NationalTeamPickerSelect
      {...props}
      teams={teams.map(toPickerTeam)}
    />
  );
}
