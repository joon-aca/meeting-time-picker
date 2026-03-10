import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Meeting Time Picker",
  description: "Scheduling poll for the ACA board meeting.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
