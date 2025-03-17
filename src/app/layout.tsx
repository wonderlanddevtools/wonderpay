import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { SessionProvider } from "@/components/session-provider";

export const metadata: Metadata = {
  title: "WonderPay",
  description: "AP & AR automation platform for music, entertainment, and luxury hospitality",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <SessionProvider>
            {children}
          </SessionProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
