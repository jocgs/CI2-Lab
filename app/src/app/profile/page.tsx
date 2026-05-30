import Link from "next/link";
import { ProfileHeaderCard } from "@/components/profile/ProfileHeaderCard";
import { ProfileToolbar } from "@/components/profile/ProfileToolbar";
import { getProfileUserContext } from "@/lib/profile-data";
import { getShopAvatarById } from "@/lib/shop-avatars";
import { AchievementsOverview } from "@/components/AchievementsGrid";
import { Card, SectionTitle } from "@/components/ui";

export default async function ProfilePage() {
  const ctx = await getProfileUserContext();
  const activeShopAvatar = ctx.user.activeAvatarId
    ? getShopAvatarById(ctx.user.activeAvatarId)
    : null;

  return (
    <div className="flex flex-col gap-6">
      <ProfileHeaderCard
        displayName={ctx.user.displayName}
        username={ctx.user.username}
        avatarUrl={ctx.user.avatarUrl}
        friendsCount={ctx.friends.length}
        activeShopAvatar={activeShopAvatar ?? null}
        profileThemeId={ctx.user.profileThemeId}
        supportedNationalTeam={ctx.supportedNationalTeam}
        supportedTeams={ctx.supportedTeams}
        stats={ctx.stats}
      />

      <ProfileToolbar pendingRequestsCount={ctx.receivedRequests.length} />

      <Card className="p-6">
        <SectionTitle
          title="Logros"
          subtitle="Pulsa un logro para ver cómo conseguirlo y tu progreso"
        />
        <div className="mt-5">
          <AchievementsOverview achievements={ctx.achievements} />
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <Link
          href="/profile/friends"
          className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-[var(--background)]"
        >
          <div>
            <p className="font-semibold">Amigos</p>
            <p className="text-sm text-[var(--muted)]">
              {ctx.friends.length === 0
                ? "Ver lista y añadir amigos"
                : `${ctx.friends.length} ${ctx.friends.length === 1 ? "amigo" : "amigos"}`}
            </p>
          </div>
          <span className="text-xl text-[var(--muted)]" aria-hidden>
            ›
          </span>
        </Link>
      </Card>
    </div>
  );
}
