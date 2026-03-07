import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Finnish Learning Workspace",
  description: "Capture, organize, review and quiz your Finnish learning items."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="mx-auto min-h-screen max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
