import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { ClerkProvider } from "@clerk/nextjs";

import TopBar from "@/components/shared/TopBar";
import LeftBar from "@/components/shared/LeftBar";
import RightBar from "@/components/shared/RightBar";
import BottomBar from "@/components/shared/BottomBar";
import { Toaster } from "@/components/ui/toaster";
import { SpeedInsights } from "@vercel/speed-insights/next";
import NavigateBack from "@/components/shared/NavigateBack";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dhaage",
  description: "Dhaage | Share your thoughts.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <TopBar />
          <main className="flex flex-row">
            <LeftBar />

            <section className="main-container">
              <SpeedInsights />
              <div className="w-full max-w-4xl">
                <NavigateBack />
                {children}
              </div>
            </section>

            <RightBar />
          </main>
          <BottomBar />
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
