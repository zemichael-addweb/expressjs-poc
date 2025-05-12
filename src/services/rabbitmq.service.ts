import amqp from 'amqplib/callback_api';

export class RabbitMQService {
    private static instance: RabbitMQService;
    private connection: amqp.Connection | null = null;
    private channel: amqp.Channel | null = null;

    private constructor() {}

    static getInstance(): RabbitMQService {
        if (!RabbitMQService.instance) {
            RabbitMQService.instance = new RabbitMQService();
        }
        return RabbitMQService.instance;
    }

    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            amqp.connect('amqp://localhost', (err, conn) => {
                if (err) {
                    console.error('Auth Service: Error connecting to RabbitMQ:', err);
                    reject(err);
                    return;
                }
                this.connection = conn;
                conn.createChannel((err, ch) => {
                    if (err) {
                        console.error('Auth Service: Error creating channel:', err);
                        reject(err);
                        return;
                    }
                    this.channel = ch;
                    console.log('Auth Service: Connected to RabbitMQ');
                    resolve();
                });
            });
        });
    }

    async publishAuthEvent(eventType: string, data: any): Promise<void> {
        if (!this.channel) {
            throw new Error('Channel not initialized');
        }
        const exchange = 'auth_events';
        await this.channel.assertExchange(exchange, 'topic', { durable: true });
        await this.channel.publish(
            exchange,
            eventType,
            Buffer.from(JSON.stringify(data))
        );
    }

    async consumeProductEvents(): Promise<void> {
        if (!this.channel) {
            throw new Error('Channel not initialized');
        }
        const exchange = 'product_events';
        const queue = 'auth_service_product_events';
        
        await this.channel.assertExchange(exchange, 'topic', { durable: true });
        await this.channel.assertQueue(queue, { durable: true });
        await this.channel.bindQueue(queue, exchange, 'product.*');

        await this.channel.consume(queue, (msg) => {
            if (msg) {
                const content = JSON.parse(msg.content.toString());
                console.log('Auth Service received product event:', content);
                this.channel?.ack(msg);
            }
        });
    }

    async close(): Promise<void> {
        return new Promise((resolve) => {
            if (this.channel) {
                this.channel.close(() => {
                    if (this.connection) {
                        this.connection.close(() => resolve());
                    } else {
                        resolve();
                    }
                });
            } else if (this.connection) {
                this.connection.close(() => resolve());
            } else {
                resolve();
            }
        });
    }
} 