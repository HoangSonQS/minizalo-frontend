import React, { useRef } from "react";
import { useImagePicker } from "@/shared/hooks/useImagePicker";

type ImagePickerProps = {
    label?: string;
    folder?: string;
    onUploaded?: (url: string) => void;
};

export default function ImagePicker({ label = "Chọn ảnh", folder, onUploaded }: ImagePickerProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const { preview, uploading, error, selectFile, upload, clearPreview } = useImagePicker({
        folder,
    });

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (!file) return;
        selectFile(file);
        const url = await upload(file);
        if (url && onUploaded) {
            onUploaded(url);
        }
        e.target.value = "";
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleChange}
            />
            <button
                type="button"
                onClick={handleClick}
                disabled={uploading}
                style={{
                    padding: "8px 14px",
                    borderRadius: 999,
                    border: "1px dashed #93c5fd",
                    backgroundColor: "#eff6ff",
                    color: "#1d4ed8",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: uploading ? "wait" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                }}
            >
                <span
                    style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        backgroundColor: "#1d4ed8",
                        color: "#fff",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                    }}
                >
                    +
                </span>
                {uploading ? "Đang tải ảnh..." : label}
            </button>

            {preview && (
                <div
                    style={{
                        position: "relative",
                        width: 140,
                        height: 140,
                        borderRadius: 16,
                        overflow: "hidden",
                        boxShadow: "0 4px 16px rgba(15,23,42,0.12)",
                    }}
                >
                    <img
                        src={preview}
                        alt="Xem trước ảnh"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <button
                        type="button"
                        onClick={clearPreview}
                        style={{
                            position: "absolute",
                            top: 6,
                            right: 6,
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            border: "none",
                            backgroundColor: "rgba(15,23,42,0.75)",
                            color: "#fff",
                            cursor: "pointer",
                            fontSize: 14,
                            lineHeight: 1,
                        }}
                    >
                        ×
                    </button>
                </div>
            )}

            {error && (
                <div style={{ fontSize: 12, color: "#b91c1c" }}>
                    {error}
                </div>
            )}
        </div>
    );
}

