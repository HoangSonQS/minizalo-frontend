import React, { useState } from 'react';

interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

/** Section có thể thu/mở như các panel trong Zalo */
export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
    title, children, defaultOpen = true,
}) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-gray-100">
            <button
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
            >
                <span className="text-sm font-semibold text-gray-700">{title}</span>
                <svg
                    className="w-4 h-4 text-gray-400 transition-transform"
                    style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {open && <div className="pb-2">{children}</div>}
        </div>
    );
};

interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    danger?: boolean;
}

/** Nút hành động tròn với nhãn bên dưới */
export const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, onClick, danger }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center gap-1.5 group"
    >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            danger ? 'bg-red-50 group-hover:bg-red-100 text-red-500' : 'bg-gray-100 group-hover:bg-gray-200 text-gray-600'
        }`}>
            {icon}
        </div>
        <span className={`text-xs text-center leading-tight ${danger ? 'text-red-500' : 'text-gray-600'}`}
            style={{ maxWidth: 64 }}>
            {label}
        </span>
    </button>
);

/** Hàng action button toàn màn — dùng trong 2 panel */
export const ActionButtonRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex items-start justify-around px-4 py-4 border-b border-gray-100">
        {children}
    </div>
);
