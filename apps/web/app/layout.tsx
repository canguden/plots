import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ClientProviders } from "@/components/ClientProviders";

export const metadata: Metadata = {
  title: "Plots - Privacy-first Analytics",
  description: "Terminal & web analytics that respect privacy",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Script
          src="https://plots.sh/plots.js"
          data-project={process.env.NEXT_PUBLIC_PLOTS_PROJECT_ID}
          strategy="afterInteractive"
        />
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
