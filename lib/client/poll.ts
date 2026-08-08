"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 2초마다 서버에 물어보는 아주 단순한 방식.
 * 앞의 요청이 끝난 뒤에 다음 요청을 보내므로 요청이 밀리지 않는다.
 */
export function usePoll<T>(url: string | null, intervalMs = 2000) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const savedUrl = useRef(url);
  savedUrl.current = url;

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = async () => {
      try {
        const res = await fetch(url, { cache: "no-store" });
        const json = await res.json();
        if (cancelled) return;
        if (json?.ok) {
          setData(json as T);
          setError(null);
        } else {
          setError(json?.error ?? "정보를 불러오지 못했습니다.");
        }
      } catch {
        if (!cancelled) setError("연결이 잠시 끊겼어요. 계속 다시 시도합니다.");
      } finally {
        if (!cancelled) {
          setLoading(false);
          timer = setTimeout(tick, intervalMs);
        }
      }
    };

    setLoading(true);
    tick();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [url, intervalMs]);

  return { data, error, loading };
}

/** 학생 화면이 살아 있다고 서버에 알려준다. (접속 인원 계산용) */
export function useHeartbeat(code: string | null, participantId: string | null) {
  useEffect(() => {
    if (!code || !participantId) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const beat = async () => {
      try {
        await fetch(`/api/sessions/${code}/heartbeat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ participantId }),
        });
      } catch {
        // 실패해도 다음 신호에서 다시 시도한다.
      } finally {
        if (!cancelled) timer = setTimeout(beat, 10_000);
      }
    };

    beat();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [code, participantId]);
}
