import { ProfileBackNav } from "@/components/profile/ProfileBackNav";
import { FriendsList } from "@/components/profile/FriendsList";
import AddFriendForm from "@/components/AddFriendForm";
import { getProfileUserContext } from "@/lib/profile-data";
import { Card, SectionTitle } from "@/components/ui";

export default async function ProfileFriendsPage() {
  const ctx = await getProfileUserContext();

  return (
    <div className="flex flex-col gap-6">
      <ProfileBackNav
        title="Amigos"
        subtitle={`${ctx.friends.length} ${ctx.friends.length === 1 ? "amigo" : "amigos"}`}
      />

      <Card className="p-5">
        <SectionTitle title="Añadir amigo" subtitle="Busca por nombre de usuario" />
        <AddFriendForm redirectTo="/profile/friends" />
      </Card>

      <FriendsList friends={ctx.friends} />
    </div>
  );
}
