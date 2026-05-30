import Image from "next/image";
import { ProfileActiveShopAvatar, profileHeaderContentClass } from "@/components/ProfileActiveShopAvatar";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { NationalTeamCrest } from "@/components/fantasy/NationalTeamCrest";
import { ProfileBanner, profileStatAccentClass } from "@/components/profile/ProfileBanner";
import { Card } from "@/components/ui";
import {
  profileBannerIconPillClass,
  profileBannerMutedTextClass,
  profileBannerPillClass,
  profileBannerSubtextClass,
} from "@/lib/profile-themes";
import type { ShopAvatar } from "@/lib/shop-avatars";

interface ProfileHeaderCardProps {
  displayName: string;
  username: string;
  avatarUrl?: string | null;
  friendsCount: number;
  activeShopAvatar: ShopAvatar | null;
  profileThemeId?: string | null;
  supportedNationalTeam?: {
    id: string;
    name: string;
    flagUrl?: string;
    logoUrl?: string;
  };
  supportedTeams: { id: string; name: string; shortName: string; logoUrl?: string }[];
  stats: {
    totalPoints: number;
    coins: number;
    wonCount: number;
    resolvedCount: number;
    accuracy: number;
    currentStreak: number;
    bestStreak: number;
  };
}

export function ProfileHeaderCard({
  displayName,
  username,
  avatarUrl,
  friendsCount,
  activeShopAvatar,
  profileThemeId,
  supportedNationalTeam,
  supportedTeams,
  stats,
}: ProfileHeaderCardProps) {
  const pill = profileBannerPillClass(profileThemeId);
  const iconPill = profileBannerIconPillClass(profileThemeId);
  const statAccent = profileStatAccentClass(profileThemeId);

  return (
    <Card className="overflow-hidden border-[var(--border)] bg-[var(--surface)]">
      <ProfileBanner themeId={profileThemeId}>
        {activeShopAvatar && <ProfileActiveShopAvatar avatar={activeShopAvatar} />}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <ProfileAvatar avatarUrl={avatarUrl} displayName={displayName} />
          <div className={profileHeaderContentClass(!!activeShopAvatar)}>
            <p className={`text-xs uppercase tracking-[0.24em] ${profileBannerMutedTextClass(profileThemeId)}`}>
              Perfil
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">{displayName}</h1>
            <p className={`text-sm ${profileBannerSubtextClass(profileThemeId)}`}>@{username}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className={pill}>{friendsCount} amigos</span>
              <div className="flex items-center gap-2">
                {supportedNationalTeam ? (
                  <span title={supportedNationalTeam.name} className={iconPill}>
                    <NationalTeamBadge team={supportedNationalTeam} />
                  </span>
                ) : (
                  <span className={pill}>Sin selección</span>
                )}

                {supportedTeams.length > 0 ? (
                  <div className="flex items-center gap-2">
                    {supportedTeams.map((team) => (
                      <span key={team.id} title={team.name} className={iconPill}>
                        <TeamBadge team={team} />
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className={pill}>Sin equipos favoritos</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </ProfileBanner>
      <div className="grid gap-3 border-t border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-5">
        <Stat label="Puntos totales" value={stats.totalPoints} accentClass={statAccent} accent />
        <Stat label="Monedas" value={`🪙 ${stats.coins}`} />
        <Stat label="Aciertos" value={`${stats.wonCount}/${stats.resolvedCount}`} />
        <Stat label="Precisión" value={`${stats.accuracy}%`} />
        <Stat
          label="Racha actual"
          value={stats.currentStreak}
          subtitle={`Mejor: ${stats.bestStreak}`}
        />
      </div>
    </Card>
  );
}

function Stat({
  label,
  value,
  subtitle,
  accent,
  accentClass,
}: {
  label: string;
  value: number | string;
  subtitle?: string;
  accent?: boolean;
  accentClass?: string;
}) {
  return (
    <Card className={"px-4 py-3 " + (accent ? `${accentClass ?? ""} text-white` : "")}>
      <p
        className={
          "text-xs uppercase tracking-wide " + (accent ? "text-white/80" : "text-[var(--muted)]")
        }
      >
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {subtitle && (
        <p className={"text-xs " + (accent ? "text-white/80" : "text-[var(--muted)]")}>
          {subtitle}
        </p>
      )}
    </Card>
  );
}

function TeamBadge({ team }: { team: { name: string; shortName: string; logoUrl?: string } }) {
  if (team.logoUrl) {
    return (
      <span className="grid h-8 w-8 place-items-center rounded-full bg-white/90 p-1 shadow-sm">
        <Image
          src={team.logoUrl}
          alt={team.name}
          width={24}
          height={24}
          className="h-6 w-6 object-contain"
          unoptimized
        />
      </span>
    );
  }

  return (
    <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-[10px] font-semibold uppercase">
      {team.shortName}
    </span>
  );
}

function NationalTeamBadge({
  team,
}: {
  team: { id: string; name: string; flagUrl?: string; logoUrl?: string };
}) {
  return (
    <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 p-1">
      <NationalTeamCrest team={team} size={24} />
    </span>
  );
}
