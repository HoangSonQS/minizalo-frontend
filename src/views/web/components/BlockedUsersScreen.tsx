import React, { useEffect, useState } from "react";
import { useFriendStore } from "@/shared/store/friendStore";

type BlockedUsersScreenProps = {
    currentUserId?: string | null;
};

export default function BlockedUsersScreen({
    currentUserId,
}: BlockedUsersScreenProps) {
    const {
        blockedUsers,
        loading,
        error,
        fetchBlockedUsers,
        unblockUser,
        clearError,
    } = useFriendStore();

    const [confirmUnblock, setConfirmUnblock] = useState<{
        userId: string;
        userName: string;
    } | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    useEffect(() => {
        fetchBlockedUsers();
    }, [fetchBlockedUsers]);

    const handleUnblockClick = (userId: string, userName: string) => {
        setConfirmUnblock({ userId, userName });
    };

    const handleConfirmUnblock = async () => {
        if (!confirmUnblock) return;
        try {
            await unblockUser(confirmUnblock.userId);
            setConfirmUnblock(null);
            setToast("Đã bỏ chặn thành công.");
            setTimeout(() => setToast(null), 3000);
        } catch {
            // lỗi đã lưu trong store
        }
    };

    const handleCancelUnblock = () => {
        setConfirmUnblock(null);
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                backgroundColor: "#f7f9fb",
            }}
        >
            {/* Header */}
            <div
                style={{
                    padding: "12px 16px 8px",
                    borderBottom: "1px solid #e3e6ea",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <div>
                    <h2
                        style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#222" }}
                    >
                        Danh sách chặn
                    </h2>
                    <div style={{ marginTop: 4, fontSize: 12, color: "#6b7280" }}>
                        {blockedUsers.length > 0
                            ? `${blockedUsers.length} người dùng đã bị chặn`
                            : "Bạn chưa chặn ai."}
                    </div>
                </div>
                {loading && (
                    <span style={{ fontSize: 13, color: "#888" }}>Đang tải...</span>
                )}
            </div>

            {error && (
                <div
                    style={{
                        padding: "8px 16px",
                        backgroundColor: "#fdecea",
                        color: "#c62828",
                        fontSize: 13,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={clearError}
                        style={{
                            border: "none",
                            background: "none",
                            color: "#c62828",
                            cursor: "pointer",
                            fontSize: 13,
                        }}
                    >
                        Đóng
                    </button>
                </div>
            )}

            {/* Blocked users list */}
            <div style={{ flex: 1, overflowY: "auto", backgroundColor: "#f9fafb" }}>
                {blockedUsers.length === 0 && !loading && (
                    <div
                        style={{
                            padding: 48,
                            textAlign: "center",
                            color: "#6b7280",
                            fontSize: 14,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 16,
                        }}
                    >
                        <div
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: "50%",
                                backgroundColor: "#f3f4f6",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 36,
                            }}
                        >
                            🛡️
                        </div>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 600, color: "#374151", marginBottom: 4 }}>
                                Chưa chặn ai
                            </div>
                            <div style={{ fontSize: 13, color: "#9ca3af" }}>
                                Người dùng bạn chặn sẽ xuất hiện ở đây.
                                <br />
                                Họ sẽ không thể nhắn tin cho bạn.
                            </div>
                        </div>
                    </div>
                )}

                {blockedUsers.map((item) => {
                    const blockedUser = item.friend;
                    const name =
                        blockedUser.displayName || blockedUser.username || "Người dùng";
                    const initial = name.charAt(0).toUpperCase() || "?";
                    const blockedDate = item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                        })
                        : "";

                    return (
                        <div
                            key={item.id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "12px 16px",
                                backgroundColor: "#fff",
                                borderBottom: "1px solid #f3f4f6",
                                transition: "background-color 0.15s",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#f9fafb";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "#fff";
                            }}
                        >
                            {/* Avatar */}
                            <div
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: "50%",
                                    overflow: "hidden",
                                    marginRight: 12,
                                    backgroundColor: "#e3e7ed",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 600,
                                    color: "#344767",
                                    flexShrink: 0,
                                    fontSize: 16,
                                }}
                            >
                                {blockedUser.avatarUrl ? (
                                    <img
                                        src={blockedUser.avatarUrl}
                                        alt={name}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                        }}
                                    />
                                ) : (
                                    initial
                                )}
                            </div>

                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 500,
                                        color: "#111827",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    {name}
                                </div>
                                {blockedDate && (
                                    <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                                        Đã chặn vào {blockedDate}
                                    </div>
                                )}
                            </div>

                            {/* Blocked badge */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                    padding: "4px 10px",
                                    borderRadius: 999,
                                    backgroundColor: "#fef2f2",
                                    color: "#dc2626",
                                    fontSize: 12,
                                    fontWeight: 500,
                                    marginRight: 8,
                                }}
                            >
                                <span style={{ fontSize: 12 }}>🚫</span>
                                Đã chặn
                            </div>

                            {/* Unblock button */}
                            <button
                                type="button"
                                onClick={() => handleUnblockClick(blockedUser.id, name)}
                                style={{
                                    padding: "8px 16px",
                                    borderRadius: 10,
                                    border: "1px solid #d1d5db",
                                    backgroundColor: "#fff",
                                    color: "#374151",
                                    fontSize: 13,
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    transition: "all 0.15s",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = "#f0fdf4";
                                    e.currentTarget.style.borderColor = "#22c55e";
                                    e.currentTarget.style.color = "#16a34a";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "#fff";
                                    e.currentTarget.style.borderColor = "#d1d5db";
                                    e.currentTarget.style.color = "#374151";
                                }}
                            >
                                Bỏ chặn
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Confirm Unblock Modal */}
            {confirmUnblock && (
                <div
                    onClick={handleCancelUnblock}
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: "#fff",
                            borderRadius: 16,
                            padding: 24,
                            maxWidth: 420,
                            width: "90%",
                            boxShadow:
                                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                        }}
                    >
                        <div
                            style={{
                                width: 56,
                                height: 56,
                                borderRadius: "50%",
                                backgroundColor: "#f0fdf4",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 16,
                                fontSize: 28,
                            }}
                        >
                            🔓
                        </div>
                        <h3
                            style={{
                                margin: "0 0 8px 0",
                                fontSize: 18,
                                fontWeight: 600,
                                color: "#111827",
                            }}
                        >
                            Xác nhận bỏ chặn
                        </h3>
                        <p
                            style={{
                                margin: "0 0 24px 0",
                                fontSize: 14,
                                color: "#6b7280",
                                lineHeight: 1.6,
                            }}
                        >
                            Bạn có chắc chắn muốn bỏ chặn{" "}
                            <strong>"{confirmUnblock.userName}"</strong>?
                            <br />
                            <span style={{ fontSize: 13 }}>
                                Người này sẽ có thể gửi lời mời kết bạn và nhắn tin cho bạn.
                            </span>
                        </p>
                        <div
                            style={{
                                display: "flex",
                                gap: 12,
                                justifyContent: "flex-end",
                            }}
                        >
                            <button
                                type="button"
                                onClick={handleCancelUnblock}
                                style={{
                                    padding: "8px 20px",
                                    borderRadius: 10,
                                    border: "1px solid #d1d5db",
                                    backgroundColor: "#fff",
                                    color: "#374151",
                                    fontSize: 14,
                                    fontWeight: 500,
                                    cursor: "pointer",
                                }}
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmUnblock}
                                style={{
                                    padding: "8px 20px",
                                    borderRadius: 10,
                                    border: "none",
                                    backgroundColor: "#22c55e",
                                    color: "#fff",
                                    fontSize: 14,
                                    fontWeight: 500,
                                    cursor: "pointer",
                                }}
                            >
                                Bỏ chặn
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div
                    style={{
                        position: "fixed",
                        left: "50%",
                        bottom: 32,
                        transform: "translateX(-50%)",
                        backgroundColor: "rgba(17,24,39,0.92)",
                        color: "#fff",
                        padding: "12px 18px",
                        borderRadius: 12,
                        boxShadow: "0 12px 28px rgba(15,23,42,0.25)",
                        fontSize: 14,
                        fontWeight: 500,
                        zIndex: 2000,
                        maxWidth: "calc(100vw - 32px)",
                        textAlign: "center",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    <span>✅</span>
                    {toast}
                </div>
            )}
        </div>
    );
}
