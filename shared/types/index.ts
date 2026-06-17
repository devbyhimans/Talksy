export interface BaseUser {
    id: string;
    username: string;
    email?: string;
    isVerified: boolean;
}

export interface ApiError {
    success: false;
    message: string;
}

export interface ApiSuccess<T> {
    success: true;
    message: string;
    data?: T;
}
