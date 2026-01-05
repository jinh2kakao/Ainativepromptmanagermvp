# 기능 정의서 (Functional Specification)

## 1. 개요
**Ainative Prompt Manager**는 프롬프트 엔지니어링을 위한 올인원 협업 도구입니다. "Vibe Coding" 철학을 바탕으로 직관적인 UI와 강력한 AI 최적화 기능을 제공합니다.

## 2. 주요 기능 상세 정의

### 2.1 사용자 및 인증 (Authentication & User)
| 기능 ID | UI 요소 | 기능 설명 | 세부 로직 / 상호작용 |
|:--- |:--- |:--- |:--- |
| AUTH-01 | Sign In Button | 소셜 로그인 (Google) | Supabase Auth 연동, 팝업/리다이렉트 처리 |
| AUTH-02 | Sidebar Profile | 세션 정보 표시 | 프로필 클릭 시 팝업 메뉴(Settings, Sign Out) 표시 |
| USR-01 | Settings Modal | 프로필 정보 수정 | 이름, 아바타 변경 (Auth User Metadata 업데이트) |
| USR-02 | Sidebar Stats | 사용량 조회 | AI Optimization/Evaluation 일일 쿼터 시각화 (Progress Bar) |

### 2.2 프로젝트 및 워크스페이스 (Projects & Workspaces)
| 기능 ID | UI 요소 | 기능 설명 | 세부 로직 / 상호작용 |
|:--- |:--- |:--- |:--- |
| PRJ-01 | Create Modal | 신규 프로젝트 생성 | 제목/설명 입력 후 DB Insert -> 상세 페이지로 자동 이동 |
| PRJ-02 | Canvas Toolbar | 노드 추가 (Add Node) | 캔버스 중앙 또는 마지막 노드 근처에 'Prompt Node' 생성 |
| PRJ-03 | Node Item | 노드 속성 편집 | 노드 클릭 시 사이드 시트/모달 오픈 -> 연결할 프롬프트 선택 |
| PRJ-04 | Edit/Finish Btn | 동시성 제어 (Lock) | 팀 프로젝트 진입 시 Read-only. 'Edit Mode' 클릭 시 Lock 획득. 종료 시 Unlock. (타임아웃 30분) |
| PRJ-05 | Publish Modal | 프로젝트 발행 | 'Publish to Team' 클릭 -> 대상 팀 선택 및 Overwrite 여부 체크 -> 복제 수행 |
| PRJ-06 | Canvas Edge | 노드 연결 | Source 핸들에서 Target 핸들로 드래그 -> 엣지 생성 (논리적 흐름 정의) |

### 2.3 프롬프트 최적화 및 평가 (AI Optimization)
| 기능 ID | UI 요소 | 기능 설명 | 세부 로직 / 상호작용 |
|:--- |:--- |:--- |:--- |
| OPT-01 | Judge Panel | 프롬프트 평가 | 'Evaluate' 버튼 -> Gemini 1.5 Flash API 호출 -> 4가지 지표(구조, 명확성, 기법, 효율성) 점수 및 피드백 출력 |
| OPT-02 | Optimize Btn | 자동 최적화 | 평가 점수 기반으로 프롬프트 재작성 요청 -> Background Worker 처리 -> 결과 비교 뷰(Diff) 제공 |
| OPT-03 | Safety Badge | 안전성 검사 | 평가 시 Safety Check 선행. Unsafe 판정 시 붉은 배지 및 상세 사유 표시 (차단) |

### 2.4 팀 협업 (Team Collaboration)
| 기능 ID | UI 요소 | 기능 설명 | 세부 로직 / 상호작용 |
|:--- |:--- |:--- |:--- |
| TEAM-01 | Switcher | 팀 워크스페이스 전환 | 사이드바 상단 드롭다운 -> 선택한 팀 ID로 전역 상태(Context) 변경 -> 해당 팀 프로젝트 리스트 로드 |
| TEAM-02 | Invite Modal | 멤버 초대 | 이메일 입력 -> 초대장 발송 (또는 즉시 추가 정책) -> 목록 갱신 |
| TEAM-03 | Member Table | 역할 관리 (RBAC) | Dropdown으로 역할 변경 (Viewer <-> Editor <-> Admin). 자신보다 상위 권한은 수정 불가. |

### 2.5 프롬프트 템플릿 (Prompt Templates)
| 기능 ID | UI 요소 | 기능 설명 | 세부 로직 / 상호작용 |
|:--- |:--- |:--- |:--- |
| TMP-01 | Dashboard Grid | 인기/최근 템플릿 표시 | `/api/templates/?sortBy=popular` 호출 -> 사용량 기준 정렬 -> Pinterest 스타일 Masonry 레이아웃 |
| TMP-02 | Template Card | 템플릿 미리보기 카드 | 카테고리 배지, 설명, 이미지 미리보기 표시. 클릭 시 상세 페이지 이동 (`/templates/detail?id=...`) |
| TMP-03 | Detail Page | 템플릿 상세 정보 | Assistance 모드: PAIR 구조화 미리보기 (Persona/Instruction/Assets/Result). 추천 에이전트 표시. "사용하기" 버튼 |
| TMP-04 | Assistance Form | 구조화된 입력 | Markdown 헤더(## Persona 등)를 `parsePairPrompt` 유틸로 파싱하여 개별 입력 필드로 분리 표시 |
| TMP-05 | Variable Input | 변수 자동 감지 | `{{variable}}` 패턴 감지 -> 입력 폼 자동 생성 -> 실행 시 치환 |

## 3. 데이터 모델 요약
- **Project Structure**: `nodes` (위치, 타입, 데이터), `edges` (연결 정보)를 JSON으로 저장.
- **Team Roles**: `Owner`(모든 권한), `Admin`(멤버 관리), `Editor`(프로젝트 수정), `Viewer`(읽기 전용).
- **AI Log**: 모든 최적화/평가 요청은 `Audit Log`에 기록되어 사용량 추적에 활용.

## 4. 기술 제약 사항 및 정책
- **일일 한도**: Free Plan (일 10회), Pro Plan (무제한). 초과 시 블로킹 UI 노출.
- **Lock Timeout**: 프로젝트 Lock은 마지막 활동 후 30분 경과 시 자동 해제 (서버 스케줄러/Check-on-read).
- **Mobile Support**: 반응형 웹으로 구현하되, Project Canvas(React Flow)는 데스크탑 권장 메시지 표시.
