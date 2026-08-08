import type { StepId } from "./steps";

/** 한 번의 수업 = 하나의 세션 */
export interface ClassSession {
  /** 학생이 입력하는 6자리 수업코드 */
  code: string;
  /** 반 이름 같은 메모 (개인정보 아님) */
  title: string;
  createdAt: string;
  /** 지금 학생이 있어야 할 단계 */
  currentStep: StepId;
  /** 교사가 열어둔 단계 목록 (열린 단계만 학생이 들어갈 수 있다) */
  openSteps: StepId[];
}

/** 교사에게만 돌려주는 정보까지 포함한 세션 */
export interface ClassSessionWithSecret extends ClassSession {
  /** 교사 화면임을 증명하는 값. 학생에게는 절대 내려보내지 않는다. */
  teacherToken: string;
}

/** 접속한 학생 1명. 개인정보는 저장하지 않는다. */
export interface Participant {
  id: string;
  sessionCode: string;
  /** 닉네임만 받는다. 실명 금지. */
  nickname: string;
  /** 예산 챌린지에서 쓰는 팀 코드 (없으면 null) */
  teamCode: string | null;
  joinedAt: string;
  /** 마지막으로 화면이 살아 있던 시각 (접속 인원 계산용) */
  lastSeenAt: string;
}

/** 학생이 어떤 단계에서 남긴 응답 1건 */
export interface StudentResponse {
  id: string;
  sessionCode: string;
  participantId: string;
  step: StepId;
  /** 문항 id (문항이 하나뿐인 단계는 "main") */
  itemId: string;
  /** 단계별로 모양이 다르므로 자유 형식으로 저장 */
  payload: Record<string, unknown>;
  createdAt: string;
}
