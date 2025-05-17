"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const Message_1 = require("./model/Message");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const MONGODB_URL = process.env.MONGODB_URL || "";
mongoose_1.default.connect(MONGODB_URL)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection failed:", err));
const httpserver = app.listen(8080, () => {
    console.log("Server listening on port 8080");
});
const wss = new ws_1.WebSocketServer({ server: httpserver });
wss.on('connection', (ws) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('New WebSocket connection');
    try {
        const messages = yield Message_1.Message.find().sort({ timestamp: 1 });
        ws.send(JSON.stringify({ type: 'history', data: messages }));
    }
    catch (err) {
        console.error('Error sending history:', err);
    }
    ws.on('error', (err) => {
        console.error('WebSocket error:', err);
    });
    ws.on('message', (message, isBinary) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const data = JSON.parse(message);
            console.log('Message received:', data);
            const newMessage = new Message_1.Message({
                sender: data.sender,
                message: data.message
            });
            yield newMessage.save();
            wss.clients.forEach((client) => {
                if (client.readyState === ws_1.WebSocket.OPEN) {
                    client.send(JSON.stringify(data), { binary: isBinary });
                }
            });
        }
        catch (err) {
            console.error('Error handling message:', err);
        }
    }));
    ws.send(JSON.stringify({ message: 'Connected to WebSocket server' }));
}));
