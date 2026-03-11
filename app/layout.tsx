import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Connected Compliance — Diligent Prototype",
  description: "Connected Compliance prototype for compliance signal detection and task completion workflow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
