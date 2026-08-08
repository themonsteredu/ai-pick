import { LEVELS } from "@/lib/levels";
import { AppImage } from "./AppImage";

/**
 * 4단계 카드.
 * 기본은 짧게(이름 + 크레딧 + 한 줄)만 보여준다.
 * detailed 를 켜면 예시까지 보인다.
 */
export function LevelGuide({ detailed = false }: { detailed?: boolean }) {
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
              alt=""
              className="h-14 w-14 shrink-0 bg-white"
              rounded="rounded-xl"
            />
            <div className="min-w-0">
              <p className="text-lg font-black leading-tight">{level.label}</p>
              <p className="text-sm font-bold opacity-70">{level.credit} 크레딧</p>
            </div>
          </div>

          <p className="mt-3 text-base font-semibold leading-snug">{level.summary}</p>

          {detailed && (
            <ul className="mt-2 space-y-1 text-sm leading-snug opacity-80">
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
