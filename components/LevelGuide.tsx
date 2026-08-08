import { LEVELS } from "@/lib/levels";
import { AppImage } from "./AppImage";

/** 4단계를 한눈에 보여주는 카드. 여러 화면에서 반복해서 쓴다. */
export function LevelGuide({ compact = false }: { compact?: boolean }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {LEVELS.map((level) => (
        <div
          key={level.id}
          className={`rounded-2xl border-2 ${level.color.border} ${level.color.soft} p-4`}
        >
          <div className="flex items-center gap-3">
            <AppImage
              name={level.image}
              alt={`${level.label} 아이콘`}
              className="h-12 w-12 shrink-0 bg-white/70"
              rounded="rounded-xl"
            />
            <div className="min-w-0">
              <p className="text-lg font-black leading-tight">{level.label}</p>
              <p className="text-sm font-bold opacity-80">
                {level.credit === 0 ? "0 크레딧" : `${level.credit} 크레딧`}
              </p>
            </div>
          </div>

          <p className="mt-3 text-base font-semibold leading-snug">{level.summary}</p>

          {!compact && (
            <ul className="mt-2 space-y-1 text-sm leading-snug opacity-90">
              {level.examples.map((example) => (
                <li key={example}>· {example}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
