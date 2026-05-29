import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { getPlayerById } from "@/lib/fantasy-db";
import { resolvePlayerPhotoSourceUrl } from "@/lib/player-photo-resolver";

export const runtime = "nodejs";

const CACHE_DIR = path.join(process.cwd(), "public", "imagenes", "players");

function cacheFilePath(playerId: string): string {
  const safe = playerId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return path.join(CACHE_DIR, `${safe}.jpg`);
}

function contentTypeFor(buffer: Buffer): string {
  if (buffer[0] === 0x89 && buffer[1] === 0x50) return "image/png";
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return "image/jpeg";
  if (buffer[0] === 0x47 && buffer[1] === 0x49) return "image/gif";
  if (buffer[0] === 0x52 && buffer[1] === 0x49) return "image/webp";
  return "image/jpeg";
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ playerId: string }> },
) {
  const { playerId } = await context.params;
  const player = await getPlayerById(playerId);
  if (!player) {
    return new Response(null, { status: 404 });
  }

  const cachedPath = cacheFilePath(playerId);

  try {
    const cached = await readFile(cachedPath);
    return new Response(cached, {
      headers: {
        "Content-Type": contentTypeFor(cached),
        "Cache-Control": "public, max-age=604800, immutable",
      },
    });
  } catch {
    /* no cache yet */
  }

  const sourceUrl = await resolvePlayerPhotoSourceUrl(player);
  if (!sourceUrl) {
    return new Response(null, { status: 404 });
  }

  try {
    const upstream = await fetch(sourceUrl, {
      headers: { Accept: "image/*" },
      next: { revalidate: 60 * 60 * 24 * 7 },
    });
    if (!upstream.ok) {
      return new Response(null, { status: 404 });
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());
    if (buffer.length < 200) {
      return new Response(null, { status: 404 });
    }

    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(cachedPath, buffer);

    const contentType =
      upstream.headers.get("content-type")?.split(";")[0]?.trim() ||
      contentTypeFor(buffer);

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=604800, immutable",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
