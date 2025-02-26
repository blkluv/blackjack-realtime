import { Providers } from "@/components/providers";
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme";
import { Inter } from "next/font/google";
import Sound from "@/components/home/Utils/sound";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JStack App",
  description: "Created using JStack",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" forcedTheme="dark">
          <Providers>
            {children}
            <Sound />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
