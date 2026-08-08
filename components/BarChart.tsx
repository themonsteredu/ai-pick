/**
 * 교실 뒤에서도 보이는 큰 막대그래프.
 * 교사 화면에서 반 전체가 무엇을 골랐는지 보여준다.
 */

export interface BarItem {
  key: string;
  label: string;
  count: number;
  /** 막대 색 (Tailwind 클래스). 없으면 회색 */
  bar?: string;
}

export function BarChart({
  items,
  emptyText = "아직 아무도 답하지 않았습니다.",
}: {
  items: BarItem[];
  emptyText?: string;
}) {
  const total = items.reduce((sum, item) => sum + item.count, 0);

  if (total === 0) {
    return (
      <p className="rounded-2xl bg-slate-50 px-6 py-10 text-center text-xl font-bold text-slate-400">
        {emptyText}
      </p>
    );
  }

  const max = Math.max(...items.map((item) => item.count));

  return (
    <ul className="space-y-4">
      {items.map((item) => {
        const percent = Math.round((item.count / total) * 100);
        // 가장 많이 고른 항목이 한눈에 보이도록 최댓값 기준으로 길이를 잡는다
        const width = max === 0 ? 0 : Math.round((item.count / max) * 100);

        return (
          <li key={item.key}>
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span className="text-xl font-black">{item.label}</span>
              <span className="shrink-0 text-xl font-black tabular-nums text-slate-500">
                {item.count}명 · {percent}%
              </span>
            </div>
            <div className="h-10 w-full overflow-hidden rounded-xl bg-slate-100">
              <div
                className={`h-full rounded-xl transition-all duration-500 ${
                  item.bar ?? "bg-slate-400"
                }`}
                style={{ width: `${width}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
