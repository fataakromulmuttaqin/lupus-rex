import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/providers/wallet-provider";
import { WsProvider } from "@/components/providers/ws-provider";
import { AppShell } from "@/components/layout/app-shell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lupus Rex — Quant Hub",
  description: "Solana MEV & Liquidity Hub",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-surface-base text-text-primary">
        <WalletProvider>
          <WsProvider>
            <AppShell>{children}</AppShell>
          </WsProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
