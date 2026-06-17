import app from "./app.js";
import connectDB from "./config/db.js";
import { connectRabbitMQ } from "@talksy/rabbitmq";
import { connectRedis } from "@talksy/redis";

const PORT = process.env.PORT || 3001;

const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();
        
        // Connect to Shared Redis
        await connectRedis(process.env.REDIS_URL as string);
        
        // Connect to Shared RabbitMQ
        await connectRabbitMQ(
            process.env.RABBITMQ_HOST as string,
            Number(process.env.RABBITMQ_PORT),
            process.env.RABBITMQ_USER as string,
            process.env.RABBITMQ_PASSWORD as string
        );

        app.listen(PORT, () => {
            console.log(`🚀 Auth service is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Failed to start Auth Service:", error);
        process.exit(1);
    }
};

startServer();
