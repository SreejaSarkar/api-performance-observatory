import "./globals.css";
import "@fontsource/inter";
import AppShell from "@/components/layout/AppShell";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppShell>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background:
                  "#0f172a",
                color:
                  "#fff",
                border:
                  "1px solid #334155",
              },
            }}
          />
        </AppShell>
      </body>
    </html>
  );
}