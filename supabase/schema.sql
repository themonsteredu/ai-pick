-- ─────────────────────────────────────────────────────────────
-- AI 잘 부려먹기 · 데이터베이스 만들기
--
-- 사용법
--  1) Supabase 사이트 → 내 프로젝트 → 왼쪽 메뉴 "SQL Editor"
--  2) 아래 내용을 통째로 붙여넣고 "Run" 클릭
--
-- 개인정보는 저장하지 않습니다. 닉네임과 수업 응답만 저장합니다.
-- ─────────────────────────────────────────────────────────────

-- 수업 세션
create table if not exists public.sessions (
  code          text primary key,
  title         text        not null default '새 수업',
  teacher_token text        not null,
  created_at    timestamptz not null default now(),
  current_step  text        not null default 'lobby',
  open_steps    jsonb       not null default '["lobby"]'::jsonb
);

-- 접속한 학생 (닉네임만)
create table if not exists public.participants (
  id           uuid primary key default gen_random_uuid(),
  session_code text        not null references public.sessions(code) on delete cascade,
  nickname     text        not null,
  team_code    text,
  joined_at    timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index if not exists participants_session_idx
  on public.participants (session_code);

-- 학생 응답
create table if not exists public.responses (
  id             uuid primary key default gen_random_uuid(),
  session_code   text        not null references public.sessions(code) on delete cascade,
  participant_id uuid        not null references public.participants(id) on delete cascade,
  step           text        not null,
  item_id        text        not null default 'main',
  payload        jsonb       not null default '{}'::jsonb,
  created_at     timestamptz not null default now(),
  -- 같은 학생이 같은 문항에 다시 답하면 덮어쓴다
  unique (session_code, participant_id, step, item_id)
);

create index if not exists responses_session_step_idx
  on public.responses (session_code, step);

-- 보안: 앱 서버(비밀 열쇠)로만 접근할 수 있게 잠근다.
alter table public.sessions     enable row level security;
alter table public.participants enable row level security;
alter table public.responses    enable row level security;
