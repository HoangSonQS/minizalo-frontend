// Auth API types
export interface SignupRequest {
    name: string;
    phone: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    username: string; // phone or email
    password: string;
}

export interface JwtResponse {
    accessToken: string;
    refreshToken: string;
}

export interface MessageResponse {
    message: string;
}

export interface ApiError {
    message: string;
    status?: number;
}
