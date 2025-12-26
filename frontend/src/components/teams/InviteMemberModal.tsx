import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Mail, Shield } from 'lucide-react';
import { useInviteMember } from '@/features/teams/useTeamManagementHooks';
import { TeamRole } from '@/features/teams/types';
import { toast } from 'sonner';

interface InviteMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    teamId: string;
}

export function InviteMemberModal({ isOpen, onClose, teamId }: InviteMemberModalProps) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<TeamRole>('viewer');
    const [mounted, setMounted] = useState(false);

    // React Portal logic
    const [isClient, setIsClient] = useState(false);
    if (!isClient && typeof window !== 'undefined') setIsClient(true);

    const { mutate: inviteMember, isPending } = useInviteMember(teamId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        inviteMember({ user_email: email, role }, {
            onSuccess: () => {
                toast.success('Member invited successfully');
                setEmail('');
                setRole('viewer');
                onClose();
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.detail || 'Failed to invite member');
            }
        });
    };

    if (!isOpen || !isClient) return null;

    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-gray-500" />
                        Invite Member
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="colleague@example.com"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Role
                            </label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as TeamRole)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
                                >
                                    <option value="viewer">Viewer (Read Only)</option>
                                    <option value="editor">Editor (Create & Edit)</option>
                                    <option value="admin">Admin (Manage Team)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 justify-end mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!email.trim() || isPending}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            Send Invite
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
