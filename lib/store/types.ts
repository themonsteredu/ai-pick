import type { StepId } from "../steps";
import type {
  ClassSession,
  ClassSessionWithSecret,
  Participant,
  StudentResponse,
} from "../types";

/**
 * 저장소 인터페이스.
 * - Supabase 설정이 있으면 Supabase에 저장
 * - 없으면 서버 메모리에 저장 (내 컴퓨터에서 확인할 때 편하게)
 */
export interface Store {
  /** 지금 어디에 저장되고 있는지 (교사 화면에 안내로 표시) */
  readonly kind: "memory" | "supabase";

  createSession(input: {
    code: string;
    title: string;
    teacherToken: string;
  }): Promise<ClassSessionWithSecret>;

  getSession(code: string): Promise<ClassSessionWithSecret | null>;

  updateSession(
    code: string,
    patch: Partial<Pick<ClassSession, "currentStep" | "openSteps" | "title">>,
  ): Promise<ClassSessionWithSecret | null>;

  addParticipant(input: {
    sessionCode: string;
    nickname: string;
    teamCode?: string | null;
  }): Promise<Participant>;

  getParticipant(id: string): Promise<Participant | null>;

  touchParticipant(id: string): Promise<Participant | null>;

  updateParticipant(
    id: string,
    patch: Partial<Pick<Participant, "nickname" | "teamCode">>,
  ): Promise<Participant | null>;

  listParticipants(sessionCode: string): Promise<Participant[]>;

  saveResponse(input: {
    sessionCode: string;
    participantId: string;
    step: StepId;
    itemId: string;
    payload: Record<string, unknown>;
  }): Promise<StudentResponse>;

  listResponses(
    sessionCode: string,
    filter?: { step?: StepId; participantId?: string },
  ): Promise<StudentResponse[]>;
}
