import { NextRequest } from "next/server";
import { store, storageKind } from "@/lib/store";
import { normalizeSessionCode } from "@/lib/code";
import { fail, isActive, ok, publicSession } from "@/lib/api";

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
