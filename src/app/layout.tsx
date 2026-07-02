import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "./AppProviders";
import { Sidebar } from "../components/layout/Sidebar";
import { Topbar } from "../components/layout/Topbar";
import { CommandPalette } from "../components/common/CommandPalette";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meridian - Workforce Operations & Project Management Dashboard",
  description: "Enterprise operations and workforce analytics hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="light dark" />
        <script
          id="theme-initializer"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storedTheme = localStorage.getItem('theme');
                if (storedTheme) {
                  document.documentElement.setAttribute('data-theme', storedTheme);
                } else {
                  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  document.documentElement.setAttribute('data-theme', systemDark ? 'dark' : 'light');
                }
                const storedAccent = localStorage.getItem('meridian_accent');
                if (storedAccent) {
                  document.documentElement.setAttribute('data-accent', storedAccent);
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full bg-canvas text-text-primary flex flex-col md:flex-row m-0 p-0">
        <AppProviders>
          <Sidebar />

          <div className="flex-1 flex flex-col min-h-screen md:pl-[224px] bg-canvas transition-colors duration-200">
            <Topbar />
            
            <main className="flex-1">
              {children}
            </main>
          </div>
          <CommandPalette />
        </AppProviders>
      </body>
    </html>
  );
}
