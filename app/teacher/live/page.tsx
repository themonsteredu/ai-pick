"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { BarChart, type BarItem } from "@/components/BarChart";
import { usePoll } from "@/lib/client/poll";
import { loadTeacher, type TeacherSession } from "@/lib/client/storage";
import { STEPS, STEP_MAP, type StepId } from "@/lib/steps";
import { getLevel } from "@/lib/levels";
import type { ClassSession } from "@/lib/types";

interface SessionPayload {
  ok: true;
  session: ClassSession;
  joinedCount: number;
  activeCount: number;
}

interface DistributionPayload {
  ok: true;
  step: StepId;
  items: { itemId: string; total: number; counts: Record<string, number> }[];
  answeredCount: number;
  totalStudents: number;
}

/** 고른 값이 4단계 중 하나면 예쁜 이름과 색으로 바꿔준다. */
function toBarItems(counts: Record<string, number>): BarItem[] {
  return Object.entries(counts)
    .map(([key, count]) => {
      const level = getLevel(key);
      return {
        key,
        label: level ? level.label : key,
        count,
        bar: level ? level.color.bar : "bg-sky-500",
      };
    })
    .sort((a, b) => b.count - a.count);
}

export default function TeacherLivePage() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<TeacherSession | null>(null);
  const [ready, setReady] = useState(false);
  const [busyStep, setBusyStep] = useState<StepId | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadTeacher();
    if (!saved) {
      router.replace("/teacher");
      return;
    }
    setTeacher(saved);
    setReady(true);
  }, [router]);

  const { data: sessionData } = usePoll<SessionPayload>(
    teacher ? `/api/sessions/${teacher.code}` : null,
    2000,
  );

  const currentStep = sessionData?.session.currentStep ?? "lobby";
  const openSteps = sessionData?.session.openSteps ?? ["lobby"];

  const { data: dist } = usePoll<DistributionPayload>(
    teacher
      ? `/api/sessions/${teacher.code}/distribution?step=${currentStep}&teacherToken=${teacher.teacherToken}`
      : null,
    2000,
  );

  async function control(action: "open" | "lock" | "goto", step: StepId) {
    if (!teacher) return;
    setBusyStep(step);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${teacher.code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherToken: teacher.teacherToken, action, step }),
      });
      const json = await res.json();
      if (!json.ok) setError(json.error ?? "바꾸지 못했습니다.");
    } catch {
      setError("인터넷 연결을 확인해 주세요.");
    } finally {
      setBusyStep(null);
    }
  }

  if (!ready || !teacher) {
    return (
      <main className="app-shell">
        <p className="text-lg text-slate-500">불러오는 중…</p>
      </main>
    );
  }

  const currentInfo = STEP_MAP[currentStep];

  return (
    <main className="app-shell max-w-6xl">
      <AppHeader
        subtitle={`${teacher.title} · 진행 통제`}
        right={
          <Link
            href="/teacher"
            className="rounded-xl px-3 py-2 text-sm font-bold text-slate-400 hover:bg-slate-100"
          >
            수업 정보
          </Link>
        }
      />

      {/* 지금 상태 한 줄 요약 */}
      <section className="card mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-base font-bold text-slate-500">학생들이 보고 있는 화면</p>
          <p className="text-4xl font-black">{currentInfo.title}</p>
        </div>
        <div className="flex gap-8">
          <div className="text-center">
            <p className="text-base font-bold text-slate-500">접속</p>
            <p className="text-4xl font-black text-sky-600">
              {sessionData?.activeCount ?? 0}
            </p>
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-slate-500">수업코드</p>
            <p className="text-4xl font-black tracking-widest">{teacher.code}</p>
          </div>
        </div>
      </section>

      {error && (
        <p className="mb-6 rounded-2xl bg-rose-50 px-5 py-4 text-lg font-bold text-rose-700">
          {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* 단계 열기 / 잠그기 */}
        <section className="card">
          <h2 className="mb-1 text-2xl font-black">수업 진행</h2>
          <p className="mb-5 text-base text-slate-500">
            &lsquo;열기&rsquo;를 누르면 학생 화면이 그 단계로 넘어갑니다.
          </p>

          <ul className="space-y-3">
            {STEPS.map((step) => {
              const isOpen = openSteps.includes(step.id);
              const isCurrent = currentStep === step.id;
              const busy = busyStep === step.id;

              return (
                <li
                  key={step.id}
                  className={`rounded-2xl border-2 p-4 transition ${
                    isCurrent
                      ? "border-sky-500 bg-sky-50"
                      : isOpen
                        ? "border-slate-200 bg-white"
                        : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 sm:flex-nowrap">
                    <div className="min-w-0">
                      <p
                        className={`text-xl font-black ${
                          isOpen ? "text-slate-900" : "text-slate-400"
                        }`}
                      >
                        {step.title}
                        {isCurrent && (
                          <span className="ml-2 rounded-lg bg-sky-600 px-2 py-1 align-middle text-sm font-black text-white">
                            진행 중
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-slate-500">
                        {step.description} · 약 {step.minutes}분
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      {!isOpen && (
                        <button
                          onClick={() => control("open", step.id)}
                          disabled={busy}
                          className="btn-primary px-5 py-3 text-base"
                        >
                          {busy ? "…" : "열기"}
                        </button>
                      )}
                      {isOpen && !isCurrent && (
                        <button
                          onClick={() => control("goto", step.id)}
                          disabled={busy}
                          className="btn-secondary px-5 py-3 text-base"
                        >
                          {busy ? "…" : "이 화면으로"}
                        </button>
                      )}
                      {isOpen && step.id !== "lobby" && (
                        <button
                          onClick={() => control("lock", step.id)}
                          disabled={busy}
                          className="btn px-4 py-3 text-base text-slate-400 hover:bg-slate-100"
                        >
                          잠그기
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* 반 전체 분포 */}
        <section className="card">
          <div className="mb-5 flex items-baseline justify-between gap-3">
            <h2 className="text-2xl font-black">우리 반 선택</h2>
            <p className="text-lg font-bold text-slate-500">
              {dist?.answeredCount ?? 0} / {sessionData?.joinedCount ?? 0}명 응답
            </p>
          </div>

          {!dist || dist.items.length === 0 ? (
            <BarChart
              items={[]}
              emptyText={`${currentInfo.title} 단계에서 학생이 답하면 여기에 막대가 나타납니다.`}
            />
          ) : (
            <div className="space-y-8">
              {dist.items.map((item) => (
                <div key={item.itemId}>
                  {dist.items.length > 1 && (
                    <p className="mb-3 text-lg font-black text-slate-400">
                      {item.itemId}
                    </p>
                  )}
                  <BarChart items={toBarItems(item.counts)} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
