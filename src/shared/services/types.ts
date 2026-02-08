// Auth API types - shared cho Web & Mobile
export interface SignupRequest {
    name: string;
    phone: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    username: string; // phone hoặc email
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
