import { randomBytes, randomUUID } from "crypto";

/**
 * 수업코드 만들기.
 * 헷갈리는 글자(0, O, 1, I, L)는 빼서 교실 앞에서 불러주기 쉽게 만든다.
 */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateSessionCode(length = 6): string {
  const bytes = randomBytes(length);
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return code;
}

export function generateTeacherToken(): string {
  return randomUUID();
}

/** 학생이 소문자로 쳐도, 공백을 넣어도 통하게 정리한다. */
export function normalizeSessionCode(input: string): string {
  return input.replace(/\s+/g, "").toUpperCase();
}
