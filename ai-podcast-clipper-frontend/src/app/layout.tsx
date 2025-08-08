import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "~/components/ui/sonner";
import { ThemeProvider } from "~/components/theme-provider";

export const metadata: Metadata = {
  title: "AI Podcast Clipper - Transform Full Podcasts into Viral Clips",
  description:
    "AI-powered podcast clipper that transforms full podcasts into viral short-form clips ready for YouTube Shorts, TikTok, and social media.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body className="from-background via-background to-muted min-h-screen bg-gradient-to-br antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <div className="relative min-h-screen">
            {/* Enhanced background decorative elements */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
              <div className="bg-gradient-primary animate-peaceful-float absolute -top-40 -right-40 h-80 w-80 rounded-full opacity-15 blur-3xl" />
              <div
                className="bg-gradient-accent animate-peaceful-float absolute -bottom-40 -left-40 h-80 w-80 rounded-full opacity-15 blur-3xl"
                style={{ animationDelay: "3s" }}
              />
              <div
                className="bg-gradient-secondary animate-peaceful-float absolute top-1/2 left-1/2 h-60 w-60 rounded-full opacity-10 blur-3xl"
                style={{ animationDelay: "6s" }}
              />
              {/* Additional subtle gradient overlays */}
              <div className="from-primary/5 to-accent/5 absolute inset-0 bg-gradient-to-br via-transparent" />
            </div>

            <main className="relative z-10">{children}</main>

            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  color: "var(--card-foreground)",
                },
              }}
            />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
