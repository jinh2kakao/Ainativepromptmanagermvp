import { Prompt } from '@/types';

/**
 * Parses a markdown string into a structured PAIR object.
 * Looks for specific headers (H2/H3) to identify sections.
 */
export function parsePairPrompt(content: string): NonNullable<Prompt['structure']> {
    const structure: NonNullable<Prompt['structure']> = {
        job: '',
        persona: { profile: '', intent: '' },
        asset: { knowledgeBase: '', styleGuide: '' },
        instruction: { task: '', context: '', constraints: '' },
        result: { format: '', example: '' }
    };

    if (!content) return structure;

    // 1. Try to parse as JSON (Legacy & Admin Console Format)
    try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
            let unmappedContent = '';

            parsed.forEach((group: any) => {
                const groupNameLower = group.groupName.toLowerCase();
                let mapped = false;

                // Attempt to map to known keys
                // We map 'job' -> job, 'persona' -> persona, etc.
                // Note: The Admin Console allows arbitrary names.

                // keyof typeof structure: 'job' | 'persona' | 'asset' | 'instruction' | 'result'
                // We check if the group name loosely matches any of these

                if (groupNameLower.includes('persona') || groupNameLower.includes('role')) {
                    group.items.forEach((item: any) => {
                        const label = item.label.toLowerCase();
                        if (label.includes('intent') || label.includes('목표')) structure.persona.intent = item.value;
                        else structure.persona.profile = item.value; // Default to profile if unknown
                    });
                    mapped = true;
                } else if (groupNameLower.includes('asset') || groupNameLower.includes('knowledge') || groupNameLower.includes('자료')) {
                    group.items.forEach((item: any) => {
                        const label = item.label.toLowerCase();
                        if (label.includes('style')) structure.asset.styleGuide = item.value;
                        else structure.asset.knowledgeBase = item.value;
                    });
                    mapped = true;
                } else if (groupNameLower.includes('instruction') || groupNameLower.includes('지시')) {
                    group.items.forEach((item: any) => {
                        const label = item.label.toLowerCase();
                        if (label.includes('context')) structure.instruction.context = item.value;
                        else if (label.includes('constraint')) structure.instruction.constraints = item.value;
                        else structure.instruction.task = item.value; // Default to task
                    });
                    mapped = true;
                } else if (groupNameLower.includes('result') || groupNameLower.includes('output') || groupNameLower.includes('결과')) {
                    group.items.forEach((item: any) => {
                        const label = item.label.toLowerCase();
                        if (label.includes('example')) structure.result.example = item.value;
                        else structure.result.format = item.value;
                    });
                    mapped = true;
                }

                // If not mapped (Custom Group), append to unmappedContent to save in Task or Context
                if (!mapped) {
                    unmappedContent += `\n\n## ${group.groupName}\n`;
                    group.items.forEach((item: any) => {
                        unmappedContent += `- ${item.label}: ${item.value}\n`;
                    });
                }
            });

            // Append unmapped content to instruction.task so it appears in the editor
            if (unmappedContent) {
                // Determine where to append. 'task' is safe.
                if (structure.instruction.task) {
                    structure.instruction.task += unmappedContent;
                } else {
                    structure.instruction.task = unmappedContent.trim();
                }
            }

            return structure;
        }
    } catch (e) {
        // Not JSON, proceed to Markdown parsing
    }

    // 2. Parse as Markdown (New Format)
    // Helper to find a section content by possible header names
    const extractSectionContent = (possibleHeaders: string[]): string => {
        const lowerHeaders = possibleHeaders.map(h => h.toLowerCase());
        const lines = content.split('\n');
        let capture = false;
        let buffer: string[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            // Check headers (## Header or ### Header)
            if (trimmed.startsWith('#')) {
                // Clean header text to compare
                const headerText = trimmed.replace(/^#+\s*/, '').toLowerCase();

                // If it matches one of our target headers, start capturing
                if (lowerHeaders.some(h => headerText.includes(h))) {
                    capture = true;
                    continue;
                }
                // If we hit any other header while capturing, stop
                else if (capture) {
                    break;
                }
            }

            if (capture) {
                buffer.push(line);
            }
        }
        return buffer.join('\n').trim();
    };

    // 1. Persona Section
    const personaRaw = extractSectionContent(['persona', '페르소나', 'role', '역할']);
    if (personaRaw) {
        // Try to separate Profile vs Intent logic if possible, 
        // otherwise default to Profile.
        structure.persona.profile = personaRaw;
    }

    // 2. Asset Section
    const assetRaw = extractSectionContent(['asset', '에셋', 'reference', '참고자료', 'knowledge']);
    if (assetRaw) {
        structure.asset.knowledgeBase = assetRaw;
    }

    // 3. Instruction Section
    const instructionRaw = extractSectionContent(['instruction', '지시사항', '지시', '작업', 'task']);
    if (instructionRaw) {
        // Simple heuristic: Put everything in 'Task' typically
        structure.instruction.task = instructionRaw;

        // If we see explicit constraints header within global context, we might catch it?
        // For simplicity, we assume the main instruction body goes to 'task'
        // But if there's a specific 'Context' section in global scope (some templates have it top level)
        // we can check for that too.
    }

    // Extra: Check explicit Context section if it exists at top level
    const contextRaw = extractSectionContent(['context', '배경', '상황']);
    if (contextRaw) {
        structure.instruction.context = contextRaw;
    }

    // Extra: Check explicit Constraints section if it exists at top level
    const constraintRaw = extractSectionContent(['constraint', '제약조건', '유의사항', 'rule']);
    if (constraintRaw) {
        structure.instruction.constraints = constraintRaw;
    }

    // 4. Result Section
    const resultRaw = extractSectionContent(['result', 'output', '결과물', '출력']);
    if (resultRaw) {
        structure.result.format = resultRaw;
    }

    return structure;
}
