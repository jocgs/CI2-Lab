import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppBackground, type AppBackgroundId } from "@/components/AppBackground";
import { Header } from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Porrify · Porras con amigos",
  description:
    "Crea grupos, haz porras de fútbol con amigos y compite por el ranking. Porrify · CI2 Lab.",
};

/** Fondos: original | futbol | futbol-pintado | futbol-rayas */
const APP_BACKGROUND = (process.env.NEXT_PUBLIC_APP_BACKGROUND ??
  "original") as AppBackgroundId;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const isLoginPage = pathname === "/login";

  return (
    <html
      lang="es"
      data-app-bg={APP_BACKGROUND}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Anti-flash: aplica el tema antes del primer render */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('porrify-theme');var d=document.documentElement;if(t==='dark'){d.classList.add('dark')}else if(t==='light'){d.classList.add('light')}else if(window.matchMedia('(prefers-color-scheme: dark)').matches){d.classList.add('dark')}})();`,
          }}
        />
      </head>
      <body className="relative min-h-full flex flex-col">
        <AppBackground variant={APP_BACKGROUND} />
        {!isLoginPage && (
          <div className="relative z-10">
            <Header />
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
            Porrify · CI2 Lab · {new Date().getFullYear()}
          </footer>
        )}
      </body>
    </html>
  );
}
