import { NextRequest } from "next/server";
import { store, storageKind } from "@/lib/store";
import { normalizeSessionCode } from "@/lib/code";
import { fail, isActive, ok, publicSession } from "@/lib/api";
import { STEP_IDS, isStepId, type StepId } from "@/lib/steps";

export const dynamic = "force-dynamic";

/**
 * 학생·교사 화면이 2초마다 물어보는 곳.
 * 지금 열린 단계와 접속 인원을 알려준다.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } },
) {
  const code = normalizeSessionCode(params.code);

  try {
    const session = await store.getSession(code);
    if (!session) return fail("그런 수업코드가 없습니다.", 404);

    const participants = await store.listParticipants(code);
    const now = Date.now();

    return ok({
      session: publicSession(session),
      joinedCount: participants.length,
      activeCount: participants.filter((p) => isActive(p, now)).length,
      storage: storageKind,
    });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "수업 정보를 불러오지 못했습니다.",
      500,
    );
  }
}

/**
 * 교사 화면 전용: 단계 열기 / 잠그기 / 되돌아가기
 *
 *  open : 그 단계를 열고, 학생 화면을 그 단계로 넘긴다
 *  lock : 그 단계를 잠근다 (열려 있던 학생은 이전 단계로 되돌아온다)
 *  goto : 이미 열린 단계로 학생 화면만 이동시킨다
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { code: string } },
) {
  const code = normalizeSessionCode(params.code);

  let body: { teacherToken?: unknown; action?: unknown; step?: unknown };
  try {
    body = await req.json();
  } catch {
    return fail("요청 내용을 읽지 못했습니다.");
  }

  const action = body.action;
  const step = body.step;
  if (action !== "open" && action !== "lock" && action !== "goto") {
    return fail("알 수 없는 동작입니다.");
  }
  if (!isStepId(step)) return fail("알 수 없는 단계입니다.");

  try {
    const session = await store.getSession(code);
    if (!session) return fail("그런 수업코드가 없습니다.", 404);
    if (session.teacherToken !== body.teacherToken) {
      return fail("교사 화면에서만 바꿀 수 있습니다.", 403);
    }

    // 대기실은 항상 열려 있어야 한다. (잠그면 학생이 갈 곳이 없어진다)
    if (action === "lock" && step === "lobby") {
      return fail("대기실은 잠글 수 없습니다.");
    }

    const openSet = new Set<StepId>(session.openSteps);
    openSet.add("lobby");
    let currentStep = session.currentStep;

    if (action === "open") {
      openSet.add(step);
      currentStep = step;
    } else if (action === "lock") {
      openSet.delete(step);
      if (currentStep === step) {
        // 잠근 단계에 학생이 머물지 않도록 열려 있는 이전 단계로 되돌린다
        const previous = STEP_IDS.slice(0, STEP_IDS.indexOf(step))
          .reverse()
          .find((id) => openSet.has(id));
        currentStep = previous ?? "lobby";
      }
    } else {
      if (!openSet.has(step)) return fail("아직 열지 않은 단계입니다.");
      currentStep = step;
    }

    // 수업 순서대로 정렬해서 저장한다
    const openSteps = STEP_IDS.filter((id) => openSet.has(id));
    const updated = await store.updateSession(code, { currentStep, openSteps });
    if (!updated) return fail("단계를 바꾸지 못했습니다.", 500);

    return ok({ session: publicSession(updated) });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "단계를 바꾸지 못했습니다.",
      500,
    );
  }
}
