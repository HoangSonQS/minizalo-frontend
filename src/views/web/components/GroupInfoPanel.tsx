import React, { useEffect, useState } from 'react';
import { CollapsibleSection, ActionButton, ActionButtonRow } from './ChatInfoHelpers';
import { useGroupStore } from '@/shared/store/useGroupStore';
import { useAuthStore } from '@/shared/store/authStore';
import { groupService } from '@/shared/services/groupService';
import { useChatStore } from '@/shared/store/useChatStore';
import GroupMembersList from './GroupMembersList';
import ConfirmModal from './ConfirmModal';

interface GroupInfoPanelProps {
    roomId: string;
    onClose: () => void;
}

// ─── Icons ───
const BellIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const PinIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>;
const AddMemberIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>;
const SettingsIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const UsersIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>;
const ClockIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ImageIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>;
const AlertIcon = () => <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>;
const TrashIcon = () => <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;
const LeaveIcon = () => <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>;

const GroupInfoPanel: React.FC<GroupInfoPanelProps> = ({ roomId, onClose }) => {
    const { currentGroupDetail, setCurrentGroupDetail, openAddMembers } = useGroupStore();
    const { user } = useAuthStore();
    const { rooms, setRooms } = useChatStore();
    
    const [isLeaving, setIsLeaving] = useState(false);
    const [hideConversation, setHideConversation] = useState(false);
    const [autoDeleteMsg] = useState('Không bao giờ');

    const [isClearHistoryModalOpen, setIsClearHistoryModalOpen] = useState(false);
    const [isLeaveGroupModalOpen, setIsLeaveGroupModalOpen] = useState(false);

    useEffect(() => {
        if (!roomId) return;
        groupService.getGroupDetails(roomId)
            .then((detail) => setCurrentGroupDetail(detail))
            .catch(console.error);
    }, [roomId]);

    const group = currentGroupDetail;
    if (!group) return (
        <div className="flex items-center justify-center h-40 text-gray-400 text-sm" style={{ width: 300 }}>
            Đang tải...
        </div>
    );

    const isOwnerOrAdmin =
        user?.id === group.ownerId ||
        group.members.some((m) => m.userId === user?.id && m.role === 'ADMIN');
    const avatarSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(group.groupName)}&background=0068FF&color=fff&bold=true`;

    const imageMessages = useChatStore.getState().messages[roomId]?.filter(m => m.type === 'IMAGE' && m.fileUrl).slice(-8) || [];

    const executeLeaveGroup = async () => {
        setIsLeaving(true);
        try {
            await groupService.leaveGroup(roomId);
            setRooms(rooms.filter((r) => r.id !== roomId));
            onClose();
            // Việc handle view selectedRoomId = null đã được HomeWeb lo nhờ useEffect [rooms, selectedRoomId]
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Rời nhóm thất bại.');
        } finally {
            setIsLeaving(false);
        }
    };

    const executeClearHistory = () => {
        useChatStore.getState().setMessages(roomId, []);
    };

    return (
        <div className="flex flex-col h-full bg-white border-l border-gray-200 overflow-y-auto" style={{ width: 300, minWidth: 300 }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0 sticky top-0 bg-white z-10">
                <span className="font-semibold text-gray-800 text-sm">Thông tin nhóm</span>
                <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Avatar + Tên nhóm */}
            <div className="flex flex-col items-center py-5 px-4 border-b border-gray-100 relative group/avatar">
                <img src={avatarSrc} alt={group.groupName}
                    className="w-16 h-16 rounded-full object-cover mb-2 shadow-sm" />
                <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-gray-900 text-base">{group.groupName}</span>
                    <button className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors" title="Sửa tên nhóm và ảnh nhóm">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Action Buttons */}
            <ActionButtonRow>
                <ActionButton icon={<BellIcon />} label="Tắt thông báo" />
                <ActionButton icon={<PinIcon />} label="Ghim hội thoại" />
                {isOwnerOrAdmin && (
                    <ActionButton icon={<AddMemberIcon />} label={<span>Thêm<br/>thành viên</span> as any} onClick={openAddMembers} />
                )}
                {isOwnerOrAdmin && (
                    <ActionButton icon={<SettingsIcon />} label={<span>Quản lý<br/>nhóm</span> as any} />
                )}
            </ActionButtonRow>

            {/* Thành viên nhóm */}
            <CollapsibleSection title="Thành viên nhóm">
                {/* Số lượng + icon */}
                <div className="px-4 py-2 flex items-center gap-3">
                    <UsersIcon />
                    <span className="text-sm text-gray-700">{group.members.length} thành viên</span>
                </div>
                {/* Danh sách 3 người đầu */}
                <GroupMembersList members={group.members.slice(0, 4)} ownerId={group.ownerId} />
                {group.members.length > 4 && (
                    <div className="px-4 py-2">
                        <button className="text-sm text-blue-600 hover:underline">
                            Xem tất cả {group.members.length} thành viên
                        </button>
                    </div>
                )}
            </CollapsibleSection>

            {/* Bảng tin nhóm */}
            <CollapsibleSection title="Bảng tin nhóm" defaultOpen={false}>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left">
                    <ClockIcon />
                    <span className="text-sm text-gray-700">Danh sách nhắc hẹn</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                    <span className="text-sm text-gray-700">Ghi chú, ghim, bình chọn</span>
                </button>
            </CollapsibleSection>

            {/* Ảnh/Video */}
            <CollapsibleSection title="Ảnh/Video">
                {imageMessages.length > 0 ? (
                    <div className="px-3">
                        <div className="grid grid-cols-4 gap-1 mb-2">
                            {imageMessages.map((m) => (
                                <img key={m.id} src={m.fileUrl} alt="" className="w-full aspect-square object-cover rounded" />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="px-3">
                        <div className="grid grid-cols-4 gap-1 mb-1">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="w-full aspect-square rounded bg-gray-100 flex items-center justify-center text-gray-300">
                                    <ImageIcon />
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-center text-gray-400 py-1">Chưa có ảnh/video nào</p>
                    </div>
                )}
                <div className="px-3 pb-2">
                    <button className="w-full text-sm text-center py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-500 font-medium transition-colors">
                        Xem tất cả
                    </button>
                </div>
            </CollapsibleSection>

            {/* File */}
            <CollapsibleSection title="File" defaultOpen={false}>
                <div className="px-4 py-2 text-sm text-gray-400 text-center">Chưa có file nào</div>
                <div className="px-3 pb-2">
                    <button className="w-full text-sm text-center py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-500 font-medium transition-colors">
                        Xem tất cả
                    </button>
                </div>
            </CollapsibleSection>

            {/* Link */}
            <CollapsibleSection title="Link" defaultOpen={false}>
                <div className="px-4 py-2 text-sm text-gray-400 text-center">Chưa có link nào</div>
                <div className="px-3 pb-2">
                    <button className="w-full text-sm text-center py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-500 font-medium transition-colors">
                        Xem tất cả
                    </button>
                </div>
            </CollapsibleSection>

            {/* Thiết lập bảo mật */}
            <CollapsibleSection title="Thiết lập bảo mật" defaultOpen={false}>
                <div className="px-4 py-2.5 flex items-center gap-3">
                    <ClockIcon />
                    <div className="flex-1">
                        <div className="text-sm text-gray-700">Tin nhắn tự xóa</div>
                        <div className="text-xs text-gray-400">{autoDeleteMsg}</div>
                    </div>
                </div>
                <div className="px-4 py-2.5 flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    <span className="flex-1 text-sm text-gray-700">Ẩn trò chuyện</span>
                    <button onClick={() => setHideConversation(v => !v)}
                        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${hideConversation ? 'bg-blue-600' : 'bg-gray-300'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${hideConversation ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                </div>
            </CollapsibleSection>

            {/* Danger zone */}
            <div className="py-2 border-t border-gray-100">
                <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                    <AlertIcon />
                    <span className="text-sm text-gray-600">Báo xấu</span>
                </button>
                <button onClick={() => setIsClearHistoryModalOpen(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors">
                    <TrashIcon />
                    <span className="text-sm text-red-500">Xóa lịch sử trò chuyện</span>
                </button>
                <button onClick={() => setIsLeaveGroupModalOpen(true)} disabled={isLeaving}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors disabled:opacity-50">
                    <LeaveIcon />
                    <span className="text-sm text-red-500">{isLeaving ? 'Đang rời...' : 'Rời nhóm'}</span>
                </button>
            </div>

            {/* Modals */}
            <ConfirmModal
                isOpen={isClearHistoryModalOpen}
                onClose={() => setIsClearHistoryModalOpen(false)}
                onConfirm={executeClearHistory}
                title="Xác nhận"
                message="Toàn bộ nội dung trò chuyện sẽ bị xóa vĩnh viễn.\nBạn có chắc chắn muốn xóa?"
                confirmText="Xóa"
                isDanger={true}
            />

            <ConfirmModal
                isOpen={isLeaveGroupModalOpen}
                onClose={() => setIsLeaveGroupModalOpen(false)}
                onConfirm={executeLeaveGroup}
                title="Xác nhận rời nhóm"
                message="Bạn có chắc chắn muốn rời nhóm này?\nToàn bộ lịch sử trò chuyện sẽ bị xóa đối với bạn."
                confirmText="Rời nhóm"
                isDanger={true}
            />
        </div>
    );
};

export default GroupInfoPanel;
