import Link from "next/link";
import { AppImage } from "./AppImage";

/** 모든 화면 위쪽에 들어가는 제목 줄 */
export function AppHeader({
  subtitle,
  right,
}: {
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex items-center justify-between gap-4">
      <Link href="/" className="flex items-center gap-3">
        <AppImage
          name="logo.png"
          alt="AI 선택 훈련소 로고"
          className="h-12 w-12 shrink-0"
        />
        <div>
          <p className="text-xl font-black leading-tight sm:text-2xl">AI 선택 훈련소</p>
          {subtitle && (
            <p className="text-sm font-bold text-slate-500 sm:text-base">{subtitle}</p>
          )}
        </div>
      </Link>
      {right}
    </header>
  );
}
