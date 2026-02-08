import React, { useState } from "react";
import { useRouter, usePathname } from "expo-router";
import SettingsPanel from "./SettingsPanel";

const SIDEBAR_BG = "#004A99";
const ACTIVE_BG = "rgba(255,255,255,0.18)";
const ICON_SIZE = 24;

const iconMessage = (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);
const iconContacts = (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);
const iconCloudZ = (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>
);
const iconFolder = (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
);
const iconPlus = (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeDasharray="4 2" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
);
const iconBriefcase = (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
);
const iconSettings = (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

const navItems: { href: string; label: string; icon: React.ReactNode }[] = [
    { href: "/(tabs)", label: "Tin nhắn", icon: iconMessage },
    { href: "/(tabs)/contacts", label: "Danh bạ", icon: iconContacts },
    { href: "/(tabs)/zalo-cloud", label: "Zalo Cloud", icon: iconCloudZ },
    { href: "/(tabs)/files", label: "Thư mục", icon: iconFolder },
    { href: "/(tabs)/explore", label: "Khám phá", icon: iconPlus },
    { href: "/(tabs)/work", label: "Công việc", icon: iconBriefcase },
];

export default function WebSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const [showSettingsPanel, setShowSettingsPanel] = useState(false);

    const isActive = (href: string) => {
        if (href === "/(tabs)") return pathname === "/(tabs)" || pathname === "/(tabs)/";
        return pathname.startsWith(href);
    };

    return (
        <div style={{ display: "flex", flexShrink: 0 }}>
        <aside
            style={{
                width: 72,
                minWidth: 72,
                backgroundColor: SIDEBAR_BG,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingTop: 16,
                paddingBottom: 16,
                gap: 4,
                flexShrink: 0,
            }}
        >
            {/* Avatar */}
            <div
                style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    backgroundColor: "rgba(255,255,255,0.25)",
                    marginBottom: 12,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 18,
                    fontWeight: 600,
                }}
            >
                U
            </div>

            {/* Tin nhắn - luôn đầu, active khi đang ở tabs */}
            <NavItem
                href="/(tabs)"
                label="Tin nhắn"
                icon={iconMessage}
                active={isActive("/(tabs)")}
                onClick={() => router.push("/(tabs)")}
            />

            {/* Danh bạ */}
            <NavItem
                href="/(tabs)/contacts"
                label="Danh bạ"
                icon={iconContacts}
                active={isActive("/(tabs)/contacts")}
                onClick={() => router.push("/(tabs)/contacts")}
            />

            {/* Khoảng trống giữa */}
            <div style={{ flex: 1, minHeight: 24 }} />

            {/* Zalo Cloud, Thư mục, Khám phá, Công việc */}
            {navItems.slice(2).map((item) => (
                <NavItem
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    active={isActive(item.href)}
                    onClick={() => router.push(item.href as any)}
                />
            ))}

            {/* Cài đặt - mở panel thay vì chuyển trang */}
            <NavItem
                href="/(tabs)/settings"
                label="Cài đặt"
                icon={iconSettings}
                active={showSettingsPanel}
                onClick={() => setShowSettingsPanel((v) => !v)}
            />
        </aside>

        {showSettingsPanel && (
            <SettingsPanel onClose={() => setShowSettingsPanel(false)} />
        )}
        </div>
    );
}

function NavItem({
    href,
    label,
    icon,
    active,
    onClick,
}: {
    href: string;
    label: string;
    icon: React.ReactNode;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={label}
            style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                border: "none",
                background: active ? ACTIVE_BG : "transparent",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
            onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }}
            onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
            }}
        >
            {icon}
        </button>
    );
}
