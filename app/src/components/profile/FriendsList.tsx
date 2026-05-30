import Link from "next/link";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { EmptyState } from "@/components/ui";

export interface FriendListItem {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
}

export function FriendsList({ friends }: { friends: FriendListItem[] }) {
  if (friends.length === 0) {
    return (
      <EmptyState
        title="Aún no tienes amigos"
        description="Añade a alguien por su usuario para empezar a compararte con él."
      />
    );
  }

  return (
    <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      {friends.map((friend) => (
        <li key={friend.id}>
          <Link
            href={`/users/${friend.username}`}
            className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-[var(--background)]"
          >
            <ProfileAvatar
              avatarUrl={friend.avatarUrl}
              displayName={friend.displayName}
              size="lg"
              zoomable={false}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold leading-tight">{friend.displayName}</p>
              <p className="truncate text-sm text-[var(--muted)]">@{friend.username}</p>
            </div>
            <span className="text-[var(--muted)]" aria-hidden>
              ›
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
