import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Routeboard — Field Service Dispatch",
  description: "A practical field service dispatch board for coordinating jobs and technicians.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
