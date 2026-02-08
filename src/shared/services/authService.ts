import axios from "axios";
import {
    SignupRequest,
    LoginRequest,
    JwtResponse,
    MessageResponse,
} from "./types";

const API_BASE_URL =
    typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL
        ? process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "")
        : "http://localhost:8080/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const authService = {
    signup: async (data: SignupRequest): Promise<MessageResponse> => {
        const response = await api.post<MessageResponse>("/auth/signup", data);
        return response.data;
    },

    signin: async (data: LoginRequest): Promise<JwtResponse> => {
        const response = await api.post<JwtResponse>("/auth/signin", data);
        return response.data;
    },

    refreshToken: async (refreshToken: string): Promise<JwtResponse> => {
        const response = await api.post<JwtResponse>("/auth/refreshtoken", {
            refreshToken,
        });
        return response.data;
    },

    logout: async (accessToken: string): Promise<MessageResponse> => {
        const response = await api.post<MessageResponse>(
            "/auth/logout",
            {},
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        return response.data;
    },
};

export default authService;
