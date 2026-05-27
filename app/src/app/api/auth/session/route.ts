import { NextRequest, NextResponse } from "next/server";
import { createSession, destroySession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: "idToken requerido" }, { status: 400 });
    }
    await createSession(idToken);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error creando sesión:", err);
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}

export async function DELETE() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
