import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 선택 훈련소",
  description:
    "문제에 맞는 도구를 고르고, 좋은 질문을 만들고, 답을 검증하는 힘을 기르는 중학생 AI 리터러시 수업",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // 태블릿 가로 화면 기준. 확대는 막지 않는다.
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-full bg-gradient-to-b from-sky-50 via-slate-50 to-white">
        {children}
      </body>
    </html>
  );
}
