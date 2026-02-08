import { useState, useCallback } from "react";
import { useAuthStore } from "@/shared/store/authStore";
import { useUserStore } from "@/shared/store/userStore";
import userService from "@/shared/services/userService";

export function useAvatarUpload() {
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const setProfile = useUserStore((s) => s.setProfile);
    const hasToken = !!useAuthStore((s) => s.accessToken);

    const selectFile = useCallback((file: File | null) => {
        setError(null);
        if (!file) {
            setPreview(null);
            return;
        }
        if (!file.type.startsWith("image/")) {
            setError("Vui lòng chọn file ảnh (JPEG, PNG, GIF).");
            return;
        }
        const url = URL.createObjectURL(file);
        setPreview(url);
    }, []);

    const upload = useCallback(async (file: File): Promise<boolean> => {
        if (!hasToken) {
            setError("Vui lòng đăng nhập để tải ảnh lên.");
            return false;
        }
        setUploading(true);
        setError(null);
        try {
            const profile = await userService.uploadAvatar(file);
            setProfile(profile);
            setPreview(null);
            return true;
        } catch (e: unknown) {
            const msg = (e as { response?: { data?: string } })?.response?.data ?? "Tải ảnh thất bại.";
            setError(typeof msg === "string" ? msg : "Tải ảnh thất bại.");
            return false;
        } finally {
            setUploading(false);
        }
    }, [hasToken, setProfile]);

    const clearPreview = useCallback(() => {
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
        setError(null);
    }, [preview]);

    return { preview, uploading, error, selectFile, upload, clearPreview, hasToken };
}
