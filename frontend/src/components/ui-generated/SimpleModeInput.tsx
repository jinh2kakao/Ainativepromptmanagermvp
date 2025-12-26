import { useEffect, useState } from 'react';
import { extractVariables } from '@/utils/promptUtils';

interface SimpleModeInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function SimpleModeInput({ value, onChange }: SimpleModeInputProps) {
  const [variables, setVariables] = useState<string[]>([]);

  useEffect(() => {
    const vars = extractVariables(value);
    setVariables(vars);
  }, [value]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-700 mb-2">
          Prompt Content
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-48 md:h-64 px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm md:text-base"
          placeholder="Write your prompt here... Use {{variable}} for dynamic values.

Example:
Write a {{tone}} blog post about {{topic}} targeting {{audience}}."
        />
      </div>

      {variables.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
          <p className="text-sm text-blue-900 mb-2">
            Detected Variables ({variables.length}):
          </p>
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {Array.from(new Set(variables)).map((variable) => (
              <span
                key={variable}
                className="px-2.5 md:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs md:text-sm"
              >
                {`{{${variable}}}`}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
