import axios from "axios";

// MediaController không có tiền tố /api, nên cần base URL là root backend
const rawBase =
    typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL
        ? process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "")
        : "http://localhost:8080/api";

// Nếu cấu hình là .../api thì bỏ /api đi để gọi /media/...
const ROOT_BASE_URL = rawBase.endsWith("/api") ? rawBase.slice(0, -4) : rawBase;

const api = axios.create({
    baseURL: ROOT_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const mediaService = {
    /**
     * Lấy presigned URL để upload file (PUT) trực tiếp lên MinIO.
     * Trả về chính URL BE trả về (có query ký số).
     */
    async getPresignedUrl(folder: string, fileName: string): Promise<string> {
        const { data } = await api.post<string>("/media/presigned-url", {
            folder,
            fileName,
        });
        return data;
    },
};

export default mediaService;

