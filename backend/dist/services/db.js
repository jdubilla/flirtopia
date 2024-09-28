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
Object.defineProperty(exports, "__esModule", { value: true });
exports.addNotifMessage = exports.updatePopularityScore = exports.deleteNotifsMessages = exports.blockUser = exports.userDisonnected = exports.userConnected = exports.insertHistory = exports.deleteChannel = exports.createChannel = exports.getRelaion = exports.insertNotif = exports.deleteLike = exports.insertLike = exports.insertMessage = void 0;
const connectionDb_1 = require("./connectionDb");
const insertMessage = (conversation_id, message_content, recipient_id, sender_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const convQuery = 'SELECT * FROM privateMessages WHERE conversation_id = ?';
        const conv = yield new Promise((resolve, reject) => {
            connection.query(convQuery, conversation_id, (err, results) => {
                if (err) {
                    reject(new Error('Erreur lors de l\'exécution de la requête'));
                }
                else {
                    resolve(results);
                }
            });
        });
        const notFirstMessage = conv.some((obj) => {
            return obj.sender_id === sender_id;
        });
        if (conv.length === 0) {
            yield (0, exports.updatePopularityScore)(sender_id, 10);
        }
        else if (!notFirstMessage) {
            yield (0, exports.updatePopularityScore)(sender_id, 5);
        }
        const query = 'INSERT INTO privateMessages (conversation_id, sender_id, recipient_id, message_content, timestamp) VALUES (?, ?, ?, ?, NOW())';
        yield new Promise((resolve, reject) => {
            connection.query(query, [conversation_id, sender_id, recipient_id, message_content], (err, results) => {
                if (err) {
                    reject(new Error('Erreur lors de l\'exécution de la requête'));
                }
                else {
                    resolve(results);
                }
            });
        });
    }
    catch (error) {
        console.log('Erreur lors de l\'exécution de la requête');
    }
});
exports.insertMessage = insertMessage;
const insertLike = (id_user_source, id_user_target) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = (0, connectionDb_1.getConnection)();
        yield new Promise((resolve, reject) => {
            const insertQuery = 'INSERT INTO likes (id_user_source, id_user_target) VALUES (?, ?)';
            const values = [id_user_source, id_user_target];
            connection.query(insertQuery, values, (error) => {
                if (error) {
                    reject(new Error('Error occurred while liked user'));
                }
                else {
                    resolve();
                }
            });
        });
    }
    catch (error) {
        console.log('Erreur lors de l\'exécution de la requête');
    }
});
exports.insertLike = insertLike;
const deleteLike = (id_user_source, id_user_target) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = (0, connectionDb_1.getConnection)();
        yield new Promise((resolve, reject) => {
            const insertQuery = 'DELETE FROM likes WHERE id_user_source = ? AND id_user_target = ?';
            const values = [id_user_source, id_user_target];
            connection.query(insertQuery, values, (error) => {
                if (error) {
                    reject(new Error('Error occurred while dislike user'));
                }
                else {
                    resolve();
                }
            });
        });
    }
    catch (error) {
        console.log('Erreur lors de l\'exécution de la requête');
    }
});
exports.deleteLike = deleteLike;
const insertNotif = (id_user_source, id_user_target, notification) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = (0, connectionDb_1.getConnection)();
        yield new Promise((resolve, reject) => {
            const insertQuery = 'INSERT INTO notifications (user_source_id, user_target_id, notification_type, timestamp)\
				VALUES (?, ?, ?, NOW());';
            const values = [id_user_source, id_user_target, notification];
            connection.query(insertQuery, values, (error) => {
                if (error) {
                    reject(new Error('Erreur lors de l\'exécution de la requête'));
                }
                else {
                    resolve();
                }
            });
        });
    }
    catch (error) {
        console.log('Erreur lors de l\'exécution de la requête');
    }
});
exports.insertNotif = insertNotif;
const getRelaion = (id_user_source, id_user_target) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const relation = yield new Promise((resolve, reject) => {
            const query = 'SELECT * FROM likes WHERE (id_user_source = ? AND id_user_target = ?) \
			OR (id_user_source = ? AND id_user_target = ?)';
            connection.query(query, [id_user_source, id_user_target, id_user_target, id_user_source], (err, results) => {
                if (err) {
                    reject(new Error('Erreur lors de l\'exécution de la requête'));
                }
                else {
                    resolve(results);
                }
            });
        });
        return relation;
    }
    catch (error) {
        console.log('Erreur lors de l\'exécution de la requête');
    }
});
exports.getRelaion = getRelaion;
const createChannel = (id_user_source, id_user_target) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const channel = yield new Promise((resolve, reject) => {
            const query = 'SELECT * FROM conversations WHERE user1_id = ? AND user2_id = ? OR user1_id = ? and user2_id = ?';
            connection.query(query, [id_user_source, id_user_target, id_user_target, id_user_source], (err, results) => {
                if (err) {
                    reject(new Error('Erreur lors de l\'exécution de la requête'));
                }
                else {
                    resolve(results);
                }
            });
        });
        if (channel.length === 1) {
            return;
        }
        yield new Promise((resolve, reject) => {
            const query = 'INSERT INTO conversations (user1_id, user2_id, creation_date) VALUES (?, ?, NOW())';
            connection.query(query, [id_user_source, id_user_target], (err, results) => {
                if (err) {
                    reject(new Error('Erreur lors de l\'exécution de la requête'));
                }
                else {
                    resolve(results);
                }
            });
        });
    }
    catch (error) {
        console.log('Erreur lors de l\'exécution de la requête');
    }
});
exports.createChannel = createChannel;
const deleteChannel = (id_user_source, id_user_target) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const channel = yield new Promise((resolve, reject) => {
            const query = 'SELECT * FROM conversations WHERE user1_id = ? AND user2_id = ? OR user1_id = ? and user2_id = ?';
            connection.query(query, [id_user_source, id_user_target, id_user_target, id_user_source], (err, results) => {
                if (err) {
                    reject(new Error('Erreur lors de l\'exécution de la requête'));
                }
                else {
                    resolve(results);
                }
            });
        });
        if (channel.length !== 1) {
            return;
        }
        yield (0, exports.updatePopularityScore)(id_user_source, -30);
        yield (0, exports.updatePopularityScore)(id_user_target, -30);
        const channelId = channel[0].conversation_id;
        yield new Promise((resolve, reject) => {
            const query = 'DELETE from privateMessages WHERE conversation_id = ?';
            connection.query(query, [channelId], (err, results) => {
                if (err) {
                    reject(new Error('Erreur lors de l\'exécution de la requête'));
                }
                else {
                    resolve(results);
                }
            });
        });
        yield new Promise((resolve, reject) => {
            const query = 'DELETE from conversations WHERE conversation_id = ?';
            connection.query(query, [channelId], (err, results) => {
                if (err) {
                    reject(new Error('Erreur lors de l\'exécution de la requête'));
                }
                else {
                    resolve(results);
                }
            });
        });
    }
    catch (error) {
        console.log('Erreur lors de l\'exécution de la requête');
    }
});
exports.deleteChannel = deleteChannel;
const insertHistory = (id_user_source, id_user_target) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = (0, connectionDb_1.getConnection)();
        yield new Promise((resolve, reject) => {
            const insertQuery = 'INSERT INTO history (id_user_source, id_user_target) VALUES (?, ?)';
            const values = [id_user_source, id_user_target];
            connection.query(insertQuery, values, (error) => {
                if (error) {
                    reject(new Error('Error occurred while insert visit'));
                }
                else {
                    resolve();
                }
            });
        });
    }
    catch (error) {
        console.log('Erreur lors de l\'exécution de la requête');
    }
});
exports.insertHistory = insertHistory;
const userConnected = (idUser) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const currentDateTime = new Date();
        const localDateTime = currentDateTime.toISOString().replace('T', ' ').slice(0, 19);
        yield new Promise((resolve, reject) => {
            const insertQuery = 'UPDATE user SET online = ?, lastConnection = ? WHERE id = ?';
            const values = [true, localDateTime, idUser];
            connection.query(insertQuery, values, (error) => {
                if (error) {
                    reject(new Error('Error'));
                }
                else {
                    resolve();
                }
            });
        });
    }
    catch (error) {
        console.log('Erreur lors de l\'exécution de la requête:', error);
    }
});
exports.userConnected = userConnected;
const userDisonnected = (idUser) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const currentDateTime = new Date();
        const localDateTime = currentDateTime.toISOString().replace('T', ' ').slice(0, 19);
        yield new Promise((resolve, reject) => {
            const insertQuery = 'UPDATE user SET online = ?, lastConnection = ? WHERE id = ?';
            const values = [false, localDateTime, idUser];
            connection.query(insertQuery, values, (error) => {
                if (error) {
                    reject(new Error('Error'));
                }
                else {
                    resolve();
                }
            });
        });
    }
    catch (error) {
        console.log('Erreur lors de l\'exécution de la requête:', error);
    }
});
exports.userDisonnected = userDisonnected;
const blockUser = (id, idUserBlock) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, exports.deleteChannel)(id, idUserBlock);
        yield (0, exports.deleteLike)(id, idUserBlock);
        const connection = (0, connectionDb_1.getConnection)();
        const query = 'INSERT INTO blockUser (id_user_source, id_user_target)\
			VALUES (?, ?);';
        yield new Promise((resolve, reject) => {
            connection.query(query, [id, idUserBlock], (err, results) => {
                if (err) {
                    reject(new Error('Erreur lors de l\'exécution de la requête'));
                }
                else {
                    resolve(results);
                }
            });
        });
    }
    catch (error) {
        console.log(error);
    }
});
exports.blockUser = blockUser;
const deleteNotifsMessages = (id, idUserBlock) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, exports.deleteChannel)(id, idUserBlock);
        yield (0, exports.deleteLike)(id, idUserBlock);
        const connection = (0, connectionDb_1.getConnection)();
        const query = 'DELETE FROM notificationsMessages \
			WHERE (user_id_source = ? AND user_id = ?) OR\
			(user_id_source = ? AND user_id = ?);';
        yield new Promise((resolve, reject) => {
            connection.query(query, [id, idUserBlock, idUserBlock, id], (err, results) => {
                if (err) {
                    reject(new Error('Erreur lors de l\'exécution de la requête'));
                }
                else {
                    resolve(results);
                }
            });
        });
    }
    catch (error) {
        console.log(error);
    }
});
exports.deleteNotifsMessages = deleteNotifsMessages;
const updatePopularityScore = (id, score) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const query = 'SELECT * FROM user WHERE id = ?';
        const user = yield new Promise((resolve, reject) => {
            connection.query(query, [id], (err, results) => {
                if (err) {
                    reject(new Error('Erreur lors de l\'exécution de la requête'));
                }
                else {
                    resolve(results);
                }
            });
        });
        if (user.length === 0) {
            return;
        }
        let newScore = user[0].popularity + score;
        if (newScore < 0) {
            newScore = 0;
        }
        else if (newScore > 1000) {
            newScore = 1000;
        }
        const popularityQuery = 'UPDATE user SET popularity = ? WHERE id = ?';
        yield new Promise((resolve, reject) => {
            connection.query(popularityQuery, [newScore, id], (err, results) => {
                if (err) {
                    reject(new Error('Erreur lors de l\'exécution de la requête'));
                }
                else {
                    resolve(results);
                }
            });
        });
    }
    catch (error) {
        console.log(error);
    }
});
exports.updatePopularityScore = updatePopularityScore;
const addNotifMessage = (id, conversation_id, sender_id, message_content) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const query = 'INSERT INTO notificationsMessages (user_id, conversation_id, user_id_source, message_content)\
		VALUES (?, ?, ?, ?);';
        yield new Promise((resolve, reject) => {
            connection.query(query, [id, conversation_id, sender_id, message_content], (err, results) => {
                if (err) {
                    reject(new Error('Erreur lors de l\'exécution de la requête'));
                }
                else {
                    resolve(results);
                }
            });
        });
    }
    catch (error) {
        console.log(error);
    }
});
exports.addNotifMessage = addNotifMessage;
