import { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeProps, NodeResizer, useReactFlow } from '@xyflow/react';
import { Trash2 } from 'lucide-react';

const MemoNode = ({ id, data, selected }: NodeProps) => {
    const { setNodes } = useReactFlow();
    const [text, setText] = useState(data.label as string || '');

    const onDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setNodes((nodes) => nodes.filter((n) => n.id !== id));
    };

    const handleChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(evt.target.value);
        // Optimize: Debounce this if performance issues arise
        setNodes((nodes) =>
            nodes.map((n) => {
                if (n.id === id) {
                    return {
                        ...n,
                        data: { ...n.data, label: evt.target.value },
                    };
                }
                return n;
            })
        );
    }, [id, setNodes]);

    return (
        <div className={`
            group relative shadow-md rounded-lg bg-yellow-50 border-2
            ${selected ? 'border-yellow-500 shadow-lg' : 'border-yellow-200'}
            transition-all duration-200
            min-w-[150px] min-h-[100px] h-full w-full
        `}>
            <NodeResizer
                minWidth={150}
                minHeight={100}
                isVisible={selected}
                lineClassName="border-yellow-400"
                handleClassName="h-3 w-3 bg-white border-2 border-yellow-400 rounded"
            />

            <div className="flex flex-col h-full p-2">
                <div className="flex items-center justify-between mb-1 handle cursor-move opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 left-0 right-0 p-1 bg-yellow-100/50 rounded-t-lg">
                    <div className="text-[10px] text-yellow-600 font-medium px-1">MEMO</div>
                    <button
                        onClick={onDelete}
                        className="p-1 hover:bg-yellow-200 rounded text-yellow-600"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>

                <textarea
                    className="flex-1 w-full bg-transparent resize-none border-none focus:ring-0 p-1 text-sm text-gray-800 placeholder-yellow-300/50 mt-4 font-handwriting"
                    placeholder="Write a memo..."
                    value={text}
                    onChange={handleChange}
                    onMouseDown={(e) => e.stopPropagation()} // Enable text selection
                />
            </div>
        </div>
    );
};

export default memo(MemoNode);
