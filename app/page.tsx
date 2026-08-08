import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { AppImage } from "@/components/AppImage";
import { LevelGuide } from "@/components/LevelGuide";
import { APP_TAGLINE } from "@/lib/brand";

export default function HomePage() {
  return (
    <main className="app-shell">
      <AppHeader subtitle={APP_TAGLINE} />

      <section className="card">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <h1 className="text-3xl font-black leading-snug sm:text-4xl">
              가장 비싼 AI를 쓰는 사람이
              <br />
              AI를 잘 쓰는 사람일까?
            </h1>
            <p className="mt-4 text-step text-slate-600">
              고르고, 묻고, 검증하는 사람이 잘 쓰는 사람입니다.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Link href="/join" className="btn-primary w-full py-6 text-xl">
                학생 입장하기
              </Link>
              <Link href="/teacher" className="btn-secondary w-full py-6 text-xl">
                선생님 화면
              </Link>
            </div>
          </div>

          <AppImage
            name="intro-scene.png"
            alt="교실에서 노트북 앞에 앉아 어떤 도구를 쓸지 고민하는 학생"
            className="h-auto w-full"
            rounded="rounded-3xl"
          />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-2xl font-black">오늘 쓸 4단계</h2>
        <LevelGuide />
      </section>

      <p className="mt-8 text-center text-sm text-slate-400">
        닉네임만 사용합니다. 개인정보를 받지 않습니다.
      </p>
    </main>
  );
}
