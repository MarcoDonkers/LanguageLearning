import type { Metadata } from "next";
import { Inter, Quicksand } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
});

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: '--font-quicksand',
});

export const metadata: Metadata = {
  title: "Dutch Learning App",
  description: "A cute language learning app for Dutch vocabulary",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${quicksand.variable} font-sans bg-primary-50 antialiased`}>
        {children}
      </body>
    </html>
  );
}
