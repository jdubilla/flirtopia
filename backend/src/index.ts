import { createConnection } from './services/connectionDb';
import { authenticateToken } from './utils/token';
import { Server, Socket } from 'socket.io'
import { addNotifMessage, blockUser, createChannel, deleteChannel, deleteLike, deleteNotifsMessages, getRelaion, insertHistory, insertLike, insertMessage, insertNotif, updatePopularityScore, userConnected, userDisonnected } from './services/db';
import { isBlocked } from './utils/userUtils';
import express from 'express';
import cors from 'cors';
import login from './routes/login';
import users from './routes/user';
import uploads from './routes/uploads';
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

const app = express();
const port = 3000;
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

createConnection();

app.use('/login', login);

app.use(authenticateToken);

app.use('/users', users);
app.use('/uploads', uploads);


const io = new Server(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

const connectedSockets: any = {};

io.on('connection', (socket) => {
	socket.on('userConnect', (data) => {
		const userId = data.userId;
		console.log(`User ${userId} connected via Socket.io`);
		connectedSockets[userId] = socket;
		(async () => {
			try {
				await userConnected(userId);
			} catch (error) {
				console.log(error);
			}
		})();
	});

	socket.on('userDisconnect', (data) => {
		const userId = data.userId;
		console.log(`User ${userId} DISconnected via Socket.io`);
		delete connectedSockets[userId];
		(async () => {
			try {
				await userDisonnected(userId);
			} catch (error) {
				console.log(error);
			}
		})();
	});

	socket.on('disconnect', () => {
		const disconnectedUserId = Object.keys(connectedSockets).find(
			(userId) => connectedSockets[userId] === socket
		);

		if (disconnectedUserId) {
			console.log(`User ${disconnectedUserId} disconnected`);
			delete connectedSockets[disconnectedUserId];
			(async () => {
				try {
					await userDisonnected(Number(disconnectedUserId));
				} catch (error) {
					console.log(error);
				}
			})();
		} else {
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
		(async () => {
			try {
				await insertMessage(conversation_id, message_content, recipient_id, sender_id);
				if (!userSocket) {
					await addNotifMessage(recipient_id, conversation_id, sender_id, message_content);
				}
			} catch (error) {
				console.log(error);
			}
		})();
	})

	socket.on('like', (data) => {
		const sender_id = data.sender_id;
		const recipient_id = data.recipient_id;

		(async () => {
			try {
				await insertLike(sender_id, recipient_id);
				const userSocket = connectedSockets[recipient_id];
				const senderUserSocket = connectedSockets[sender_id];
				const relation: any = await getRelaion(sender_id, recipient_id);
				const notificationType = relation.length === 2 ? 'match' : 'like';
				
				if (notificationType === 'match') {
					await insertNotif(sender_id, recipient_id, 'match')
					await insertNotif(recipient_id, sender_id, 'match')
					await createChannel(sender_id, recipient_id);
					await updatePopularityScore(recipient_id, 45);
					await updatePopularityScore(sender_id, 30);
					if (senderUserSocket) {
						senderUserSocket.emit('notifFromServer', { user_target_id: sender_id, user_source_id: recipient_id, notification_type: notificationType, timestamp: new Date() });
					}
				} else {
					await insertNotif(sender_id, recipient_id, 'like')
					await updatePopularityScore(recipient_id, 15);
				}
				if (userSocket) {
					userSocket.emit('notifFromServer', { user_target_id: recipient_id, user_source_id: sender_id, notification_type: notificationType, timestamp: new Date() });
					userSocket.emit('reloadConv');
				}
			
			} catch (error) {
				console.log(error);
			}
		})();
	})

	socket.on('dislike', (data) => {
		const sender_id = data.sender_id;
		const recipient_id = data.recipient_id;
		const userSocket = connectedSockets[recipient_id];
		(async () => {
			try {
				await deleteChannel(sender_id, recipient_id);
				await deleteLike(sender_id, recipient_id);
				await insertNotif(sender_id, recipient_id, 'dislike');
				await updatePopularityScore(recipient_id, -15);
				await deleteNotifsMessages(recipient_id, sender_id);
				if (userSocket) {
					userSocket.emit('notifFromServer', { user_target_id: recipient_id, user_source_id: sender_id, notification_type: 'dislike', timestamp: new Date() });
					userSocket.emit('reloadConv');
				}
			} catch (error) {
				console.log(error);
			}
		})();
	})

	socket.on('blockUser', (data) => {
		const sender_id = data.sender_id;
		const recipient_id = data.recipient_id;
		const userSocket = connectedSockets[recipient_id];
		(async () => {
			try {
				await blockUser(sender_id, recipient_id);
				await deleteNotifsMessages(recipient_id, sender_id);
				if (userSocket) {
					userSocket.emit('reloadConv');
				}
			} catch (error) {
				console.log(error);
			}
		})();
	})

	socket.on('visited', (data) => {
		const sender_id = data.sender_id;
		const recipient_id = data.recipient_id;
		const userSocket = connectedSockets[recipient_id];
		(async () => {
			try {
				if (userSocket) {
					if (!(await isBlocked(sender_id, recipient_id))) {
						userSocket.emit('notifFromServer', { user_target_id: recipient_id, user_source_id: sender_id, notification_type: 'visited', timestamp: new Date() });
					}
				}
				await insertNotif(sender_id, recipient_id, 'visited');
				await insertHistory(sender_id, recipient_id);
				await updatePopularityScore(recipient_id, 3);
			} catch (error) {
				console.log(error);
			}
		})();
	})
});

server.listen(port, () => {
	console.log(`Serveur Express en cours d'exécution sur le port ${port}`);
});
