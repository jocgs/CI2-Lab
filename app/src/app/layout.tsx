import type { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppBackground, type AppBackgroundId } from "@/components/AppBackground";
import { Header } from "@/components/Header";
import { ProfileThemeRoot, resolveProfileThemeId } from "@/components/ProfileThemeRoot";
import { getSessionUser } from "@/lib/session";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TikiTaka · Porras con amigos",
  description:
    "Crea grupos, haz porras de fútbol con amigos y compite por el ranking. TikiTaka · CI2 Lab.",
  manifest: "/manifest.webmanifest",
  applicationName: "TikiTaka",
  appleWebApp: {
    capable: true,
    title: "TikiTaka",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c1510",
};

/** Fondos: original | futbol | futbol-pintado | futbol-rayas */
const APP_BACKGROUND = (process.env.NEXT_PUBLIC_APP_BACKGROUND ??
  "original") as AppBackgroundId;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [headerStore, cookieStore] = await Promise.all([headers(), cookies()]);
  const pathname = headerStore.get("x-pathname") ?? "";
  const isLoginPage = pathname === "/login";

  // Leer tema desde cookie para aplicar la clase correcta en SSR (evita flash)
  const themeCookie = cookieStore.get("tikitaka-theme")?.value;
  const themeClass = themeCookie === "dark" ? "dark" : themeCookie === "light" ? "light" : "";

  const sessionUser = await getSessionUser();
  const profileThemeCookie = cookieStore.get("tikitaka-profile-theme")?.value;
  const profileThemeId = resolveProfileThemeId(
    sessionUser?.profileThemeId,
    profileThemeCookie,
  );

  return (
    <html
      lang="es"
      data-app-bg={APP_BACKGROUND}
      data-profile-theme={profileThemeId}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased${themeClass ? ` ${themeClass}` : ""}`}
      suppressHydrationWarning
    >
      <body className="relative min-h-full flex flex-col">
        <ProfileThemeRoot themeId={profileThemeId} />
        <AppBackground variant={APP_BACKGROUND} />
        {!isLoginPage && (
          <div className="relative z-10">
            <Header initialTheme={themeCookie === "dark" ? "dark" : "light"} />
          </div>
        )}
        <main
          className={
            (isLoginPage
              ? "relative z-10 flex flex-1 flex-col"
              : "relative z-10 mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24 sm:px-6 sm:pb-6")
          }
        >
          {children}
        </main>
        {!isLoginPage && (
          <footer className="relative z-10 mx-auto w-full max-w-5xl px-4 py-6 text-center text-xs text-[var(--muted)] sm:px-6">
            TikiTaka · CI2 Lab · {new Date().getFullYear()}
          </footer>
        )}
      </body>
    </html>
  );
}
