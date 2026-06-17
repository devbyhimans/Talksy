import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
    user?: { id: string };
}

export const generateToken = (userId: string, secret: string): string => {
    return jwt.sign({ id: userId }, secret, { expiresIn: "7d" });
};

export const verifyToken = (token: string, secret: string) => {
    return jwt.verify(token, secret);
};

export const requireAuth = (secret: string) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            if (!token) {
                return res.status(401).json({ success: false, message: "Unauthorized - No token provided" });
            }

            const decoded = verifyToken(token, secret) as { id: string };
            req.user = { id: decoded.id };
            next();
        } catch (error) {
            return res.status(401).json({ success: false, message: "Unauthorized - Invalid or expired token" });
        }
    };
};
