import { NextRequest } from "next/server";
import { store } from "@/lib/store";
import { normalizeSessionCode } from "@/lib/code";
import { fail, ok } from "@/lib/api";

export const dynamic = "force-dynamic";

/**
 * 학생 화면이 살아 있다고 알려주는 신호.
 * 교사 화면의 '접속 중' 인원수를 정확하게 만들기 위해 쓴다.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } },
) {
  const code = normalizeSessionCode(params.code);

  let participantId: string | undefined;
  try {
    const body = await req.json();
    participantId = typeof body?.participantId === "string" ? body.participantId : undefined;
  } catch {
    // 아래에서 처리
  }

  if (!participantId) return fail("참가자 정보가 없습니다.");

  try {
    const participant = await store.touchParticipant(participantId);
    if (!participant || participant.sessionCode !== code) {
      return fail("참가 정보를 찾을 수 없습니다. 다시 입장해 주세요.", 404);
    }
    return ok({ participant });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "실패했습니다.", 500);
  }
}
