import "./globals.css";
import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Rundown App"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl">
      <body className="min-h-screen bg-white text-zinc-900">
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col">
          <main className="flex-1 px-4 py-10">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
