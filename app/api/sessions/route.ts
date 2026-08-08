import { NextRequest } from "next/server";
import { store, storageKind } from "@/lib/store";
import { generateSessionCode, generateTeacherToken } from "@/lib/code";
import { fail, ok, publicSession } from "@/lib/api";

export const dynamic = "force-dynamic";

/** 교사가 새 수업을 만든다. */
export async function POST(req: NextRequest) {
  let title = "새 수업";
  try {
    const body = await req.json();
    if (typeof body?.title === "string" && body.title.trim()) {
      title = body.title.trim().slice(0, 30);
    }
  } catch {
    // 본문이 없어도 기본값으로 만든다.
  }

  // 이미 쓰고 있는 코드와 겹치지 않을 때까지 다시 뽑는다.
  let code = generateSessionCode();
  for (let i = 0; i < 5; i += 1) {
    const existing = await store.getSession(code);
    if (!existing) break;
    code = generateSessionCode();
  }

  try {
    const session = await store.createSession({
      code,
      title,
      teacherToken: generateTeacherToken(),
    });

    return ok({
      session: publicSession(session),
      teacherToken: session.teacherToken,
      storage: storageKind,
    });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "수업을 만들지 못했습니다.",
      500,
    );
  }
}
