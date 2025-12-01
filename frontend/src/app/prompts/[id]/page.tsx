import { PromptDetailClient } from './PromptDetailClient';

// 정적 내보내기(output: export)를 위해 필요한 함수
// 동적 경로([id])를 미리 생성해야 하지만, ID를 미리 알 수 없으므로 빈 배열을 반환합니다.
// 실제로는 클라이언트 사이드에서 처리되거나 404 폴백을 통해 처리되어야 합니다.
export async function generateStaticParams() {
    return [{ id: '1' }];
}

export default function PromptDetail() {
    return <PromptDetailClient />;
}
