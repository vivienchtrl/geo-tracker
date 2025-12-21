import type { Metadata } from "next";
import { Inter, Figtree } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import Script from "next/script";

const figtree = Figtree({subsets:['latin'],variable:'--font-sans'});
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Geo Tracker",
  description: "Track your AI rankings",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={figtree.variable} suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="h-full relative">
            <main>
              {children}
            </main>
            <Toaster />
          </div>
        </ThemeProvider>

        <Script
          src="https://geo-tracker-teal.vercel.app/tracker.js"
          data-project-id="6699bf7c-b3fb-4853-bdf9-54bebd316a1f"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}