import React from "react";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/shared/store/authStore";

const SIDEBAR_WIDTH = 72;
const PANEL_WIDTH = 280;
const ICON_SIZE = 22;
const SIDEBAR_BG = "#004A99";

const iconPerson = (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);
const iconGear = (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);
const iconDatabase = (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    </svg>
);
const iconGlobe = (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
);
const iconSupport = (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M9 10h.01M15 10h.01M9.5 15a3.5 3.5 0 0 0 5 0" />
    </svg>
);
const iconArrow = (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
    </svg>
);

type MenuItem = {
    id: string;
    label: string;
    icon: React.ReactNode;
    showArrow?: boolean;
    highlighted?: boolean;
    danger?: boolean;
    onClick: () => void;
};

export default function SettingsPanel({ onClose }: { onClose: () => void }) {
    const router = useRouter();
    const logout = useAuthStore((s) => s.logout);

    const handleLogout = async () => {
        await logout();
        onClose();
        router.replace("/(auth)/login");
    };

    const menuItems: MenuItem[] = [
        {
            id: "account",
            label: "Thông tin tài khoản",
            icon: iconPerson,
            highlighted: true,
            onClick: () => {
                router.push("/(tabs)/account");
                onClose();
            },
        },
        {
            id: "settings",
            label: "Cài đặt",
            icon: iconGear,
            onClick: () => onClose(),
        },
        {
            id: "data",
            label: "Dữ liệu",
            icon: iconDatabase,
            showArrow: true,
            onClick: () => {
                router.push("/(tabs)/data");
                onClose();
            },
        },
        {
            id: "language",
            label: "Ngôn ngữ",
            icon: iconGlobe,
            showArrow: true,
            onClick: () => {
                router.push("/(tabs)/language");
                onClose();
            },
        },
        {
            id: "support",
            label: "Hỗ trợ",
            icon: iconSupport,
            showArrow: true,
            onClick: () => {
                router.push("/(tabs)/support");
                onClose();
            },
        },
    ];

    return (
        <>
            {/* Click ra ngoài để đóng panel */}
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 999,
                    background: "transparent",
                }}
                aria-hidden
                onClick={onClose}
            />
            <div
                style={{
                    position: "fixed",
                    left: SIDEBAR_WIDTH,
                    bottom: 16,
                    zIndex: 1000,
                    width: PANEL_WIDTH,
                    maxWidth: "33vw",
                    maxHeight: "50vh",
                    overflowY: "auto",
                }}
            >
                <div
                    style={{
                        position: "relative",
                        width: "100%",
                        backgroundColor: "#fff",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                        borderRadius: 12,
                        overflow: "hidden",
                    }}
                >
                    {/* Thanh xanh dọc bên trái */}
                    <div
                        style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 4,
                            backgroundColor: SIDEBAR_BG,
                        }}
                    />
                    <div style={{ paddingLeft: 12, paddingTop: 12, paddingBottom: 12 }}>
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={item.onClick}
                        style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "10px 12px",
                            marginBottom: 2,
                            border: "none",
                            borderRadius: 8,
                            background: item.highlighted ? "rgba(0,0,0,0.06)" : "transparent",
                            color: item.danger ? "#e53935" : "#333",
                            fontSize: 15,
                            cursor: "pointer",
                            textAlign: "left",
                        }}
                        onMouseEnter={(e) => {
                            if (!item.highlighted && !item.danger) e.currentTarget.style.background = "rgba(0,0,0,0.04)";
                        }}
                        onMouseLeave={(e) => {
                            if (!item.highlighted) e.currentTarget.style.background = "transparent";
                        }}
                    >
                        <span style={{ color: item.danger ? "#e53935" : "#666", display: "flex" }}>{item.icon}</span>
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {item.showArrow && (
                            <span style={{ color: "#999", display: "flex" }}>{iconArrow}</span>
                        )}
                    </button>
                ))}

                <div
                    style={{
                        height: 1,
                        backgroundColor: "rgba(0,0,0,0.08)",
                        margin: "8px 0",
                    }}
                />

                <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 12px",
                        marginBottom: 2,
                        border: "none",
                        borderRadius: 8,
                        background: "transparent",
                        color: "#e53935",
                        fontSize: 15,
                        cursor: "pointer",
                        textAlign: "left",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(229,57,53,0.08)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                    }}
                >
                    <span style={{ flex: 1 }}>Đăng xuất</span>
                </button>

                <button
                    type="button"
                    onClick={onClose}
                    style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        padding: "10px 12px",
                        border: "none",
                        borderRadius: 8,
                        background: "transparent",
                        color: "#555",
                        fontSize: 15,
                        cursor: "pointer",
                        textAlign: "left",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(0,0,0,0.04)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                    }}
                >
                    Thoát
                </button>
            </div>
                </div>
            </div>
        </>
    );
}
