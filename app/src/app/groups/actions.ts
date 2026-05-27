"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserId, createGroup, joinGroup } from "@/lib/db";

export async function createGroupAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("El grupo necesita un nombre");

  const userId = await getCurrentUserId();
  if (!userId) throw new Error("No autenticado");

  const group = await createGroup({ name, ownerId: userId });

  revalidatePath("/groups");
  redirect(`/groups/${group.id}`);
}

export async function joinGroupAction(formData: FormData) {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!code) throw new Error("Introduce un código de invitación");

  const userId = await getCurrentUserId();
  if (!userId) throw new Error("No autenticado");

  const group = await joinGroup(code, userId);
  if (!group) throw new Error("Código no válido");

  revalidatePath("/groups");
  revalidatePath(`/groups/${group.id}`);
  redirect(`/groups/${group.id}`);
}
