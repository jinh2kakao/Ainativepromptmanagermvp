import { Prompt } from '../types';

// Job Categories - 2 Depth Structure
export const jobCategories: Record<string, string[]> = {
  "서비스 & 프로덕트 기획": [
    "비즈니스 모델(BM) 수립",
    "사용자 리서치(UX Research)",
    "기능 명세 및 정책",
    "화면 설계(IA)",
    "프로젝트 관리(PM/PO)"
  ],
  "UI/UX & 크리에이티브 디자인": [
    "UI 구조 및 레이아웃",
    "디자인 시스템",
    "UX 라이팅",
    "그래픽 & 브랜딩",
    "디자인 리뷰"
  ],
  "소프트웨어 개발 & 엔지니어링": [
    "프론트엔드 개발",
    "백엔드 & API",
    "코드 품질 & 리팩토링",
    "데브옵스 & 인프라",
    "QA & 테스팅",
    "기술 문서"
  ],
  "데이터 분석 & AI": [
    "데이터 쿼리(SQL)",
    "데이터 시각화",
    "데이터 분석 보고",
    "AI 모델링"
  ],
  "마케팅 & 그로스": [
    "카피라이팅(Ads)",
    "콘텐츠 마케팅",
    "소셜 미디어(SNS)",
    "CRM & 이메일",
    "브랜드 스토리텔링"
  ],
  "유튜브 & 영상 미디어": [
    "숏폼 시나리오",
    "롱폼 영상 기획",
    "영상 메타데이터",
    "스토리보드 묘사"
  ],
  "비즈니스 일반 & 영업": [
    "비즈니스 이메일",
    "문서 및 보고서",
    "발표 및 스피치",
    "협상 및 커뮤니케이션"
  ],
  "인사 & 조직문화": [
    "채용(Recruiting)",
    "온보딩 & 교육",
    "평가 & 피드백"
  ],
  "고객 경험 & 지원 (CS/CX)": [
    "고객 응대",
    "챗봇 시나리오",
    "설문조사"
  ]
};

// Extract variables from text ({{variable}} format)
export function extractVariables(text: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const matches = text.matchAll(regex);
  const variables = new Set<string>();

  for (const match of matches) {
    variables.add(match[1].trim());
  }

  return Array.from(variables);
}

// Replace variables in text with values
export function replaceVariables(text: string, values: Record<string, string>): string {
  let result = text;

  for (const [key, value] of Object.entries(values)) {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    result = result.replace(regex, value);
  }

  return result;
}

// Assemble P.A.I.R structured prompt into markdown
export function assemblePrompt(structure: Prompt['structure']): string {
  if (!structure) return '';

  const sections: string[] = [];

  // Role & Objective
  if (structure.persona.profile || structure.persona.intent) {
    sections.push('# Role & Objective');
    if (structure.persona.profile) sections.push(`- Role: ${structure.persona.profile}`);
    if (structure.persona.intent) sections.push(`- Goal: ${structure.persona.intent}`);
  }

  // Context & Assets
  if (structure.asset.knowledgeBase || structure.asset.styleGuide) {
    sections.push('', '# Context & Assets');
    if (structure.asset.knowledgeBase) sections.push(`- References: ${structure.asset.knowledgeBase}`);
    if (structure.asset.styleGuide) sections.push(`- Style/Tone: ${structure.asset.styleGuide}`);
  }

  // Instructions
  if (structure.instruction.task || structure.instruction.context || structure.instruction.constraints) {
    sections.push('', '# Instructions');
    if (structure.instruction.task) sections.push(`- Task: ${structure.instruction.task}`);
    if (structure.instruction.context) sections.push(`- Context: ${structure.instruction.context}`);
    if (structure.instruction.constraints) sections.push(`- Constraints: ${structure.instruction.constraints}`);
  }

  // Output Format
  if (structure.result.format || structure.result.example) {
    sections.push('', '# Output Format');
    if (structure.result.format) sections.push(`- Format: ${structure.result.format}`);
    if (structure.result.example) sections.push(`- Examples: ${structure.result.example}`);
  }

  return sections.join('\n');
}

// Get job-specific field labels and placeholders (Korean UI)
export function getJobConfig(job: string) {
  const configs: Record<string, Record<string, Record<string, { label: string; guide: string; placeholder: string }>>> = {
    'general': {
      persona: {
        profile: {
          label: '역할 (Role)',
          guide: '전문가',
          placeholder: '예: 전문 컨설턴트, 기술 작가'
        },
        intent: {
          label: '목표 (Goal)',
          guide: '작업 목적',
          placeholder: '예: 종합적인 분석 제공'
        }
      },
      asset: {
        knowledgeBase: {
          label: '참조 자료 (References)',
          guide: '지식 베이스',
          placeholder: '파일 업로드 또는 참고 자료 붙여넣기'
        },
        styleGuide: {
          label: '스타일/톤 (Style & Tone)',
          guide: '작성 가이드',
          placeholder: '톤앤매너, 포맷 선호도'
        }
      },
      instruction: {
        task: {
          label: '작업 내용 (Task)',
          guide: '구체적 업무',
          placeholder: '수행할 작업을 구체적으로 설명'
        },
        context: {
          label: '배경 상황 (Context)',
          guide: '작업 배경',
          placeholder: '배경 정보, 작업이 필요한 이유'
        },
        constraints: {
          label: '제약 조건 (Constraints)',
          guide: '주의사항',
          placeholder: '피해야 할 사항이나 제한사항'
        }
      },
      result: {
        format: {
          label: '출력 형식 (Format)',
          guide: '결과물 형태',
          placeholder: '예: Markdown, JSON, 일반 텍스트'
        },
        example: {
          label: '예시 (Examples)',
          guide: 'Few-shot 예제',
          placeholder: '원하는 결과물의 예시 제공'
        }
      }
    },
    'uiux-planning': {
      persona: {
        profile: {
          label: '역할 (Role)',
          guide: '기획 전문가',
          placeholder: '예: 시니어 서비스 기획자, UX 전략가'
        },
        intent: {
          label: '목표 (Goal)',
          guide: '기획 목표',
          placeholder: '예: 사용자 플로우 설계, 기능 명세 작성'
        }
      },
      asset: {
        knowledgeBase: {
          label: '참조 자료 (References)',
          guide: '기획 자료',
          placeholder: '사용자 리서치, 경쟁사 분석 자료'
        },
        styleGuide: {
          label: '스타일/톤 (Style & Tone)',
          guide: '디자인 시스템',
          placeholder: 'UI 가이드라인, 브랜드 아이덴티티'
        }
      },
      instruction: {
        task: {
          label: '작업 내용 (Task)',
          guide: '기획 업무',
          placeholder: '예: 결제 과정 사용자 여정 설계'
        },
        context: {
          label: '배경 상황 (Context)',
          guide: '제품 맥락',
          placeholder: '타겟 사용자, 비즈니스 목표'
        },
        constraints: {
          label: '제약 조건 (Constraints)',
          guide: '기획 제약',
          placeholder: '기술적 한계, 일정'
        }
      },
      result: {
        format: {
          label: '출력 형식 (Format)',
          guide: '산출물 형식',
          placeholder: '예: 플로우차트, 유저 스토리, 와이어프레임 설명'
        },
        example: {
          label: '예시 (Examples)',
          guide: '결과물 예시',
          placeholder: '원하는 형식의 예시'
        }
      }
    },
    'uiux-design': {
      persona: {
        profile: {
          label: '역할 (Role)',
          guide: '디자인 전문가',
          placeholder: '예: 시니어 UI 디자이너, 비주얼 디자이너'
        },
        intent: {
          label: '목표 (Goal)',
          guide: '디자인 목표',
          placeholder: '예: 랜딩 페이지 디자인, 모바일 앱 UI 제작'
        }
      },
      asset: {
        knowledgeBase: {
          label: '참조 자료 (References)',
          guide: '디자인 레퍼런스',
          placeholder: '무드보드, 영감 자료, 스크린샷'
        },
        styleGuide: {
          label: '스타일/톤 (Style & Tone)',
          guide: '브랜드 가이드',
          placeholder: '컬러, 타이포그래피, 컴포넌트 라이브러리'
        }
      },
      instruction: {
        task: {
          label: '작업 내용 (Task)',
          guide: '디자인 업무',
          placeholder: '예: CTA가 포함된 히어로 섹션 디자인'
        },
        context: {
          label: '배경 상황 (Context)',
          guide: '디자인 맥락',
          placeholder: '브랜드 개성, 타겟 오디언스'
        },
        constraints: {
          label: '제약 조건 (Constraints)',
          guide: '디자인 제약',
          placeholder: '플랫폼 요구사항, 접근성'
        }
      },
      result: {
        format: {
          label: '출력 형식 (Format)',
          guide: '결과물 형태',
          placeholder: '예: Figma 파일 구조, 디자인 토큰, 컴포넌트 명세'
        },
        example: {
          label: '예시 (Examples)',
          guide: '레퍼런스',
          placeholder: '유사한 디자인이나 목업'
        }
      }
    },
    'dev-tech': {
      persona: {
        profile: {
          label: '역할 (Role)',
          guide: '개발 스택 전문가',
          placeholder: '예: 시니어 Python 개발자, 풀스택 엔지니어'
        },
        intent: {
          label: '목표 (Goal)',
          guide: '개발 목표',
          placeholder: '예: 코드 리팩토링, API 구현'
        }
      },
      asset: {
        knowledgeBase: {
          label: '참조 자료 (References)',
          guide: '코드베이스 정보',
          placeholder: '기존 코드, 문서, 의존성 정보'
        },
        styleGuide: {
          label: '스타일/톤 (Style & Tone)',
          guide: '코딩 컨벤션',
          placeholder: '스타일 가이드, 린트 규칙, 베스트 프랙티스'
        }
      },
      instruction: {
        task: {
          label: '작업 내용 (Task)',
          guide: '코딩 업무',
          placeholder: '예: 데이터베이스 쿼리 최적화'
        },
        context: {
          label: '배경 상황 (Context)',
          guide: '기술적 배경',
          placeholder: '현재 아키텍처, 성능 이슈'
        },
        constraints: {
          label: '제약 조건 (Constraints)',
          guide: '기술적 제약',
          placeholder: '프레임워크 버전, 하위 호환성'
        }
      },
      result: {
        format: {
          label: '출력 형식 (Format)',
          guide: '코드 형식',
          placeholder: '예: Python, TypeScript, JSON'
        },
        example: {
          label: '예시 (Examples)',
          guide: '코드 예제',
          placeholder: '기대하는 코드 구조나 패턴'
        }
      }
    },
    'marketing': {
      persona: {
        profile: {
          label: '역할 (Role)',
          guide: '브랜드 페르소나',
          placeholder: '예: 시니어 마케터, 콘텐츠 전략가'
        },
        intent: {
          label: '목표 (Goal)',
          guide: '마케팅 목표',
          placeholder: '예: 참여도 증대, 전환율 향상'
        }
      },
      asset: {
        knowledgeBase: {
          label: '참조 자료 (References)',
          guide: '캠페인 자료',
          placeholder: '이전 캠페인, 시장 조사 자료'
        },
        styleGuide: {
          label: '스타일/톤 (Style & Tone)',
          guide: '브랜드 보이스',
          placeholder: '톤앤매너, 메시징 가이드라인'
        }
      },
      instruction: {
        task: {
          label: '작업 내용 (Task)',
          guide: '마케팅 업무',
          placeholder: '예: 제품 상세 페이지 카피 작성'
        },
        context: {
          label: '배경 상황 (Context)',
          guide: '캠페인 맥락',
          placeholder: '타겟 오디언스, 가치 제안, 페인 포인트'
        },
        constraints: {
          label: '제약 조건 (Constraints)',
          guide: '브랜드 제약',
          placeholder: '사용 금지 단어, 규제 요구사항'
        }
      },
      result: {
        format: {
          label: '출력 형식 (Format)',
          guide: '콘텐츠 형식',
          placeholder: '예: 블로그 포스트, 이메일, 소셜 미디어 카피'
        },
        example: {
          label: '예시 (Examples)',
          guide: '성공 사례',
          placeholder: '높은 성과를 낸 콘텐츠 샘플'
        }
      }
    },
    'video-creator': {
      persona: {
        profile: {
          label: '역할 (Role)',
          guide: '크리에이터 프로필',
          placeholder: '예: 유튜브 크리에이터, 비디오 편집자'
        },
        intent: {
          label: '목표 (Goal)',
          guide: '콘텐츠 목표',
          placeholder: '예: 바이럴 숏폼 콘텐츠, 튜토리얼 시리즈'
        }
      },
      asset: {
        knowledgeBase: {
          label: '참조 자료 (References)',
          guide: '콘텐츠 레퍼런스',
          placeholder: '인기 동영상, 트렌드, 경쟁사 분석'
        },
        styleGuide: {
          label: '스타일/톤 (Style & Tone)',
          guide: '채널 아이덴티티',
          placeholder: '편집 스타일, 브랜드 컬러, 인트로/아웃트로'
        }
      },
      instruction: {
        task: {
          label: '작업 내용 (Task)',
          guide: '영상 업무',
          placeholder: '예: 60초 설명 영상 스크립트 작성'
        },
        context: {
          label: '배경 상황 (Context)',
          guide: '시청자 맥락',
          placeholder: '인구통계, 플랫폼, 참여 지표'
        },
        constraints: {
          label: '제약 조건 (Constraints)',
          guide: '제작 제약',
          placeholder: '재생 시간 제한, 예산, 장비'
        }
      },
      result: {
        format: {
          label: '출력 형식 (Format)',
          guide: '산출물 형식',
          placeholder: '예: 스크립트, 스토리보드, 샷 리스트'
        },
        example: {
          label: '예시 (Examples)',
          guide: '레퍼런스 영상',
          placeholder: '유사한 성공 사례 링크'
        }
      }
    }
  };

  return configs[job] || configs.general;
}

// Highlight variables in text
export function highlightVariables(text: string): string {
  return text.replace(/\{\{([^}]+)\}\}/g, '<span class="bg-blue-100 text-blue-700 px-1 rounded">{{$1}}</span>');
}
