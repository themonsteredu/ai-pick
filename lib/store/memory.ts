import { randomUUID } from "crypto";
import type { Store } from "./types";
import type {
  ClassSessionWithSecret,
  Participant,
  StudentResponse,
} from "../types";

/**
 * 서버 메모리 저장소.
 * Supabase 설정 없이도 바로 확인할 수 있도록 만든 임시 저장소다.
 * 서버를 껐다 켜면 내용이 사라진다. 실제 수업에서는 Supabase를 쓴다.
 */

interface MemoryDb {
  sessions: Map<string, ClassSessionWithSecret>;
  participants: Map<string, Participant>;
  responses: StudentResponse[];
}

// 개발 중 코드가 바뀌어도 데이터가 날아가지 않도록 전역에 붙여둔다.
const globalForDb = globalThis as unknown as { __aiPickDb?: MemoryDb };

const db: MemoryDb =
  globalForDb.__aiPickDb ??
  (globalForDb.__aiPickDb = {
    sessions: new Map(),
    participants: new Map(),
    responses: [],
  });

export const memoryStore: Store = {
  kind: "memory",

  async createSession({ code, title, teacherToken }) {
    const session: ClassSessionWithSecret = {
      code,
      title,
      teacherToken,
      createdAt: new Date().toISOString(),
      currentStep: "lobby",
      openSteps: ["lobby"],
    };
    db.sessions.set(code, session);
    return session;
  },

  async getSession(code) {
    return db.sessions.get(code) ?? null;
  },

  async updateSession(code, patch) {
    const session = db.sessions.get(code);
    if (!session) return null;
    const next = { ...session, ...patch };
    db.sessions.set(code, next);
    return next;
  },

  async addParticipant({ sessionCode, nickname, teamCode = null }) {
    const now = new Date().toISOString();
    const participant: Participant = {
      id: randomUUID(),
      sessionCode,
      nickname,
      teamCode,
      joinedAt: now,
      lastSeenAt: now,
    };
    db.participants.set(participant.id, participant);
    return participant;
  },

  async getParticipant(id) {
    return db.participants.get(id) ?? null;
  },

  async touchParticipant(id) {
    const participant = db.participants.get(id);
    if (!participant) return null;
    const next = { ...participant, lastSeenAt: new Date().toISOString() };
    db.participants.set(id, next);
    return next;
  },

  async updateParticipant(id, patch) {
    const participant = db.participants.get(id);
    if (!participant) return null;
    const next = { ...participant, ...patch };
    db.participants.set(id, next);
    return next;
  },

  async listParticipants(sessionCode) {
    return [...db.participants.values()]
      .filter((p) => p.sessionCode === sessionCode)
      .sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));
  },

  async saveResponse({ sessionCode, participantId, step, itemId, payload }) {
    // 같은 학생이 같은 문항에 다시 답하면 덮어쓴다.
    const existingIndex = db.responses.findIndex(
      (r) =>
        r.sessionCode === sessionCode &&
        r.participantId === participantId &&
        r.step === step &&
        r.itemId === itemId,
    );
    const response: StudentResponse = {
      id: existingIndex >= 0 ? db.responses[existingIndex].id : randomUUID(),
      sessionCode,
      participantId,
      step,
      itemId,
      payload,
      createdAt: new Date().toISOString(),
    };
    if (existingIndex >= 0) {
      db.responses[existingIndex] = response;
    } else {
      db.responses.push(response);
    }
    return response;
  },

  async listResponses(sessionCode, filter) {
    return db.responses.filter(
      (r) =>
        r.sessionCode === sessionCode &&
        (!filter?.step || r.step === filter.step) &&
        (!filter?.participantId || r.participantId === filter.participantId),
    );
  },
};
