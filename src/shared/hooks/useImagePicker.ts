import { useState, useCallback } from "react";
import mediaService from "@/shared/services/mediaService";

type UseImagePickerOptions = {
    /**
     * Thư mục trong bucket MinIO, ví dụ: "avatars/", "images/", "messages/".
     * Mặc định: "images/".
     */
    folder?: string;
};

export function useImagePicker(options?: UseImagePickerOptions) {
    const folder = options?.folder ?? "images/";
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const selectFile = useCallback((file: File | null) => {
        setError(null);
        if (!file) {
            if (preview) URL.revokeObjectURL(preview);
            setPreview(null);
            return;
        }
        if (!file.type.startsWith("image/")) {
            setError("Vui lòng chọn file ảnh (JPEG, PNG, GIF, ...).");
            return;
        }
        if (preview) URL.revokeObjectURL(preview);
        const url = URL.createObjectURL(file);
        setPreview(url);
    }, [preview]);

    /**
     * Upload file ảnh lên MinIO thông qua presigned URL.
     * Trả về URL public (không query) nếu thành công, hoặc null nếu thất bại.
     */
    const upload = useCallback(
        async (file: File): Promise<string | null> => {
            setUploading(true);
            setError(null);
            try {
                const presignedUrl = await mediaService.getPresignedUrl(folder, file.name);
                await fetch(presignedUrl, {
                    method: "PUT",
                    headers: {
                        "Content-Type": file.type || "application/octet-stream",
                    },
                    body: file,
                });

                // Loại bỏ query string để lấy URL file "sạch"
                const publicUrl = presignedUrl.split("?")[0];
                return publicUrl;
            } catch (e: unknown) {
                const anyError = e as { message?: string };
                setError(anyError?.message || "Tải ảnh thất bại.");
                return null;
            } finally {
                setUploading(false);
            }
        },
        [folder]
    );

    const clearPreview = useCallback(() => {
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
        setError(null);
    }, [preview]);

    return {
        preview,
        uploading,
        error,
        selectFile,
        upload,
        clearPreview,
    };
}

export default useImagePicker;

