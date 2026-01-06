import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  // AWS Amplify 정적 호스팅 (비용 절감 및 안정성)
  output: 'export',

  // 이미지 최적화는 유지 (비용 절감)
  images: {
    unoptimized: true
  },

  // AWS Amplify는 루트 도메인을 사용하므로 basePath 제거
  // GitHub Pages 설정 주석 처리
  // basePath: isProd ? '/Ainativepromptmanagermvp' : undefined,
  // assetPrefix: isProd ? '/Ainativepromptmanagermvp/' : undefined,

  env: {
    NEXT_PUBLIC_BASE_PATH: '', // 루트 경로 사용
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*',
      },
      {
        source: '/docs',
        destination: 'http://127.0.0.1:8000/docs',
      },
      {
        source: '/openapi.json',
        destination: 'http://127.0.0.1:8000/openapi.json',
      },
    ];
  },
};

export default nextConfig;