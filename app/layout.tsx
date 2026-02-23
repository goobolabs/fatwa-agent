import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fatwa Agent — Su'aalaha Ramadaanka",
  description:
    "Nidaam AI ah oo ka jawaaba su'aalaha Fiqhiga Ramadaanka, ku salaysan xogta culimada Soomaaliyeed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="so" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
