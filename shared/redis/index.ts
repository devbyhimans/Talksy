import { createClient } from "redis";

let redisClient: ReturnType<typeof createClient> | null = null;

export const connectRedis = async (url: string) => {
    redisClient = createClient({ url });
    
    try {
        await redisClient.connect();
        console.log("✅ Redis connected globally");
        return redisClient;
    } catch (err) {
        console.error("❌ Error connecting to Redis globally", err);
        throw err;
    }
};

export const getRedisClient = () => {
    if (!redisClient) throw new Error("Redis Client is not initialized");
    return redisClient;
};
