import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Meeting Time Picker",
  description: "A lightweight scheduling poll for comparing meeting availability.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
