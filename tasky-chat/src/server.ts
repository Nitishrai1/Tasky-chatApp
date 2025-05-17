import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Message } from './model/Message'; 

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


const MONGODB_URL: string = process.env.MONGODB_URL || "";
mongoose.connect(MONGODB_URL)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection failed:", err));

const httpserver = app.listen(8080, () => {
    console.log("Server listening on port 8080");
});

const wss = new WebSocketServer({ server:httpserver });

wss.on('connection', async (ws: WebSocket) => {
    console.log('New WebSocket connection');

    try {
        const messages = await Message.find().sort({ timestamp: 1 });
        ws.send(JSON.stringify({ type: 'history', data: messages }));
    } catch (err) {
        console.error('Error sending history:', err);
    }

    ws.on('error', (err) => {
        console.error('WebSocket error:', err);
    });

    ws.on('message', async (message: string, isBinary) => {
        try {
            const data = JSON.parse(message);
            console.log('Message received:', data);

            const newMessage = new Message({
                sender: data.sender,
                message: data.message
            });
            await newMessage.save();

            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data), { binary: isBinary });
                }
            });
        } catch (err) {
            console.error('Error handling message:', err);
        }
    });

    ws.send(JSON.stringify({ message: 'Connected to WebSocket server' }));
});
