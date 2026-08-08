"use client";

import { AppHeader } from "@/components/AppHeader";
import { useStepGate } from "@/lib/client/gate";
import { STEP_MAP, type StepId } from "@/lib/steps";

/**
 * 아직 안 만든 학생 화면의 임시 자리.
 * 선생님이 단계를 열면 학생 화면이 실제로 이동하는지 지금 확인할 수 있게 해준다.
 * 각 단계를 만들 때 이 자리를 진짜 화면으로 바꾼다.
 */
export function StepStub({ step }: { step: StepId }) {
  const { student, ready } = useStepGate(step);
  const info = STEP_MAP[step];

  if (!ready || !student) {
    return (
      <main className="app-shell">
        <p className="text-lg text-slate-500">불러오는 중…</p>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <AppHeader subtitle={`${student.nickname} 님`} />
      <section className="card text-center">
        <p className="text-lg font-bold text-slate-400">지금 단계</p>
        <h1 className="mt-2 text-4xl font-black">{info.title}</h1>
        <p className="mt-4 text-step text-slate-600">{info.description}</p>
        <p className="mt-8 inline-block rounded-2xl bg-slate-100 px-6 py-4 text-base font-bold text-slate-500">
          이 화면은 아직 준비 중입니다.
        </p>
      </section>
    </main>
  );
}
