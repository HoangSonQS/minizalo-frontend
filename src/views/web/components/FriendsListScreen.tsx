import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFriendStore } from "@/shared/store/friendStore";
import friendCategoryService from "@/shared/services/friendCategoryService";
import type { FriendResponseDto } from "@/shared/services/types";

function getFriendUser(item: FriendResponseDto, currentUserId?: string | null) {
  if (!currentUserId) return item.friend;
  return item.user.id === currentUserId ? item.friend : item.user;
}

type FriendsListScreenProps = {
  currentUserId?: string | null;
  onOpenChat?: (userId: string) => void;
  searchText?: string;
  onSearchChange?: (value: string) => void;
};

export default function FriendsListScreen({
  currentUserId,
  onOpenChat,
  searchText,
  onSearchChange,
}: FriendsListScreenProps) {
  const { friends, loading, error, fetchFriends, removeFriend, clearError } =
    useFriendStore();
  const [internalSearch, setInternalSearch] = useState("");
  const search = searchText ?? internalSearch;
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  // friendType: UI + danh sách phân loại (logic lọc cụ thể sẽ bổ sung sau)
  type FriendCategory = { id: string; name: string; color: string };
  const DEFAULT_CATEGORIES: FriendCategory[] = [
    { id: "customers", name: "Khách hàng", color: "#ef4444" },
    { id: "family", name: "Gia đình", color: "#22c55e" },
    { id: "work", name: "Công việc", color: "#f97316" },
    { id: "friends", name: "Bạn bè", color: "#8b5cf6" },
    { id: "reply_later", name: "Trả lời sau", color: "#eab308" },
    { id: "colleagues", name: "Đồng nghiệp", color: "#3b82f6" },
  ];

  const [categories, setCategories] =
    useState<FriendCategory[]>(DEFAULT_CATEGORIES);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const selectedCategoryLabel = useMemo(() => {
    if (selectedCategoryId === "all") return "Tất cả";
    return (
      categories.find((c) => c.id === selectedCategoryId)?.name ?? "Tất cả"
    );
  }, [categories, selectedCategoryId]);

  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement | null>(null);
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);
  const [categorySubmenuOpenFor, setCategorySubmenuOpenFor] = useState<
    string | null
  >(null);

  // Gán phân loại cho từng bạn bè: friendId -> categoryId
  const [friendCategoryMap, setFriendCategoryMap] = useState<
    Record<string, string>
  >({});
  const [toast, setToast] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  // Load categories + assignments từ backend
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cats, assigns] = await Promise.all([
          friendCategoryService.listCategories(),
          friendCategoryService.listAssignments(),
        ]);
        if (cancelled) return;

        // Nếu BE chưa có categories (user mới), seed mặc định lên BE để đồng bộ
        let finalCats = cats;
        if (!finalCats.length) {
          finalCats = await Promise.all(
            DEFAULT_CATEGORIES.map((c) =>
              friendCategoryService.createCategory({
                name: c.name,
                color: c.color,
              }),
            ),
          );
        }
        if (cancelled) return;
        setCategories(finalCats);

        const map: Record<string, string> = {};
        assigns.forEach((a) => {
          if (a.categoryId) map[a.targetUserId] = a.categoryId;
        });
        setFriendCategoryMap(map);
      } catch {
        // Nếu lỗi mạng, fallback giữ default (UI vẫn chạy)
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup toast timeout
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = null;
      }
    };
  }, []);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    if (!categoryMenuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      const el = categoryMenuRef.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      setCategoryMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [categoryMenuOpen]);
  const [confirmDelete, setConfirmDelete] = useState<{
    friendId: string;
    friendName: string;
  } | null>(null);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const handleRemoveClick = (friendId: string, friendName: string) => {
    setConfirmDelete({ friendId, friendName });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    try {
      await removeFriend(confirmDelete.friendId);
      setConfirmDelete(null);
    } catch {
      // lỗi đã được lưu trong store
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  const openManageCategories = () => {
    setCategoryMenuOpen(false);
    setCategorySubmenuOpenFor(null);
    setManageCategoriesOpen(true);
  };

  const randomColor = () => {
    const palette = [
      "#ef4444",
      "#22c55e",
      "#f97316",
      "#8b5cf6",
      "#eab308",
      "#3b82f6",
    ];
    return palette[Math.floor(Math.random() * palette.length)];
  };

  const slugifyId = (name: string) => {
    const base = name
      .trim()
      .toLowerCase()
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    const id = base || "category";
    let finalId = id;
    let i = 1;
    while (categories.some((c) => c.id === finalId) || finalId === "all") {
      finalId = `${id}_${i++}`;
    }
    return finalId;
  };

  const addCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    const color = randomColor();
    const tempId = slugifyId(name);

    // Optimistic UI
    setCategories((prev) => [...prev, { id: tempId, name, color }]);
    setNewCategoryName("");

    // Persist lên BE
    friendCategoryService
      .createCategory({ name, color })
      .then((created) => {
        setCategories((prev) =>
          prev.map((c) => (c.id === tempId ? created : c)),
        );
      })
      .catch(() => {
        setCategories((prev) => prev.filter((c) => c.id !== tempId));
      });
  };

  const startEdit = (c: FriendCategory) => {
    setEditingId(c.id);
    setEditingName(c.name);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const name = editingName.trim();
    if (!name) return;
    setCategories((prev) =>
      prev.map((c) => (c.id === editingId ? { ...c, name } : c)),
    );
    const id = editingId;
    const color = categories.find((c) => c.id === id)?.color ?? "#3b82f6";
    friendCategoryService.updateCategory(id, { name, color }).catch(() => {
      // ignore
    });
    setEditingId(null);
    setEditingName("");
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    if (selectedCategoryId === id) setSelectedCategoryId("all");
    if (editingId === id) {
      setEditingId(null);
      setEditingName("");
    }
    setFriendCategoryMap((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((friendId) => {
        if (next[friendId] === id) delete next[friendId];
      });
      return next;
    });
    friendCategoryService.deleteCategory(id).catch(() => {
      // ignore
    });
  };

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, 3000);
  };

  // Lọc & nhóm theo chữ cái đầu (giống Zalo A, B, C,...)
  const groupedFriends = useMemo(() => {
    const items = friends
      .map((item) => {
        const u = getFriendUser(item, currentUserId);
        return {
          raw: item,
          user: u,
          name: (u.displayName || u.username || "").trim(),
        };
      })
      // Lọc theo ô "Tìm bạn"
      .filter(({ name }) =>
        search.trim()
          ? name.toLowerCase().includes(search.trim().toLowerCase())
          : true,
      )
      // Lọc theo thẻ phân loại
      .filter(({ user }) => {
        if (selectedCategoryId === "all") return true; // không lọc
        const catId = friendCategoryMap[user.id]; // friendCategoryMap: friendId -> categoryId
        return catId === selectedCategoryId;
      })
      // Sắp xếp theo tên
      .sort((a, b) => {
        const cmp = a.name.localeCompare(b.name, "vi", { sensitivity: "base" });
        return sortOrder === "asc" ? cmp : -cmp;
      });

    const groups: Record<string, typeof items> = {};
    for (const it of items) {
      const letter = it.name.charAt(0).toUpperCase() || "#";
      const key =
        /[A-ZÁÀÂÃĂẠẢẤẦẨẪẬẮẰẲẴẶÉÈẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ]/.test(
          letter,
        )
          ? letter
          : "#";
      if (!groups[key]) groups[key] = [];
      groups[key].push(it);
    }
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [
    friends,
    currentUserId,
    search,
    sortOrder,
    selectedCategoryId,
    friendCategoryMap,
  ]);

  return (
    <div
      onClick={() => {
        setActionMenuOpenId(null);
        setCategorySubmenuOpenFor(null);
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "#f7f9fb",
      }}
    >
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
            Danh sách bạn bè
          </h2>
          <div style={{ marginTop: 4, fontSize: 12, color: "#6b7280" }}>
            {friends.length > 0
              ? `Bạn bè (${friends.length})`
              : "Bạn chưa có bạn bè nào."}
          </div>
        </div>
        {loading && (
          <span style={{ fontSize: 13, color: "#888" }}>Đang tải...</span>
        )}
      </div>

      {/* Thanh tìm kiếm + sắp xếp + phân loại */}
      <div
        style={{
          padding: "8px 16px 12px",
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#f9fafb",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {/* Ô tìm kiếm bạn bè với icon kính lúp */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            padding: "6px 10px",
            borderRadius: 999,
            border: "1px solid #d1d5db",
            backgroundColor: "#fff",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 14, color: "#9ca3af" }}>🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              onSearchChange
                ? onSearchChange(e.target.value)
                : setInternalSearch(e.target.value);
            }}
            placeholder="Tìm bạn"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: 13,
              backgroundColor: "transparent",
            }}
          />
        </div>

        {/* Sắp xếp theo tên A-Z / Z-A */}
        <button
          type="button"
          onClick={() =>
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
          }
          style={{
            padding: "6px 14px",
            borderRadius: 999,
            border: "1px solid #e5e7eb",
            backgroundColor: "#f3f4f6",
            fontSize: 12,
            color: "#111827",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span style={{ fontSize: 14 }}>⇅</span>
          <span>{sortOrder === "asc" ? "Tên (A-Z)" : "Tên (Z-A)"}</span>
          <span style={{ fontSize: 10 }}>▾</span>
        </button>

        {/* Phân loại bạn bè theo loại (UI trước, logic sau) */}
        <div style={{ position: "relative" }} ref={categoryMenuRef}>
          <button
            type="button"
            onClick={() => setCategoryMenuOpen((v) => !v)}
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              border: "1px solid #e5e7eb",
              backgroundColor: "#f3f4f6",
              fontSize: 12,
              color: "#111827",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              minWidth: 150,
              justifyContent: "space-between",
            }}
          >
            <span
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <span style={{ fontSize: 14 }}>⏷</span>
              <span>{selectedCategoryLabel}</span>
            </span>
            <span style={{ fontSize: 10, color: "#6b7280" }}>▾</span>
          </button>

          {categoryMenuOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: 240,
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                boxShadow: "0 12px 28px rgba(15,23,42,0.12)",
                overflow: "hidden",
                zIndex: 50,
              }}
            >
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategoryId(c.id);
                    setCategoryMenuOpen(false);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    border: "none",
                    backgroundColor: "transparent",
                    cursor: "pointer",
                    textAlign: "left" as const,
                    fontSize: 14,
                    color: "#111827",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <span
                    style={{
                      width: 18,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: c.color,
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ flex: 1 }}>{c.name}</span>
                </button>
              ))}

              <div style={{ height: 1, backgroundColor: "#e5e7eb" }} />
              <button
                type="button"
                onClick={openManageCategories}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "none",
                  backgroundColor: "transparent",
                  cursor: "pointer",
                  fontSize: 14,
                  color: "#111827",
                  textAlign: "center" as const,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f9fafb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Quản lý thẻ phân loại
              </button>
            </div>
          )}
        </div>
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

      <div style={{ flex: 1, overflowY: "auto", backgroundColor: "#f9fafb" }}>
        {friends.length === 0 && !loading && (
          <div
            style={{
              padding: 24,
              textAlign: "center",
              color: "#666",
              fontSize: 14,
            }}
          >
            Bạn chưa có bạn bè nào.
          </div>
        )}
        {groupedFriends.map(([letter, items]) => (
          <div key={letter}>
            {/* Header chữ cái */}
            <div
              style={{
                padding: "6px 16px",
                fontSize: 12,
                fontWeight: 600,
                color: "#9ca3af",
                textTransform: "uppercase",
              }}
            >
              {letter}
            </div>
            {items.map(({ raw, user: friendUser }) => {
              const initial =
                (friendUser.displayName || friendUser.username || "?")
                  .charAt(0)
                  .toUpperCase() || "?";
              return (
                <div
                  key={raw.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 16px",
                    backgroundColor: "#fff",
                    borderBottom: "1px solid #f3f4f6",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
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
                    {friendUser.avatarUrl ? (
                      <img
                        src={friendUser.avatarUrl}
                        alt={friendUser.displayName || friendUser.username}
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
                      {friendUser.displayName || friendUser.username}
                    </div>
                    {/* Thẻ phân loại (hiển thị sau khi gán) */}
                    {(() => {
                      const catId = friendCategoryMap[friendUser.id];
                      if (!catId) return null;
                      const cat = categories.find((c) => c.id === catId);
                      if (!cat) return null;
                      return (
                        <div
                          style={{
                            marginTop: 4,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 12,
                            color: "#374151",
                          }}
                        >
                          <span
                            style={{
                              width: 12,
                              height: 8,
                              borderRadius: 999,
                              backgroundColor: cat.color,
                              display: "inline-block",
                            }}
                          />
                          <span>{cat.name}</span>
                        </div>
                      );
                    })()}
                    {friendUser.statusMessage && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#6b7280",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {friendUser.statusMessage}
                      </div>
                    )}
                  </div>
                  <div style={{ position: "relative", marginLeft: 8 }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActionMenuOpenId((prev) => {
                          const next =
                            prev === friendUser.id ? null : friendUser.id;
                          if (next === null) setCategorySubmenuOpenFor(null);
                          return next;
                        });
                      }}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 999,
                        border: "1px solid #e5e7eb",
                        backgroundColor: "#f9fafb",
                        color: "#374151",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: 16,
                      }}
                    >
                      ⋯
                    </button>

                    {actionMenuOpenId === friendUser.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: "absolute",
                          top: "calc(100% + 4px)",
                          right: 0,
                          width: 220,
                          backgroundColor: "#fff",
                          borderRadius: 12,
                          border: "1px solid #e5e7eb",
                          boxShadow: "0 12px 28px rgba(15,23,42,0.12)",
                          // cần overflow visible để submenu "Phân loại" không bị cắt
                          overflow: "visible",
                          zIndex: 60,
                        }}
                      >
                        <button
                          type="button"
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "none",
                            backgroundColor: "transparent",
                            textAlign: "left",
                            fontSize: 14,
                            color: "#111827",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#f9fafb";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                          }}
                          // TODO: mở panel xem thông tin chi tiết
                          onClick={() => {
                            setActionMenuOpenId(null);
                          }}
                        >
                          Xem thông tin
                        </button>

                        <button
                          type="button"
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "none",
                            backgroundColor: "transparent",
                            textAlign: "left",
                            fontSize: 14,
                            color: "#111827",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#f9fafb";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                          }}
                          onClick={() => {
                            // toggle submenu phân loại
                            setCategorySubmenuOpenFor((prev) =>
                              prev === friendUser.id ? null : friendUser.id,
                            );
                          }}
                        >
                          Phân loại &gt;
                        </button>

                        {/* Submenu phân loại */}
                        {categorySubmenuOpenFor === friendUser.id && (
                          <div
                            style={{
                              position: "absolute",
                              top: 44,
                              right: 220,
                              width: 240,
                              backgroundColor: "#fff",
                              borderRadius: 12,
                              border: "1px solid #e5e7eb",
                              boxShadow: "0 12px 28px rgba(15,23,42,0.12)",
                              overflow: "hidden",
                              zIndex: 61,
                            }}
                          >
                            {categories.map((c) => {
                              const isSelected =
                                friendCategoryMap[friendUser.id] === c.id;
                              return (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => {
                                    setFriendCategoryMap((prev) => {
                                      const current = prev[friendUser.id];
                                      // Click lại đúng thẻ đang chọn => hủy phân loại
                                      if (current === c.id) {
                                        const next = { ...prev };
                                        delete next[friendUser.id];
                                        return next;
                                      }
                                      return {
                                        ...prev,
                                        [friendUser.id]: c.id,
                                      };
                                    });
                                    // Persist lên BE: nếu click lại thẻ đang chọn => gửi null để hủy
                                    friendCategoryService
                                      .assignCategory(
                                        friendUser.id,
                                        isSelected ? null : c.id,
                                      )
                                      .catch(() => {
                                        // ignore
                                      });
                                    showToast("Cập nhật phân loại thành công");
                                    setCategorySubmenuOpenFor(null);
                                    setActionMenuOpenId(null);
                                  }}
                                  style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    padding: "10px 12px",
                                    border: "none",
                                    backgroundColor: "transparent",
                                    cursor: "pointer",
                                    textAlign: "left" as const,
                                    fontSize: 14,
                                    color: "#111827",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                      "#f9fafb";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                      "transparent";
                                  }}
                                >
                                  <span
                                    style={{
                                      width: 18,
                                      height: 12,
                                      borderRadius: 6,
                                      backgroundColor: c.color,
                                      display: "inline-block",
                                      flexShrink: 0,
                                    }}
                                  />
                                  <span style={{ flex: 1 }}>{c.name}</span>
                                  {isSelected && (
                                    <span
                                      style={{ fontSize: 14, color: "#10b981" }}
                                    >
                                      ✓
                                    </span>
                                  )}
                                </button>
                              );
                            })}

                            <div
                              style={{ height: 1, backgroundColor: "#e5e7eb" }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                openManageCategories();
                              }}
                              style={{
                                width: "100%",
                                padding: "10px 12px",
                                border: "none",
                                backgroundColor: "transparent",
                                cursor: "pointer",
                                fontSize: 14,
                                color: "#111827",
                                textAlign: "center" as const,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#f9fafb";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                              }}
                            >
                              Quản lý thẻ phân loại
                            </button>
                          </div>
                        )}

                        <button
                          type="button"
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "none",
                            backgroundColor: "transparent",
                            textAlign: "left",
                            fontSize: 14,
                            color: "#111827",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#f9fafb";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                          }}
                          // TODO: đặt tên gợi nhớ
                          onClick={() => {
                            setActionMenuOpenId(null);
                          }}
                        >
                          Đặt tên gợi nhớ
                        </button>

                        <div
                          style={{ height: 1, backgroundColor: "#e5e7eb" }}
                        />

                        <button
                          type="button"
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "none",
                            backgroundColor: "transparent",
                            textAlign: "left",
                            fontSize: 14,
                            color: "#111827",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#f9fafb";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                          }}
                          // TODO: chặn người này
                          onClick={() => {
                            setActionMenuOpenId(null);
                          }}
                        >
                          Chặn người này
                        </button>

                        <button
                          type="button"
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "none",
                            backgroundColor: "transparent",
                            textAlign: "left",
                            fontSize: 14,
                            color: "#dc2626",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#fef2f2";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                          }}
                          onClick={() => {
                            setActionMenuOpenId(null);
                            handleRemoveClick(
                              friendUser.id,
                              friendUser.displayName ||
                                friendUser.username ||
                                "người này",
                            );
                          }}
                        >
                          Xóa bạn
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Modal xác nhận xóa bạn bè */}
      {confirmDelete && (
        <div
          onClick={handleCancelDelete}
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
              maxWidth: 400,
              width: "90%",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
          >
            <h3
              style={{
                margin: "0 0 12px 0",
                fontSize: 18,
                fontWeight: 600,
                color: "#111827",
              }}
            >
              Xác nhận xóa bạn bè
            </h3>
            <p
              style={{
                margin: "0 0 24px 0",
                fontSize: 14,
                color: "#6b7280",
                lineHeight: 1.5,
              }}
            >
              Bạn có chắc chắn muốn xóa{" "}
              <strong>"{confirmDelete.friendName}"</strong> khỏi danh sách bạn
              bè không?
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
                onClick={handleCancelDelete}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
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
                onClick={handleConfirmDelete}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "none",
                  backgroundColor: "#e11d48",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal quản lý thẻ phân loại */}
      {manageCategoriesOpen && (
        <div
          onClick={() => setManageCategoriesOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1001,
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              width: "100%",
              maxWidth: 520,
              boxShadow: "0 20px 40px rgba(15,23,42,0.18)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
                Quản lý thẻ phân loại
              </div>
              <button
                type="button"
                onClick={() => setManageCategoriesOpen(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 18,
                  color: "#6b7280",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {/* Add */}
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Thêm phân loại mới..."
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    outline: "none",
                    fontSize: 14,
                  }}
                />
                <button
                  type="button"
                  onClick={addCategory}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "none",
                    backgroundColor: "#0068FF",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Thêm
                </button>
              </div>

              {/* List */}
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                {categories.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      borderTop: "1px solid #f3f4f6",
                    }}
                  >
                    <span
                      style={{
                        width: 18,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: c.color,
                        display: "inline-block",
                        flexShrink: 0,
                      }}
                    />

                    {editingId === c.id ? (
                      <input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        style={{
                          flex: 1,
                          padding: "8px 10px",
                          borderRadius: 10,
                          border: "1px solid #e5e7eb",
                          outline: "none",
                          fontSize: 14,
                        }}
                      />
                    ) : (
                      <div style={{ flex: 1, fontSize: 14, color: "#111827" }}>
                        {c.name}
                      </div>
                    )}

                    {editingId === c.id ? (
                      <>
                        <button
                          type="button"
                          onClick={saveEdit}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 10,
                            border: "none",
                            backgroundColor: "#10b981",
                            color: "#fff",
                            cursor: "pointer",
                            fontSize: 12,
                          }}
                        >
                          Lưu
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setEditingName("");
                          }}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 10,
                            border: "1px solid #e5e7eb",
                            backgroundColor: "#fff",
                            color: "#374151",
                            cursor: "pointer",
                            fontSize: 12,
                          }}
                        >
                          Hủy
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(c)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 10,
                            border: "1px solid #e5e7eb",
                            backgroundColor: "#fff",
                            color: "#374151",
                            cursor: "pointer",
                            fontSize: 12,
                          }}
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCategory(c.id)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 10,
                            border: "1px solid #fecaca",
                            backgroundColor: "#fff",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontSize: 12,
                          }}
                        >
                          Xóa
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast thông báo (tự ẩn sau ~3s) */}
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
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
