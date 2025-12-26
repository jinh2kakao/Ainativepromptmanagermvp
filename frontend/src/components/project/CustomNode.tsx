import { memo } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { FileText, AlertCircle, X } from 'lucide-react';

const CustomNode = ({ id, data, selected }: NodeProps) => {
    const { setNodes } = useReactFlow();
    const label = data.label as string;
    const promptTitle = data.promptTitle as string;
    const promptSummary = data.promptSummary as string;
    const isConnected = !!data.promptId;

    const onDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setNodes((nodes) => nodes.filter((n) => n.id !== id));
    };

    return (
        <div className={`
            group relative px-4 py-3 shadow-md rounded-lg bg-white border-2 min-w-[200px] max-w-[400px]
            ${selected ? 'border-blue-500' : 'border-gray-200'}
            transition-all duration-200
        `}>
            {/* Delete Button */}
            <button
                onClick={onDelete}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600 z-10"
            >
                <X className="w-3 h-3" />
            </button>

            <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-gray-400" />

            <div className="flex items-start gap-3">
                <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                    ${isConnected ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}
                `}>
                    {isConnected ? <FileText className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-900 truncate">
                        {isConnected ? promptTitle : label}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {isConnected ? promptSummary : 'Click to connect a prompt'}
                    </div>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-gray-400" />
        </div>
    );
};

export default memo(CustomNode);
