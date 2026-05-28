"use server";

import { adminDb } from "@/lib/firebase-admin";
import { getCurrentUser } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function sendMessageAction(groupId: string, text: string) {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > 500) return;

  const user = await getCurrentUser();

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

  revalidatePath(`/groups/${groupId}`);
}
