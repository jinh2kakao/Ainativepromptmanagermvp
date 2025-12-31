'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/axios';
import { Plus, Folder, Clock, MoreVertical, Edit, Trash2, AlertTriangle, Building2, User } from 'lucide-react';
import { toast } from 'sonner';
import { Project } from '@/types/project';
import { useTeamStore } from '@/stores/teamStore';
import { useTeams } from '@/features/teams/useTeamHooks';
import { useAuthStore } from '@/features/auth/store';

export default function ProjectsPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Context
    const { currentTeamId } = useTeamStore();
    const { data: teams } = useTeams();

    const currentTeam = teams?.find(t => t.id === currentTeamId);

    const { session } = useAuthStore();

    // Dropdown State
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Edit/Delete State
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [deletingProject, setDeletingProject] = useState<Project | null>(null);

    // Form State (Shared for Create/Edit)
    const [projectTitle, setProjectTitle] = useState('');
    const [projectDesc, setProjectDesc] = useState('');

    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showGuestLimitModal, setShowGuestLimitModal] = useState(false);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [currentTeamId]);

    const fetchProjects = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/api/projects/', {
                params: currentTeamId ? { team_id: currentTeamId } : {}
            });
            setProjects(res.data);
        } catch (error) {
            console.error('Failed to fetch projects', error);
        } finally {
            setIsLoading(false);
        }
    };


    // Permission Check
    const myMembership = currentTeam?.members?.find(m => m.user_id === session?.user?.id);
    // If not in a team (Personal), owner is implicitly user, so canCreate is true.
    // If in a team, must be owner, admin, or editor.
    const canCreate = !currentTeamId || (myMembership && ['owner', 'admin', 'editor'].includes(myMembership.role));

    const handleOpenCreate = () => {
        if (!session) {
            setShowGuestLimitModal(true);
            return;
        }
        if (!canCreate) {
            toast.error("You do not have permission to create projects in this team.");
            return;
        }
        setEditingProject(null);
        setProjectTitle('');
        setProjectDesc('');
        setShowProjectModal(true);
    };

    const handleOpenEdit = (e: React.MouseEvent, project: Project) => {
        e.stopPropagation();
        setEditingProject(project);
        setProjectTitle(project.title);
        setProjectDesc(project.description || '');
        setShowProjectModal(true);
        setActiveDropdown(null);
    };

    const handleOpenDelete = (e: React.MouseEvent, project: Project) => {
        e.stopPropagation();
        setDeletingProject(project);
        setActiveDropdown(null);
    };

    const handleSubmitProject = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            if (editingProject) {
                // Update existing project
                const res = await api.patch(`/api/projects/${editingProject.id}`, {
                    title: projectTitle,
                    description: projectDesc
                });
                setProjects(projects.map(p => p.id === editingProject.id ? res.data : p));
                setShowProjectModal(false);
                toast.success('Project updated successfully');
            } else {
                // Create new project
                const res = await api.post('/api/projects/', {
                    title: projectTitle,
                    description: projectDesc,
                    team_id: currentTeamId
                });
                if (res.data) {
                    toast.success('Project created successfully');
                    router.push(`/projects/view?id=${res.data.id}`);
                }
            }
        } catch (error: any) {
            // Only log valid errors (not expected 403s)
            if (error.response?.status !== 403) {
                console.error('Failed to save project', error);
            }

            if (error.response?.status === 403) {
                toast.error('You do not have permission to create projects in this team.');
            } else {
                toast.error('Failed to save project. Please try again.');
            }
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deletingProject) return;
        try {
            await api.delete(`/api/projects/${deletingProject.id}`);
            setProjects(projects.filter(p => p.id !== deletingProject.id));
            setDeletingProject(null);
            toast.success('Project deleted');
        } catch (error) {
            console.error('Failed to delete project', error);
            toast.error('Failed to delete project');
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        {currentTeamId ? <Building2 className="w-5 h-5 text-indigo-600" /> : <User className="w-5 h-5 text-gray-500" />}
                        <h1 className="text-2xl font-bold text-gray-900">
                            {currentTeam ? `${currentTeam.name} Projects` : 'Personal Projects'}
                        </h1>
                    </div>
                    <p className="text-gray-500 mt-1">Manage and organize your prompt flows</p>
                </div>
                {(!currentTeamId || canCreate) && (
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New Project
                    </button>
                )}
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : projects.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Folder className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                    <p className="text-gray-500 mb-6">Create your first project to start organizing prompts</p>
                    <button
                        onClick={handleOpenCreate}
                        className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                    >
                        Create Project
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            onClick={() => router.push(`/projects/view?id=${project.id}`)}
                            className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer relative"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Folder className="w-5 h-5" />
                                </div>
                                <div className="relative" ref={activeDropdown === project.id ? dropdownRef : null}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveDropdown(activeDropdown === project.id ? null : project.id);
                                        }}
                                        className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {activeDropdown === project.id && (
                                        <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10 animate-in fade-in zoom-in-95 duration-100">
                                            <button
                                                onClick={(e) => handleOpenEdit(e, project)}
                                                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={(e) => handleOpenDelete(e, project)}
                                                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                {project.title}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
                                {project.description || 'No description'}
                            </p>
                            <div className="flex items-center text-xs text-gray-400 gap-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(project.updated_at).toLocaleDateString()}
                                </div>
                                <div>
                                    {project.nodes?.length || 0} items
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Project Modal */}
            {showProjectModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">
                            {editingProject ? 'Edit Project' : 'Create New Project'}
                        </h2>
                        <form onSubmit={handleSubmitProject}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Project Name
                                    </label>
                                    <input
                                        type="text"
                                        name="projectTitle"
                                        id="projectTitle"
                                        autoComplete="off"
                                        required
                                        value={projectTitle}
                                        onChange={(e) => setProjectTitle(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        placeholder="e.g., Marketing Campaign Q4"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={projectDesc}
                                        onChange={(e) => setProjectDesc(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                                        rows={3}
                                        placeholder="Optional description..."
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setShowProjectModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {isCreating ? 'Saving...' : (editingProject ? 'Save Changes' : 'Create Project')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingProject && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Project?</h3>
                        <p className="text-sm text-gray-500 text-center mb-6">
                            Are you sure you want to delete <span className="font-semibold text-gray-900">"{deletingProject.title}"</span>?<br />
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeletingProject(null)}
                                className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Guest Limit Modal */}
            {showGuestLimitModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">회원가입 필요</h3>
                        <p className="text-sm text-gray-500 text-center mb-6">
                            프로젝트 생성은 회원가입 후 이용 가능합니다.<br />
                            로그인 또는 회원가입을 해주세요.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowGuestLimitModal(false)}
                                className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={() => router.push('/auth')}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                로그인 / 회원가입
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
