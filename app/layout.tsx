import type { Metadata } from "next";
import "reactflow/dist/style.css";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "DialogMaker",
  description: "Editor visual de diálogos para NPCs de jogos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-bg-900 text-gray-100 antialiased overflow-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
