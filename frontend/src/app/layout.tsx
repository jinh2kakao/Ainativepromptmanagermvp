import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import { Toaster } from "sonner";
import { ClientLayout } from '@/components/layouts/ClientLayout';
import { AlertProvider } from "@/components/providers/AlertProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Prompt Manager",
  description: "Manage your AI prompts efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {/* [추가] QueryProvider로 children을 감싸줍니다. */}
        <QueryProvider>
          <AlertProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
            <Toaster />
          </AlertProvider>
        </QueryProvider>
      </body>
    </html>
  );
}