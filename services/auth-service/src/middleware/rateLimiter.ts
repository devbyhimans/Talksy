import type { Request, Response, NextFunction } from "express";
import { getRedisClient } from "@talksy/redis";

export const rateLimiter = (limit: number, windowSeconds: number, keyPrefix: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const redisClient = getRedisClient();
            const identifier = req.body.email || req.ip;
            const key = `ratelimit:${keyPrefix}:${identifier}`;

            const requests = await redisClient.incr(key);

            if (requests === 1) {
                await redisClient.expire(key, windowSeconds);
            }

            if (requests > limit) {
                return res.status(429).json({
                    success: false,
                    message: "Too many requests, please try again later."
                });
            }

            next();
        } catch (error) {
            console.error("Rate limiter error:", error);
            next();
        }
    };
};
