import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { LevelGuide } from "@/components/LevelGuide";

export default function HomePage() {
  return (
    <main className="app-shell">
      <AppHeader subtitle="문제에 맞는 도구를 고르는 힘을 기르는 수업" />

      <section className="card">
        <h1 className="text-3xl font-black leading-snug sm:text-4xl">
          가장 비싼 AI를 쓰는 사람이
          <br />
          AI를 잘 쓰는 사람일까?
        </h1>
        <p className="mt-4 text-step text-slate-600">
          문제에 맞는 도구를 고르고, 좋은 질문을 만들고, 답을 검증하는 사람이
          <br className="hidden sm:block" /> AI를 잘 쓰는 사람입니다.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link href="/join" className="btn-primary w-full py-6 text-xl">
            학생 입장하기
          </Link>
          <Link href="/teacher" className="btn-secondary w-full py-6 text-xl">
            선생님 화면
          </Link>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-2xl font-black">오늘 쓸 4단계</h2>
        <LevelGuide />
      </section>

      <p className="mt-8 text-center text-sm text-slate-400">
        이 수업은 이름·연락처 같은 개인정보를 받지 않습니다. 닉네임만 사용합니다.
      </p>
    </main>
  );
}
