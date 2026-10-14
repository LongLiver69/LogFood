import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "LogFood - Quản Lý Thực Đơn Giảm Cân",
  description: "Hệ thống quản lý thực đơn tự chọn các món ăn theo chế độ giảm cân 1000Kcal và 1200Kcal. Theo dõi dinh dưỡng, định lượng và hướng dẫn nấu ăn.",
  keywords: "thực đơn giảm cân, 1000kcal, 1200kcal, log food, quản lý dinh dưỡng",
  openGraph: {
    title: "LogFood - Quản Lý Thực Đơn Giảm Cân",
    description: "Hệ thống quản lý thực đơn tự chọn theo chế độ giảm cân",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
