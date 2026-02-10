import React, { useEffect } from "react";
import { useFriendStore } from "@/shared/store/friendStore";
import type { FriendResponseDto } from "@/shared/services/types";

type FriendRequestsScreenProps = {
    currentUserId?: string | null;
};

function getRequester(item: FriendResponseDto, currentUserId?: string | null) {
    if (!currentUserId) return item.user;
    // Với model hiện tại, user là người gửi, friend là người nhận
    return item.user.id === currentUserId ? item.friend : item.user;
}

export default function FriendRequestsScreen({ currentUserId }: FriendRequestsScreenProps) {
    const {
        requests,
        loading,
        error,
        fetchRequests,
        acceptRequest,
        rejectRequest,
        clearError,
    } = useFriendStore();

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleAccept = async (id: string) => {
        try {
            await acceptRequest(id);
        } catch {
            // lỗi đã lưu trong store
        }
    };

    const handleReject = async (id: string) => {
        try {
            await rejectRequest(id);
        } catch {
            // lỗi đã lưu trong store
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#f7f9fb" }}>
            <div
                style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #e3e6ea",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#222" }}>
                    Lời mời kết bạn
                </h2>
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

            <div style={{ flex: 1, overflowY: "auto" }}>
                {requests.length === 0 && !loading && (
                    <div style={{ padding: 24, textAlign: "center", color: "#666", fontSize: 14 }}>
                        Hiện chưa có lời mời kết bạn nào.
                    </div>
                )}
                {requests.map((item) => {
                    const user = getRequester(item, currentUserId);
                    const initial =
                        (user.displayName || user.username || "?").charAt(0).toUpperCase() || "?";
                    return (
                        <div
                            key={item.id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "10px 16px",
                                borderBottom: "1px solid #eef1f5",
                                backgroundColor: "#fff",
                            }}
                        >
                            <div
                                style={{
                                    width: 40,
                                    height: 40,
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
                                }}
                            >
                                {user.avatarUrl ? (
                                    <img
                                        src={user.avatarUrl}
                                        alt={user.displayName || user.username}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                ) : (
                                    initial
                                )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                    style={{
                                        fontSize: 15,
                                        fontWeight: 500,
                                        color: "#1f2933",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    {user.displayName || user.username}
                                </div>
                                <div style={{ fontSize: 13, color: "#6b7280" }}>
                                    Đã gửi lời mời kết bạn
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button
                                    type="button"
                                    onClick={() => handleAccept(item.id)}
                                    style={{
                                        padding: "6px 10px",
                                        borderRadius: 999,
                                        border: "none",
                                        backgroundColor: "#0068FF",
                                        color: "#fff",
                                        fontSize: 13,
                                        cursor: "pointer",
                                    }}
                                >
                                    Đồng ý
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleReject(item.id)}
                                    style={{
                                        padding: "6px 10px",
                                        borderRadius: 999,
                                        border: "1px solid #e11d48",
                                        backgroundColor: "transparent",
                                        color: "#e11d48",
                                        fontSize: 13,
                                        cursor: "pointer",
                                    }}
                                >
                                    Từ chối
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

