"use client";

import { useState, useTransition } from "react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { saveProfileAction } from "@/app/profile/actions";
import { TeamPickerSelect } from "@/components/TeamPickerSelect";

interface Team {
  id: string;
  name: string;
  shortName: string;
  logoUrl?: string;
}

interface NationalTeam {
  id: string;
  name: string;
  flagUrl?: string;
}

interface ProfileEditFormProps {
  supportedNationalTeamId: string | null;
  supportedTeamIds: string[];
  teams: Team[];
  nationalTeams: NationalTeam[];
}

async function compressAvatarFile(file: File): Promise<File> {
  const maxEdge = 512;
  const quality = 0.82;

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("No se pudo procesar la imagen"));
    image.src = dataUrl;
  });

  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo procesar la imagen");
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/jpeg", quality);
  });
  if (!blob) throw new Error("No se pudo comprimir la imagen");

  return new File([blob], "avatar.jpg", { type: "image/jpeg" });
}

export function ProfileEditForm({
  supportedNationalTeamId,
  supportedTeamIds,
  teams,
  nationalTeams,
}: ProfileEditFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const avatarInput = form.querySelector<HTMLInputElement>('input[name="avatarFile"]');
    const file = avatarInput?.files?.[0];

    if (file && file.size > 0) {
      try {
        const compressed = await compressAvatarFile(file);
        formData.set("avatarFile", compressed);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al procesar la imagen");
        return;
      }
    }

    startTransition(() => {
      void saveProfileAction(formData).catch((err) => {
        if (isRedirectError(err)) return;
        setError(err instanceof Error ? err.message : "No se pudo guardar el perfil");
      });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Foto de perfil</span>
        <input
          type="file"
          name="avatarFile"
          accept="image/*"
          className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 outline-none focus:border-[var(--brand)]"
        />
        <span className="text-xs text-[var(--muted)]">
          JPG, PNG u otra imagen. Se redimensiona automáticamente antes de guardar.
        </span>
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Selección favorita</span>
        <select
          name="supportedNationalTeamId"
          defaultValue={supportedNationalTeamId ?? ""}
          className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 outline-none focus:border-[var(--brand)]"
        >
          <option value="">Sin selección</option>
          {nationalTeams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.flagUrl ? `${team.flagUrl} ` : ""}
              {team.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Equipo favorito 1</span>
          <TeamPickerSelect
            name="supportedTeamId1"
            teams={teams}
            defaultValue={supportedTeamIds[0] ?? ""}
            placeholder="Sin equipo"
          />
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Equipo favorito 2</span>
          <TeamPickerSelect
            name="supportedTeamId2"
            teams={teams}
            defaultValue={supportedTeamIds[1] ?? ""}
            placeholder="Opcional"
          />
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-strong)] disabled:opacity-60"
      >
        {isPending ? "Guardando…" : "Guardar perfil"}
      </button>
    </form>
  );
}
