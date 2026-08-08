import { memoryStore } from "./memory";
import { hasSupabaseConfig, supabaseStore } from "./supabase";
import type { Store } from "./types";

/**
 * Supabase 설정이 있으면 Supabase, 없으면 서버 메모리를 쓴다.
 * 덕분에 아무 설정 없이도 npm run dev 로 바로 확인할 수 있다.
 */
export const store: Store = hasSupabaseConfig() ? supabaseStore : memoryStore;

export const storageKind = store.kind;
export type { Store };
