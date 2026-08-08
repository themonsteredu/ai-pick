"use client";

/**
 * 브라우저에만 저장하는 정보.
 * 개인정보는 저장하지 않는다. (닉네임 + 수업코드 + 참가자 번호뿐)
 */

const STUDENT_KEY = "ai-pick:student";
const TEACHER_KEY = "ai-pick:teacher";

export interface StudentSession {
  code: string;
  participantId: string;
  nickname: string;
}

export interface TeacherSession {
  code: string;
  teacherToken: string;
  title: string;
}

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장이 안 되어도 화면은 계속 동작해야 한다.
  }
}

export const loadStudent = () => read<StudentSession>(STUDENT_KEY);
export const saveStudent = (value: StudentSession) => write(STUDENT_KEY, value);
export const clearStudent = () => {
  if (typeof window !== "undefined") window.localStorage.removeItem(STUDENT_KEY);
};

export const loadTeacher = () => read<TeacherSession>(TEACHER_KEY);
export const saveTeacher = (value: TeacherSession) => write(TEACHER_KEY, value);
export const clearTeacher = () => {
  if (typeof window !== "undefined") window.localStorage.removeItem(TEACHER_KEY);
};
