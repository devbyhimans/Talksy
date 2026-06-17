import type { Request, Response } from "express";
import TryCatch from "../utils/TryCatch.js";
import User from "../models/user.js";
import { generateToken } from "@talksy/auth";

export const googleCallback = TryCatch(async (req: Request, res: Response) => {
    const { code } = req.body;

    if (!code) return res.status(400).json({ success: false, message: "Authorization code is required" });

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            code: code as string,
            client_id: process.env.GOOGLE_CLIENT_ID as string,
            client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI as string,
            grant_type: "authorization_code",
        }),
    });

    const tokenData = await tokenResponse.json();
    if (tokenData.error) return res.status(400).json({ success: false, message: tokenData.error_description });

    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    
    const userData = await userResponse.json();
    if (!userData.id) return res.status(400).json({ success: false, message: "Failed to fetch Google profile" });

    let user = await User.findOne({ $or: [{ googleId: userData.id }, { email: userData.email }] });

    if (!user) {
        user = await User.create({
            name: userData.name,
            username: userData.email.split("@")[0],
            email: userData.email,
            googleId: userData.id,
            image: userData.picture,
            isVerified: true
        });
    } else if (!user.googleId) {
        user.googleId = userData.id;
        user.isVerified = true;
        await user.save();
    }

    const token = generateToken(user._id.toString(), process.env.JWT_SECRET as string);

    res.status(200).json({
        success: true,
        message: "Google login successful",
        token,
        user: { id: user._id, username: user.username, email: user.email, image: user.image }
    });
});
