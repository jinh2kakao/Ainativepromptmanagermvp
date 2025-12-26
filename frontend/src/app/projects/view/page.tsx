'use client';

import { useState, useCallback, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/utils/axios';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    Panel,
    NodeTypes,
    MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Save, ArrowLeft, Plus, Settings, Trash2, Lock, Unlock, Share, StickyNote } from 'lucide-react';
import { Project, ProjectNode } from '@/types/project';
import { Prompt } from '@/types';
import CustomNode from '@/components/project/CustomNode';
import MemoNode from '@/components/project/MemoNode';
import CustomEdge from '@/components/project/CustomEdge';
import PromptSelectionModal from '@/components/project/PromptSelectionModal';
import { ProjectDetailSkeleton } from '@/components/ui-generated/ProjectDetailSkeleton';
import { PublishModal } from '@/components/project/PublishModal';
import { useAuthStore } from '@/features/auth/store';
import { toast } from 'sonner';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

function ProjectDetailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const projectId = searchParams.get('id');
    const { user } = useAuthStore();

    const [project, setProject] = useState<Project | null>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [isSaving, setIsSaving] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    // Locking State
    const isTeamProject = !!project?.team_id;
    const isLockedByMe = project?.locked_by === user?.id;
    const isLockedByOther = project?.locked_by && project?.locked_by !== user?.id;

    // Editable if (Personal) OR (Team AND Locked by Me)
    const canEdit = !isTeamProject || isLockedByMe;

    const nodeTypes = useMemo<NodeTypes>(() => ({
        custom: CustomNode,
        memo: MemoNode,
    }), []);

    const edgeTypes = useMemo(() => ({
        custom: CustomEdge,
    }), []);

    useEffect(() => {
        if (projectId) {
            fetchProject();
        }
    }, [projectId]);

    const fetchProject = async () => {
        if (!projectId) return;
        try {
            const res = await api.get(`/api/projects/${projectId}`);
            if (res.data) {
                const data = res.data;
                console.log('[DEBUG] Project Data:', {
                    id: data.id,
                    team_id: data.team_id,
                    locked_by: data.locked_by,
                    current_user: user?.id
                });
                setProject(data);

                // Transform backend nodes to ReactFlow nodes
                if (data.nodes) {
                    const flowNodes = data.nodes.map((n: ProjectNode) => {
                        // Determine style/dimensions if memo (stored in style or width/height usually within ReactFlow node properties)
                        // But we persist via `n.data` or `n.width/n.height` if backend supports it.
                        // Our backend ProjectNode has `data` dict. We can store style there.

                        return {
                            id: n.id,
                            type: n.type === 'memo' ? 'memo' : 'custom',
                            position: { x: n.position_x, y: n.position_y },
                            data: {
                                label: n.data?.label || (n.type === 'memo' ? '' : 'New Node'),
                                promptId: n.prompt_id,
                                promptTitle: n.data?.promptTitle,
                                promptSummary: n.data?.promptSummary
                            },
                            // Pass dimensions for MemoNode if saved
                            style: n.data?.style,
                            width: n.data?.width,
                            height: n.data?.height,
                            // Store original data
                            originalData: n
                        };
                    });
                    setNodes(flowNodes);
                }

                // Load edges from project data
                if (data.data && data.data.edges) {
                    // Ensure all loaded edges have arrows and custom type
                    const loadedEdges = data.data.edges.map((edge: Edge) => ({
                        ...edge,
                        type: 'custom',
                        markerEnd: { type: MarkerType.ArrowClosed }
                    }));
                    setEdges(loadedEdges);
                }
            }
        } catch (error: any) {
            console.error('Failed to fetch project', error);
            toast.error(error.response?.data?.detail || 'Failed to load project');
        }
    };

    const handleLock = async () => {
        if (!projectId) return;
        try {
            await api.post(`/api/projects/${projectId}/lock`);
            toast.success('Edit mode enabled (Locked)');
            fetchProject();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to lock project');
        }
    };

    const handleUnlock = async () => {
        if (!projectId) return;
        // Save before unlock? Usually yes.
        await handleSave();
        try {
            await api.post(`/api/projects/${projectId}/unlock`);
            toast.success('Edit mode disabled (Unlocked)');
            fetchProject();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to unlock project');
        }
    };

    const onConnect = useCallback(
        (params: Connection) => {
            if (!canEdit) return; // Prevent connect if read-only
            setEdges((eds) => addEdge({ ...params, type: 'custom', markerEnd: { type: MarkerType.ArrowClosed } }, eds))
        },
        [setEdges, canEdit],
    );

    const handleSave = async () => {
        if (!projectId || !canEdit) return;
        setIsSaving(true);
        try {
            // Save nodes positions
            const nodesData = nodes.map(n => ({
                id: n.id,
                position: { x: n.position.x, y: n.position.y },
                data: {
                    ...n.data,
                    // Save dimensions for resizable nodes (memo)
                    style: n.style,
                    width: n.measured?.width ?? n.width,
                    height: n.measured?.height ?? n.height
                }
            }));

            // Save edges and other project data
            const projectData = {
                edges: edges
            };

            await Promise.all([
                api.put(`/api/projects/${projectId}/nodes/batch`, nodesData),
                api.patch(`/api/projects/${projectId}`, { data: projectData })
            ]);

            setIsSaving(false);
            toast.success('Project saved');
        } catch (error) {
            console.error('Failed to save', error);
            setIsSaving(false);
            toast.error('Failed to save');
        }
    };

    const handleAddNode = async (type: 'prompt' | 'memo' = 'prompt') => {
        if (!projectId || !canEdit) {
            if (isTeamProject && !isLockedByMe && !isLockedByOther) {
                toast.info("Please enter Edit Mode first");
            }
            return;
        }
        // Calculate position based on last node to avoid overlap
        let position = { x: 100, y: 100 };
        if (nodes.length > 0) {
            const lastNode = nodes[nodes.length - 1];
            position = {
                x: lastNode.position.x + 50,
                y: lastNode.position.y + 50
            };
        }

        // Create a new node in backend first
        try {
            const res = await api.post(`/api/projects/${projectId}/nodes`, {
                type: type,
                position_x: position.x,
                position_y: position.y,
                data: { label: type === 'memo' ? '' : 'New Prompt' }
            });

            if (res.data) {
                const newNode = res.data;
                const flowNode: Node = {
                    id: newNode.id,
                    type: type === 'memo' ? 'memo' : 'custom',
                    position: { x: newNode.position_x, y: newNode.position_y },
                    data: { label: type === 'memo' ? '' : 'New Prompt' }
                };
                setNodes((nds) => [...nds, flowNode]);
            }
        } catch (error) {
            console.error('Failed to add node', error);
        }
    };

    const onNodeClick = (_: React.MouseEvent, node: Node) => {
        if (!canEdit) return;
        // Only open modal for prompt nodes
        if (node.type === 'custom') {
            setSelectedNodeId(node.id);
            setIsModalOpen(true);
        }
    };

    const handlePromptSelect = async (prompt: Prompt) => {
        if (!selectedNodeId || !projectId) return;

        // Update local state
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === selectedNodeId) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            label: prompt.title,
                            promptId: prompt.id,
                            promptTitle: prompt.title,
                            promptSummary: prompt.content
                        },
                    };
                }
                return node;
            })
        );

        // Update backend
        try {
            await api.patch(`/api/projects/${projectId}/nodes/${selectedNodeId}`, {
                prompt_id: prompt.id,
                data: {
                    label: prompt.title,
                    promptTitle: prompt.title,
                    promptSummary: prompt.content
                }
            });
        } catch (error) {
            console.error('Failed to update node with prompt', error);
        }

        setIsModalOpen(false);
        setSelectedNodeId(null);
    };

    if (!project) return <ProjectDetailSkeleton />;

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/projects')}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-bold text-gray-900">{project.title}</h1>
                            {isLockedByOther && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium flex items-center gap-1">
                                    <Lock className="w-3 h-3" /> Locked by team member
                                </span>
                            )}
                            {isLockedByMe && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium flex items-center gap-1">
                                    <Lock className="w-3 h-3" /> Editing (Locked by you)
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500">Last saved: {new Date(project.updated_at).toLocaleTimeString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Team Projects: Lock/Unlock Logic */}
                    {isTeamProject && (
                        <>
                            {!isLockedByMe && !isLockedByOther && (
                                <button
                                    onClick={handleLock}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100"
                                >
                                    <Lock className="w-4 h-4" />
                                    Edit Mode
                                </button>
                            )}
                            {isLockedByMe && (
                                <button
                                    onClick={handleUnlock}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100"
                                >
                                    <Unlock className="w-4 h-4" />
                                    Finish Editing
                                </button>
                            )}
                        </>
                    )}

                    {/* Publish Button (Personal Only) */}
                    {!isTeamProject && (
                        <button
                            onClick={() => setIsPublishModalOpen(true)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100"
                        >
                            <Share className="w-4 h-4" />
                            Publish to Team
                        </button>
                    )}

                    {canEdit && (
                        <>
                            <button
                                onClick={() => handleAddNode('memo')}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                                title="Add Memo"
                            >
                                <StickyNote className="w-4 h-4 text-yellow-500" />
                                <span className="hidden md:inline">Memo</span>
                            </button>
                            <button
                                onClick={() => handleAddNode('prompt')}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                                title="Add Node"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden md:inline">Add Node</span>
                            </button>
                        </>
                    )}
                    {canEdit && (
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            title="Save Changes"
                        >
                            <Save className="w-4 h-4" />
                            <span className="hidden md:inline">{isSaving ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 w-full h-full">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    fitView
                >
                    <Background />
                    <Controls />
                    <MiniMap />
                    <Panel position="top-right" className="bg-white/80 backdrop-blur p-2 rounded-lg border border-gray-200 shadow-sm text-xs text-gray-500">
                        {nodes.length} nodes
                    </Panel>
                </ReactFlow>
            </div>

            <PromptSelectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelect={handlePromptSelect}
            />
            {project && (
                <PublishModal
                    isOpen={isPublishModalOpen}
                    onClose={() => setIsPublishModalOpen(false)}
                    projectId={project.id}
                />
            )}
        </div>
    );
}


export default function ProjectDetailPage() {
    return (
        <Suspense fallback={<ProjectDetailSkeleton />}>
            <ProjectDetailContent />
        </Suspense>
    );
}
