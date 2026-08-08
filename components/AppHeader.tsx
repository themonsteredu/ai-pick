import Link from "next/link";
import { APP_CATEGORY, APP_NAME } from "@/lib/brand";
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
          alt={`${APP_NAME} 로고`}
          className="h-12 w-12 shrink-0"
        />
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {APP_CATEGORY}
          </p>
          <p className="text-xl font-black leading-tight sm:text-2xl">{APP_NAME}</p>
          {subtitle && (
            <p className="text-sm font-bold text-slate-500 sm:text-base">{subtitle}</p>
          )}
        </div>
      </Link>
      {right}
    </header>
  );
}
