// [수정] Prompt 타입 import 경로를 @/types로 변경 (Antigravity 수정 반영)
import { Prompt } from '@/types';

// 프롬프트 카테고리 데이터 정의
export interface JobCategory {
  label: string;
  value: string;
  subCategories?: { label: string; value: string; }[];
}

// 프롬프트 카테고리 데이터 정의
export const jobCategories: JobCategory[] = [
  {
    label: '개발 (Development)',
    value: 'dev',
    subCategories: [
      { label: 'Frontend', value: 'frontend' },
      { label: 'Backend', value: 'backend' },
      { label: 'DevOps', value: 'devops' },
      { label: 'Mobile', value: 'mobile' },
      { label: 'AI/ML', value: 'ai-ml' }
    ]
  },
  {
    label: '마케팅 (Marketing)',
    value: 'marketing',
    subCategories: [
      { label: 'Content Marketing', value: 'content' },
      { label: 'Social Media', value: 'social' },
      { label: 'Email Marketing', value: 'email' },
      { label: 'SEO', value: 'seo' }
    ]
  },
  {
    label: '비즈니스 (Business)',
    value: 'business',
    subCategories: [
      { label: 'Strategy', value: 'strategy' },
      { label: 'Sales', value: 'sales' },
      { label: 'Management', value: 'management' }
    ]
  },
  {
    label: '글쓰기 (Writing)',
    value: 'writing',
    subCategories: [
      { label: 'Blog', value: 'blog' },
      { label: 'Copywriting', value: 'copywriting' },
      { label: 'Technical Writing', value: 'tech-writing' },
      { label: 'Creative Writing', value: 'creative' }
    ]
  },
  {
    label: '디자인 (Design)',
    value: 'design',
    subCategories: [
      { label: 'UI/UX', value: 'ui-ux' },
      { label: 'Graphic Design', value: 'graphic' },
      { label: 'Web Design', value: 'web' }
    ]
  },
  { label: '기타 (Other)', value: 'other', subCategories: [] },
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

// [수정] 직무별 프롬프트 구조 설정 가져오기 (persona 속성 추가)
export const getJobConfig = (jobType: string) => {
  // 실제로는 jobType에 따라 다른 설정을 반환할 수 있습니다.
  // AssistanceMode.tsx에서 기대하는 구조에 맞춰 설정을 반환합니다.
  const defaultConfig = {
    persona: {
      profile: {
        id: 'profile',
        label: 'Profile',
        guide: 'AI의 역할과 전문성을 정의하세요',
        placeholder: '예: 10년차 시니어 마케터, 친절한 상담원...'
      },
      intent: {
        id: 'intent',
        label: 'Intent',
        guide: '이 프롬프트의 핵심 목표를 설정하세요',
        placeholder: '예: 블로그 글 작성, 코드 리팩토링, 이메일 초안 작성...'
      }
    },
    asset: {
      knowledgeBase: {
        id: 'knowledgeBase',
        label: 'Knowledge Base',
        guide: '참고할 배경 지식이나 데이터를 입력하세요',
        placeholder: '예: 회사 소개서 내용, 제품 스펙 시트, 관련 기사...'
      },
      styleGuide: {
        id: 'styleGuide',
        label: 'Style Guide',
        guide: '글의 톤앤매너와 스타일을 지정하세요',
        placeholder: '예: 친근한 구어체, 전문적인 문어체, 간결하게...'
      }
    },
    instruction: {
      task: {
        id: 'task',
        label: 'Task',
        guide: '수행해야 할 구체적인 작업을 지시하세요',
        placeholder: '예: 위 내용을 바탕으로 3개의 마케팅 카피를 작성해줘...'
      },
      context: {
        id: 'context',
        label: 'Context',
        guide: '작업의 맥락과 상황을 설명하세요',
        placeholder: '예: 이번 캠페인은 2030 세대를 타겟으로 하며...'
      },
      constraints: {
        id: 'constraints',
        label: 'Constraints',
        guide: '지켜야 할 제약조건을 명시하세요',
        placeholder: '예: 500자 이내, 이모지 사용 금지, 비속어 금지...'
      }
    },
    result: {
      format: {
        id: 'format',
        label: 'Format',
        guide: '결과물의 형식을 지정하세요',
        placeholder: '예: 마크다운 표, JSON, 글머리 기호...'
      },
      example: {
        id: 'example',
        label: 'Example',
        guide: '원하는 결과물의 예시를 보여주세요',
        placeholder: '예: 입력: 사과 -> 출력: Apple (과일)...'
      }
    }
  };

  return defaultConfig;
};

// [수정] variables 인자를 선택적(optional)으로 변경하여 호출 시 생략 가능하게 함
export const assemblePrompt = (structure: any, variables?: any) => {
  if (!structure) return '';

  // structure가 문자열인 경우 그대로 반환
  if (typeof structure === 'string') return structure;

  // JSON 구조인 경우 조립 로직
  let assembledText = '';

  // Persona 섹션 처리
  if (structure.profile) assembledText += `Role: ${structure.profile}\n`;
  if (structure.intent) assembledText += `Goal: ${structure.intent}\n\n`;

  // 나머지 섹션 처리
  if (structure.context) assembledText += `Context:\n${structure.context}\n\n`;
  if (structure.task) assembledText += `Task:\n${structure.task}\n\n`;
  if (structure.constraints) assembledText += `Constraints:\n${structure.constraints}\n\n`;
  if (structure.format) assembledText += `Output Format:\n${structure.format}`;

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