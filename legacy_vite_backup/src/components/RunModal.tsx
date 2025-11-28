import { useState, useEffect } from 'react';
import { X, Copy, ExternalLink, Check } from 'lucide-react';
import { Prompt } from '../types';
import { replaceVariables } from '../utils/promptUtils';
import { toast } from 'sonner@2.0.3';

interface RunModalProps {
  prompt: Prompt;
  onClose: () => void;
}

export function RunModal({ prompt, onClose }: RunModalProps) {
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [compiledPrompt, setCompiledPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    // Initialize variable values
    const initial: Record<string, string> = {};
    prompt.variables.forEach((variable) => {
      initial[variable] = '';
    });
    setVariableValues(initial);
  }, [prompt]);
  
  useEffect(() => {
    // Update compiled prompt in real-time
    const compiled = replaceVariables(prompt.content, variableValues);
    setCompiledPrompt(compiled);
  }, [variableValues, prompt.content]);
  
  const handleCopy = async () => {
    // Try modern clipboard API first, fallback to legacy method
    try {
      await navigator.clipboard.writeText(compiledPrompt);
      setCopied(true);
      toast.success('복사되었습니다!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback: use legacy execCommand method (silently)
      try {
        const textArea = document.createElement('textarea');
        textArea.value = compiledPrompt;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          setCopied(true);
          toast.success('복사되었습니다!');
          setTimeout(() => setCopied(false), 2000);
        } else {
          toast.error('복사 실패: 브라우저가 지원하지 않습니다');
        }
      } catch (fallbackError) {
        toast.error('복사 실패: 브라우저가 지원하지 않습니다');
      }
    }
  };
  
  const handleOpenInChatGPT = () => {
    const encoded = encodeURIComponent(compiledPrompt);
    window.open(`https://chat.openai.com/?q=${encoded}`, '_blank');
  };
  
  const allVariablesFilled = prompt.variables.every((v) => variableValues[v]?.trim());
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center md:p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white md:rounded-xl shadow-2xl w-full md:max-w-3xl h-full md:h-auto md:max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-4 md:px-6 py-4 md:py-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex-1 min-w-0 mr-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base md:text-lg flex-shrink-0">🚀</span>
              <h2 className="text-gray-900 text-base md:text-lg truncate">{prompt.title}</h2>
            </div>
            <p className="text-xs md:text-sm text-gray-500 line-clamp-1">
              변수를 입력하면 완성된 프롬프트를 확인할 수 있습니다
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg p-1.5 transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0 md:min-h-0 md:min-w-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-3 md:py-4">
          <div className="space-y-4 md:space-y-6">
            {/* Variable Inputs */}
            {prompt.variables.length > 0 && (
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm text-gray-700">변수 입력</h3>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs border border-blue-200">
                    {prompt.variables.length}개
                  </span>
                </div>
                {prompt.variables.map((variable, index) => (
                  <div key={variable}>
                    <label className="block text-sm text-gray-700 mb-2">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="text-blue-600">{index + 1}.</span>
                        <span className="font-medium">{variable}</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      value={variableValues[variable] || ''}
                      onChange={(e) =>
                        setVariableValues({
                          ...variableValues,
                          [variable]: e.target.value
                        })
                      }
                      placeholder={`${variable} 값을 입력하세요...`}
                      className="w-full px-3 md:px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base min-h-[44px] md:min-h-0"
                    />
                  </div>
                ))}
              </div>
            )}
            
            {/* Preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-700">미리보기</h3>
                {allVariablesFilled && (
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <Check className="w-3.5 h-3.5" />
                    완성됨
                  </span>
                )}
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-3 md:p-5 min-h-[150px] md:min-h-[200px] max-h-80 md:max-h-96 overflow-y-auto shadow-inner">
                <pre className="text-xs md:text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {compiledPrompt || prompt.content}
                </pre>
              </div>
              {!allVariablesFilled && prompt.variables.length > 0 && (
                <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                  <span>⚠️</span>
                  모든 변수를 입력하면 완성된 프롬프트를 확인할 수 있습니다
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-4 md:px-6 py-3 md:py-4 border-t border-gray-200 bg-gray-50 flex flex-col md:flex-row items-stretch md:items-center justify-end gap-2 md:gap-3 md:rounded-b-xl">
          {/* Mobile: Stack / Desktop: Row */}
          <button
            onClick={onClose}
            className="md:order-1 px-4 md:px-5 py-2.5 text-gray-700 hover:bg-gray-200 bg-white border border-gray-300 rounded-lg transition-all duration-200 text-sm md:text-base min-h-[44px]"
          >
            닫기
          </button>
          <button
            onClick={handleOpenInChatGPT}
            disabled={!allVariablesFilled && prompt.variables.length > 0}
            className="md:order-2 px-4 md:px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base min-h-[44px]"
          >
            <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">ChatGPT에서 열기</span>
            <span className="sm:hidden">ChatGPT</span>
          </button>
          <button
            onClick={handleCopy}
            disabled={!allVariablesFilled && prompt.variables.length > 0}
            className="md:order-3 px-4 md:px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg disabled:shadow-none text-sm md:text-base min-h-[44px]"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 md:w-4 md:h-4" />
                복사 완료!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />
                프롬프트 복사
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
