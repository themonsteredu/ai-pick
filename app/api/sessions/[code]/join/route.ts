import { NextRequest } from "next/server";
import { store } from "@/lib/store";
import { normalizeSessionCode } from "@/lib/code";
import { cleanNickname, fail, ok, publicSession } from "@/lib/api";

export const dynamic = "force-dynamic";

/** 학생이 수업코드 + 닉네임으로 들어온다. 개인정보는 받지 않는다. */
export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } },
) {
  const code = normalizeSessionCode(params.code);

  let body: { nickname?: unknown };
  try {
    body = await req.json();
  } catch {
    return fail("닉네임을 입력해 주세요.");
  }

  const nickname = cleanNickname(body?.nickname);
  if (!nickname) return fail("닉네임은 1~12글자로 입력해 주세요.");

  try {
    const session = await store.getSession(code);
    if (!session) return fail("그런 수업코드가 없습니다. 코드를 다시 확인해 주세요.", 404);

    const participants = await store.listParticipants(code);
    const taken = participants.some(
      (p) => p.nickname.toLowerCase() === nickname.toLowerCase(),
    );
    if (taken) return fail("이미 쓰고 있는 닉네임이에요. 다른 닉네임으로 해 주세요.", 409);

    const participant = await store.addParticipant({
      sessionCode: code,
      nickname,
    });

    return ok({
      participant,
      session: publicSession(session),
    });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "입장하지 못했습니다.",
      500,
    );
  }
}
