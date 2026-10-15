import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "LogFood - Quản Lý Chế Độ Dinh Dưỡng",
  description: "Hệ thống quản lý chế độ dinh dưỡng tự chọn các món ăn theo mức 1000Kcal và 1200Kcal. Theo dõi chỉ số BMI, định lượng thực phẩm (g sống & g chín) và hướng dẫn nấu ăn.",
  keywords: "quản lý chế độ dinh dưỡng, dinh dưỡng, 1000kcal, 1200kcal, log food, theo dõi bmi, tính bmi",
  openGraph: {
    title: "LogFood - Quản Lý Chế Độ Dinh Dưỡng",
    description: "Hệ thống quản lý chế độ dinh dưỡng tự chọn theo ngày và tuần",
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
