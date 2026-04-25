import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { GridBackground } from "@/components/ui/grid-background";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-context";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  // ...
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${outfit.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          <GridBackground>
            {children}
          </GridBackground>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}


