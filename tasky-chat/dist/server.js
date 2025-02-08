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
const http_1 = require("http");
const ws_1 = require("ws");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const Message_1 = require("./model/Message");
const mongoose_1 = __importDefault(require("mongoose"));
const MONGODB_URL = process.env.MONGODB_URL;
mongoose_1.default.connect("mongodb+srv://nitishraigkp007:z6InbXvBf7QluDgq@tasky-database.nq1km.mongodb.net/Tasky")
    .then(() => console.log("Database connected "))
    .catch(err => console.error("failed to connect database"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const wss = new ws_1.WebSocketServer({ server });
app.use((0, cors_1.default)());
app.use(express_1.default.json());
wss.on('connection', (socket) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('New WebSocket connection established');
    // Send previous messages from DB to new user
    const messages = yield Message_1.Message.find().sort({ timestamp: 1 });
    if (messages != null) {
        console.log(messages);
        socket.send(JSON.stringify({ type: 'history', data: messages }));
    }
    socket.on('message', (message) => __awaiter(void 0, void 0, void 0, function* () {
        const data = JSON.parse(message);
        console.log('Received:', data);
        const newMessage = new Message_1.Message({
            sender: data.sender,
            message: data.message
        });
        yield newMessage.save();
        wss.clients.forEach(client => {
            if (client !== socket && client.readyState === ws_1.WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    }));
    socket.send(JSON.stringify({ message: 'Connected to WebSocket server' }));
}));
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
