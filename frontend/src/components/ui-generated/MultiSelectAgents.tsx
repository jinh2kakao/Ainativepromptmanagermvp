import React, { useState, useEffect, useRef } from 'react';
import { Check, X, ChevronDown } from 'lucide-react';
import { api } from '@/utils/axios';
import { AiAgent } from '@/types';

interface MultiSelectAgentsProps {
    selectedAgents: string[];
    onChange: (agents: string[]) => void;
}

export function MultiSelectAgents({ selectedAgents, onChange }: MultiSelectAgentsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [availableAgents, setAvailableAgents] = useState<AiAgent[]>([]);

    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const res = await api.get('/api/admin/agents');
                setAvailableAgents(res.data);
            } catch (error) {
                console.error("Failed to fetch agents", error);
            }
        };
        fetchAgents();

        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleAgent = (agentId: string) => {
        if (selectedAgents.includes(agentId)) {
            onChange(selectedAgents.filter(id => id !== agentId));
        } else {
            onChange([...selectedAgents, agentId]);
        }
    };

    const removeAgent = (agentId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(selectedAgents.filter(id => id !== agentId));
    };

    const filteredAgents = availableAgents.filter(agent =>
        agent.is_active && (
            agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.group.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const groupedAgents = filteredAgents.reduce((acc, agent) => {
        if (!acc[agent.group]) acc[agent.group] = [];
        acc[agent.group].push(agent);
        return acc;
    }, {} as Record<string, AiAgent[]>);

    return (
        <div className="relative" ref={containerRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                적용 가능한 AI 에이전트 <span className="text-gray-400 font-normal">(선택)</span>
            </label>

            <div
                className="w-full min-h-[42px] px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-white cursor-text flex flex-wrap gap-2 items-center"
                onClick={() => setIsOpen(true)}
            >
                {selectedAgents.length === 0 && !isOpen && (
                    <span className="text-gray-400 text-sm">에이전트를 선택하세요...</span>
                )}

                {selectedAgents.map(agentId => {
                    const agent = availableAgents.find(a => a.id === agentId);
                    // Even if not found (deleted?), show ID
                    return (
                        <span key={agentId} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {agent ? agent.name : agentId}
                            <button
                                type="button"
                                onClick={(e) => removeAgent(agentId, e)}
                                className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    );
                })}

                <div className="flex-1 min-w-[120px]">
                    <input
                        type="text"
                        className="w-full border-none p-0 focus:ring-0 text-sm"
                        placeholder={selectedAgents.length > 0 ? "" : ""}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsOpen(true)}
                    />
                </div>

                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                    {Object.keys(groupedAgents).length === 0 ? (
                        <div className="px-4 py-2 text-gray-500 text-sm">검색 결과가 없습니다.</div>
                    ) : (
                        Object.entries(groupedAgents).map(([group, agents]) => (
                            <div key={group}>
                                <div className="px-4 py-1.5 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 z-50 border-b border-gray-100 shadow-sm">
                                    {group}
                                </div>
                                {agents.map(agent => (
                                    <div
                                        key={agent.id}
                                        className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 ${selectedAgents.includes(agent.id) ? 'bg-blue-50' : ''}`}
                                        onClick={() => toggleAgent(agent.id)}
                                    >
                                        <span className={`block truncate ${selectedAgents.includes(agent.id) ? 'font-semibold text-blue-900' : 'text-gray-900'}`}>
                                            {agent.name}
                                        </span>
                                        {selectedAgents.includes(agent.id) && (
                                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                                                <Check className="h-4 w-4" />
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
