import type { User } from "@/types/domain";

/**
 * Lista de usuarios mock. El primero es el "yo" que se asume logueado
 * mientras no haya auth real. Cuando metamos Supabase Auth, esta función
 * la sustituirá un `getServerSession()`.
 */
export const MOCK_USERS: User[] = [
  {
    id: "user_clara",
    username: "clara",
    displayName: "Clara",
    avatarUrl: "https://ui-avatars.com/api/?name=Clara&background=0ea5e9&color=fff&bold=true",
    friendIds: ["user_marina", "user_pablo"],
    supportedNationalTeamId: "spain",
    supportedTeamIds: ["team_fcb"],
    createdAt: "2026-05-01T10:00:00.000Z",
  },
  {
    id: "user_marina",
    username: "marina",
    displayName: "Marina",
    avatarUrl: "https://ui-avatars.com/api/?name=Marina&background=f97316&color=fff&bold=true",
    friendIds: ["user_clara"],
    createdAt: "2026-05-02T10:00:00.000Z",
  },
  {
    id: "user_pablo",
    username: "pablo",
    displayName: "Pablo",
    avatarUrl: "https://ui-avatars.com/api/?name=Pablo&background=22c55e&color=fff&bold=true",
    friendIds: ["user_clara"],
    createdAt: "2026-05-03T10:00:00.000Z",
  },
  {
    id: "user_lucia",
    username: "lucia",
    displayName: "Lucía",
    avatarUrl: "https://ui-avatars.com/api/?name=Luc%C3%ADa&background=ec4899&color=fff&bold=true",
    friendIds: [],
    createdAt: "2026-05-04T10:00:00.000Z",
  },
  {
    id: "user_diego",
    username: "diego",
    displayName: "Diego",
    avatarUrl: "https://ui-avatars.com/api/?name=Diego&background=6366f1&color=fff&bold=true",
    friendIds: [],
    createdAt: "2026-05-05T10:00:00.000Z",
  },
];

export const CURRENT_USER_ID = "user_clara";

export function getCurrentUser(): User {
  const user = MOCK_USERS.find((u) => u.id === CURRENT_USER_ID);
  if (!user) throw new Error("Mock user not found");
  return user;
}
