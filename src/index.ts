import express, { Request, Response } from 'express';
import { RabbitMQService } from './services/rabbitmq.service';
import authRoutes from './routes/authRoutes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req: Request, res: Response) => {
    res.send('Auth Service is running');
});

// API routes
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const rabbitMQ = RabbitMQService.getInstance();

async function startServer() {
    try {
        await rabbitMQ.connect();
        await rabbitMQ.consumeProductEvents();
        
        app.listen(PORT, () => {
            console.log(`Auth Service is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start Auth Service:', error);
        process.exit(1);
    }
}

startServer();
