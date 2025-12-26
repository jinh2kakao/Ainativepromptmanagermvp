
import { useState } from 'react';
import { useTeams } from '@/features/teams/useTeamHooks';
import { api } from '@/utils/axios';
import { useRouter } from 'next/navigation';
import { X, Loader2, Building2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface PublishModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
}

export function PublishModal({ isOpen, onClose, projectId }: PublishModalProps) {
    const [selectedTeamId, setSelectedTeamId] = useState<string>('');
    const [isPublishing, setIsPublishing] = useState(false);
    const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);
    const { data: teams } = useTeams();
    const router = useRouter();

    if (!isOpen) return null;

    const handlePublish = async (forceOverwrite = false) => {
        if (!selectedTeamId) return;
        setIsPublishing(true);
        try {
            const params: any = { team_id: selectedTeamId };
            if (forceOverwrite) {
                params.overwrite = true;
            }

            const res = await api.post(`/api/projects/${projectId}/publish`, null, {
                params: params
            });

            toast.success(forceOverwrite ? 'Project overwritten successfully' : 'Project published to team successfully');

            if (res.data && res.data.id) {
                // If ID changes, redirect
                if (res.data.id !== projectId) {
                    router.push(`/projects/view?id=${res.data.id}`);
                } else {
                    router.push(`/projects/view?id=${res.data.id}`);
                }
            }
            onClose();
            // Reset state
            setShowOverwriteConfirm(false);
            setSelectedTeamId('');

        } catch (error: any) {
            if (error.response?.status === 409 && !forceOverwrite) {
                setShowOverwriteConfirm(true);
            } else {
                console.error('Publish failed', error);
                toast.error(error.response?.data?.detail || 'Failed to publish project');
            }
        } finally {
            setIsPublishing(false);
        }
    };

    const handleClose = () => {
        setShowOverwriteConfirm(false);
        setSelectedTeamId('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Publish to Team</h2>
                    <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {showOverwriteConfirm ? (
                    <div className="space-y-4">
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 flex gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-medium text-yellow-900">Project Already Exists</h3>
                                <p className="text-sm text-yellow-700 mt-1">
                                    A project with this title already exists in the selected team. Do you want to overwrite it?
                                    This will verify replace all content in the destination project.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 justify-end mt-6">
                            <button
                                onClick={() => setShowOverwriteConfirm(false)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handlePublish(true)}
                                disabled={isPublishing}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isPublishing && <Loader2 className="w-4 h-4 animate-spin" />}
                                Overwrite
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-gray-500 mb-6 text-sm">
                            Select a team to publish this project to. This will create a copy of the project in the team workspace.
                        </p>

                        <div className="space-y-4 mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Team
                            </label>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {teams?.map((team) => (
                                    <button
                                        key={team.id}
                                        onClick={() => setSelectedTeamId(team.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${selectedTeamId === team.id
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedTeamId === team.id ? 'bg-blue-100' : 'bg-gray-100'
                                            }`}>
                                            <Building2 className="w-4 h-4" />
                                        </div>
                                        <span className="font-medium">{team.name}</span>
                                    </button>
                                ))}
                                {teams?.length === 0 && (
                                    <p className="text-sm text-gray-400 text-center py-2">No teams available</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 justify-end">
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handlePublish(false)}
                                disabled={!selectedTeamId || isPublishing}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isPublishing && <Loader2 className="w-4 h-4 animate-spin" />}
                                Publish Project
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

