import { z } from "zod";

export const registerSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    email: z.string().email("Invalid email").optional(),
    name: z.string().optional()
});

export const loginSchema = z.object({
    username: z.string(),
    password: z.string()
});

export const emailOtpSchema = z.object({
    email: z.string().email("Invalid email format")
});

export const verifyOtpSchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6, "OTP must be exactly 6 characters"),
    username: z.string().optional(),
    name: z.string().optional()
});

export const requestResetSchema = z.object({
    email: z.string().email()
});

export const passwordResetSchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6),
    newPassword: z.string().min(6, "Password must be at least 6 characters")
});
