import amqp from "amqplib";

let channel: amqp.Channel | null = null;

export const connectRabbitMQ = async (host: string, port: number, user: string, pass: string) => {
    try {
        const connection = await amqp.connect({
           hostname: host,
           port: port,
           username: user,
           password: pass,
        });
        channel = await connection.createChannel();
        console.log("✅ RabbitMQ connected globally");
        return channel;
    } catch (error) {
        console.error("❌ Error connecting to RabbitMQ globally", error);
        throw error;
    }
};

export const getRabbitMQChannel = () => {
    if (!channel) throw new Error("RabbitMQ Channel is not initialized");
    return channel;
};

export const publishMessage = async (queue: string, message: any) => {
    if (!channel) throw new Error("RabbitMQ Channel is not established");
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
};
