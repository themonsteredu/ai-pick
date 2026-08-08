import { NextResponse } from "next/server";
import type { ClassSession, ClassSessionWithSecret, Participant } from "./types";

/** 학생에게 내려보내도 되는 세션 정보 (교사 토큰 제거) */
export function publicSession(session: ClassSessionWithSecret): ClassSession {
  const { teacherToken: _teacherToken, ...rest } = session;
  return rest;
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export function ok<T extends Record<string, unknown>>(data: T) {
  return NextResponse.json({ ok: true, ...data });
}

/** 최근 40초 안에 화면이 살아 있던 학생을 '접속 중'으로 본다. */
export const ACTIVE_WINDOW_MS = 40_000;

export function isActive(participant: Participant, now = Date.now()): boolean {
  return now - new Date(participant.lastSeenAt).getTime() < ACTIVE_WINDOW_MS;
}

/** 닉네임 정리: 앞뒤 공백 제거, 길이 제한. 개인정보(실명·연락처)는 받지 않는다. */
export function cleanNickname(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim().replace(/\s+/g, " ");
  if (trimmed.length < 1 || trimmed.length > 12) return null;
  return trimmed;
}
