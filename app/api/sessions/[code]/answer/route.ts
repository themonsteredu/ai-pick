import { NextRequest } from "next/server";
import { store } from "@/lib/store";
import { normalizeSessionCode } from "@/lib/code";
import { fail, ok } from "@/lib/api";
import { isStepId } from "@/lib/steps";

export const dynamic = "force-dynamic";

/**
 * 학생이 무언가를 고르거나 적으면 여기로 보낸다.
 * 같은 학생이 같은 문항에 다시 답하면 덮어쓴다.
 *
 * 약속: 고른 것은 항상 choice 에 담는다. (교사 화면 막대그래프가 이걸 센다)
 *      그 밖에 적은 글 등은 extra 에 자유롭게 담는다.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } },
) {
  const code = normalizeSessionCode(params.code);

  let body: {
    participantId?: unknown;
    step?: unknown;
    itemId?: unknown;
    choice?: unknown;
    extra?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return fail("요청 내용을 읽지 못했습니다.");
  }

  const { participantId, step, itemId, choice, extra } = body;

  if (typeof participantId !== "string") return fail("참가자 정보가 없습니다.");
  if (!isStepId(step)) return fail("알 수 없는 단계입니다.");

  const item = typeof itemId === "string" && itemId ? itemId : "main";

  try {
    const session = await store.getSession(code);
    if (!session) return fail("그런 수업코드가 없습니다.", 404);

    // 교사가 열지 않은 단계에는 답을 남길 수 없다
    if (!session.openSteps.includes(step)) {
      return fail("아직 열리지 않은 단계입니다.", 403);
    }

    const participant = await store.getParticipant(participantId);
    if (!participant || participant.sessionCode !== code) {
      return fail("참가 정보를 찾을 수 없습니다. 다시 입장해 주세요.", 404);
    }

    const payload: Record<string, unknown> = {};
    if (typeof choice === "string") payload.choice = choice;
    if (extra && typeof extra === "object") Object.assign(payload, extra);

    const response = await store.saveResponse({
      sessionCode: code,
      participantId,
      step,
      itemId: item,
      payload,
    });

    // 답을 남겼다는 건 화면이 살아 있다는 뜻이다
    await store.touchParticipant(participantId);

    return ok({ response });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "답을 저장하지 못했습니다.",
      500,
    );
  }
}
