import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { Toaster } from "react-hot-toast";
import {
  Plus_Jakarta_Sans,
  Space_Grotesk,
} from "next/font/google";

const bodyFont = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${displayFont.variable} antialiased`}>
        <AppShell>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background:
                  "#0b1328",
                color:
                  "#fff",
                border:
                  "1px solid rgba(148, 163, 184, 0.28)",
                borderRadius:
                  "18px",
                boxShadow:
                  "0 24px 60px rgba(2, 6, 23, 0.45)",
              },
            }}
          />
        </AppShell>
      </body>
    </html>
  );
}