"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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

const MAX_EDGE = 512;
const JPEG_QUALITY = 0.8;

function isHeicFile(file: File): boolean {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return (
    type === "image/heic" ||
    type === "image/heif" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
}

function drawBitmapToJpegFile(bitmap: ImageBitmap): Promise<File> {
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo procesar la imagen");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("No se pudo comprimir la imagen"));
          return;
        }
        resolve(new File([blob], "avatar.jpg", { type: "image/jpeg" }));
      },
      "image/jpeg",
      JPEG_QUALITY,
    );
  });
}

async function compressWithImageBitmap(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file, {
    resizeWidth: MAX_EDGE,
    resizeHeight: MAX_EDGE,
    resizeQuality: "high",
  });
  return drawBitmapToJpegFile(bitmap);
}

async function compressWithCanvas(file: File): Promise<File> {
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

  const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo procesar la imagen");
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/jpeg", JPEG_QUALITY);
  });
  if (!blob) throw new Error("No se pudo comprimir la imagen");

  return new File([blob], "avatar.jpg", { type: "image/jpeg" });
}

async function compressAvatarFile(file: File): Promise<File> {
  if (isHeicFile(file) && typeof createImageBitmap !== "function") {
    throw new Error(
      "Formato HEIC no compatible en este navegador. En iPhone: Ajustes → Cámara → Formatos → «Más compatible», o elige una foto JPG de la galería.",
    );
  }

  if (typeof createImageBitmap === "function") {
    try {
      return await compressWithImageBitmap(file);
    } catch {
      // Safari antiguo u otros fallos: probamos canvas
    }
  }

  return compressWithCanvas(file);
}

function buildProfileFormData(
  form: HTMLFormElement,
  avatarFile?: File,
): FormData {
  const data = new FormData();
  const national = form.elements.namedItem("supportedNationalTeamId");
  if (national instanceof HTMLSelectElement) {
    data.set("supportedNationalTeamId", national.value);
  }

  const team1 = form.elements.namedItem("supportedTeamId1");
  if (team1 instanceof HTMLSelectElement) {
    data.set("supportedTeamId1", team1.value);
  }

  const team2 = form.elements.namedItem("supportedTeamId2");
  if (team2 instanceof HTMLSelectElement) {
    data.set("supportedTeamId2", team2.value);
  }

  if (avatarFile && avatarFile.size > 0) {
    data.set("avatarFile", avatarFile, "avatar.jpg");
  }

  return data;
}

export function ProfileEditForm({
  supportedNationalTeamId,
  supportedTeamIds,
  teams,
  nationalTeams,
}: ProfileEditFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const form = event.currentTarget;
    const avatarInput = form.querySelector<HTMLInputElement>('input[name="avatarFile"]');
    const file = avatarInput?.files?.[0];

    let avatarFile: File | undefined;
    if (file && file.size > 0) {
      try {
        avatarFile = await compressAvatarFile(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al procesar la imagen");
        return;
      }
    }

    const formData = buildProfileFormData(form, avatarFile);

    startTransition(() => {
      void saveProfileAction(formData).then((result) => {
        if ("error" in result) {
          setError(result.error);
          return;
        }
        setSuccess("Perfil guardado correctamente");
        if (avatarInput) avatarInput.value = "";
        router.refresh();
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
          accept="image/jpeg,image/png,image/webp,image/*"
          className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-base outline-none focus:border-[var(--brand)]"
        />
        <span className="text-xs text-[var(--muted)]">
          JPG o PNG recomendado. En móvil se redimensiona antes de enviar. Si falla en iPhone, activa
          «Más compatible» en Ajustes → Cámara.
        </span>
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Selección favorita</span>
        <select
          name="supportedNationalTeamId"
          defaultValue={supportedNationalTeamId ?? ""}
          className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-base outline-none focus:border-[var(--brand)]"
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

      {success && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="min-h-11 rounded-xl bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-strong)] disabled:opacity-60"
      >
        {isPending ? "Guardando…" : "Guardar perfil"}
      </button>
    </form>
  );
}
