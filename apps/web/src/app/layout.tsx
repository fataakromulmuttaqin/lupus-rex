import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/providers/wallet-provider";
import { WsProvider } from "@/components/providers/ws-provider";
import { AppShell } from "@/components/layout/app-shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lupus Rex",
  description: "Solana MEV & Liquidity Hub",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}>
      <body className="min-h-full bg-zinc-950 text-zinc-50">
        <WalletProvider>
          <WsProvider>
            <AppShell>{children}</AppShell>
          </WsProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
