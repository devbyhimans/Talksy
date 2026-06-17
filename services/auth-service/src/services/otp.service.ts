import { getRedisClient } from "@talksy/redis";

export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeOTP = async (email: string, otp: string, ttlSeconds: number = 300) => {
    const redisClient = getRedisClient();
    await redisClient.setEx(`otp:${email}`, ttlSeconds, otp);
};

export const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
    const redisClient = getRedisClient();
    const storedOTP = await redisClient.get(`otp:${email}`);
    
    if (storedOTP === otp) {
        await redisClient.del(`otp:${email}`); // Delete OTP after successful verification
        return true;
    }
    return false;
};
