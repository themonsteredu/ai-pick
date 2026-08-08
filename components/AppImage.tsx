"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 그림 파일이 아직 없어도 화면이 깨지지 않게 해주는 이미지.
 * 파일이 없으면 회색 상자에 파일명이 적힌 자리표시자가 보인다.
 *
 * 사용법: <AppImage name="logo.png" alt="로고" className="h-20 w-20" />
 * 그림 파일은 /public/images/ 안에 넣으면 자동으로 바뀐다.
 */
export function AppImage({
  name,
  alt,
  className = "",
  rounded = "rounded-2xl",
}: {
  name: string;
  alt: string;
  className?: string;
  rounded?: string;
}) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // 화면이 그려지기 전에 이미 실패한 경우도 잡아낸다.
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={`${alt} (그림 파일 없음: ${name})`}
        title={`/public/images/${name} 파일을 넣으면 여기에 그림이 나옵니다.`}
        className={`flex items-center justify-center overflow-hidden border-2 border-dashed
                    border-slate-300 bg-slate-100 p-1 text-center ${rounded} ${className}`}
      >
        <span className="break-all text-[10px] font-semibold leading-[1.15] text-slate-400">
          {name}
        </span>
      </div>
    );
  }

  return (
    // 파일이 없을 수 있으므로 next/image 대신 기본 img 를 쓴다.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={`/images/${name}`}
      alt={alt}
      onError={() => setFailed(true)}
      className={`object-contain ${rounded} ${className}`}
    />
  );
}
