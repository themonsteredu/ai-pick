import type { Store } from "./types";
import type {
  ClassSessionWithSecret,
  Participant,
  StudentResponse,
} from "../types";
import type { StepId } from "../steps";

/**
 * Supabase 저장소.
 * 추가 라이브러리 없이 Supabase가 제공하는 주소(REST)로 직접 통신한다.
 *
 * 필요한 환경변수 (.env.local)
 *   SUPABASE_URL=https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=xxxxx
 * 이 두 값은 서버에서만 쓰이고 학생 화면으로는 절대 나가지 않는다.
 */

const url = process.env.SUPABASE_URL ?? "";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export function hasSupabaseConfig(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function rest<T>(
  path: string,
  init: RequestInit & { prefer?: string } = {},
): Promise<T> {
  const { prefer, headers, ...rest } = init;
  const res = await fetch(`${url}/rest/v1/${path}`, {
    ...rest,
    cache: "no-store",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
      ...headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Supabase 요청 실패 (${res.status}) ${path}\n${body}\n` +
        `→ supabase/schema.sql 을 Supabase SQL Editor에서 실행했는지 확인하세요.`,
    );
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

interface SessionRow {
  code: string;
  title: string;
  teacher_token: string;
  created_at: string;
  current_step: string;
  open_steps: string[];
}

interface ParticipantRow {
  id: string;
  session_code: string;
  nickname: string;
  team_code: string | null;
  joined_at: string;
  last_seen_at: string;
}

interface ResponseRow {
  id: string;
  session_code: string;
  participant_id: string;
  step: string;
  item_id: string;
  payload: Record<string, unknown>;
  created_at: string;
}

function toSession(row: SessionRow): ClassSessionWithSecret {
  return {
    code: row.code,
    title: row.title,
    teacherToken: row.teacher_token,
    createdAt: row.created_at,
    currentStep: row.current_step as StepId,
    openSteps: (row.open_steps ?? []) as StepId[],
  };
}

function toParticipant(row: ParticipantRow): Participant {
  return {
    id: row.id,
    sessionCode: row.session_code,
    nickname: row.nickname,
    teamCode: row.team_code,
    joinedAt: row.joined_at,
    lastSeenAt: row.last_seen_at,
  };
}

function toResponse(row: ResponseRow): StudentResponse {
  return {
    id: row.id,
    sessionCode: row.session_code,
    participantId: row.participant_id,
    step: row.step as StepId,
    itemId: row.item_id,
    payload: row.payload ?? {},
    createdAt: row.created_at,
  };
}

export const supabaseStore: Store = {
  kind: "supabase",

  async createSession({ code, title, teacherToken }) {
    const rows = await rest<SessionRow[]>("sessions", {
      method: "POST",
      prefer: "return=representation",
      body: JSON.stringify({
        code,
        title,
        teacher_token: teacherToken,
        current_step: "lobby",
        open_steps: ["lobby"],
      }),
    });
    return toSession(rows[0]);
  },

  async getSession(code) {
    const rows = await rest<SessionRow[]>(
      `sessions?code=eq.${encodeURIComponent(code)}&limit=1`,
    );
    return rows[0] ? toSession(rows[0]) : null;
  },

  async updateSession(code, patch) {
    const body: Record<string, unknown> = {};
    if (patch.currentStep !== undefined) body.current_step = patch.currentStep;
    if (patch.openSteps !== undefined) body.open_steps = patch.openSteps;
    if (patch.title !== undefined) body.title = patch.title;

    const rows = await rest<SessionRow[]>(
      `sessions?code=eq.${encodeURIComponent(code)}`,
      {
        method: "PATCH",
        prefer: "return=representation",
        body: JSON.stringify(body),
      },
    );
    return rows[0] ? toSession(rows[0]) : null;
  },

  async addParticipant({ sessionCode, nickname, teamCode = null }) {
    const rows = await rest<ParticipantRow[]>("participants", {
      method: "POST",
      prefer: "return=representation",
      body: JSON.stringify({
        session_code: sessionCode,
        nickname,
        team_code: teamCode,
      }),
    });
    return toParticipant(rows[0]);
  },

  async getParticipant(id) {
    const rows = await rest<ParticipantRow[]>(
      `participants?id=eq.${encodeURIComponent(id)}&limit=1`,
    );
    return rows[0] ? toParticipant(rows[0]) : null;
  },

  async touchParticipant(id) {
    const rows = await rest<ParticipantRow[]>(
      `participants?id=eq.${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        prefer: "return=representation",
        body: JSON.stringify({ last_seen_at: new Date().toISOString() }),
      },
    );
    return rows[0] ? toParticipant(rows[0]) : null;
  },

  async updateParticipant(id, patch) {
    const body: Record<string, unknown> = {};
    if (patch.nickname !== undefined) body.nickname = patch.nickname;
    if (patch.teamCode !== undefined) body.team_code = patch.teamCode;

    const rows = await rest<ParticipantRow[]>(
      `participants?id=eq.${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        prefer: "return=representation",
        body: JSON.stringify(body),
      },
    );
    return rows[0] ? toParticipant(rows[0]) : null;
  },

  async listParticipants(sessionCode) {
    const rows = await rest<ParticipantRow[]>(
      `participants?session_code=eq.${encodeURIComponent(
        sessionCode,
      )}&order=joined_at.asc`,
    );
    return rows.map(toParticipant);
  },

  async saveResponse({ sessionCode, participantId, step, itemId, payload }) {
    const rows = await rest<ResponseRow[]>(
      "responses?on_conflict=session_code,participant_id,step,item_id",
      {
        method: "POST",
        prefer: "return=representation,resolution=merge-duplicates",
        body: JSON.stringify({
          session_code: sessionCode,
          participant_id: participantId,
          step,
          item_id: itemId,
          payload,
          created_at: new Date().toISOString(),
        }),
      },
    );
    return toResponse(rows[0]);
  },

  async listResponses(sessionCode, filter) {
    const params = [`session_code=eq.${encodeURIComponent(sessionCode)}`];
    if (filter?.step) params.push(`step=eq.${encodeURIComponent(filter.step)}`);
    if (filter?.participantId) {
      params.push(`participant_id=eq.${encodeURIComponent(filter.participantId)}`);
    }
    const rows = await rest<ResponseRow[]>(`responses?${params.join("&")}`);
    return rows.map(toResponse);
  },
};
