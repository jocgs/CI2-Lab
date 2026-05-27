import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { USE_MOCKS } from "./lib/runtime";

const SESSION_COOKIE = "porrify-session";
const PUBLIC_PATHS = ["/login", "/api/auth/session", "/api/sync-matches", "/api/resolve-bets", "/api/sync-status"];

export function proxy(req: NextRequest) {
  // Modo mock: sin autenticación, acceso libre a toda la app
  if (USE_MOCKS) {
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const uid = req.cookies.get(SESSION_COOKIE)?.value;
  if (!uid) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
