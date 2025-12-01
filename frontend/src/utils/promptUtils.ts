// [수정] Prompt 타입 import 경로를 @/types로 변경 (Antigravity 수정 반영)
import { Prompt } from '@/types';

// 프롬프트 카테고리 데이터 정의
export const jobCategories = [
  { label: '개발 (Development)', value: 'dev' },
  { label: '마케팅 (Marketing)', value: 'marketing' },
  { label: '비즈니스 (Business)', value: 'business' },
  { label: '글쓰기 (Writing)', value: 'writing' },
  { label: '디자인 (Design)', value: 'design' },
  { label: '기타 (Other)', value: 'other' },
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