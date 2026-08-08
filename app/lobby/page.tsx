"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { LevelGuide } from "@/components/LevelGuide";
import { useHeartbeat, usePoll } from "@/lib/client/poll";
import { clearStudent, loadStudent, type StudentSession } from "@/lib/client/storage";
import type { ClassSession } from "@/lib/types";

interface SessionPayload {
  ok: true;
  session: ClassSession;
  joinedCount: number;
  activeCount: number;
}

export default function LobbyPage() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = loadStudent();
    if (!saved) {
      router.replace("/join");
      return;
    }
    setStudent(saved);
    setReady(true);
  }, [router]);

  const { data, error } = usePoll<SessionPayload>(
    student ? `/api/sessions/${student.code}` : null,
    2000,
  );

  useHeartbeat(student?.code ?? null, student?.participantId ?? null);

  if (!ready || !student) {
    return (
      <main className="app-shell">
        <p className="text-lg text-slate-500">불러오는 중…</p>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <AppHeader
        subtitle={`${student.nickname} 님 · 수업코드 ${student.code}`}
        right={
          <button
            type="button"
            onClick={() => {
              clearStudent();
              router.replace("/join");
            }}
            className="rounded-xl px-3 py-2 text-sm font-bold text-slate-400 hover:bg-slate-100"
          >
            나가기
          </button>
        }
      />

      <section className="card text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-sky-100">
          <span className="h-5 w-5 animate-ping rounded-full bg-sky-500" />
        </div>

        <h1 className="text-3xl font-black leading-snug sm:text-4xl">
          입장 완료!
        </h1>
        <p className="mt-4 text-step text-slate-600">
          선생님이 시작할 때까지 잠시만 기다려 주세요.
          <br />
          화면을 그대로 두면 자동으로 다음 화면으로 넘어갑니다.
        </p>

        {data && (
          <p className="mt-6 inline-block rounded-2xl bg-slate-100 px-6 py-3 text-xl font-black">
            지금 들어온 친구 {data.activeCount}명
          </p>
        )}

        {error && (
          <p className="mt-6 rounded-2xl bg-amber-50 px-5 py-4 text-base font-bold text-amber-700">
            {error}
          </p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-black">기다리는 동안 읽어보기 — 오늘의 4단계</h2>
        <LevelGuide />
      </section>
    </main>
  );
}
