import React from 'react';
import { GroupMember } from '@/shared/types';

interface GroupMembersListProps {
    members: GroupMember[];
    ownerId: string;
}

const roleLabel: Record<string, string> = {
    ADMIN: 'Quản trị viên',
    MEMBER: 'Thành viên',
};

const GroupMembersList: React.FC<GroupMembersListProps> = ({ members, ownerId }) => {
    // Sắp xếp: ADMIN trước, sau đó theo tên
    const sorted = [...members].sort((a, b) => {
        if (a.role === 'ADMIN' && b.role !== 'ADMIN') return -1;
        if (a.role !== 'ADMIN' && b.role === 'ADMIN') return 1;
        return a.username.localeCompare(b.username);
    });

    return (
        <div className="flex flex-col gap-0 overflow-y-auto" style={{ maxHeight: 320 }}>
            {sorted.map((member) => {
                const avatarSrc =
                    member.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(member.username)}&background=0068FF&color=fff`;
                const isAdminOrOwner = member.role === 'ADMIN' || member.userId === ownerId;

                return (
                    <div
                        key={member.userId}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors rounded-lg"
                    >
                        {/* Avatar */}
                        <img
                            src={avatarSrc}
                            alt={member.username}
                            className="w-10 h-10 rounded-full object-cover shrink-0"
                        />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-800 truncate">
                                {member.username}
                            </div>
                            <div className="text-xs text-gray-400 truncate">@{member.username}</div>
                        </div>

                        {/* Role badge */}
                        {isAdminOrOwner && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 shrink-0">
                                {roleLabel[member.role] || member.role}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default GroupMembersList;
