'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Check, Sparkles, User, Calendar, Copy } from 'lucide-react';
import { api } from '@/utils/axios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const fetchTemplateDetail = async (id: string) => {
    const res = await api.get(`/api/templates/${id}`);
    return res.data;
};

const recordUsage = async (id: string, action: string) => {
    try {
        await api.post(`/api/templates/${id}/track`, null, { params: { action } });
    } catch (e) {
        console.error("Failed to track usage", e);
    }
};

export function TemplateDetailContent() {
    const params = useParams();
    const router = useRouter();
    const templateId = params.id as string;

    const { data: template, isLoading, isError } = useQuery({
        queryKey: ['template', templateId],
        queryFn: () => fetchTemplateDetail(templateId),
        enabled: !!templateId,
    });

    const handleUseTemplate = () => {
        if (template) {
            recordUsage(template.id, 'copy');
            router.push(`/prompts/new?templateId=${template.id}`);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading template...</div>;
    }

    if (isError || !template) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-gray-500">Template not found.</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/30 pb-20">
            {/* Header / Nav */}
            <div className="border-b bg-white sticky top-0 z-10">
                <div className="container mx-auto px-4 h-14 flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="font-semibold text-lg truncate">Template Details</h1>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                    {/* Hero Image */}
                    {template.preview_image_url ? (
                        <div className="h-64 sm:h-80 w-full bg-gray-100 relative">
                            <img
                                src={template.preview_image_url}
                                alt={template.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6 sm:p-8">
                                <div className="text-white">
                                    <h1 className="text-3xl font-bold mb-2">{template.title || template.name}</h1>
                                    <p className="text-white/90 line-clamp-2 max-w-2xl">{template.description}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-600 p-8 flex items-end">
                            <div className="text-white">
                                <h1 className="text-3xl font-bold mb-2">{template.title || template.name}</h1>
                            </div>
                        </div>
                    )}

                    {/* Content Body */}
                    <div className="p-6 sm:p-8 space-y-8">
                        {/* Meta Tags */}
                        <div className="flex flex-wrap gap-2">
                            {template.mode === 'assistance' && (
                                <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    AI Assistance Mode
                                </Badge>
                            )}
                            <Badge variant="outline" className="text-gray-600">
                                {template.category?.name || 'Uncategorized'}
                            </Badge>
                            <div className="flex items-center text-sm text-gray-500 ml-auto gap-4">
                                <div className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    <span>Admin</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(template.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Description / Content Preview */}
                        <div>
                            <h2 className="text-lg font-semibold mb-3 text-gray-900 border-l-4 border-blue-500 pl-3">Description</h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {template.description || "No specific description provided."}
                            </p>
                        </div>

                        {/* Content Section (Optional Preview) */}
                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                            <h2 className="text-sm font-semibold mb-3 text-gray-500 uppercase tracking-wide">Template Content Preview</h2>
                            <div className="font-mono text-sm text-gray-700 max-h-60 overflow-y-auto whitespace-pre-wrap">
                                {template.content}
                            </div>
                        </div>

                        {/* Applicable Agents */}
                        {template.applicable_agents && template.applicable_agents.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold mb-3 text-gray-900">Recommended for</h2>
                                <div className="flex gap-2">
                                    {template.applicable_agents.map((agent: string) => (
                                        <Badge key={agent} variant="secondary">
                                            {agent}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-6 border-t flex items-center justify-end gap-3">
                            <Button size="lg" onClick={handleUseTemplate} className="w-full sm:w-auto min-w-[200px]">
                                <Copy className="w-4 h-4 mr-2" />
                                Use This Template
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
