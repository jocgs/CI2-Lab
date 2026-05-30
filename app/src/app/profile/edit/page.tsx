import { ProfileBackNav } from "@/components/profile/ProfileBackNav";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import { getProfileUserContext } from "@/lib/profile-data";
import { Card } from "@/components/ui";

export default async function ProfileEditPage() {
  const ctx = await getProfileUserContext();

  return (
    <div className="flex flex-col gap-6">
      <ProfileBackNav
        title="Editar perfil"
        subtitle="Foto, color del perfil, selección y equipos de club"
      />
      <Card className="p-6">
        <ProfileEditForm
          profileThemeId={ctx.user.profileThemeId ?? "default"}
          supportedNationalTeamId={ctx.user.supportedNationalTeamId ?? null}
          supportedTeamIds={ctx.supportedTeamIds}
          teams={ctx.teams}
          nationalTeams={ctx.nationalTeams}
        />
      </Card>
    </div>
  );
}
