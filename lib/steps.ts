/**
 * 수업 단계 정의.
 * 교사가 "열기"를 눌러야 학생이 그 단계로 넘어갈 수 있다.
 */

export type StepId =
  | "lobby"
  | "intro"
  | "warmup"
  | "battle"
  | "prompt"
  | "budget"
  | "final"
  | "result";

export interface StepDef {
  id: StepId;
  /** 교사 화면에 보이는 이름 */
  title: string;
  /** 한 줄 설명 */
  description: string;
  /** 학생이 이동할 경로 */
  path: string;
  /** 예상 소요 시간(분) — 교사 화면 참고용 */
  minutes: number;
}

export const STEPS: StepDef[] = [
  {
    id: "lobby",
    title: "대기실",
    description: "학생들이 수업코드로 들어오는 중",
    path: "/lobby",
    minutes: 3,
  },
  {
    id: "intro",
    title: "사전 투표",
    description: "정답을 공개하지 않고 생각만 물어본다",
    path: "/intro",
    minutes: 5,
  },
  {
    id: "warmup",
    title: "워밍업 판별",
    description: "5문항, 4단계 중 하나 고르기",
    path: "/warmup",
    minutes: 10,
  },
  {
    id: "battle",
    title: "블라인드 배틀",
    description: "3라운드, 어느 답이 좋은지 고른 뒤 정체 공개",
    path: "/battle",
    minutes: 15,
  },
  {
    id: "prompt",
    title: "질문 업그레이드",
    description: "나쁜 질문을 직접 고쳐 쓰고 체크리스트로 점수 확인",
    path: "/prompt",
    minutes: 12,
  },
  {
    id: "budget",
    title: "예산 챌린지",
    description: "팀별 크레딧 12로 미션 8개 해결",
    path: "/budget",
    minutes: 15,
  },
  {
    id: "final",
    title: "최종 미션",
    description: "질문 작성 → 검증 → 재질문",
    path: "/final",
    minutes: 13,
  },
  {
    id: "result",
    title: "결과 프로필",
    description: "능력 점수 + 유형 + 처음 투표와 비교",
    path: "/result",
    minutes: 7,
  },
];

export const STEP_MAP: Record<StepId, StepDef> = STEPS.reduce(
  (acc, step) => {
    acc[step.id] = step;
    return acc;
  },
  {} as Record<StepId, StepDef>,
);

export const STEP_IDS: StepId[] = STEPS.map((step) => step.id);

export function isStepId(value: unknown): value is StepId {
  return typeof value === "string" && STEP_IDS.includes(value as StepId);
}

/** 학생이 지금 가야 할 화면 경로 */
export function pathForStep(step: StepId): string {
  return STEP_MAP[step]?.path ?? "/lobby";
}
