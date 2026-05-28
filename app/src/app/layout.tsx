import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
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
      <body className="min-h-full flex flex-col">
        {!isLoginPage && <Header />}
        <main
          className={
            isLoginPage
              ? "flex flex-1 flex-col"
              : "mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6"
          }
        >
          {children}
        </main>
        {!isLoginPage && (
          <footer className="mx-auto w-full max-w-5xl px-4 py-6 text-center text-xs text-[var(--muted)] sm:px-6">
            Porrify · CI2 Lab · {new Date().getFullYear()}
          </footer>
        )}
      </body>
    </html>
  );
}
