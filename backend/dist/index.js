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
const connectionDb_1 = require("./services/connectionDb");
const token_1 = require("./utils/token");
const socket_io_1 = require("socket.io");
const db_1 = require("./services/db");
const userUtils_1 = require("./utils/userUtils");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const login_1 = __importDefault(require("./routes/login"));
const user_1 = __importDefault(require("./routes/user"));
const uploads_1 = __importDefault(require("./routes/uploads"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 3000;
const server = http_1.default.createServer(app);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
(0, connectionDb_1.createConnection)();
app.use('/login', login_1.default);
app.use(token_1.authenticateToken);
app.use('/users', user_1.default);
app.use('/uploads', uploads_1.default);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
const connectedSockets = {};
io.on('connection', (socket) => {
    socket.on('userConnect', (data) => {
        const userId = data.userId;
        console.log(`User ${userId} connected via Socket.io`);
        connectedSockets[userId] = socket;
        (() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield (0, db_1.userConnected)(userId);
            }
            catch (error) {
                console.log(error);
            }
        }))();
    });
    socket.on('userDisconnect', (data) => {
        const userId = data.userId;
        console.log(`User ${userId} DISconnected via Socket.io`);
        delete connectedSockets[userId];
        (() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield (0, db_1.userDisonnected)(userId);
            }
            catch (error) {
                console.log(error);
            }
        }))();
    });
    socket.on('disconnect', () => {
        const disconnectedUserId = Object.keys(connectedSockets).find((userId) => connectedSockets[userId] === socket);
        if (disconnectedUserId) {
            console.log(`User ${disconnectedUserId} disconnected`);
            delete connectedSockets[disconnectedUserId];
            (() => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    yield (0, db_1.userDisonnected)(Number(disconnectedUserId));
                }
                catch (error) {
                    console.log(error);
                }
            }))();
        }
        else {
            console.log('A user disconnected');
        }
    });
    socket.on('message', (data) => {
        const conversation_id = data.conversation_id;
        const message_content = data.message_content;
        const recipient_id = data.recipient_id;
        const sender_id = data.sender_id;
        const timestamp = data.timestamp;
        socket.emit('messageFromServer', { conversation_id: conversation_id, message_content: message_content, recipient_id: recipient_id, sender_id: sender_id, timestamp: timestamp });
        socket.emit('messageFromServerBis', { conversation_id: conversation_id, message_content: message_content, recipient_id: recipient_id, sender_id: sender_id, timestamp: timestamp });
        const userSocket = connectedSockets[recipient_id];
        if (userSocket) {
            userSocket.emit('messageFromServer', { conversation_id: conversation_id, message_content: message_content, recipient_id: recipient_id, sender_id: sender_id, timestamp: timestamp });
            userSocket.emit('messageFromServerBis', { conversation_id: conversation_id, message_content: message_content, recipient_id: recipient_id, sender_id: sender_id, timestamp: timestamp });
        }
        (() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield (0, db_1.insertMessage)(conversation_id, message_content, recipient_id, sender_id);
                if (!userSocket) {
                    yield (0, db_1.addNotifMessage)(recipient_id, conversation_id, sender_id, message_content);
                }
            }
            catch (error) {
                console.log(error);
            }
        }))();
    });
    socket.on('like', (data) => {
        const sender_id = data.sender_id;
        const recipient_id = data.recipient_id;
        (() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield (0, db_1.insertLike)(sender_id, recipient_id);
                const userSocket = connectedSockets[recipient_id];
                const senderUserSocket = connectedSockets[sender_id];
                const relation = yield (0, db_1.getRelaion)(sender_id, recipient_id);
                const notificationType = relation.length === 2 ? 'match' : 'like';
                if (notificationType === 'match') {
                    yield (0, db_1.insertNotif)(sender_id, recipient_id, 'match');
                    yield (0, db_1.insertNotif)(recipient_id, sender_id, 'match');
                    yield (0, db_1.createChannel)(sender_id, recipient_id);
                    yield (0, db_1.updatePopularityScore)(recipient_id, 45);
                    yield (0, db_1.updatePopularityScore)(sender_id, 30);
                    if (senderUserSocket) {
                        senderUserSocket.emit('notifFromServer', { user_target_id: sender_id, user_source_id: recipient_id, notification_type: notificationType, timestamp: new Date() });
                    }
                }
                else {
                    yield (0, db_1.insertNotif)(sender_id, recipient_id, 'like');
                    yield (0, db_1.updatePopularityScore)(recipient_id, 15);
                }
                if (userSocket) {
                    userSocket.emit('notifFromServer', { user_target_id: recipient_id, user_source_id: sender_id, notification_type: notificationType, timestamp: new Date() });
                    userSocket.emit('reloadConv');
                }
            }
            catch (error) {
                console.log(error);
            }
        }))();
    });
    socket.on('dislike', (data) => {
        const sender_id = data.sender_id;
        const recipient_id = data.recipient_id;
        const userSocket = connectedSockets[recipient_id];
        (() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield (0, db_1.deleteChannel)(sender_id, recipient_id);
                yield (0, db_1.deleteLike)(sender_id, recipient_id);
                yield (0, db_1.insertNotif)(sender_id, recipient_id, 'dislike');
                yield (0, db_1.updatePopularityScore)(recipient_id, -15);
                yield (0, db_1.deleteNotifsMessages)(recipient_id, sender_id);
                if (userSocket) {
                    userSocket.emit('notifFromServer', { user_target_id: recipient_id, user_source_id: sender_id, notification_type: 'dislike', timestamp: new Date() });
                    userSocket.emit('reloadConv');
                }
            }
            catch (error) {
                console.log(error);
            }
        }))();
    });
    socket.on('blockUser', (data) => {
        const sender_id = data.sender_id;
        const recipient_id = data.recipient_id;
        const userSocket = connectedSockets[recipient_id];
        (() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield (0, db_1.blockUser)(sender_id, recipient_id);
                yield (0, db_1.deleteNotifsMessages)(recipient_id, sender_id);
                if (userSocket) {
                    userSocket.emit('reloadConv');
                }
            }
            catch (error) {
                console.log(error);
            }
        }))();
    });
    socket.on('visited', (data) => {
        const sender_id = data.sender_id;
        const recipient_id = data.recipient_id;
        const userSocket = connectedSockets[recipient_id];
        (() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                if (userSocket) {
                    if (!(yield (0, userUtils_1.isBlocked)(sender_id, recipient_id))) {
                        userSocket.emit('notifFromServer', { user_target_id: recipient_id, user_source_id: sender_id, notification_type: 'visited', timestamp: new Date() });
                    }
                }
                yield (0, db_1.insertNotif)(sender_id, recipient_id, 'visited');
                yield (0, db_1.insertHistory)(sender_id, recipient_id);
                yield (0, db_1.updatePopularityScore)(recipient_id, 3);
            }
            catch (error) {
                console.log(error);
            }
        }))();
    });
});
server.listen(port, () => {
    console.log(`Serveur Express en cours d'exécution sur le port ${port}`);
});
