# Frontend 컨텍스트

## 📁 디렉토리 구조

```
frontend/src/
├── app/                    # Next.js App Router (30개 라우트)
│   ├── (auth)/             # 인증 관련 페이지
│   ├── (dashboard)/        # 대시보드 페이지
│   ├── projects/           # 프로젝트 관리
│   └── layout.tsx          # 루트 레이아웃
├── components/             # UI 컴포넌트 (151개)
│   ├── ui/                 # shadcn/ui 컴포넌트
│   ├── prompts/            # 프롬프트 관련
│   ├── projects/           # 프로젝트/캔버스
│   └── common/             # 공통 컴포넌트
├── features/               # 기능별 모듈
│   ├── auth/               # 인증 기능
│   ├── prompts/            # 프롬프트 기능
│   ├── teams/              # 팀 기능
│   └── community/          # 커뮤니티 기능
├── stores/                 # Zustand 스토어
│   ├── teamStore.ts        # 팀 상태
│   └── uiStore.ts          # UI 상태
├── lib/                    # 유틸리티 라이브러리
├── types/                  # TypeScript 타입 정의
└── utils/                  # 헬퍼 함수
```

---

## 🛠️ 기술 스택

| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js | 16.0.5 | 프레임워크 (App Router) |
| React | 19.2.0 | UI 라이브러리 |
| TypeScript | 5.x | 타입 안전성 |
| TailwindCSS | 4.x | 스타일링 |
| Zustand | 5.0.9 | 상태 관리 |
| @xyflow/react | 12.9.3 | 캔버스 에디터 |
| React Query | 5.x | 서버 상태 관리 |
| Radix UI | - | 접근성 컴포넌트 |

---

## 📐 코드 규칙

### 컴포넌트 작성
```tsx
// ✅ 함수형 컴포넌트 + interface 사용
interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick: () => void;
}

export function Button({ variant, onClick }: ButtonProps) {
  return <button className={cn(styles[variant])} onClick={onClick} />;
}
```

### 스타일링
- TailwindCSS **inline class** 사용
- `cn()` 유틸리티로 조건부 클래스 병합
- 컴포넌트 스타일은 같은 파일에 정의

### 상태 관리
```tsx
// Zustand 스토어 패턴
import { useTeamStore } from '@/stores/teamStore';

const { currentTeam, setCurrentTeam } = useTeamStore();
```

### API 호출
```tsx
// React Query 사용
import { useQuery, useMutation } from '@tanstack/react-query';

const { data, isLoading } = useQuery({
  queryKey: ['prompts'],
  queryFn: fetchPrompts,
});
```

---

## 🔐 인증

- **Supabase Auth** 사용
- 세션은 `@supabase/supabase-js` 클라이언트로 관리
- Protected Route는 `middleware.ts`에서 처리

---

## 📦 빌드 & 배포

- **빌드 모드**: Static Export (`output: 'export'`)
- **배포**: Cloudflare Pages (자동)
- **도메인**: `promptlib.co.kr`

### 주요 스크립트
```bash
npm run dev          # 개발 서버
npm run build        # 프로덕션 빌드
npm run type-check   # 타입 검사
npm run lint         # ESLint 검사
```

---

## ⚠️ 주의사항

- `any` 타입 사용 금지
- `console.log` 프로덕션 코드에 남기지 않기
- inline style 사용 금지 (TailwindCSS 사용)
- 컴포넌트 파일명은 PascalCase

---

## 🔗 Path Alias

```tsx
import { Button } from '@/components/ui/Button';
import { useTeamStore } from '@/stores/teamStore';
import { cn } from '@/lib/utils';
```

`@/*` → `./src/*` 매핑 (tsconfig.json)
