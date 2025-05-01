export interface RegisterRequest {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'STUDENT' | 'MENTOR';
    department?: string;
    studentNumber?: string;
    bio?: string;
    expertise?: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    username: string;
    role: string;
    message: string;
} 