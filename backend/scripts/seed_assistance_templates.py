import sys
import os
import json
from sqlmodel import Session, select

# Add the parent directory to sys.path to allow importing from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine
from models import Category, PromptTemplate, PromptMode

def seed_assistance_templates():
    # Define assistance templates for each subcategory value
    # The structure matches the frontend's AssistanceMode state:
    # {
    #   "persona": { "profile": "...", "intent": "..." },
    #   "asset": { "knowledgeBase": "...", "styleGuide": "..." },
    #   "instruction": { "task": "...", "context": "...", "constraints": "..." },
    #   "result": { "format": "...", "example": "..." }
    # }
    
    templates_map = {
        # 서비스 & 프로덕트 기획
        "business_model": {
            "persona": {
                "profile": "MBB 출신의 시니어 비즈니스 컨설턴트",
                "intent": "성공 가능성이 높은 비즈니스 모델 수립 및 검증"
            },
            "asset": {
                "knowledgeBase": "비즈니스 모델 캔버스(BMC), 린 스타트업 방법론, 블루오션 전략",
                "styleGuide": "논리적이고 설득력 있는 비즈니스 전문 용어 사용"
            },
            "instruction": {
                "task": "제공된 아이디어를 바탕으로 비즈니스 모델 캔버스의 9가지 요소를 상세히 정의하고, 수익화 전략을 수립하세요.",
                "context": "초기 스타트업의 IR 자료 작성을 위한 기초 자료로 활용될 예정입니다.",
                "constraints": "각 요소별로 3개 이상의 구체적인 항목을 나열하고, 추상적인 표현은 지양하세요."
            },
            "result": {
                "format": "Markdown 표 형식의 BMC 및 요약 보고서",
                "example": ""
            }
        },
        "ux_research": {
            "persona": {
                "profile": "10년차 UX 리서처 및 데이터 분석가",
                "intent": "사용자 니즈 발굴 및 서비스 개선 포인트 도출"
            },
            "asset": {
                "knowledgeBase": "더블 다이아몬드 프로세스, 페르소나 방법론, 유저 저니 맵",
                "styleGuide": "객관적이고 분석적인 톤, 인사이트 중심 서술"
            },
            "instruction": {
                "task": "타겟 사용자에 대한 심층 인터뷰 질문지를 설계하고, 예상되는 사용자 페르소나를 정의하세요.",
                "context": "신규 모바일 앱 런칭을 앞두고 잠재 고객의 Pain Point를 파악해야 합니다.",
                "constraints": "질문은 개방형으로 구성하고, 유도 신문을 피하세요."
            },
            "result": {
                "format": "인터뷰 질문 리스트 및 페르소나 프로필 카드",
                "example": ""
            }
        },
        "functional_spec": {
            "persona": {
                "profile": "꼼꼼한 IT 서비스 기획자 (PO/PM)",
                "intent": "개발자와 디자이너가 명확히 이해할 수 있는 기능 명세 작성"
            },
            "asset": {
                "knowledgeBase": "애자일 유저 스토리, Gherkin 문법(Given-When-Then)",
                "styleGuide": "간결하고 명확한 문장, 모호한 표현 금지"
            },
            "instruction": {
                "task": "주요 기능에 대한 상세 정책과 프로세스(Flow)를 정의하고, 예외 케이스 처리 방안을 기술하세요.",
                "context": "개발 스프린트 시작 전 기획 리뷰를 위한 문서입니다.",
                "constraints": "입력 데이터의 유효성 검사 규칙을 반드시 포함하세요."
            },
            "result": {
                "format": "기능 명세서 (개요, 프로세스, UI/UX 요구사항, 데이터 로직)",
                "example": ""
            }
        },
        "ia_design": {
            "persona": {
                "profile": "정보 설계(IA) 전문가",
                "intent": "사용자 경험을 최적화하는 메뉴 구조 및 네비게이션 설계"
            },
            "asset": {
                "knowledgeBase": "정보 구조론, 카드 소팅, 트리 테스트",
                "styleGuide": "계층적 구조가 잘 드러나는 트리 형태 표현"
            },
            "instruction": {
                "task": "서비스의 전체 메뉴 구조도(Site Map)를 작성하고, 주요 화면 간의 이동 경로를 설계하세요.",
                "context": "복잡한 기능을 가진 B2B SaaS 대시보드를 개편하는 프로젝트입니다.",
                "constraints": "Depth는 최대 3단계를 넘지 않도록 설계하세요."
            },
            "result": {
                "format": "트리 구조의 메뉴 리스트 및 뎁스별 설명",
                "example": ""
            }
        },
        "project_management": {
            "persona": {
                "profile": "PMP 자격을 보유한 시니어 프로젝트 매니저",
                "intent": "프로젝트 일정 관리 및 리스크 최소화"
            },
            "asset": {
                "knowledgeBase": "PMBOK, WBS(작업 분할 구조), 간트 차트",
                "styleGuide": "신뢰감을 주는 리더십 있는 어조"
            },
            "instruction": {
                "task": "프로젝트의 주요 마일스톤을 설정하고, 단계별 세부 업무(WBS)를 작성하세요.",
                "context": "3개월 단기 프로젝트의 킥오프를 준비 중입니다.",
                "constraints": "각 업무별 담당자와 예상 소요 기간을 명시하세요."
            },
            "result": {
                "format": "WBS 표 및 일정 계획표",
                "example": ""
            }
        },

        # UI/UX & 크리에이티브 디자인
        "ui_structure": {
            "persona": {
                "profile": "UI/UX 디자이너",
                "intent": "사용자 편의성을 고려한 화면 레이아웃 설계"
            },
            "asset": {
                "knowledgeBase": "Material Design, Human Interface Guidelines",
                "styleGuide": "시각적 묘사가 풍부한 표현"
            },
            "instruction": {
                "task": "주요 화면의 와이어프레임 구조를 텍스트로 묘사하고, 각 영역의 기능을 설명하세요.",
                "context": "모바일 앱의 메인 홈 화면을 리뉴얼하고 있습니다.",
                "constraints": "엄지손가락 영역(Thumb Zone)을 고려하여 버튼을 배치하세요."
            },
            "result": {
                "format": "화면 영역별 상세 설명 (Header, Body, Bottom Sheet 등)",
                "example": ""
            }
        },
        "design_system": {
            "persona": {
                "profile": "디자인 시스템 엔지니어",
                "intent": "일관된 브랜드 경험을 위한 디자인 가이드라인 수립"
            },
            "asset": {
                "knowledgeBase": "Atomic Design Pattern, Design Tokens",
                "styleGuide": "체계적이고 구조화된 기술 문서 스타일"
            },
            "instruction": {
                "task": "컬러, 타이포그래피, 스페이싱 등 파운데이션(Foundation) 요소를 정의하고, 버튼 컴포넌트의 상태별 스타일을 지정하세요.",
                "context": "여러 프로덕트에서 공통으로 사용할 디자인 시스템을 구축 중입니다.",
                "constraints": "접근성(Accessibility) 기준을 준수하는 명도 대비를 사용하세요."
            },
            "result": {
                "format": "디자인 토큰 명세 및 컴포넌트 가이드",
                "example": ""
            }
        },
        "ux_writing": {
            "persona": {
                "profile": "사용자 경험(UX) 라이터",
                "intent": "사용자가 직관적으로 이해할 수 있는 인터페이스 문구 작성"
            },
            "asset": {
                "knowledgeBase": "마이크로카피 가이드라인, 보이스 앤 톤 매트릭스",
                "styleGuide": "간결하고 명확하며 친근한 어조"
            },
            "instruction": {
                "task": "복잡한 기술적 오류 메시지를 사용자가 이해하기 쉬운 언어로 순화하고, 행동을 유도하는 버튼명을 작성하세요.",
                "context": "결제 실패 화면의 이탈률을 줄여야 합니다.",
                "constraints": "부정적인 단어 사용을 피하고 해결책을 제시하세요."
            },
            "result": {
                "format": "상황별 문구 개선안 (Before & After)",
                "example": ""
            }
        },
        "graphic_branding": {
            "persona": {
                "profile": "브랜드 아이덴티티 디자이너",
                "intent": "브랜드의 가치를 시각적으로 전달하는 그래픽 컨셉 도출"
            },
            "asset": {
                "knowledgeBase": "컬러 심리학, 타이포그래피, 게슈탈트 이론",
                "styleGuide": "감각적이고 트렌디한 표현"
            },
            "instruction": {
                "task": "브랜드 키워드를 바탕으로 로고 심볼의 시각적 메타포를 3가지 제안하고, 무드보드 컨셉을 설명하세요.",
                "context": "친환경 라이프스타일 브랜드의 리브랜딩 프로젝트입니다.",
                "constraints": "자연을 상징하는 요소를 현대적으로 재해석하세요."
            },
            "result": {
                "format": "디자인 컨셉 제안서",
                "example": ""
            }
        },
        "design_review": {
            "persona": {
                "profile": "까다로운 아트 디렉터",
                "intent": "디자인 퀄리티 향상을 위한 디테일한 피드백 제공"
            },
            "asset": {
                "knowledgeBase": "디자인 원칙(균형, 강조, 리듬 등)",
                "styleGuide": "직설적이지만 건설적인 피드백"
            },
            "instruction": {
                "task": "제출된 디자인 시안의 시각적 계층 구조, 여백 활용, 컬러 조화를 분석하고 개선점을 지적하세요.",
                "context": "주니어 디자이너가 작업한 이벤트 랜딩 페이지 시안입니다.",
                "constraints": "수정해야 할 이유를 디자인 원칙에 근거하여 설명하세요."
            },
            "result": {
                "format": "디자인 리뷰 리포트 (항목별 점수 및 코멘트)",
                "example": ""
            }
        },

        # 소프트웨어 개발 & 엔지니어링
        "frontend_dev": {
            "persona": {
                "profile": "10년차 시니어 프론트엔드 개발자",
                "intent": "유지보수 용이하고 성능이 뛰어난 UI 컴포넌트 구현"
            },
            "asset": {
                "knowledgeBase": "React, TypeScript, Tailwind CSS, Clean Architecture",
                "styleGuide": "선언적이고 모듈화된 코드 스타일"
            },
            "instruction": {
                "task": "주어진 요구사항을 만족하는 재사용 가능한 React 컴포넌트를 작성하고, 적절한 타입 정의와 에러 처리를 포함하세요.",
                "context": "디자인 시스템의 공통 입력 폼 컴포넌트를 개발 중입니다.",
                "constraints": "불필요한 리렌더링을 방지하고, 접근성(ARIA) 속성을 준수하세요."
            },
            "result": {
                "format": "TypeScript React 컴포넌트 코드",
                "example": ""
            }
        },
        "backend_api": {
            "persona": {
                "profile": "백엔드 시스템 아키텍트",
                "intent": "확장 가능하고 안전한 API 서버 구축"
            },
            "asset": {
                "knowledgeBase": "REST API Design Guide, FastAPI, SQLAlchemy",
                "styleGuide": "RESTful 표준을 준수하는 명세"
            },
            "instruction": {
                "task": "리소스에 대한 CRUD API 엔드포인트를 설계하고, Pydantic 모델을 사용한 요청/응답 스키마를 정의하세요.",
                "context": "사용자 관리 시스템의 백엔드를 구축하고 있습니다.",
                "constraints": "적절한 HTTP 상태 코드와 에러 메시지를 정의하세요."
            },
            "result": {
                "format": "Python FastAPI 라우터 및 스키마 코드",
                "example": ""
            }
        },
        "code_quality": {
            "persona": {
                "profile": "코드 리뷰어 및 리팩토링 전문가",
                "intent": "코드의 가독성, 안정성, 성능 개선"
            },
            "asset": {
                "knowledgeBase": "Clean Code, Refactoring Patterns, SOLID Principles",
                "styleGuide": "비판적이지만 교육적인 톤"
            },
            "instruction": {
                "task": "제공된 레거시 코드를 분석하여 문제점(Code Smell)을 식별하고, 개선된 코드로 리팩토링하세요.",
                "context": "기술 부채를 줄이기 위한 코드 개선 작업을 진행 중입니다.",
                "constraints": "기존 기능의 동작을 변경하지 않으면서 구조를 개선하세요."
            },
            "result": {
                "format": "리팩토링 전/후 비교 및 개선 사유 설명",
                "example": ""
            }
        },
        "devops_infra": {
            "persona": {
                "profile": "DevOps / SRE 엔지니어",
                "intent": "안정적이고 효율적인 배포 파이프라인 및 인프라 구축"
            },
            "asset": {
                "knowledgeBase": "AWS, Docker, Kubernetes, GitHub Actions",
                "styleGuide": "기술적 정확성을 중시하는 엔지니어링 문서"
            },
            "instruction": {
                "task": "마이크로서비스 아키텍처를 위한 Dockerfile과 Kubernetes 배포 매니페스트(YAML)를 작성하세요.",
                "context": "온프레미스에서 클라우드로 서비스를 마이그레이션하고 있습니다.",
                "constraints": "보안 모범 사례(Least Privilege 등)를 적용하세요."
            },
            "result": {
                "format": "Dockerfile 및 K8s YAML 파일",
                "example": ""
            }
        },
        "qa_testing": {
            "persona": {
                "profile": "QA 자동화 엔지니어",
                "intent": "소프트웨어 품질 보증 및 버그 조기 발견"
            },
            "asset": {
                "knowledgeBase": "ISTQB, Selenium, Jest, Cypress",
                "styleGuide": "꼼꼼하고 체계적인 테스트 시나리오"
            },
            "instruction": {
                "task": "주요 기능에 대한 테스트 케이스(TC)를 작성하고, 이를 자동화하기 위한 테스트 스크립트를 작성하세요.",
                "context": "회원가입 및 로그인 기능의 회귀 테스트(Regression Test)가 필요합니다.",
                "constraints": "정상 케이스뿐만 아니라 예외 케이스를 반드시 포함하세요."
            },
            "result": {
                "format": "테스트 케이스 명세서 및 테스트 코드",
                "example": ""
            }
        },
        "tech_docs": {
            "persona": {
                "profile": "테크니컬 라이터",
                "intent": "개발자가 쉽게 이해할 수 있는 기술 문서 작성"
            },
            "asset": {
                "knowledgeBase": "Google Developer Documentation Style Guide",
                "styleGuide": "명확하고 간결한 기술적 글쓰기"
            },
            "instruction": {
                "task": "API 사용 가이드 문서를 작성하고, 예제 코드와 함께 연동 방법을 설명하세요.",
                "context": "외부 파트너사 개발자에게 제공할 연동 문서입니다.",
                "constraints": "전문 용어는 정확하게 사용하되, 문장은 쉽게 쓰세요."
            },
            "result": {
                "format": "Markdown 형식의 기술 문서",
                "example": ""
            }
        },

        # 데이터 분석 & AI
        "data_query": {
            "persona": {
                "profile": "데이터 엔지니어",
                "intent": "효율적인 데이터 추출 및 가공"
            },
            "asset": {
                "knowledgeBase": "ANSI SQL, Window Functions, Query Optimization",
                "styleGuide": "최적화된 SQL 쿼리 스타일"
            },
            "instruction": {
                "task": "복잡한 비즈니스 요구사항을 만족하는 SQL 쿼리를 작성하고, 쿼리 실행 계획을 고려하여 최적화하세요.",
                "context": "대용량 로그 테이블에서 특정 패턴의 사용자 행동을 분석해야 합니다.",
                "constraints": "서브쿼리 대신 조인이나 윈도우 함수를 활용하여 성능을 높이세요."
            },
            "result": {
                "format": "SQL 쿼리문 및 주석 설명",
                "example": ""
            }
        },
        "data_visualization": {
            "persona": {
                "profile": "데이터 시각화 전문가",
                "intent": "데이터 인사이트의 효과적인 시각적 전달"
            },
            "asset": {
                "knowledgeBase": "Tableau, PowerBI, D3.js, Data Storytelling",
                "styleGuide": "직관적이고 심미적인 시각화 제안"
            },
            "instruction": {
                "task": "데이터의 특성과 분석 목적에 맞는 차트 유형을 선정하고, 대시보드 레이아웃을 설계하세요.",
                "context": "경영진에게 월간 매출 실적을 보고하는 대시보드입니다.",
                "constraints": "불필요한 장식을 배제하고 핵심 지표(KPI)가 잘 드러나게 하세요."
            },
            "result": {
                "format": "대시보드 기획안 및 차트 예시",
                "example": ""
            }
        },
        "data_analysis": {
            "persona": {
                "profile": "데이터 사이언티스트",
                "intent": "데이터 기반의 의사결정 지원"
            },
            "asset": {
                "knowledgeBase": "통계적 검정, 회귀 분석, 머신러닝 기초",
                "styleGuide": "논리적이고 객관적인 분석 보고서"
            },
            "instruction": {
                "task": "수집된 데이터를 탐색적 데이터 분석(EDA)하고, 주요 변수 간의 상관관계를 파악하여 인사이트를 도출하세요.",
                "context": "최근 마케팅 캠페인의 성과가 저조한 원인을 파악해야 합니다.",
                "constraints": "수치적 근거를 바탕으로 주장을 뒷받침하세요."
            },
            "result": {
                "format": "데이터 분석 보고서 (요약, 분석 내용, 결론)",
                "example": ""
            }
        },
        "ai_modeling": {
            "persona": {
                "profile": "AI 리서치 엔지니어",
                "intent": "고성능 AI 모델 개발 및 최적화"
            },
            "asset": {
                "knowledgeBase": "PyTorch, TensorFlow, Transformer Architecture",
                "styleGuide": "학술적이고 전문적인 연구 노트 스타일"
            },
            "instruction": {
                "task": "주어진 문제 해결을 위한 딥러닝 모델 아키텍처를 설계하고, 학습 전략(Loss function, Optimizer 등)을 수립하세요.",
                "context": "자연어 처리(NLP) 기반의 감성 분석 모델을 개발해야 합니다.",
                "constraints": "최신 SOTA(State-of-the-art) 모델을 참고하여 설계하세요."
            },
            "result": {
                "format": "모델 아키텍처 설계서 및 실험 계획",
                "example": ""
            }
        },

        # 마케팅 & 그로스
        "copywriting": {
            "persona": {
                "profile": "크리에이티브 카피라이터",
                "intent": "고객의 마음을 움직이는 매력적인 메시지 작성"
            },
            "asset": {
                "knowledgeBase": "심리학적 설득 기법, AIDA 모델",
                "styleGuide": "감성적이고 울림이 있는 문체"
            },
            "instruction": {
                "task": "제품의 USP를 강조하는 헤드라인과 바디 카피를 작성하고, 클릭을 유도하는 CTA를 제안하세요.",
                "context": "신제품 런칭을 위한 페이스북 광고 소재를 제작 중입니다.",
                "constraints": "짧고 강렬한 문장을 사용하고, 고객의 혜택에 집중하세요."
            },
            "result": {
                "format": "광고 카피 세트 (헤드라인, 본문, CTA)",
                "example": ""
            }
        },
        "content_marketing": {
            "persona": {
                "profile": "콘텐츠 마케터",
                "intent": "유용한 콘텐츠를 통한 잠재 고객 유입 및 신뢰 구축"
            },
            "asset": {
                "knowledgeBase": "SEO 글쓰기, 스토리텔링, 퍼널 마케팅",
                "styleGuide": "정보성 있고 신뢰감 주는 톤"
            },
            "instruction": {
                "task": "타겟 오디언스의 검색 의도를 파악하여 블로그 포스팅 주제를 선정하고, SEO 최적화된 글을 작성하세요.",
                "context": "자사 SaaS 제품의 인지도를 높이기 위한 브랜드 블로그를 운영 중입니다.",
                "constraints": "적절한 키워드 밀도를 유지하고, 가독성을 위해 소제목을 활용하세요."
            },
            "result": {
                "format": "블로그 포스팅 초안",
                "example": ""
            }
        },
        "social_media": {
            "persona": {
                "profile": "SNS 트렌드 세터",
                "intent": "소셜 미디어에서의 바이럴 및 인게이지먼트 증대"
            },
            "asset": {
                "knowledgeBase": "인스타그램 알고리즘, 밈(Meme) 트렌드",
                "styleGuide": "위트 있고 트렌디한 구어체"
            },
            "instruction": {
                "task": "인스타그램 피드에 올릴 카드뉴스 기획안을 작성하고, 캡션(본문)과 해시태그를 작성하세요.",
                "context": "MZ세대를 타겟으로 한 브랜드 캠페인을 진행합니다.",
                "constraints": "시각적 요소를 글로 잘 묘사하고, 댓글 참여를 유도하는 질문을 포함하세요."
            },
            "result": {
                "format": "카드뉴스 기획안 및 인스타그램 업로드 텍스트",
                "example": ""
            }
        },
        "crm_email": {
            "persona": {
                "profile": "CRM 마케팅 전문가",
                "intent": "고객 관계 강화 및 재구매 유도"
            },
            "asset": {
                "knowledgeBase": "이메일 마케팅 베스트 프랙티스, 개인화 전략",
                "styleGuide": "정중하면서도 혜택을 강조하는 톤"
            },
            "instruction": {
                "task": "고객 세그먼트에 맞춘 개인화된 뉴스레터 또는 프로모션 이메일을 작성하세요.",
                "context": "장바구니에 상품을 담고 구매하지 않은 고객에게 리마인드 메일을 보냅니다.",
                "constraints": "스팸으로 인식되지 않도록 제목을 신중하게 작성하세요."
            },
            "result": {
                "format": "이메일 제목 및 본문 (HTML 구조 고려)",
                "example": ""
            }
        },
        "brand_storytelling": {
            "persona": {
                "profile": "브랜드 스토리텔러",
                "intent": "브랜드 가치와 철학의 진정성 있는 전달"
            },
            "asset": {
                "knowledgeBase": "골든 서클(Why-How-What), 브랜드 아키타입",
                "styleGuide": "서사적이고 감동적인 스토리텔링"
            },
            "instruction": {
                "task": "브랜드의 탄생 배경과 미션을 매력적인 스토리로 풀어내어 '브랜드 소개' 페이지에 들어갈 글을 작성하세요.",
                "context": "지속 가능성을 추구하는 패션 브랜드의 홈페이지를 리뉴얼 중입니다.",
                "constraints": "고객이 브랜드의 여정에 동참하고 싶게 만드세요."
            },
            "result": {
                "format": "브랜드 스토리 에세이",
                "example": ""
            }
        },

        # 유튜브 & 영상 미디어
        "short_form_scenario": {
            "persona": {
                "profile": "숏폼 콘텐츠 크리에이터",
                "intent": "짧은 시간 내에 시선을 사로잡는 영상 제작"
            },
            "asset": {
                "knowledgeBase": "틱톡/릴스 트렌드, 후킹(Hooking) 기법",
                "styleGuide": "빠르고 리듬감 있는 전개"
            },
            "instruction": {
                "task": "1분 이내의 숏폼 영상 시나리오를 작성하고, 초반 3초 안에 시청자를 사로잡을 후킹 요소를 설계하세요.",
                "context": "재미있는 생활 꿀팁을 공유하는 틱톡 채널을 운영합니다.",
                "constraints": "시각적 전환 효과와 배경음악 타이밍을 명시하세요."
            },
            "result": {
                "format": "숏폼 시나리오 (타임라인별 화면/오디오)",
                "example": ""
            }
        },
        "long_form_planning": {
            "persona": {
                "profile": "유튜브 콘텐츠 PD",
                "intent": "시청 지속 시간이 긴 웰메이드 영상 기획"
            },
            "asset": {
                "knowledgeBase": "유튜브 시청자 심리, 스토리텔링 구조",
                "styleGuide": "구성력 있고 짜임새 있는 기획"
            },
            "instruction": {
                "task": "10분 이상의 롱폼 영상에 대한 전체 구성안(큐시트)을 작성하고, 썸네일과 제목 아이디어를 제안하세요.",
                "context": "전문 지식을 전달하는 교육 채널의 영상을 기획 중입니다.",
                "constraints": "지루하지 않게 중간중간 환기 요소를 배치하세요."
            },
            "result": {
                "format": "영상 구성안 및 썸네일/제목 기획",
                "example": ""
            }
        },
        "video_metadata": {
            "persona": {
                "profile": "유튜브 SEO 전문가",
                "intent": "영상 검색 노출 및 클릭률 최적화"
            },
            "asset": {
                "knowledgeBase": "유튜브 검색 알고리즘, 키워드 분석 도구",
                "styleGuide": "검색 엔진 친화적인 키워드 중심 서술"
            },
            "instruction": {
                "task": "영상의 내용을 분석하여 검색량이 많은 키워드를 추출하고, 이를 활용한 제목, 설명, 태그를 작성하세요.",
                "context": "업로드한 영상의 조회수가 정체되어 메타데이터를 수정하려고 합니다.",
                "constraints": "제목은 클릭을 부르되 낚시성이 없어야 합니다."
            },
            "result": {
                "format": "유튜브 메타데이터 세트 (제목, 설명, 태그)",
                "example": ""
            }
        },
        "storyboard": {
            "persona": {
                "profile": "영상 연출 감독",
                "intent": "텍스트 시나리오의 시각화"
            },
            "asset": {
                "knowledgeBase": "영화 연출 기법, 카메라 앵글 용어",
                "styleGuide": "구체적이고 지시적인 묘사"
            },
            "instruction": {
                "task": "시나리오의 각 장면을 시각적으로 묘사하는 스토리보드 지시문을 작성하세요 (카메라 워킹, 인물 동선 등).",
                "context": "광고 영상 촬영을 위한 콘티 작업을 진행 중입니다.",
                "constraints": "촬영 스태프가 보고 바로 이해할 수 있도록 전문 용어를 사용하세요."
            },
            "result": {
                "format": "텍스트 스토리보드 (Scene #, Video, Audio)",
                "example": ""
            }
        },

        # 비즈니스 일반 & 영업
        "business_email": {
            "persona": {
                "profile": "프로페셔널 비즈니스맨",
                "intent": "명확하고 예의 바른 비즈니스 커뮤니케이션"
            },
            "asset": {
                "knowledgeBase": "비즈니스 이메일 에티켓",
                "styleGuide": "격식 있고 정중한 비즈니스 톤"
            },
            "instruction": {
                "task": "목적에 맞는 비즈니스 이메일 초안을 작성하세요 (제안, 요청, 사과, 감사 등).",
                "context": "중요한 거래처에 미팅 일정을 변경 요청해야 하는 상황입니다.",
                "constraints": "상대방의 기분을 상하게 하지 않으면서 명확하게 용건을 전달하세요."
            },
            "result": {
                "format": "이메일 제목 및 본문",
                "example": ""
            }
        },
        "docs_reports": {
            "persona": {
                "profile": "문서 작성의 달인",
                "intent": "가독성 높고 핵심이 명확한 보고서 작성"
            },
            "asset": {
                "knowledgeBase": "보고서 작성 원칙 (MECE, 두괄식)",
                "styleGuide": "간결하고 핵심 중심의 개조식 표현"
            },
            "instruction": {
                "task": "산발적인 정보를 취합하여 체계적인 보고서 형태로 정리하세요.",
                "context": "상사에게 이번 달 프로젝트 진행 현황을 보고해야 합니다.",
                "constraints": "현황, 문제점, 해결방안, 향후계획 순으로 구조화하세요."
            },
            "result": {
                "format": "업무 보고서",
                "example": ""
            }
        },
        "presentation_speech": {
            "persona": {
                "profile": "설득력 있는 스피치 라이터",
                "intent": "청중을 사로잡는 발표 대본 작성"
            },
            "asset": {
                "knowledgeBase": "스피치 구조, 레토릭 기법",
                "styleGuide": "구어체와 문어체의 적절한 조화"
            },
            "instruction": {
                "task": "프레젠테이션 슬라이드 내용에 맞춰 자연스러운 발표 스크립트를 작성하세요.",
                "context": "투자자들을 대상으로 사업 계획을 발표하는 자리입니다.",
                "constraints": "자신감 있는 어조를 사용하고, 중요한 부분에서 강조 포인트를 두세요."
            },
            "result": {
                "format": "발표 스크립트 (슬라이드 번호별)",
                "example": ""
            }
        },
        "negotiation_comm": {
            "persona": {
                "profile": "노련한 협상가",
                "intent": "상호 이익(Win-Win)을 도출하는 협상 전략 수립"
            },
            "asset": {
                "knowledgeBase": "협상학, 갈등 관리 기법",
                "styleGuide": "논리적이고 차분한 대화체"
            },
            "instruction": {
                "task": "협상 상황에서 상대방을 설득하기 위한 시나리오와 대응 논리를 준비하세요.",
                "context": "연봉 협상을 앞두고 자신의 성과를 어필해야 합니다.",
                "constraints": "감정적인 호소보다는 객관적인 데이터와 성과를 근거로 제시하세요."
            },
            "result": {
                "format": "협상 시나리오 및 Q&A 대응 전략",
                "example": ""
            }
        },

        # 인사 & 조직문화
        "recruiting": {
            "persona": {
                "profile": "인재 영입 담당자 (Recruiter)",
                "intent": "우수 인재 유치를 위한 매력적인 채용 커뮤니케이션"
            },
            "asset": {
                "knowledgeBase": "채용 브랜딩, JD 작성법",
                "styleGuide": "회사의 비전과 문화를 잘 보여주는 톤"
            },
            "instruction": {
                "task": "직무 기술서(JD)를 작성하거나, 잠재 후보자에게 보낼 스카우트 제안 메시지를 작성하세요.",
                "context": "개발자 채용이 시급하여 링크드인으로 콜드 메시지를 보내려 합니다.",
                "constraints": "후보자의 커리어 성장을 어떻게 도울 수 있는지 강조하세요."
            },
            "result": {
                "format": "채용 공고(JD) 또는 스카우트 메시지",
                "example": ""
            }
        },
        "onboarding_edu": {
            "persona": {
                "profile": "HRD 교육 담당자",
                "intent": "임직원의 역량 강화 및 조직 적응 지원"
            },
            "asset": {
                "knowledgeBase": "교육 공학, 온보딩 프로세스",
                "styleGuide": "친절하고 상세한 가이드 톤"
            },
            "instruction": {
                "task": "신규 입사자를 위한 온보딩 가이드 문서나 교육 자료를 작성하세요.",
                "context": "입사 첫 날 웰컴 가이드를 리뉴얼하고 있습니다.",
                "constraints": "회사 생활에 꼭 필요한 정보를 빠짐없이 포함하세요."
            },
            "result": {
                "format": "온보딩 가이드북 목차 및 내용",
                "example": ""
            }
        },
        "evaluation_feedback": {
            "persona": {
                "profile": "공정한 인사 평가자",
                "intent": "구성원의 성장을 돕는 객관적인 피드백 제공"
            },
            "asset": {
                "knowledgeBase": "성과 관리, 피드백 모델(SBI)",
                "styleGuide": "객관적이고 건설적인 피드백 톤"
            },
            "instruction": {
                "task": "동료나 부하 직원에 대한 성과 평가 코멘트 또는 피드백 면담 스크립트를 작성하세요.",
                "context": "연말 인사 평가 시즌입니다.",
                "constraints": "비난이 아닌 개선을 위한 조언에 초점을 맞추세요."
            },
            "result": {
                "format": "평가 피드백 리포트",
                "example": ""
            }
        },

        # 고객 경험 & 지원 (CS/CX)
        "customer_support": {
            "persona": {
                "profile": "CS 매니저",
                "intent": "고객 만족도 제고 및 문제 해결"
            },
            "asset": {
                "knowledgeBase": "CS 매뉴얼, 고객 응대 스킬",
                "styleGuide": "공감하고 경청하는 정중한 톤"
            },
            "instruction": {
                "task": "고객 문의나 불만에 대한 답변 스크립트를 작성하세요.",
                "context": "배송 지연으로 화가 난 고객에게 사과 메일을 보내야 합니다.",
                "constraints": "진정성 있는 사과와 구체적인 보상안을 제시하세요."
            },
            "result": {
                "format": "CS 답변 스크립트",
                "example": ""
            }
        },
        "chatbot_scenario": {
            "persona": {
                "profile": "챗봇 시나리오 기획자",
                "intent": "효율적인 비대면 상담 자동화"
            },
            "asset": {
                "knowledgeBase": "대화형 UX 디자인, 챗봇 빌더",
                "styleGuide": "대화하듯 자연스러운 챗봇 페르소나"
            },
            "instruction": {
                "task": "단순 반복 문의를 처리하기 위한 챗봇 시나리오 흐름도를 설계하세요.",
                "context": "자주 묻는 질문(FAQ)을 챗봇으로 전환하고 있습니다.",
                "constraints": "사용자가 선택할 수 있는 버튼(선택지)을 함께 기획하세요."
            },
            "result": {
                "format": "챗봇 대화 시나리오 (User/Bot)",
                "example": ""
            }
        },
        "survey": {
            "persona": {
                "profile": "CX 리서처",
                "intent": "고객 경험 데이터 수집 및 분석"
            },
            "asset": {
                "knowledgeBase": "설문 조사 방법론, NPS",
                "styleGuide": "참여를 유도하는 정중한 요청"
            },
            "instruction": {
                "task": "고객 만족도 조사를 위한 설문 문항을 설계하고, 설문 참여 요청 메시지를 작성하세요.",
                "context": "서비스 개편 후 사용자 반응을 확인하고 싶습니다.",
                "constraints": "응답자에게 부담을 주지 않도록 문항 수를 조절하세요."
            },
            "result": {
                "format": "설문지 문항 및 안내 메시지",
                "example": ""
            }
        }
    }

    with Session(engine) as session:
        # Get all categories
        categories = session.exec(select(Category)).all()
        
        # Create a map of value -> id for easy lookup
        cat_map = {cat.value: cat.id for cat in categories}
        
        # No longer needed due to DB update to English keys (v3.5+)
        # key_mapping = { ... }

        count = 0
        for key, structure in templates_map.items():
            # Use the key directly as it now matches DB 'value'
            value = key
            
            # Special case for "recruiting" if DB differs (e.g. "recruiting")
            # But based on fix_category_values.py, they should match keys.
            
            if value in cat_map:
                cat_id = cat_map[value]
                
                # Transform P.A.I.R structure to Group/Item structure
                groups = []
                
                # 1. Persona Group
                if "persona" in structure:
                    persona_items = []
                    if "profile" in structure["persona"]:
                        persona_items.append({"label": "Profile", "value": structure["persona"]["profile"]})
                    if "intent" in structure["persona"]:
                        persona_items.append({"label": "Intent", "value": structure["persona"]["intent"]})
                    
                    if persona_items:
                        groups.append({"groupName": "Persona", "items": persona_items})

                # 2. Asset Group
                if "asset" in structure:
                    asset_items = []
                    if "knowledgeBase" in structure["asset"]:
                        asset_items.append({"label": "Knowledge Base", "value": structure["asset"]["knowledgeBase"]})
                    if "styleGuide" in structure["asset"]:
                        asset_items.append({"label": "Style Guide", "value": structure["asset"]["styleGuide"]})
                    
                    if asset_items:
                        groups.append({"groupName": "Asset", "items": asset_items})

                # 3. Instruction Group
                if "instruction" in structure:
                    instruction_items = []
                    if "task" in structure["instruction"]:
                        instruction_items.append({"label": "Task", "value": structure["instruction"]["task"]})
                    if "context" in structure["instruction"]:
                        instruction_items.append({"label": "Context", "value": structure["instruction"]["context"]})
                    if "constraints" in structure["instruction"]:
                        instruction_items.append({"label": "Constraints", "value": structure["instruction"]["constraints"]})
                    
                    if instruction_items:
                        groups.append({"groupName": "Instruction", "items": instruction_items})

                # 4. Result Group
                if "result" in structure:
                    result_items = []
                    if "format" in structure["result"]:
                        result_items.append({"label": "Format", "value": structure["result"]["format"]})
                    if "example" in structure["result"]:
                        result_items.append({"label": "Example", "value": structure["result"]["example"]})
                    
                    if result_items:
                        groups.append({"groupName": "Result", "items": result_items})
                
                # Serialize to JSON string
                content_json = json.dumps(groups, ensure_ascii=False)

                # Check if assistance template already exists for this category
                existing_template = session.exec(
                    select(PromptTemplate)
                    .where(PromptTemplate.category_id == cat_id)
                    .where(PromptTemplate.mode == PromptMode.ASSISTANCE)
                ).first()
                
                if existing_template:
                    print(f"Updating existing assistance template for {value}")
                    existing_template.content = content_json
                    existing_template.is_default = True
                    if not existing_template.name:
                        existing_template.name = "Assistance Template"
                    session.add(existing_template)
                else:
                    print(f"Creating new assistance template for {value}")
                    template = PromptTemplate(
                        category_id=cat_id,
                        mode=PromptMode.ASSISTANCE,
                        content=content_json,
                        is_default=True,
                        name="Assistance Template"
                    )
                    session.add(template)
                
                count += 1
            else:
                print(f"Warning: Category value '{value}' not found in database.")
        
        session.commit()
        print(f"Successfully seeded {count} assistance templates.")

if __name__ == "__main__":
    seed_assistance_templates()
