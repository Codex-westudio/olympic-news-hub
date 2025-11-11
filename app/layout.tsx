import type { Metadata } from "next";
import { Manrope, Space_Mono } from "next/font/google";

import "./globals.css";
import { Header } from "@/components/Header";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import { getServerSession } from "@/lib/articlesService";

const manrope = Manrope({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Olympic News Hub",
  description: "Agrégateur d’actus olympiques avec filtres intelligents.",
  metadataBase: new URL(siteUrl),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {
    data: { session },
  } = await getServerSession();

  return (
    <html lang="fr">
      <body className={`${manrope.variable} ${spaceMono.variable} bg-slate-50 antialiased`}>
        <SupabaseProvider initialSession={session}>
          <Header isAuthenticated={Boolean(session)} />
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </SupabaseProvider>
      </body>
    </html>
  );
}
