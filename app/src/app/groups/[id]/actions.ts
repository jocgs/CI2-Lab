"use server";

import { adminDb } from "@/lib/firebase-admin";
import { getCurrentUser } from "@/lib/db";

export interface ChatMessage {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  text: string;
  createdAt: string;
}

export async function sendMessageAction(groupId: string, text: string): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > 500) return;

  const user = await getCurrentUser();

  const groupSnap = await adminDb.collection("groups").doc(groupId).get();
  if (!groupSnap.exists) throw new Error("Grupo no encontrado");
  const groupData = groupSnap.data() as { memberIds?: string[] };
  if (!groupData.memberIds?.includes(user.id)) {
    throw new Error("No eres miembro de este grupo");
  }

  await adminDb
    .collection("groups")
    .doc(groupId)
    .collection("messages")
    .add({
      userId:      user.id,
      displayName: user.displayName,
      avatarUrl:   user.avatarUrl ?? null,
      text:        trimmed,
      createdAt:   new Date().toISOString(),
    });
}

export async function getMessagesAction(groupId: string): Promise<ChatMessage[]> {
  const snap = await adminDb
    .collection("groups")
    .doc(groupId)
    .collection("messages")
    .orderBy("createdAt", "asc")
    .limitToLast(100)
    .get();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return snap.docs.map((d: any) => ({
    id: d.id,
    ...(d.data() as Omit<ChatMessage, "id">),
  }));
}
