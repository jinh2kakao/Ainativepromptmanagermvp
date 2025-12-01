import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// [추가] 방금 만든 QueryProvider 임포트
import QueryProvider from "@/components/providers/QueryProvider";

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
    <html lang="en">
      <body className={inter.className}>
        {/* [추가] QueryProvider로 children을 감싸줍니다. */}
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}