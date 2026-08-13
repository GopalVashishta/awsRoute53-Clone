import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import "@/styles/globals.css";
import "@/styles/aws-theme.css";

export const metadata: Metadata = {
  title: "Route 53 Clone",
  description: "AWS Route53 Clone",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NotificationProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
