import { Prompt } from '@/types';

// 프롬프트 카테고리 데이터 정의
import { jobCategories } from './jobCategories';
export { jobCategories };

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
  // Default configuration for general purpose
  // In a real app, this would return different configs based on jobType
  return {
    persona: {
      profile: {
        label: 'Profile (역할)',
        guide: '누가 이 작업을 수행하나요?',
        placeholder: '예: 10년차 시니어 마케터, 친절한 고객 상담원'
      },
      intent: {
        label: 'Intent (의도)',
        guide: '이 작업의 궁극적인 목표는 무엇인가요?',
        placeholder: '예: 2030 여성을 타겟으로 한 신제품 홍보, 고객 불만 해소 및 신뢰 회복'
      }
    },
    asset: {
      knowledgeBase: {
        label: 'Knowledge Base (지식)',
        guide: '참고해야 할 배경 지식이나 정보는 무엇인가요?',
        placeholder: '예: 우리 회사의 브랜드 가이드라인, 제품 상세 스펙 시트, 경쟁사 분석 리포트'
      },
      styleGuide: {
        label: 'Style Guide (스타일)',
        guide: '어떤 톤앤매너로 작성해야 하나요?',
        placeholder: '예: 전문적이고 신뢰감 있는 톤, 친근하고 유머러스한 말투, 간결하고 명확한 문체'
      }
    },
    instruction: {
      task: {
        label: 'Task (작업)',
        guide: '구체적으로 어떤 작업을 수행해야 하나요?',
        placeholder: '예: 인스타그램 홍보 게시글 3개 작성, 고객 컴플레인 답변 메일 초안 작성'
      },
      context: {
        label: 'Context (맥락)',
        guide: '작업의 배경이나 상황은 무엇인가요?',
        placeholder: '예: 이번 주말에 런칭하는 신제품임, 고객이 배송 지연으로 매우 화가 난 상태임'
      },
      constraints: {
        label: 'Constraints (제약)',
        guide: '지켜야 할 규칙이나 피해야 할 내용은 무엇인가요?',
        placeholder: '예: 500자 이내로 작성, 경쟁사 언급 금지, 해시태그 5개 이상 포함'
      }
    },
    result: {
      format: {
        label: 'Format (형식)',
        guide: '어떤 형식으로 결과물을 받고 싶나요?',
        placeholder: '예: 마크다운 표, JSON 데이터, 블로그 포스트 형식'
      },
      example: {
        label: 'Example (예시)',
        guide: '참고할 만한 예시가 있나요?',
        placeholder: '예: (기존에 잘 작성된 게시글 예시 붙여넣기)'
      }
    }
  };
};

// [추가] 구조화된 프롬프트 조립 (JSON -> String)
export const assemblePrompt = (structure: any, variables?: any) => {
  if (!structure) return '';

  // structure가 문자열인 경우 그대로 반환
  if (typeof structure === 'string') return structure;

  // JSON 구조인 경우 조립 로직
  let assembledText = '';

  // Persona
  if (structure.persona?.profile) assembledText += `Role: ${structure.persona.profile}\n`;
  if (structure.persona?.intent) assembledText += `Intent: ${structure.persona.intent}\n`;

  // Asset
  if (structure.asset?.knowledgeBase) assembledText += `Knowledge Base: ${structure.asset.knowledgeBase}\n`;
  if (structure.asset?.styleGuide) assembledText += `Style Guide: ${structure.asset.styleGuide}\n`;

  // Instruction
  if (structure.instruction?.task) assembledText += `Task: ${structure.instruction.task}\n`;
  if (structure.instruction?.context) assembledText += `Context: ${structure.instruction.context}\n`;
  if (structure.instruction?.constraints) assembledText += `Constraints: ${structure.instruction.constraints}\n`;

  // Result
  if (structure.result?.format) assembledText += `Format: ${structure.result.format}\n`;
  if (structure.result?.example) assembledText += `Example: ${structure.result.example}\n`;

  return assembledText;
};

// [추가] 프롬프트에서 변수 추출 ({{variable}})
export const extractVariables = (content: string) => {
  const regex = /{{(.*?)}}/g;
  const matches = content.match(regex);
  if (!matches) return [];

  return matches.map(match => match.replace(/{{|}}/g, '').trim());
};