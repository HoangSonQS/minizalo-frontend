import axios from "axios";
import { SignupRequest, LoginRequest, JwtResponse, MessageResponse } from "./types";

// API base URL - use your computer's IP address for mobile devices
// Change this to your backend URL
const API_BASE_URL = "http://192.168.1.9:8080/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const authService = {
    /**
     * Register a new user
     */
    signup: async (data: SignupRequest): Promise<MessageResponse> => {
        const response = await api.post<MessageResponse>("/auth/signup", data);
        return response.data;
    },

    /**
     * Login user
     */
    signin: async (data: LoginRequest): Promise<JwtResponse> => {
        const response = await api.post<JwtResponse>("/auth/signin", data);
        return response.data;
    },

    /**
     * Refresh access token
     */
    refreshToken: async (refreshToken: string): Promise<JwtResponse> => {
        const response = await api.post<JwtResponse>("/auth/refreshtoken", {
            refreshToken,
        });
        return response.data;
    },

    /**
     * Logout user
     */
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
