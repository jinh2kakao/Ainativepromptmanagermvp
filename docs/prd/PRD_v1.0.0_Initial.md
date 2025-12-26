# [PRD] AI Native Prompt Manager MVP (Refined)

## 1. Product Strategy & Scope

**Core Value**: 파편화된 프롬프트를 자산화하고, 변수 입력을 통해 즉시 재사용 가능한 워크플로우 제공.

**Target Audience**: 마케터, 콘텐츠 크리에이터, LLM 헤비 유저.

**Monetization Model (Freemium)**:
- **Guest**: 로컬 저장소 이용, 최대 10개 프롬프트 저장, 기본 기능.
- **Free Member**: 클라우드 동기화, 최대 50개 저장.
- **Pro (Future)**: 무제한 저장, 팀 공유, 버전 관리 ($5/mo 예상).

## 2. Requirements Detail

### P0-0: 반응형 디자인 표준 (Global Responsive Standard)

**Strategic Goal**: 모든 디바이스에서 끊김 없는 경험을 제공합니다. 기존 기능은 유지하되 레이아웃만 유동적으로 변경합니다.

**Breakpoints Definition (Tailwind CSS 기준)**
- **Mobile**: < 768px (block layout, 1 column)
- **Tablet**: 768px ~ 1024px (md:, 2~3 columns)
- **Desktop**: > 1024px (lg:, 4 columns, Split Screen)

**Common Behaviors**
- **Touch Target**: 모바일/태블릿에서 모든 버튼과 입력 필드는 최소 44px 높이 확보.
- **Typography**: 모바일에서 H1~H3 폰트 사이즈 10~15% 축소 (Scale Down).
- **Padding**: 컨테이너 좌우 여백 Mobile(16px/4) -> Tablet(24px/6) -> Desktop(32px+/8).
- **Global Navigation**: 상단 헤더의 좌측(로고/뷰토글)과 우측(프로필/로그아웃) 요소 사이에는 충분한 간격(Gap 또는 Justify-Between)을 확보하여 시각적 간섭을 방지한다.

### P0-1: 하이브리드 프롬프트 입력 (일반모드 & 어시스턴스)

**Strategic Update**: 단순 메모장이 아닌 '프롬프트 설계 도구'로서의 정체성을 강화합니다. 사용자는 '어시스턴스' 모드를 통해 직무별로 최적화된 P.A.I.R 프레임워크를 손쉽게 적용할 수 있습니다.

**User Story**
사용자는 먼저 **자신의 직무(대분류-소분류)**를 선택한 후, **'일반모드'**에서 자유롭게 작성하거나 '어시스턴스' 모드에서 가이드를 받아 작성한다. 두 모드 모두 분류 데이터가 저장된다.

**UI/UX Detail**
- **Responsive Layout**:
    - **Desktop/Tablet**: 화면 중앙에 max-w-4xl 크기의 모달(Modal) 형태로 팝업. 배경 딤(Dim) 처리.
    - **Mobile**: 화면 전체를 덮는 풀스크린(Full Screen) 형태 또는 높이 90% 이상의 바텀 시트(Bottom Sheet). 닫기 버튼(X) 위치 및 크기 강조.
- **Step 0: 공통 직무 선택 (Common Header)**:
    - 모드 선택 탭 상단(또는 직후)에 위치.
    - **Desktop**: 대분류/소분류 Dropdown 가로 배치 (Row).
    - **Mobile**: 대분류/소분류 Dropdown 세로 배치 (Stack) 및 100% Width.
    - **Validation**: 대분류(Category)는 필수 입력. 소분류(Sub-Category)는 선택 입력(Optional).
- **Mode Switcher (Segmented Control)**:
    - 탭: 📝 일반모드 | 🤖 어시스턴스
    - 기본값: 로컬 스토리지에 저장된 사용자의 마지막 선택 모드.

**Mode A: 일반모드 (Simple)**
- **기능**: 하나의 거대한 Smart Textarea. {{변수}} 자동 감지 및 하이라이팅.
- **Note**: 선택한 직무 분류는 메타데이터로 저장됨 (본문 변형 없음).

**Mode B: 어시스턴스 (Assistance) - Dynamic Forms**
- **Step 1: P.A.I.R 기반 입력 폼 (Structured Inputs)**
    - 화면을 4개의 섹션으로 구분하여 입력 항목 배치.
    - **Desktop**: 2열 그리드(Grid-cols-2)로 배치하여 스크롤 최소화.
    - **Mobile**: 1열(Grid-cols-1)로 배치하여 세로 스크롤 허용.
    - **Section 1: Persona (Who)**
        - Profile (Role): (자동완성: 소분류에 따른 추천 역할)
        - Intent (Goal): (예: 코드 리팩토링, 상세페이지 기획)
    - **Section 2: Asset (Reference)**
        - Knowledge Base: (파일 업로드 또는 텍스트/링크 입력)
        - Style Guide: (톤앤매너, 디자인 시스템 등)
    - **Section 3: Instruction (What & How)**
        - Task (Main): (구체적인 작업 명령)
        - Context: (배경 상황, 작업 이유)
        - Constraints: (제약 조건, 하지 말아야 할 것)
    - **Section 4: Result (Output)**
        - Format: (Markdown, JSON, Python Code 등)
        - Example (Few-shot): (원하는 결과물의 예시)
    - **Preview Area**:
        - 입력값 변경 시, 하단에 조립된 최종 프롬프트 실시간 미리보기 제공.

**Business Logic (The Assembler)**
- **직무 분류 데이터 (Categories)**:
    - 서비스 & 프로덕트 기획, UI/UX & 크리에이티브 디자인, 소프트웨어 개발 & 엔지니어링, 데이터 분석 & AI, 마케팅 & 그로스, 유튜브 & 영상 미디어, 비즈니스 일반 & 영업, 인사 & 조직문화, 고객 경험 & 지원
- **Auto-Title Logic (자동 제목 생성)**:
    - 사용자가 제목(Title) 필드를 비워두고 저장할 경우:
        - **일반모드**: 본문의 첫 줄(최대 30자)을 제목으로 자동 저장.
        - **어시스턴스**: Profile (Role) 입력값(예: '시니어 마케터')을 제목으로 자동 저장.
- **Prompt Assembly Logic**:
    - 저장 시 각 필드 값을 조합하여 하나의 마크다운 형태 텍스트로 변환.
    - **Template Structure (Korean Localized)**:
      ```markdown
      # 역할 및 목표 (Role & Objective)
      - 역할: [Profile]
      - 목표: [Intent]

      # 배경 및 자산 (Context & Assets)
      - 참조 자료: [Knowledge Base]
      - 스타일/톤: [Style Guide]

      # 작업 지시 (Instructions)
      - 작업 내용: [Task]
      - 배경 상황: [Context]
      - 제약 조건: [Constraints]

      # 출력 결과 (Output)
      - 출력 형식: [Format]
      - 예시: [Example]
      ```

**Acceptance Criteria**
- **Happy Path (Common Category)**
    - GIVEN 사용자가 '일반모드' 탭 선택
    - WHEN 대분류를 선택하지 않고 저장 시도 -> THEN '직무 분류(대분류)를 선택해주세요' 에러 메시지 표시
    - WHEN 대분류만 선택하고 소분류는 비워둔 채 저장 -> THEN 정상적으로 저장됨 (소분류 Optional)
- **Happy Path (Assistant Mode Flow)**
    - GIVEN 사용자가 '어시스턴스' 탭 선택
    - WHEN 대분류 '마케팅 & 그로스', 소분류 '카피라이팅' 선택 -> THEN 입력 폼 라벨이 마케팅 문맥에 맞게 변경됨.
    - GIVEN 제목 미입력, Profile에 'SNS 마케터' 입력 후 저장 -> THEN 목록에 제목이 'SNS 마케터'로 저장됨.
- **Happy Path (Assembly & Save)**
    - GIVEN 모든 필수 항목 입력 완료
    - WHEN 저장 버튼 클릭
    - THEN DB structure 필드에 JSON 형태의 개별 입력값 저장 (수정 용도)
    - AND DB content 필드에 조립된 마크다운 텍스트 저장 (실행/복사 용도)

### P0-2: 다중 뷰 & 퀵 액션 (View & Quick Action)

**Strategic Update**: 단순 뷰 전환을 넘어, 방대한 프롬프트를 체계적으로 탐색(Filtering & Searching)할 수 있는 기능을 제공합니다.

**User Story**
사용자는 제목 검색과 **직무 카테고리 필터링(1Depth, 2Depth)**을 통해 원하는 프롬프트를 즉시 찾고, 핀터레스트 스타일의 리스트 뷰에서 시각적으로 프롬프트를 탐색한다.

**UI/UX Detail**
- **Filter & Search Bar (Top Area)**:
    - **Desktop**: 검색창(왼쪽) + 필터 1 + 필터 2 (가로 일렬 배치).
    - **Mobile**: 검색창 (최상단 100% 폭) + 필터 1/2 (아래 줄에 50%:50% 배치).
    - **Interaction**: 필터/검색 입력 시 리스트/칸반 뷰 실시간 필터링 (Debounce 300ms).
- **1) List View (Pinterest Style Masonry)**:
    - **Layout**: 명칭은 'List View'지만, UI는 Masonry Grid Layout (Pinterest 스타일).
    - **Responsive Grid**: Desktop (4 Cols), Tablet (2~3 Cols), Mobile (1 Col).
    - **Card Design**: 썸네일(카테고리 아이콘) + 제목 + 본문 미리보기(3~5줄) + 태그(Chips).
    - **Hover Action**: 복사, 공유 버튼 오버레이.
- **2) Kanban View**:
    - **Desktop**: 가로 스크롤로 모든 컬럼(대분류) 표시.
    - **Mobile**: Swiper/Carousel 형태로 한 번에 하나의 컬럼(대분류)만 표시하거나, 아코디언 형태로 수직 나열.
- **Item Interaction**:
    - **Title Click**: 프롬프트 상세 페이지(P0-6)로 이동.
    - **Quick Copy**: 리스트/카드 내 복사 버튼 클릭 시 즉시 복사.

**Acceptance Criteria**
- **Happy Path (Filtering)**
    - GIVEN 프롬프트 50개 (마케팅 20, 개발 30)
    - WHEN 대분류 필터 '마케팅' 선택 -> THEN 리스트에 마케팅 관련 20개만 표시됨
    - WHEN 검색어 'SNS' 입력 -> THEN 'SNS'가 제목에 포함된 프롬프트만 필터링됨
- **Happy Path (Detail Link)**
    - GIVEN 핀터레스트 스타일 리스트 뷰
    - WHEN 프롬프트 카드 클릭 -> THEN /prompt/{id} 상세 페이지로 라우팅

### P0-3: 요금제 안내 및 업셀링 (Pricing & Upsell)

**Strategic Update**: '11번째 프롬프트' 생성을 강력한 유료 전환 포인트(Trigger)로 활용하며, 명확한 가격 정책과 기능 비교를 통해 결제를 유도합니다.

**User Story**
사용자가 무료(Guest/Basic) 한도를 초과하여 프롬프트를 생성하려 할 때, 요금제 비교 모달을 통해 Basic과 Pro 플랜의 차이를 인지하고 구독을 결정한다.

**UI/UX Detail**
- **Trigger Point**: 보유 프롬프트 10개 상태에서 11번째 프롬프트 저장 시도 시 '업셀링 모달' 팝업.
- **Pricing Modal Structure**:
    - **Headline**: '무제한 프롬프트 자산을 만드세요 🚀'
    - **Billing Toggle**: 연간 결제 (20% 할인) <-> 월간 결제 스위치.
    - **Plan Comparison**: Basic (무료, 50개 제한) vs Pro ($4/mo, 무제한).
    - **CTA**: [Pro 시작하기] (Primary), [Basic 유지하기] (Text Link).

**Acceptance Criteria**
- **Happy Path (Upsell View)**
    - GIVEN 프롬프트 10개 보유한 Basic 유저
    - WHEN 새 프롬프트 저장 버튼 클릭 -> THEN 저장 동작 차단 + Pricing Modal 오픈
    - WHEN '연간 결제' 토글 활성화 -> THEN Pro 플랜 가격이 '$4/월'로 표시됨

### P0-4: 프롬프트 런처 (Prompt Launcher)

**Rationale**: 이 기능이 이 SaaS의 Killer Feature입니다. 단순히 텍스트를 복사하는 것이 아니라, 변수를 입력받아 완성된 프롬프트를 만들어주는 기능입니다.

**User Story**
사용자는 저장된 템플릿의 변수({{주제}}, {{톤앤매너}})만 빠르게 입력하여 완성된 프롬프트를 생성하고 복사한다. P.A.I.R로 작성된 프롬프트도 동일하게 동작한다.

**UI/UX Detail**
- **Run Modal (Responsive)**:
    - **Desktop**: 중앙 모달. 미리보기(Preview)와 입력폼(Input)이 좌우 5:5 또는 상하 배치.
    - **Mobile**: 풀스크린. 상단(입력폼 50%) + 하단(미리보기 50%) 스크롤 뷰.
- **Action**:
    - '복사하기' 버튼 (Primary): 완성된 텍스트 복사.
    - 'ChatGPT에서 열기' 버튼 (Secondary): 외부 링크 연동.

**Acceptance Criteria**
- **Happy Path (Variable in P.A.I.R)**
    - GIVEN 어시스턴스 모드에서 Task 필드에 'Write about {{Topic}}'이 저장됨
    - WHEN 런처 실행 -> THEN 화면에 'Topic' 입력 필드 생성
    - WHEN 'AI News' 입력 -> THEN Preview 영역에 조립된 텍스트 중 '- Task: Write about AI News' 확인 가능

### P0-5: 인증 및 계정 관리 (Authentication)

**Strategic Goal**: 보안(Verification)과 편의성(Social Login)의 균형을 통해 가입 전환율을 극대화합니다.

**User Story**
사용자는 이메일 인증을 통해 안전하게 계정을 생성하거나, 구글 로그인을 통해 별도의 가입 절차 없이 즉시 서비스를 이용할 수 있다.

**UI/UX Detail**
- **Responsive Layout**: Desktop (Split Screen), Mobile (Stacked).
- **A. 로그인 페이지 (Default)**: 기존과 동일.
- **B. 회원가입 페이지 (Sign Up)**:
    - **Step 1 (Verification)**: 이메일 입력 + 인증번호 전송/확인.
    - **Step 2 (Profile & Terms)**: 이름, 비밀번호, 약관 동의.
    - **Terms Agreement**: 전체 동의, 서비스 이용약관(필수), 개인정보(필수), 만 14세 이상(필수), 마케팅(선택).
- **Business Logic**:
    - ID Policy: 이메일을 고유 식별자로 사용.
    - Verification: 가입 시 이메일 소유 확인 필수.
    - Social Login (Google): 신규 회원 시 약관 동의 모달 노출.

**Acceptance Criteria**
- **Happy Path (Email Sign-up)**
    - GIVEN 이메일 인증 완료
    - WHEN 이름/비밀번호 입력 후 '전체 동의' 체크 -> THEN '가입 완료' 버튼 활성화
    - WHEN 버튼 클릭 -> THEN 회원가입 성공 + 대시보드 이동
- **Happy Path (Social Sign-up New)**
    - GIVEN 신규 구글 계정으로 로그인 시도 -> THEN '서비스 시작을 위해 약관 동의가 필요합니다' 모달 노출
    - WHEN 필수 항목 동의 후 확인 -> THEN 가입 완료
