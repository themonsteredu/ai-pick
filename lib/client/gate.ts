"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { pathForStep, type StepId } from "@/lib/steps";
import type { ClassSession } from "@/lib/types";
import { loadStudent, type StudentSession } from "./storage";
import { useHeartbeat, usePoll } from "./poll";

interface SessionPayload {
  ok: true;
  session: ClassSession;
  joinedCount: number;
  activeCount: number;
}

/**
 * 학생 화면의 문지기.
 *
 *  - 입장하지 않았으면 입장 화면으로 보낸다
 *  - 선생님이 지금 열어둔 단계와 다른 화면에 있으면 그 단계로 옮긴다
 *
 * 덕분에 빠른 학생이 혼자 앞서갈 수 없다.
 */
export function useStepGate(expectedStep: StepId) {
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

  const currentStep = data?.session.currentStep;

  useEffect(() => {
    if (!currentStep || currentStep === expectedStep) return;
    router.replace(pathForStep(currentStep));
  }, [currentStep, expectedStep, router]);

  return {
    student,
    ready,
    session: data?.session ?? null,
    activeCount: data?.activeCount ?? 0,
    error,
    /** 선생님이 다른 단계를 열어서 곧 화면이 바뀔 예정 */
    leaving: Boolean(currentStep && currentStep !== expectedStep),
  };
}
