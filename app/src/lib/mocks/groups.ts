import type { Group } from "@/types/domain";

export const MOCK_GROUPS: Group[] = [
  {
    id: "group_amigos",
    name: "Los del finde",
    inviteCode: "FINDE26",
    ownerId: "user_clara",
    memberIds: ["user_clara", "user_marina", "user_pablo", "user_lucia"],
    createdAt: "2026-05-10T10:00:00.000Z",
  },
  {
    id: "group_master",
    name: "Máster CI2",
    inviteCode: "CI2LAB",
    ownerId: "user_diego",
    memberIds: ["user_clara", "user_diego", "user_pablo"],
    createdAt: "2026-05-12T10:00:00.000Z",
  },
];
