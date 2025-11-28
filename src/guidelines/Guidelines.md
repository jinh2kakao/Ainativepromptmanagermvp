# AI Native Prompt Manager - Development Guidelines

## 📋 Table of Contents
1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [프로젝트 구조](#프로젝트-구조)
4. [핵심 기능](#핵심-기능)
5. [아키텍처](#아키텍처)
6. [컴포넌트 가이드](#컴포넌트-가이드)
7. [상태 관리](#상태-관리)
8. [스타일링 가이드](#스타일링-가이드)
9. [반응형 디자인](#반응형-디자인)
10. [코딩 컨벤션](#코딩-컨벤션)
11. [개발 워크플로우](#개발-워크플로우)

---

## 프로젝트 개요

### 🎯 목적
파편화된 프롬프트를 자산화하고 변수 입력을 통해 즉시 재사용 가능한 워크플로우를 제공하는 생산성 도구

### 👥 타겟 사용자
- 마케터
- 콘텐츠 크리에이터  
- LLM 헤비 유저
- 기획자, 디자이너, 개발자 등 다양한 직군

### 💼 비즈니스 모델
**Freemium Model**
- **Guest**: 로컬스토리지 최대 10개 (7개 시점 경고, 10개 생성 차단)
- **Free**: 로그인 후 50개 제한
- **Pro**: 무제한 프롬프트 + 프리미엄 기능
  - 월간: $5/월
  - 연간: $4/월 (연 $48, 20% 할인)

---

## 기술 스택

### Core
- **React 18+**: UI 라이브러리
- **TypeScript**: 타입 안정성
- **Tailwind CSS v4.0**: 유틸리티 기반 스타일링
- **Vite**: 빌드 도구

### 주요 라이브러리
- **lucide-react**: 아이콘
- **sonner**: 토스트 알림
- **react-responsive-masonry**: Masonry 그리드 레이아웃
- **motion/react**: 애니메이션 (구 Framer Motion)

### Storage
- **LocalStorage**: Guest 및 Free tier 데이터 저장
- **Supabase** (향후): Pro tier 클라우드 동기화

---

## 프로젝트 구조

```
/
├── App.tsx                         # 메인 애플리케이션 엔트리
├── types/
│   └── index.ts                    # TypeScript 타입 정의
├── components/
│   ├── Header.tsx                  # 상단 네비게이션
│   ├── PromptModal.tsx             # 프롬프트 생성/수정 모달
│   ├── PricingModal.tsx            # Pro 요금제 안내 모달
│   ├── SimpleModeInput.tsx         # 일반 모드 입력
│   ├── AssistanceMode.tsx          # 어시스턴스 모드 (P.A.I.R 프레임워크)
│   ├── PromptListView.tsx          # 리스트/칸반 뷰 컨테이너
│   ├── PromptList.tsx              # Masonry 그리드 리스트
│   ├── PromptCard.tsx              # 프롬프트 카드 (칸반용)
│   ├── PromptDetailPage.tsx        # 프롬프트 상세 페이지
│   ├── KanbanBoard.tsx             # 칸반 보드
│   ├── RunModal.tsx                # 변수 치환 및 실행 모달
│   ├── QuotaWarning.tsx            # 할당량 경고
│   ├── EmptyState.tsx              # 빈 상태 UI
│   ├── auth/                       # 인증 관련 컴포넌트
│   │   ├── AuthPage.tsx
│   │   ├── LoginForm.tsx
│   │   ├── SignUpForm.tsx
│   │   ├── AuthLeftPanel.tsx
│   │   ├── TermsCheckboxGroup.tsx  # 약관 동의 체크박스 그룹
│   │   ├── TermsModal.tsx          # 약관 상세보기 모달
│   │   └── SocialLoginTermsModal.tsx  # 소셜 로그인 약관 모달
│   ├── figma/
│   │   └── ImageWithFallback.tsx   # 이미지 폴백 처리
│   └── ui/                         # 재사용 가능한 UI 컴포넌트
├── utils/
│   ├── promptUtils.ts              # 프롬프트 관련 유틸리티
│   ├── jobCategories.ts            # 직무 카테고리 데이터
│   └── storage.ts                  # 로컬스토리지 관리
├── styles/
│   └── globals.css                 # 글로벌 스타일 및 CSS 변수
└── guidelines/
    └── Guidelines.md               # 개발 가이드라인
```

---

## 핵심 기능

### 1️⃣ 하이브리드 프롬프트 입력

#### 일반 모드 (Simple Mode)
- 자유 형식 텍스트 입력
- 변수 자동 감지: `{{변수명}}` 형식
- 실시간 변수 추출 및 표시

#### 어시스턴스 모드 (Assistance Mode)
**P.A.I.R 프레임워크 기반**
- **P**ersona: 역할(Profile) + 의도(Intent)
- **A**sset: 지식 베이스(Knowledge Base) + 스타일 가이드(Style Guide)  
- **I**nstruction: 작업(Task) + 맥락(Context) + 제약사항(Constraints)
- **R**esult: 형식(Format) + 예시(Example)

각 직무별 맞춤형 가이드 제공 (플레이스홀더 및 예시)

### 2️⃣ 다중 뷰 모드

#### List View (리스트 뷰)
- Masonry 그리드 레이아웃
- 반응형 컬럼: 1/2/3/4단 자동 조정
- 카드 너비 고정, 높이만 동적 조정
- 빠른 복사 버튼

#### Kanban View (칸반 뷰)
- 직무 카테고리별 그룹핑
- Drag & Drop 지원
- 7개 카테고리:
  - 서비스 & 프로덕트 기획
  - UI/UX & 크리에이티브 디자인
  - 소프트웨어 개발 & 엔지니어링
  - 데이터 분석 & AI
  - 마케팅 & 그로스
  - 유튜브 & 영상 미디어
  - 비즈니스 일반 & 영업

### 3️⃣ 변수 치환 프롬프트 런처
- 런타임 변수 입력 폼 자동 생성
- 치환 후 프롬프트 미리보기
- 클립보드 복사 기능
- 변수 검증 및 안내

### 4️⃣ 직무 기반 분류
- **대분류(Category)**: 필수 선택
- **소분류(Sub-Category)**: 선택 사항 (Optional)
- 2단계 직무 체계 (7개 대분류, 각 4~6개 소분류)

### 5️⃣ 사용자 할당량 관리
- Guest: 10개 제한 (7개 시점 경고)
- Free: 50개 제한
- Pro: 무제한 + 프리미엄 기능

### 6️⃣ 약관 동의 시스템
- **회원가입 플로우**: 이메일 인증 → 프로필 입력 → 약관 동의 → 가입 완료
- **소셜 로그인 플로우**: Google 로그인 → 신규 유저 감지 → 약관 동의 모달 → 가입 완료
- **약관 항목**:
  - (필수) 서비스 이용약관 동의
  - (필수) 개인정보 수집 및 이용 동의
  - (필수) 만 14세 이상 확인
  - (선택) 마케팅 정보 수신 동의
- **UI 특징**:
  - 전체 동의 체크박스 (하위 항목 일괄 체크/해제)
  - 모던한 체크박스 디자인 (Blue 채움, 3px 둥근 모서리)
  - 약관 [보기] 링크 → 상세 약관 모달 오픈
  - 필수 항목 미체크 시 가입 버튼 비활성화

---

## 아키텍처

### 데이터 흐름

```
┌─────────────────┐
│   App.tsx       │  ← 최상위 상태 관리
│   (State Root)  │
└────────┬────────┘
         │
         ├─────────────────────────────┬────────────────────┐
         ▼                             ▼                    ▼
┌─────────────────┐         ┌──────────────────┐   ┌─────────────┐
│  Header         │         │  PromptListView  │   │  AuthPage   │
│  (Navigation)   │         │  (View Container)│   │  (Auth)     │
└─────────────────┘         └────────┬─────────┘   └─────────────┘
                                     │
                        ┌────────────┴────────────┐
                        ▼                         ▼
                ┌───────────────┐         ┌──────────────┐
                │  PromptList   │         │ KanbanBoard  │
                │  (Masonry)    │         │  (Columns)   │
                └───────────────┘         └──────────────┘
                        │
                        ▼
                ┌───────────────┐
                │ PromptCard    │
                │ (Individual)  │
                └───────────────┘
```

### 상태 관리 패턴
- **로컬 상태**: `useState` (컴포넌트 레벨)
- **전역 상태**: Props Drilling (App.tsx → 하위 컴포넌트)
- **영속성**: LocalStorage API
- **향후**: Context API 또는 Zustand 도입 고려

### 타입 시스템

```typescript
// 핵심 타입
interface Prompt {
  id: string;
  title: string;
  mode: 'simple' | 'assistance';
  content: string;              // 조합된 최종 프롬프트
  category?: string;            // 대분류 (필수)
  subCategory?: string;         // 소분류 (선택)
  isPublic: boolean;            // 공개/비공개
  ownerId?: string;             // 소유자 ID
  structure?: PAIRStructure;    // 어시스턴스 모드 데이터
  variables: string[];          // 추출된 변수 목록
  createdAt: number;
  updatedAt: number;
}

type ViewMode = 'list' | 'kanban';
type UserType = 'guest' | 'free' | 'pro';
```

---

## 컴포넌트 가이드

### 🔷 Layout Components

#### `Header.tsx`
**역할**: 상단 네비게이션 바
**Props**:
- `viewMode`: 현재 뷰 모드
- `onViewModeChange`: 뷰 모드 변경 핸들러
- `userType`: 사용자 타입
- `onSignUp`: 회원가입/로그아웃 핸들러
- `promptCount`: 현재 프롬프트 수
- `quotaLimit`: 할당량 제한

**특징**:
- 좌측: 로고
- 중앙: 뷰 토글 (List/Kanban)
- 우측: 사용자 상태 + 액션 버튼
- `gap-4 md:gap-6`로 요소 간 충분한 간격 확보

---

### 🔷 Modal Components

#### `PromptModal.tsx`
**역할**: 프롬프트 생성/수정 모달
**Props**:
- `prompt`: 수정할 프롬프트 (없으면 생성 모드)
- `onSave`: 저장 핸들러
- `onClose`: 닫기 핸들러

**특징**:
- 모바일: Full Screen
- 데스크톱: Centered Modal (max-w-4xl)
- 모드 토글: 일반 ↔ 어시스턴스
- 직무 선택: 대분류(필수) + 소분류(선택)
- 자동 제목 생성 지원

**유효성 검사**:
```typescript
// 대분류만 필수, 소분류는 선택
if (!category) {
  alert('대분류를 선택해주세요');
  return;
}
```

#### `RunModal.tsx`
**역할**: 변수 치환 및 실행 모달
**Props**:
- `prompt`: 실행할 프롬프트
- `onClose`: 닫기 핸들러

**특징**:
- 변수 입력 폼 동적 생성
- 실시간 프롬프트 조합 미리보기
- 클립보드 복사 기능
- 빈 변수 검증

#### `PricingModal.tsx`
**역할**: Pro 요금제 안내 모달
**Props**:
- `onClose`: 닫기 핸들러
- `onUpgrade`: 업그레이드 핸들러

**특징**:
- 월간/연간 결제 토글 (20% 할인 배지)
- Basic vs Pro 요금제 비교
- 그라데이션 헤더 (Blue → Purple)
- **레이아웃 안정성**: 토글 시 모달 상단 고정 (items-start)
- **반응형**: 모바일 세로 스택, 데스크톱 2단 그리드

---

### 🔷 View Components

#### `PromptList.tsx`
**역할**: Masonry 그리드 리스트
**Props**:
- `prompts`: 프롬프트 배열
- `onPromptClick`: 클릭 핸들러

**특징**:
- 반응형 컬럼: `{ 350: 1, 640: 2, 900: 3, 1200: 4 }`
- 카드 너비 고정: `w-full` + `style={{ width: '100%' }}`
- 텍스트 줄바꿈: `break-all`
- Hover 시 퀵 복사 버튼 (데스크톱)
- 모바일 항상 표시 (터치 접근성)

#### `KanbanBoard.tsx`
**역할**: 칸반 보드
**Props**:
- `prompts`: 프롬프트 배열
- `onPromptClick`: 클릭 핸들러

**특징**:
- 7개 카테고리 컬럼
- 가로 스크롤 (모바일)
- 카테고리별 프롬프트 그룹핑
- 각 카드는 `PromptCard` 컴포넌트 사용

#### `PromptDetailPage.tsx`
**역할**: 프롬프트 상세 페이지
**Props**:
- `prompt`: 프롬프트 데이터
- `currentUserId`: 현재 사용자 ID
- `onBack`, `onEdit`, `onDelete`, `onRun`, `onTogglePublic`: 각종 액션 핸들러

**특징**:
- 상단: 뒤로가기 + 액션 버튼 (복사/공개/공유/수정/삭제)
- 본문: 프롬프트 내용 전체 표시
- 변수 있으면 실행 버튼 표시
- 소유자만 수정/삭제 가능

**최근 추가**: 
- 헤더에 그라데이션 **복사 버튼** 추가 (가장 눈에 띄게)

---

### 🔷 Input Components

#### `SimpleModeInput.tsx`
**역할**: 일반 모드 텍스트 입력
**Props**:
- `value`: 입력값
- `onChange`: 변경 핸들러

**특징**:
- 자유 형식 textarea
- 실시간 변수 감지: `{{variable}}`
- 감지된 변수 자동 표시

#### `AssistanceMode.tsx`
**역할**: 어시스턴스 모드 (P.A.I.R 프레임워크)
**Props**:
- `value`: 구조체 데이터
- `onChange`: 변경 핸들러
- `selectedJob`: 선택된 직무

**특징**:
- 4개 섹션 아코디언 (Persona, Asset, Instruction, Result)
- 각 필드별 가이드 및 플레이스홀더
- 직무별 맞춤형 템플릿
- 실시간 프롬프트 조합 미리보기

---

### 🔷 Feedback Components

#### `QuotaWarning.tsx`
**역할**: 할당량 경고 토스트
**사용 시점**:
- Guest 사용자가 7개 프롬프트 생성 시
- 회원가입 유도

#### `EmptyState.tsx`
**역할**: 빈 상태 UI
**Props**:
- `onCreatePrompt`: 생성 버튼 핸들러

**특징**:
- 친근한 안내 메시지
- 시작 버튼

---

### 🔷 Authentication Components

#### `LoginForm.tsx`
**역할**: 로그인 폼
**Props**:
- `onSwitchToSignUp`: 회원가입 전환 핸들러
- `onLoginSuccess`: 로그인 성공 핸들러

**특징**:
- Google 소셜 로그인 버튼
- 이메일/비밀번호 입력
- 신규 유저 감지 시 약관 동의 모달 자동 표시
- 비밀번호 찾기 링크

#### `SignUpForm.tsx`
**역할**: 회원가입 폼
**Props**:
- `onSwitchToLogin`: 로그인 전환 핸들러
- `onSignUpSuccess`: 회원가입 성공 핸들러

**특징**:
- 2단계 플로우: 이메일 인증 → 프로필 입력
- 이메일 인증번호 발송 (3분 타이머)
- 이름, 비밀번호, 비밀번호 확인 입력
- **약관 동의 섹션**: 프로필 입력 후, 가입 완료 버튼 전에 배치
- Motion 애니메이션으로 단계별 전환

#### `TermsCheckboxGroup.tsx`
**역할**: 재사용 가능한 약관 체크박스 그룹
**Props**:
- `allChecked`, `onAllCheckedChange`: 전체 동의 상태
- `serviceTerms`, `onServiceTermsChange`: 서비스 이용약관
- `privacyPolicy`, `onPrivacyPolicyChange`: 개인정보 수집 동의
- `ageConfirm`, `onAgeConfirmChange`: 만 14세 이상 확인
- `marketingConsent`, `onMarketingConsentChange`: 마케팅 수신 동의
- `onViewTerms`: 약관 상세보기 핸들러

**특징**:
- 전체 동의 체크박스 (상단 구분선 포함)
- 4개 개별 항목 (필수 3개 + 선택 1개)
- 체크박스 크기: 모바일 5x5px, 데스크톱 6x6px
- Blue (600) 체크 상태, 회색 기본 상태
- [보기] 링크 밑줄 처리
- 반응형: gap-3 md:gap-4, leading-relaxed

#### `TermsModal.tsx`
**역할**: 약관 상세보기 모달
**Props**:
- `type`: 'service' | 'privacy'
- `onClose`: 닫기 핸들러

**특징**:
- 서비스 이용약관 전문 (7개 조항)
- 개인정보 수집 및 이용 동의 전문 (8개 조항)
- 스크롤 가능 컨텐츠 (max-h-[85vh])
- 상단 헤더 고정, 하단 확인 버튼 고정

#### `SocialLoginTermsModal.tsx`
**역할**: 소셜 로그인 신규 가입 약관 모달
**Props**:
- `onAgree`: 동의 핸들러
- `onClose`: 닫기 핸들러
- `userName`: 사용자 이름 (선택)

**특징**:
- "환영합니다!" 인사 메시지
- TermsCheckboxGroup 재사용
- 그라데이션 "동의하고 시작하기" 버튼
- 필수 약관 미체크 시 버튼 비활성화

---

## 상태 관리

### LocalStorage 관리 (`utils/storage.ts`)

```typescript
// 주요 함수
- loadPrompts(): Prompt[]           // 프롬프트 로드
- savePrompts(prompts): void        // 프롬프트 저장
- loadViewMode(): ViewMode          // 뷰 모드 로드
- saveViewMode(mode): void          // 뷰 모드 저장
- loadUserType(): UserType          // 사용자 타입 로드
- saveUserType(type): void          // 사용자 타입 저장
- canCreatePrompt(count, type): boolean  // 생성 가능 여부
- getQuotaLimit(type): number       // 할당량 조회
- getQuotaWarning(count, type): string | null  // 경고 메시지
- loadLastInputMode(): 'simple' | 'assistance'  // 마지막 입력 모드
- saveLastInputMode(mode): void     // 입력 모드 저장
```

### 데이터 영속성 전략
1. **즉시 저장**: 프롬프트 생성/수정/삭제 시 즉시 LocalStorage 저장
2. **초기 로드**: 앱 마운트 시 LocalStorage에서 데이터 복원
3. **타입 안정성**: JSON 파싱 시 타입 검증
4. **에러 핸들링**: LocalStorage 실패 시 빈 배열 반환

---

## 스타일링 가이드

### Tailwind CSS v4.0 사용

#### ⚠️ 중요: 기본 Typography 오버라이드 금지
```css
/* globals.css에 정의된 기본 타이포그래피 */
h1 { font-size: var(--text-2xl); font-weight: 500; }
h2 { font-size: var(--text-xl); font-weight: 500; }
p { font-size: var(--text-base); font-weight: 400; }
```

**❌ 사용 금지 (특별한 요청 없이)**:
- `text-xl`, `text-2xl` 등 font-size 클래스
- `font-bold`, `font-semibold` 등 font-weight 클래스
- `leading-tight`, `leading-relaxed` 등 line-height 클래스

**✅ 사용 권장**:
- 색상: `text-gray-900`, `text-blue-600`
- 간격: `px-4`, `py-2`, `gap-3`
- 레이아웃: `flex`, `grid`, `w-full`
- 반응형: `md:px-6`, `lg:max-w-7xl`

### 색상 시스템
```css
--primary: #030213          /* 주요 텍스트 */
--secondary: #f3f3f5        /* 배경 */
--accent: #3b82f6           /* 강조 (파란색) */
--purple: #9333ea           /* 보조 강조 (보라색) */
```

### 그라데이션
```tsx
// 주요 그라데이션
bg-gradient-to-r from-blue-600 to-purple-600  // 버튼, 강조
bg-gradient-to-br from-blue-50 to-purple-50   // 배경
```

### 애니메이션
```tsx
// 페이드인 + 줌인
className="animate-in fade-in zoom-in-95 duration-200"

// 트랜지션
className="transition-all duration-200"
```

### 그림자
```tsx
shadow-sm      // 기본 카드
shadow-md      // 호버 카드
shadow-lg      // 버튼
shadow-2xl     // 모달
```

---

## 반응형 디자인

### 브레이크포인트
```css
sm: 640px     /* Small tablets */
md: 768px     /* Tablets */
lg: 1024px    /* Desktop */
xl: 1280px    /* Large Desktop */
```

### 핵심 원칙

#### 1️⃣ Mobile First
```tsx
// 기본: 모바일 스타일
// md: 태블릿 이상
// lg: 데스크톱 이상
className="px-4 md:px-6 lg:px-8"
```

#### 2️⃣ 터치 영역 확보
```tsx
// 모바일에서 최소 44px x 44px
className="min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
```

#### 3️⃣ 패딩 단계적 확대
```tsx
// 모바일 → 태블릿 → 데스크톱
className="p-3 md:p-4 lg:p-6"
className="gap-2 md:gap-3 lg:gap-4"
```

#### 4️⃣ 텍스트 크기 조정
```tsx
// 본문
className="text-xs md:text-sm lg:text-base"

// 제목 (단, globals.css 기본 타이포 우선)
className="text-sm md:text-base lg:text-lg"
```

#### 5️⃣ 모달 처리
```tsx
// 모바일: Full Screen
// 데스크톱: Centered Modal
className="w-full md:max-w-4xl h-full md:h-auto md:rounded-xl"
```

#### 6️⃣ 레이아웃 변경
```tsx
// 모바일: 세로 스택
// 데스크톱: 가로 배치
className="flex flex-col md:flex-row"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

#### 7️⃣ 요소 숨김/표시
```tsx
// 모바일 숨김
className="hidden md:block"

// 모바일만 표시
className="md:hidden"
```

### 주요 컴포넌트 반응형 예시

#### Header
```tsx
// Logo 텍스트: 모바일 숨김
<div className="hidden sm:block">
  <h1>Prompt Manager</h1>
</div>

// 버튼 텍스트: 작은 화면에서 축약
<span className="hidden sm:inline">Sign Up</span>
<span className="sm:hidden">Join</span>
```

#### PromptModal
```tsx
// 전체 화면 vs 센터 모달
<div className="w-full md:max-w-4xl h-full md:h-auto md:max-h-[90vh] md:rounded-xl">
  
// 직무 선택: 모바일 세로 스택, 데스크톱 그리드
<div className="flex flex-col md:grid md:grid-cols-2 gap-3">
```

#### PromptList
```tsx
// Masonry 컬럼 반응형
<ResponsiveMasonry
  columnsCountBreakPoints={{ 350: 1, 640: 2, 900: 3, 1200: 4 }}
>
```

#### KanbanBoard
```tsx
// 모바일: 가로 스크롤
<div className="flex gap-4 overflow-x-auto">
  <div className="min-w-[280px] md:min-w-[320px]">
```

#### PricingModal
```tsx
// 모달 상단 고정 (컨텐츠 변경 시 하단만 변경)
<div className="fixed inset-0 flex items-start pt-8 md:pt-12">

// 토글 버튼 - opacity로 레이아웃 유지
<span className={`transition-opacity ${isYearly ? 'opacity-100' : 'opacity-0'}`}>
  20% 할인
</span>
```

#### TermsCheckboxGroup
```tsx
// 체크박스 크기 반응형
<div className="w-5 h-5 md:w-6 md:h-6">

// 텍스트 크기 반응형
<span className="text-sm md:text-base">

// 간격 및 터치 영역
<div className="space-y-3 md:space-y-4">
<label className="flex items-start gap-3">
```

---

## 코딩 컨벤션

### TypeScript

#### 타입 정의
```typescript
// Interface 사용 (확장 가능한 객체)
interface PromptModalProps {
  prompt?: Prompt | null;
  onSave: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

// Type 사용 (유니언, 리터럴)
type ViewMode = 'list' | 'kanban';
type UserType = 'guest' | 'free' | 'pro';
```

#### Optional Chaining
```typescript
// 안전한 접근
const subCat = prompt?.subCategory;
const taskValue = structure?.instruction?.task || '';
```

#### 타입 단언 최소화
```typescript
// ❌ 지양
(structure as any)[sectionKey][key]

// ✅ 권장
const section = structure[sectionKey];
if (section) {
  section[key] = value;
}
```

### React

#### 컴포넌트 명명
```typescript
// PascalCase
export function PromptModal({ ... }) { }
```

#### Props 구조 분해
```typescript
// 명시적으로 구조 분해
export function Header({ viewMode, onViewModeChange, userType }: HeaderProps) {
  // ...
}
```

#### State 명명
```typescript
const [isLoading, setIsLoading] = useState(false);        // boolean: is/has prefix
const [selectedId, setSelectedId] = useState<string | null>(null);  // nullable
const [prompts, setPrompts] = useState<Prompt[]>([]);    // 배열: 복수형
```

#### 이벤트 핸들러 명명
```typescript
const handleSave = () => { };         // handle prefix
const handlePromptClick = (id) => { }; // 명확한 동작 설명
```

#### useEffect 의존성
```typescript
// 모든 의존성 명시
useEffect(() => {
  const vars = extractVariables(value);
  setVariables(vars);
}, [value]);  // ✅
```

### CSS (Tailwind)

#### 클래스 순서
```tsx
// 레이아웃 → 크기 → 간격 → 색상 → 타이포 → 효과
className="
  flex items-center justify-between  // 레이아웃
  w-full h-14                        // 크기
  px-4 py-2 gap-3                    // 간격
  bg-white text-gray-900             // 색상
  rounded-lg shadow-sm               // 효과
  hover:shadow-md transition-all     // 상호작용
  md:px-6 md:h-16                    // 반응형
"
```

#### 조건부 클래스
```tsx
// 템플릿 리터럴 사용
className={`px-3 py-2 rounded-lg ${
  isActive 
    ? 'bg-blue-600 text-white' 
    : 'bg-gray-100 text-gray-700'
}`}
```

### 파일 구조

#### 컴포넌트 파일
```typescript
// 1. Imports
import { useState } from 'react';
import { Icon } from 'lucide-react';
import { Type } from '../types';

// 2. Types/Interfaces
interface ComponentProps {
  // ...
}

// 3. Component
export function Component({ ... }: ComponentProps) {
  // 4. State
  const [state, setState] = useState();
  
  // 5. Handlers
  const handleAction = () => { };
  
  // 6. Effects
  useEffect(() => { }, []);
  
  // 7. Render
  return (
    // JSX
  );
}
```

### 네이밍

#### 파일명
- 컴포넌트: `PascalCase.tsx` (예: `PromptModal.tsx`)
- 유틸리티: `camelCase.ts` (예: `promptUtils.ts`)
- 타입: `index.ts` (types 폴더 내)

#### 변수/함수
- 컴포넌트: `PascalCase`
- 변수: `camelCase`
- 상수: `UPPER_SNAKE_CASE`
- Private: `_privateFunction` (언더스코어 prefix)

---

## 개발 워크플로우

### 1️⃣ 새 기능 개발

```bash
# 1. 기능 브랜치 생성
git checkout -b feature/new-feature

# 2. 타입 정의 (필요 시)
# types/index.ts 수정

# 3. 유틸리티 함수 작성 (필요 시)
# utils/ 폴더에 작성

# 4. 컴포넌트 작성
# components/ 폴더에 작성

# 5. 통합 및 테스트
# App.tsx에 통합

# 6. 스타일 조정
# Tailwind 클래스 적용

# 7. 반응형 확인
# 모바일/태블릿/데스크톱 확인

# 8. 커밋
git add .
git commit -m "feat: Add new feature"

# 9. 푸시
git push origin feature/new-feature
```

### 2️⃣ 버그 수정

```bash
# 1. 버그 재현
# 문제 확인 및 재현 단계 파악

# 2. 원인 분석
# 해당 컴포넌트/함수 확인

# 3. 수정
# 최소한의 변경으로 수정

# 4. 회귀 테스트
# 다른 기능에 영향 없는지 확인

# 5. 커밋
git commit -m "fix: Fix bug description"
```

### 3️⃣ 컴포넌트 추가

```bash
# 1. 컴포넌트 파일 생성
# components/NewComponent.tsx

# 2. Props 인터페이스 정의
interface NewComponentProps {
  // ...
}

# 3. 컴포넌트 작성
export function NewComponent({ ... }: NewComponentProps) {
  // ...
}

# 4. 반응형 스타일 적용
# 모바일 우선 + md/lg 브레이크포인트

# 5. 부모 컴포넌트에 통합
import { NewComponent } from './components/NewComponent';

# 6. 테스트
# 다양한 화면 크기에서 확인
```

### 4️⃣ 스타일 수정

```bash
# 1. globals.css 확인
# 기본 타이포그래피 변경 금지

# 2. Tailwind 클래스 사용
# 유틸리티 클래스 우선

# 3. 커스텀 CSS는 최소화
# globals.css에 추가 (필요 시에만)

# 4. 반응형 확인
# 모든 브레이크포인트에서 확인
```

### 5️⃣ 커밋 메시지 컨벤션

```bash
# Type: Subject
# 
# Body (optional)

# Types:
feat:     # 새 기능
fix:      # 버그 수정
refactor: # 리팩토링
style:    # 스타일 변경 (코드 포맷팅 등)
docs:     # 문서 수정
chore:    # 빌드/설정 변경
test:     # 테스트 추가/수정

# 예시:
feat: Add P.A.I.R framework assistance mode
fix: Fix card width overflow in list view
refactor: Extract storage logic to utils
style: Update responsive padding in Header
docs: Add development guidelines
```

---

## 체크리스트

### ✅ 새 컴포넌트 작성 시
- [ ] TypeScript 인터페이스 정의
- [ ] Props 명시적 타입 지정
- [ ] 반응형 스타일 적용 (모바일 우선)
- [ ] 터치 영역 최소 44px (모바일)
- [ ] 기본 타이포그래피 오버라이드 금지
- [ ] 애니메이션/트랜지션 추가 (적절한 경우)
- [ ] 접근성 고려 (aria-label, title 등)

### ✅ 스타일 수정 시
- [ ] Tailwind 유틸리티 클래스 우선 사용
- [ ] 반응형 브레이크포인트 적용
- [ ] 색상 시스템 준수 (gray-*, blue-*, purple-*)
- [ ] 일관된 간격 사용 (px-4, gap-3 등)
- [ ] 그림자/둥근 모서리 일관성

### ✅ 기능 추가 시
- [ ] 타입 정의 업데이트
- [ ] LocalStorage 저장/로드 처리
- [ ] 에러 핸들링 추가
- [ ] Toast 알림 표시 (적절한 경우)
- [ ] 사용자 피드백 제공
- [ ] 모달 레이아웃 안정성 확인 (컨텐츠 변경 시 상단 고정)

### ✅ 배포 전 확인
- [ ] TypeScript 에러 없음
- [ ] 모든 브레이크포인트에서 정상 작동
- [ ] LocalStorage 동작 확인
- [ ] Guest 할당량 제한 동작 확인
- [ ] 크로스 브라우저 테스트 (Chrome, Safari, Firefox)

---

## 추가 참고사항

### 향후 개발 계획
- [ ] Context API / Zustand 도입 (상태 관리 개선)
- [ ] Supabase 연동 (Pro tier 클라우드 동기화)
- [ ] 실제 결제 시스템 연동 (Stripe, Toss Payments 등)
- [ ] 약관 버전 관리 및 변경 이력 추적
- [ ] 프롬프트 검색 기능
- [ ] 프롬프트 태그 시스템
- [ ] 프롬프트 템플릿 마켓플레이스
- [ ] 팀 협업 기능
- [ ] 버전 관리 (프롬프트 히스토리)

### 알려진 제약사항
- LocalStorage 용량 제한 (~5MB)
- Guest 사용자 브라우저 캐시 삭제 시 데이터 손실
- 현재 단일 사용자만 지원 (멀티 유저 미지원)

### 유용한 리소스
- [Tailwind CSS v4 문서](https://tailwindcss.com/docs)
- [React 공식 문서](https://react.dev)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
- [Lucide Icons](https://lucide.dev/)

---

## 문의 및 기여

### 질문이 있으신가요?
- 이슈 등록: GitHub Issues
- 토론: GitHub Discussions

### 기여 방법
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 최근 업데이트 (2025년 11월 28일)

### ✨ 새로운 기능
1. **약관 동의 시스템 추가**
   - 회원가입 시 약관 동의 섹션 통합
   - 소셜 로그인 신규 유저 약관 모달
   - 재사용 가능한 체크박스 그룹 컴포넌트
   - 상세 약관 조회 모달

2. **Pro 요금제 모달 추가**
   - 월간/연간 결제 토글
   - Basic vs Pro 비교 표
   - 모달 레이아웃 안정성 개선

3. **브랜드 업데이트**
   - Promit 로고로 전면 교체
   - 투명 배경 PNG 이미지 적용

### 🔧 개선사항
- 모달 상단 위치 고정 (items-start) - 컨텐츠 변경 시 레이아웃 안정성
- 토글 버튼 opacity 제어 - 레이아웃 이동 방지
- 약관 체크박스 반응형 개선 - 터치 영역 확보

---

**마지막 업데이트**: 2025년 11월 28일  
**버전**: 1.1.0  
**작성자**: Development Team
