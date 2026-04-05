import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WILROP Colombia Travel",
  description:
    "Descubre la magia de Colombia. Paquetes turísticos a los mejores destinos del país.",
  keywords: [
    "WILROP",
    "Colombia",
    "viajes",
    "turismo",
    "Cartagena",
    "Medellín",
    "San Andrés",
    "Eje Cafetero",
    "Amazonía",
    "Bogotá",
    "paquetes turísticos",
  ],
  authors: [{ name: "WILROP Colombia Travel" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "WILROP Colombia Travel",
    description:
      "Descubre la magia de Colombia. Paquetes turísticos a los mejores destinos del país.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WILROP Colombia Travel",
    description:
      "Descubre la magia de Colombia. Paquetes turísticos a los mejores destinos del país.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
