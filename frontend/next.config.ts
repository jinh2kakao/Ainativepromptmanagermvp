import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. 정적 사이트 생성 모드 (GitHub Pages 필수)
  output: 'export',

  // 2. 이미지 최적화 끄기 (Next.js 서버 없이 배포하기 때문)
  images: {
    unoptimized: true
  },

  // 3. GitHub Pages 경로 설정 (저장소 이름)
  // [주의] 커스텀 도메인(promptlib.co.kr) 연결 시 아래 두 줄은 삭제하거나 주석 처리해야 합니다.
  basePath: '/Ainativepromptmanagermvp',
  assetPrefix: '/Ainativepromptmanagermvp/',
};

export default nextConfig;