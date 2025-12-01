// [수정] Prompt 타입 import 경로를 @/types로 변경 (Antigravity 수정 반영)
import { Prompt } from '@/types';

export interface SubCategory {
  value: string;
  label: string;
}

export interface JobCategory {
  value: string;
  label: string;
  subCategories?: SubCategory[];
}

// 프롬프트 카테고리 데이터 정의
export const jobCategories: JobCategory[] = [
  {
    value: '서비스 & 프로덕트 기획',
    label: '서비스 & 프로덕트 기획',
    subCategories: [
      { value: '비즈니스 모델(BM) 수립', label: '비즈니스 모델(BM) 수립' },
      { value: '사용자 리서치(UX Research)', label: '사용자 리서치(UX Research)' },
      { value: '기능 명세 및 정책', label: '기능 명세 및 정책' },
      { value: '화면 설계(IA)', label: '화면 설계(IA)' },
      { value: '프로젝트 관리(PM/PO)', label: '프로젝트 관리(PM/PO)' }
    ]
  },
  {
    value: 'UI/UX & 크리에이티브 디자인',
    label: 'UI/UX & 크리에이티브 디자인',
    subCategories: [
      { value: 'UI 구조 및 레이아웃', label: 'UI 구조 및 레이아웃' },
      { value: '디자인 시스템', label: '디자인 시스템' },
      { value: 'UX 라이팅', label: 'UX 라이팅' },
      { value: '그래픽 & 브랜딩', label: '그래픽 & 브랜딩' },
      { value: '디자인 리뷰', label: '디자인 리뷰' }
    ]
  },
  {
    value: '소프트웨어 개발 & 엔지니어링',
    label: '소프트웨어 개발 & 엔지니어링',
    subCategories: [
      { value: '프론트엔드 개발', label: '프론트엔드 개발' },
      { value: '백엔드 & API', label: '백엔드 & API' },
      { value: '코드 품질 & 리팩토링', label: '코드 품질 & 리팩토링' },
      { value: '데브옵스 & 인프라', label: '데브옵스 & 인프라' },
      { value: 'QA & 테스팅', label: 'QA & 테스팅' },
      { value: '기술 문서', label: '기술 문서' }
    ]
  },
  {
    value: '데이터 분석 & AI',
    label: '데이터 분석 & AI',
    subCategories: [
      { value: '데이터 쿼리(SQL)', label: '데이터 쿼리(SQL)' },
      { value: '데이터 시각화', label: '데이터 시각화' },
      { value: '데이터 분석 보고', label: '데이터 분석 보고' },
      { value: 'AI 모델링', label: 'AI 모델링' }
    ]
  },
  {
    value: '마케팅 & 그로스',
    label: '마케팅 & 그로스',
    subCategories: [
      { value: '카피라이팅(Ads)', label: '카피라이팅(Ads)' },
      { value: '콘텐츠 마케팅', label: '콘텐츠 마케팅' },
      { value: '소셜 미디어(SNS)', label: '소셜 미디어(SNS)' },
      { value: 'CRM & 이메일', label: 'CRM & 이메일' },
      { value: '브랜드 스토리텔링', label: '브랜드 스토리텔링' }
    ]
  },
  {
    value: '유튜브 & 영상 미디어',
    label: '유튜브 & 영상 미디어',
    subCategories: [
      { value: '숏폼 시나리오', label: '숏폼 시나리오' },
      { value: '롱폼 영상 기획', label: '롱폼 영상 기획' },
      { value: '영상 메타데이터', label: '영상 메타데이터' },
      { value: '스토리보드 묘사', label: '스토리보드 묘사' }
    ]
  },
  {
    value: '비즈니스 일반 & 영업',
    label: '비즈니스 일반 & 영업',
    subCategories: [
      { value: '비즈니스 이메일', label: '비즈니스 이메일' },
      { value: '문서 및 보고서', label: '문서 및 보고서' },
      { value: '발표 및 스피치', label: '발표 및 스피치' },
      { value: '협상 및 커뮤니케이션', label: '협상 및 커뮤니케이션' }
    ]
  },
  {
    value: '인사 & 조직문화',
    label: '인사 & 조직문화',
    subCategories: [
      { value: '채용(Recruiting)', label: '채용(Recruiting)' },
      { value: '온보딩 & 교육', label: '온보딩 & 교육' },
      { value: '평가 & 피드백', label: '평가 & 피드백' }
    ]
  },
  {
    value: '고객 경험 & 지원 (CS/CX)',
    label: '고객 경험 & 지원 (CS/CX)',
    subCategories: [
      { value: '고객 응대', label: '고객 응대' },
      { value: '챗봇 시나리오', label: '챗봇 시나리오' },
      { value: '설문조사', label: '설문조사' }
    ]
  }
];

// 날짜 포맷팅 유틸리티
export const formatDate = (dateString?: string | number | Date) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

// 텍스트 요약 유틸리티
export const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// [추가] 직무별 프롬프트 구조 설정 가져오기
export const getJobConfig = (jobType: string) => {
  // 실제로는 더 복잡한 설정이 들어갈 수 있습니다.
  // 여기서는 간단한 예시 구조를 반환합니다.
  const defaultConfig = {
    sections: [
      { id: 'role', label: 'Role', placeholder: 'Act as a...' },
      { id: 'task', label: 'Task', placeholder: 'Your task is to...' },
      { id: 'context', label: 'Context', placeholder: 'Provide context...' },
      { id: 'format', label: 'Format', placeholder: 'Output format...' },
    ]
  };

  return defaultConfig;
};

// [수정] variables 인자를 선택적(optional)으로 변경하여 호출 시 생략 가능하게 함
export const assemblePrompt = (structure: any, variables?: any) => {
  if (!structure) return '';

  // structure가 문자열인 경우 그대로 반환
  if (typeof structure === 'string') return structure;

  // JSON 구조인 경우 조립 로직 (예시)
  let assembledText = '';
  if (structure.role) assembledText += `Role: ${structure.role}\n`;
  if (structure.task) assembledText += `Task: ${structure.task}\n`;
  if (structure.context) assembledText += `Context: ${structure.context}\n`;

  return assembledText;
};

// [추가] 프롬프트에서 변수 추출 ({{variable}})
export const extractVariables = (content: string) => {
  const regex = /{{(.*?)}}/g;
  const matches = content.match(regex);
  if (!matches) return [];

  return matches.map(match => match.replace(/{{|}}/g, '').trim());
};

// [누락된 함수 추가] 변수 치환 함수
export const replaceVariables = (content: string, variables: Record<string, string>) => {
  if (!content) return '';
  let result = content;

  // variables 객체의 키-값 쌍을 순회하며 치환
  Object.entries(variables).forEach(([key, value]) => {
    // {{key}} 형태를 찾아서 value로 교체 (g 플래그로 전체 치환)
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  });

  return result;
};