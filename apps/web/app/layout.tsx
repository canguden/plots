import type { Metadata } from "next";
import "./globals.css";
import { ClientProviders } from "../components/ClientProviders";

export const metadata: Metadata = {
  title: "Plots - Privacy-first Analytics",
  description: "Terminal & web analytics that respect privacy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
