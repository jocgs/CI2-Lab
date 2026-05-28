import { NextRequest, NextResponse } from "next/server";
import { createSession, registerUser, destroySession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, password, displayName } = body as {
      action?: string;
      email?: string;
      password?: string;
      displayName?: string;
    };

    if (!email || !password) {
      return NextResponse.json({ error: "Faltan credenciales" }, { status: 400 });
    }

    if (action === "register") {
      if (!displayName) {
        return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
      }
      const uid = await registerUser({ email, displayName, password });
      return NextResponse.json({ ok: true, uid });
    }

    const uid = await createSession(email, password);
    return NextResponse.json({ ok: true, uid });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al iniciar sesión";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function DELETE() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
