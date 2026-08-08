import { NextRequest } from "next/server";
import { store } from "@/lib/store";
import { normalizeSessionCode } from "@/lib/code";
import { fail, ok } from "@/lib/api";
import { isStepId } from "@/lib/steps";

export const dynamic = "force-dynamic";

/**
 * 교사 화면 전용: 반 전체가 무엇을 골랐는지 세어준다.
 *
 * 학생 응답은 모두 { choice: "고른 것" } 모양으로 저장하기로 약속했다.
 * 그래서 단계가 달라져도 세는 방법은 똑같다.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } },
) {
  const code = normalizeSessionCode(params.code);
  const teacherToken = req.nextUrl.searchParams.get("teacherToken") ?? "";
  const step = req.nextUrl.searchParams.get("step");

  if (!isStepId(step)) return fail("알 수 없는 단계입니다.");

  try {
    const session = await store.getSession(code);
    if (!session) return fail("그런 수업코드가 없습니다.", 404);
    if (session.teacherToken !== teacherToken) {
      return fail("교사 화면에서만 볼 수 있습니다.", 403);
    }

    const [participants, responses] = await Promise.all([
      store.listParticipants(code),
      store.listResponses(code, { step }),
    ]);

    // 문항별로 묶고, 문항 안에서 고른 것을 센다
    const byItem = new Map<string, Map<string, number>>();
    const answeredBy = new Set<string>();

    for (const response of responses) {
      const choice = response.payload?.choice;
      if (typeof choice !== "string") continue;

      answeredBy.add(response.participantId);
      if (!byItem.has(response.itemId)) byItem.set(response.itemId, new Map());
      const counts = byItem.get(response.itemId)!;
      counts.set(choice, (counts.get(choice) ?? 0) + 1);
    }

    const items = [...byItem.entries()]
      .map(([itemId, counts]) => {
        const total = [...counts.values()].reduce((sum, n) => sum + n, 0);
        return {
          itemId,
          total,
          counts: Object.fromEntries(counts),
        };
      })
      .sort((a, b) => a.itemId.localeCompare(b.itemId));

    return ok({
      step,
      items,
      answeredCount: answeredBy.size,
      totalStudents: participants.length,
    });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "분포를 불러오지 못했습니다.",
      500,
    );
  }
}
