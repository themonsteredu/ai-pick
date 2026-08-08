"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { usePoll } from "@/lib/client/poll";
import {
  clearTeacher,
  loadTeacher,
  saveTeacher,
  type TeacherSession,
} from "@/lib/client/storage";
import type { ClassSession } from "@/lib/types";

interface SessionPayload {
  ok: true;
  session: ClassSession;
  joinedCount: number;
  activeCount: number;
  storage: "memory" | "supabase";
}

interface ParticipantsPayload {
  ok: true;
  participants: {
    id: string;
    nickname: string;
    teamCode: string | null;
    joinedAt: string;
    active: boolean;
  }[];
}

export default function TeacherPage() {
  const [teacher, setTeacher] = useState<TeacherSession | null>(null);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [joinUrl, setJoinUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setTeacher(loadTeacher());
    setReady(true);
  }, []);

  useEffect(() => {
    if (teacher) setJoinUrl(`${window.location.origin}/join?code=${teacher.code}`);
  }, [teacher]);

  const { data: sessionData } = usePoll<SessionPayload>(
    teacher ? `/api/sessions/${teacher.code}` : null,
    2000,
  );

  const { data: listData } = usePoll<ParticipantsPayload>(
    teacher
      ? `/api/sessions/${teacher.code}/participants?teacherToken=${teacher.teacherToken}`
      : null,
    2000,
  );

  async function createSession() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() || "새 수업" }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error ?? "수업을 만들지 못했습니다.");
        return;
      }
      const next: TeacherSession = {
        code: json.session.code,
        teacherToken: json.teacherToken,
        title: json.session.title,
      };
      saveTeacher(next);
      setTeacher(next);
    } catch {
      setError("인터넷 연결을 확인한 뒤 다시 눌러 주세요.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <main className="app-shell">
        <p className="text-lg text-slate-500">불러오는 중…</p>
      </main>
    );
  }

  // ── 아직 수업을 만들지 않은 상태 ─────────────────────────────
  if (!teacher) {
    return (
      <main className="app-shell">
        <AppHeader subtitle="선생님 화면" />
        <section className="card">
          <h1 className="text-3xl font-black">수업 만들기</h1>
          <p className="mt-3 text-lg text-slate-600">
            버튼을 누르면 학생에게 알려줄 수업코드가 나옵니다.
          </p>

          <div className="mt-6">
            <label className="label" htmlFor="title">
              수업 이름 (선택 — 예: 2학년 3반)
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="비워두면 '새 수업'"
              maxLength={30}
              className="field"
            />
          </div>

          {error && (
            <p className="mt-4 rounded-2xl bg-rose-50 px-5 py-4 text-lg font-bold text-rose-700">
              {error}
            </p>
          )}

          <button
            onClick={createSession}
            disabled={busy}
            className="btn-primary mt-6 w-full py-6 text-xl"
          >
            {busy ? "만드는 중…" : "수업 코드 만들기"}
          </button>
        </section>
      </main>
    );
  }

  // ── 수업을 만든 뒤: 코드 안내 + 접속 인원 ────────────────────
  const participants = listData?.participants ?? [];
  const activeCount = sessionData?.activeCount ?? 0;
  const joinedCount = sessionData?.joinedCount ?? participants.length;

  return (
    <main className="app-shell">
      <AppHeader
        subtitle={`${teacher.title} · 선생님 화면`}
        right={
          <button
            type="button"
            onClick={() => {
              if (confirm("지금 수업을 끝내고 새 코드를 만들까요?")) {
                clearTeacher();
                setTeacher(null);
              }
            }}
            className="rounded-xl px-3 py-2 text-sm font-bold text-slate-400 hover:bg-slate-100"
          >
            새 수업 만들기
          </button>
        }
      />

      <section className="card text-center">
        <p className="text-lg font-bold text-slate-500">학생들에게 알려줄 수업코드</p>
        <p className="my-4 text-7xl font-black tracking-[0.15em] sm:text-8xl">
          {teacher.code}
        </p>
        <p className="text-lg text-slate-600">
          {joinUrl.replace(/^https?:\/\//, "")}
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(joinUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              } catch {
                setCopied(false);
              }
            }}
            className="btn-secondary"
          >
            {copied ? "복사했어요!" : "입장 주소 복사하기"}
          </button>
          <Link href="/teacher/live" className="btn-primary">
            수업 시작하기 →
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="card text-center">
          <p className="text-lg font-bold text-slate-500">지금 접속 중</p>
          <p className="mt-2 text-7xl font-black text-sky-600">{activeCount}</p>
          <p className="mt-1 text-base text-slate-400">명</p>
        </div>
        <div className="card text-center">
          <p className="text-lg font-bold text-slate-500">지금까지 들어온 학생</p>
          <p className="mt-2 text-7xl font-black text-slate-800">{joinedCount}</p>
          <p className="mt-1 text-base text-slate-400">명</p>
        </div>
      </section>

      <section className="card mt-6">
        <h2 className="mb-4 text-xl font-black">들어온 학생 ({participants.length}명)</h2>
        {participants.length === 0 ? (
          <p className="text-lg text-slate-400">
            아직 아무도 들어오지 않았어요. 코드를 불러주세요.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {participants.map((p) => (
              <li
                key={p.id}
                className={`animate-pop rounded-xl px-4 py-2 text-lg font-bold ${
                  p.active
                    ? "bg-sky-100 text-sky-900"
                    : "bg-slate-100 text-slate-400 line-through"
                }`}
              >
                {p.nickname}
              </li>
            ))}
          </ul>
        )}
      </section>

      {sessionData?.storage === "memory" && (
        <p className="mt-6 rounded-2xl bg-amber-50 px-5 py-4 text-base font-bold text-amber-800">
          임시 저장 상태 — 서버를 껐다 켜면 기록이 사라집니다. (README 참고)
        </p>
      )}
    </main>
  );
}
