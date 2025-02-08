import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';

import { Message } from './model/Message';
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
const MONGODB_URL:string=process.env.MONGODB_URL || ""
console.log(MONGODB_URL);
mongoose.connect(MONGODB_URL)
.then(()=>console.log("Database connected "))
.catch(err=> console.error("failed to connect database"));


const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

wss.on('connection', async (socket: WebSocket) => {
    console.log('New WebSocket connection established');
    // Send previous messages from DB to new user
    const messages = await Message.find().sort({ timestamp: 1 });
    if(messages!=null){
        console.log(messages)
        socket.send(JSON.stringify({ type: 'history', data: messages }));
    }
    socket.on('message', async(message: string) => {
        const data = JSON.parse(message);
        console.log('Received:', data);
        const newMessage = new Message({
            sender: data.sender,
            message: data.message
        });
        await newMessage.save();

        wss.clients.forEach(client => {
            if (client !== socket && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    });

    socket.send(JSON.stringify({ message: 'Connected to WebSocket server' }));
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
