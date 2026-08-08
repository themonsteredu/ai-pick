/**
 * 앱 전체에서 쓰는 "4단계" 정의.
 *
 * ⚠️ 중요 원칙
 *  - 특정 AI 회사 이름, 모델 이름, 요금제 이름은 이 앱 어디에도 넣지 않는다.
 *  - 학생이 보는 표현은 아래 label(표시명)뿐이다.
 */

export type LevelId = "PERSON" | "LIGHT" | "THINK" | "DEEP";

export interface LevelDef {
  id: LevelId;
  /** 학생에게 보이는 이름 */
  label: string;
  /** 크레딧 비용 (예산 챌린지에서 사용) */
  credit: number;
  /** 한 줄 설명 */
  summary: string;
  /** 이런 일에 쓴다 (예시 목록) */
  examples: string[];
  /** /public/images 안의 아이콘 파일명 */
  image: string;
  /** 색 (Tailwind 클래스는 문자열 조합이 안 되므로 미리 전부 적어둔다) */
  color: {
    /** 진한 배경 + 흰 글씨 */
    solid: string;
    /** 연한 배경 + 진한 글씨 */
    soft: string;
    /** 테두리 */
    border: string;
    /** 글씨색 */
    text: string;
    /** 선택됐을 때 링 */
    ring: string;
    /** 막대그래프 채움 */
    bar: string;
  };
}

export const LEVELS: LevelDef[] = [
  {
    id: "PERSON",
    label: "사람 · 직접",
    credit: 0,
    summary: "AI에게 맡기면 안 되는 일",
    examples: [
      "친구·가족의 개인정보가 들어가는 일",
      "친구 관계에 대한 판단",
      "내 진로처럼 내가 정해야 하는 결정",
      "암산으로 되는 간단한 계산",
    ],
    image: "level-person.png",
    color: {
      solid: "bg-slate-500 text-white",
      soft: "bg-slate-100 text-slate-700",
      border: "border-slate-400",
      text: "text-slate-600",
      ring: "ring-slate-400",
      bar: "bg-slate-400",
    },
  },
  {
    id: "LIGHT",
    label: "빠른 AI",
    credit: 1,
    summary: "한 번에 답이 나오는 간단한 일",
    examples: ["단어 뜻 물어보기", "제목 추천받기", "아이디어 여러 개 뽑기"],
    image: "level-light.png",
    color: {
      solid: "bg-lime-600 text-white",
      soft: "bg-lime-50 text-lime-800",
      border: "border-lime-500",
      text: "text-lime-700",
      ring: "ring-lime-500",
      bar: "bg-lime-500",
    },
  },
  {
    id: "THINK",
    label: "생각하는 AI",
    credit: 2,
    summary: "조건을 지켜가며 여러 단계로 생각해야 하는 일",
    examples: ["내 글 고쳐 쓰기", "조건 여러 개 반영하기", "두 가지를 비교해서 설명하기"],
    image: "level-think.png",
    color: {
      solid: "bg-blue-600 text-white",
      soft: "bg-blue-50 text-blue-800",
      border: "border-blue-500",
      text: "text-blue-700",
      ring: "ring-blue-500",
      bar: "bg-blue-500",
    },
  },
  {
    id: "DEEP",
    label: "깊게 파는 AI",
    credit: 4,
    summary: "길고 복잡한 자료를 끝까지 따져봐야 하는 일",
    examples: ["긴 자료 분석하기", "숨어 있는 오류 찾기", "근거가 맞는지 판단하기"],
    image: "level-deep.png",
    color: {
      solid: "bg-violet-600 text-white",
      soft: "bg-violet-50 text-violet-800",
      border: "border-violet-500",
      text: "text-violet-700",
      ring: "ring-violet-500",
      bar: "bg-violet-500",
    },
  },
];

export const LEVEL_MAP: Record<LevelId, LevelDef> = LEVELS.reduce(
  (acc, level) => {
    acc[level.id] = level;
    return acc;
  },
  {} as Record<LevelId, LevelDef>,
);

export function getLevel(id: string): LevelDef | undefined {
  return LEVEL_MAP[id as LevelId];
}

/** 판단의 두 번째 축: 틀렸을 때 내가 알아챌 수 있는가? */
export type VerifyNeed = "LOW" | "MID" | "HIGH";

export const VERIFY_NEEDS: Record<
  VerifyNeed,
  { label: string; description: string; soft: string; bar: string }
> = {
  LOW: {
    label: "가볍게 확인",
    description: "틀려도 내가 바로 알아챌 수 있다",
    soft: "bg-emerald-50 text-emerald-800",
    bar: "bg-emerald-500",
  },
  MID: {
    label: "확인 필요",
    description: "한 번은 다시 봐야 안심된다",
    soft: "bg-amber-50 text-amber-800",
    bar: "bg-amber-500",
  },
  HIGH: {
    label: "꼭 검증",
    description: "틀려도 내가 못 알아챈다. 반드시 근거를 확인해야 한다",
    soft: "bg-rose-50 text-rose-800",
    bar: "bg-rose-500",
  },
};
