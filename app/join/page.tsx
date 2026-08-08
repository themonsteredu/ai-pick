"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { loadStudent, saveStudent } from "@/lib/client/storage";

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [already, setAlready] = useState<{ code: string; nickname: string } | null>(null);

  useEffect(() => {
    // 주소에 ?code=ABC123 이 있으면 자동으로 채워준다.
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("code");
    if (fromUrl) setCode(fromUrl.toUpperCase());

    const saved = loadStudent();
    if (saved) setAlready({ code: saved.code, nickname: saved.nickname });
  }, []);

  async function handleJoin(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const cleanCode = code.replace(/\s+/g, "").toUpperCase();
    if (cleanCode.length < 4) {
      setError("수업코드를 정확히 입력해 주세요.");
      return;
    }
    if (!nickname.trim()) {
      setError("닉네임을 입력해 주세요.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`/api/sessions/${cleanCode}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname }),
      });
      const json = await res.json();

      if (!json.ok) {
        setError(json.error ?? "입장하지 못했습니다.");
        return;
      }

      saveStudent({
        code: cleanCode,
        participantId: json.participant.id,
        nickname: json.participant.nickname,
      });
      router.push("/lobby");
    } catch {
      setError("인터넷 연결을 확인한 뒤 다시 눌러 주세요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="app-shell">
      <AppHeader subtitle="입장하기" />

      {already && (
        <div className="mb-5 rounded-2xl border-2 border-sky-200 bg-sky-50 p-5">
          <p className="text-lg font-bold text-sky-900">
            아까 <b>{already.nickname}</b> 닉네임으로 들어와 있었어요.
          </p>
          <button
            type="button"
            onClick={() => router.push("/lobby")}
            className="btn-primary mt-3 w-full sm:w-auto"
          >
            이어서 하기
          </button>
        </div>
      )}

      <form onSubmit={handleJoin} className="card">
        <div className="mb-6">
          <label className="label" htmlFor="code">
            수업코드 (칠판·화면에 적힌 6글자)
          </label>
          <input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="예) K7QM2P"
            autoComplete="off"
            maxLength={8}
            className="field text-center text-4xl font-black tracking-[0.3em]"
          />
        </div>

        <div className="mb-2">
          <label className="label" htmlFor="nickname">
            닉네임 (1~12글자)
          </label>
          <input
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="예) 초코바"
            autoComplete="off"
            maxLength={12}
            className="field"
          />
        </div>
        <p className="mb-6 text-sm text-slate-500">진짜 이름은 쓰지 마세요.</p>

        {error && (
          <p className="mb-4 rounded-2xl bg-rose-50 px-5 py-4 text-lg font-bold text-rose-700">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className="btn-primary w-full py-6 text-xl">
          {busy ? "들어가는 중…" : "입장하기"}
        </button>
      </form>
    </main>
  );
}
