import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { USE_MOCKS } from "./lib/runtime";

const SESSION_COOKIE = "tikitaka-session";
const PUBLIC_PATHS = [
  "/login",
  "/api/auth/session",
  "/api/sync-matches",
  "/api/resolve-bets",
  "/api/sync-status",
  "/api/player-photo",
];

export function proxy(req: NextRequest) {
  // Modo mock: sin autenticación, acceso libre a toda la app
  if (USE_MOCKS) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-pathname", req.nextUrl.pathname);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const { pathname } = req.nextUrl;

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const raw = req.cookies.get(SESSION_COOKIE)?.value;
  // Las cookies firmadas siempre tienen la forma "userId.hmacHex".
  // Un valor sin punto es una cookie antigua (sin firma) o forjada → redirigir.
  if (!raw || !raw.includes(".")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|avatares/|backgrounds/|bolines/|imagenes/|.*\\.(?:png|jpe?g|gif|webp|svg|ico)$).*)",
  ],
};
