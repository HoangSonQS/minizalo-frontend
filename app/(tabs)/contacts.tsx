import React, { useState } from "react";
import { View, Text, Platform, ScrollView } from "react-native";
import { useUserStore } from "@/shared/store/userStore";
import FriendsListScreen from "@/views/web/components/FriendsListScreen";
import FriendRequestsScreen from "@/views/web/components/FriendRequestsScreen";
import SearchUsersScreen from "@/views/web/components/SearchUsersScreen";

export default function ContactsScreen() {
  const isWeb = Platform.OS === "web";
  const { profile } = useUserStore();
  const currentUserId = profile?.id ?? null;

  const [activeNav, setActiveNav] = useState<
    "friends" | "groups" | "friendRequests" | "groupInvites"
  >("friends");
  const [globalSearch, setGlobalSearch] = useState("");

  if (isWeb) {
    // Bản web: layout danh bạ theo kiểu Zalo Web (sidebar bên trái + nội dung chính)
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          maxHeight: "100%",
          backgroundColor: "#e5e7eb",
        }}
      >
        {/* Sidebar trái: menu danh bạ giống Zalo */}
        <aside
          style={{
            width: 400,
            minWidth: 400,
            maxWidth: 500,
            backgroundColor: "#f9fafb",
            borderRight: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            padding: 12,
            gap: 12,
          }}
        >
          {/* Ô tìm kiếm bạn (tìm user theo SĐT / tên qua backend) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                padding: 8,
                borderRadius: 999,
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                color: "#6b7280",
                flex: 1,
              }}
            >
              <span style={{ fontSize: 16, marginRight: 4 }}>🔍</span>
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Tìm kiếm"
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  fontSize: 13,
                  backgroundColor: "transparent",
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => setGlobalSearch("")}
              style={{
                border: "none",
                background: "none",
                color: "#111827",
                fontSize: 13,
                cursor: "pointer",
                padding: "4px 6px",
              }}
            >
              Đóng
            </button>
          </div>

          {/* Danh sách mục điều hướng */}
          <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { id: "friends" as const, label: "Danh sách bạn bè", icon: "👥" },
              // {
              //   id: "groups" as const,
              //   label: "Danh sách nhóm và cộng đồng",
              //   icon: "👥",
              // },
              {
                id: "friendRequests" as const,
                label: "Lời mời kết bạn",
                icon: "💌",
              },
              // {
              //   id: "groupInvites" as const,
              //   label: "Lời mời vào nhóm và cộng đồng",
              //   icon: "📩",
              // },
            ].map((item) => {
              const active = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveNav(item.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "none",
                    backgroundColor: active ? "#e0edff" : "transparent",
                    color: active ? "#2563eb" : "#374151",
                    cursor: "pointer",
                    fontSize: 14,
                    textAlign: "left" as const,
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Nội dung chính bên phải */}
        <main
          style={{
            flex: 1,
            minWidth: 0,
            padding: 16,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 1500,
              backgroundColor: "#fff",
              borderRadius: 16,
              boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              maxHeight: "calc(100vh - 32px)",
            }}
          >
            {activeNav === "friends" &&
              (globalSearch.trim() === "" ? (
                <FriendsListScreen
                  currentUserId={currentUserId}
                  // TODO: nối với màn chat khi có
                  onOpenChat={() => {}}
                />
              ) : (
                <SearchUsersScreen
                  externalQuery={globalSearch}
                  hideSearchInput
                  // TODO: nối với màn chat khi có
                  onOpenChat={() => {}}
                />
              ))}
            {activeNav === "friendRequests" && (
              <FriendRequestsScreen currentUserId={currentUserId} />
            )}
            {activeNav === "groups" && (
              <div style={{ padding: 24, fontSize: 14, color: "#6b7280" }}>
                Danh sách nhóm và cộng đồng sẽ được phát triển sau.
              </div>
            )}
            {activeNav === "groupInvites" && (
              <div style={{ padding: 24, fontSize: 14, color: "#6b7280" }}>
                Lời mời vào nhóm và cộng đồng sẽ được phát triển sau.
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Bản mobile: giữ placeholder đơn giản, sau có thể tái dùng shared store để hiển thị.
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f2f4f7", padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", color: "#0068FF" }}>
        Danh bạ
      </Text>
      <Text style={{ marginTop: 8, color: "#666" }}>
        Màn hình danh bạ cho mobile sẽ được hoàn thiện sau, hiện chức năng đầy
        đủ đã có trên bản web.
      </Text>
    </ScrollView>
  );
}
