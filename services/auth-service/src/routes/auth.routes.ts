import express from "express";
import { 
    registerClassic, loginClassic, 
    sendEmailOtp, verifyEmailOtp, 
    requestPasswordReset, resetPassword 
} from "../controllers/auth.controller.js";
import { rateLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.js";
import { 
    registerSchema, loginSchema, 
    emailOtpSchema, verifyOtpSchema, 
    requestResetSchema, passwordResetSchema 
} from "@talksy/zod";

const router = express.Router();

// Apply a rate limit of 5 requests per minute for sending OTPs
const otpLimiter = rateLimiter(5, 60, "send-otp");

// Classic Auth (Username/Password)
router.post("/register", validate(registerSchema), registerClassic);
router.post("/login", validate(loginSchema), loginClassic);

// Email Auth
router.post("/email/send-otp", otpLimiter, validate(emailOtpSchema), sendEmailOtp);
router.post("/email/verify", validate(verifyOtpSchema), verifyEmailOtp);

// Password Reset
router.post("/reset-password/request", otpLimiter, validate(requestResetSchema), requestPasswordReset);
router.post("/reset-password/verify", validate(passwordResetSchema), resetPassword);

export default router;
