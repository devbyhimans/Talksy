import type { Request, Response } from "express";
import TryCatch from "../utils/TryCatch.js";
import User from "../models/user.js";
import { publishMessage } from "@talksy/rabbitmq";
import { generateOTP, storeOTP, verifyOTP } from "../services/otp.service.js";
import { generateToken } from "@talksy/auth";
import bcrypt from "bcrypt";

// ==========================================
// CLASSIC AUTHENTICATION
// ==========================================

export const registerClassic = TryCatch(async (req: Request, res: Response) => {
    const { username, password, email, name } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ success: false, message: "Username already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        username,
        password: hashedPassword,
        email,
        name: name || username,
        isVerified: true
    });

    const token = generateToken(user._id.toString(), process.env.JWT_SECRET as string);

    res.status(201).json({
        success: true,
        message: "Registration successful",
        token,
        user: { id: user._id, username: user.username, email: user.email }
    });
});

export const loginClassic = TryCatch(async (req: Request, res: Response) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user || !user.password) {
        return res.status(400).json({ success: false, message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ success: false, message: "Invalid username or password" });
    }

    const token = generateToken(user._id.toString(), process.env.JWT_SECRET as string);

    res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: { id: user._id, username: user.username, email: user.email }
    });
});

// ==========================================
// EMAIL OTP AUTHENTICATION
// ==========================================

export const sendEmailOtp = TryCatch(async (req: Request, res: Response) => {
    const { email } = req.body;

    const otp = generateOTP();
    await storeOTP(email, otp);

    const message = {
        email: email,
        subject: "Talksy Login OTP",
        body: `<h1>Talksy Login</h1><p>Your OTP is: <strong>${otp}</strong></p><p>This OTP will expire in 5 minutes.</p>`
    };

    await publishMessage("send-email-otp", message);

    res.status(200).json({ success: true, message: `OTP sent to ${email}` });
});

export const verifyEmailOtp = TryCatch(async (req: Request, res: Response) => {
    const { email, otp, username, name } = req.body;

    const isValid = await verifyOTP(email, otp);
    if (!isValid) {
        return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    let user = await User.findOne({ email });

    if (!user) {
        const fallbackUsername = username || email.split("@")[0];
        
        const existingUsername = await User.findOne({ username: fallbackUsername });
        if (existingUsername) {
             return res.status(400).json({ success: false, message: "Username is already taken, please provide a different one." });
        }

        user = await User.create({
            username: fallbackUsername,
            name: name || fallbackUsername,
            email,
            isVerified: true
        });
    }

    const token = generateToken(user._id.toString(), process.env.JWT_SECRET as string);

    res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: { id: user._id, username: user.username, email: user.email }
    });
});

// ==========================================
// PASSWORD RESET
// ==========================================

export const requestPasswordReset = TryCatch(async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    const otp = generateOTP();
    await storeOTP(`reset:${email}`, otp, 600);

    const message = {
        email: email,
        subject: "Talksy Password Reset",
        body: `<h1>Password Reset</h1><p>Your reset code is: <strong>${otp}</strong></p><p>This code will expire in 10 minutes.</p>`
    };

    await publishMessage("send-reset-password", message);

    res.status(200).json({ success: true, message: "Password reset code sent to email" });
});

export const resetPassword = TryCatch(async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;

    const isValid = await verifyOTP(`reset:${email}`, otp);
    if (!isValid) {
        return res.status(400).json({ success: false, message: "Invalid or expired reset code" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successfully. You can now log in." });
});
