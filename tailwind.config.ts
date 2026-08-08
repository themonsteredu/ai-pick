import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // 에스코어드림 (자세한 설정은 app/globals.css 위쪽)
        sans: [
          "S-Core Dream",
          "-apple-system",
          "BlinkMacSystemFont",
          "Apple SD Gothic Neo",
          "Noto Sans KR",
          "Malgun Gothic",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        // 4단계 색 (사람=회색, 빠른 AI=연두, 생각하는 AI=파랑, 깊게 파는 AI=보라)
        person: "#64748b",
        light: "#65a30d",
        think: "#2563eb",
        deep: "#7c3aed",
      },
      fontSize: {
        // 교실 뒤에서도 보이도록 전체적으로 큼직하게
        "step": ["1.375rem", { lineHeight: "1.9rem" }],
      },
      boxShadow: {
        card: "0 10px 30px -12px rgba(15, 23, 42, 0.25)",
      },
      keyframes: {
        pop: {
          "0%": { transform: "scale(0.94)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        pop: "pop 180ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
