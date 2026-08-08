import { NextRequest } from "next/server";
import { store } from "@/lib/store";
import { normalizeSessionCode } from "@/lib/code";
import { fail, isActive, ok } from "@/lib/api";

export const dynamic = "force-dynamic";

/** 교사 화면 전용: 들어온 학생 닉네임 목록 */
export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } },
) {
  const code = normalizeSessionCode(params.code);
  const teacherToken = req.nextUrl.searchParams.get("teacherToken") ?? "";

  try {
    const session = await store.getSession(code);
    if (!session) return fail("그런 수업코드가 없습니다.", 404);
    if (session.teacherToken !== teacherToken) {
      return fail("교사 화면에서만 볼 수 있습니다.", 403);
    }

    const now = Date.now();
    const participants = await store.listParticipants(code);

    return ok({
      participants: participants.map((p) => ({
        id: p.id,
        nickname: p.nickname,
        teamCode: p.teamCode,
        joinedAt: p.joinedAt,
        active: isActive(p, now),
      })),
    });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "명단을 불러오지 못했습니다.",
      500,
    );
  }
}
