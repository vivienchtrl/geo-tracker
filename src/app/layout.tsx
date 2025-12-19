import type { Metadata } from "next";
import { Inter, Figtree } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

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
      </body>
    </html>
  );
}