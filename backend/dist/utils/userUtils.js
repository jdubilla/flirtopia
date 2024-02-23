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
exports.isBlocked = exports.calculateDistance = void 0;
const connectionDb_1 = require("../services/connectionDb");
function calculateDistance(user1, user2) {
    const R = 6371;
    if (!user1 || !user2) {
        return 0;
    }
    const coordsUser1 = user1.split(',');
    const coordsUser2 = user2.split(',');
    const lat1Rad = (parseFloat(coordsUser1[0]) * Math.PI) / 180;
    const lon1Rad = (parseFloat(coordsUser1[1]) * Math.PI) / 180;
    const lat2Rad = (parseFloat(coordsUser2[0]) * Math.PI) / 180;
    const lon2Rad = (parseFloat(coordsUser2[1]) * Math.PI) / 180;
    const dLat = lat2Rad - lat1Rad;
    const dLon = lon2Rad - lon1Rad;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return parseFloat(distance.toFixed(1));
}
exports.calculateDistance = calculateDistance;
function isBlocked(idUser1, idUser2) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const connection = (0, connectionDb_1.getConnection)();
            const combinedBlockedQuery = 'SELECT * FROM blockUser WHERE id_user_source = ? OR id_user_target = ?';
            const blockedUsers = yield new Promise((resolve, reject) => {
                connection.query(combinedBlockedQuery, [idUser1, idUser1], (checkTagErr, checkResults) => {
                    if (checkTagErr) {
                        reject(new Error('Une erreur est survenue'));
                    }
                    else {
                        resolve(checkResults);
                    }
                });
            });
            const containId = blockedUsers.some((obj) => {
                return obj.id_user_source === idUser2 || obj.id_user_target === idUser2;
            });
            return containId;
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.isBlocked = isBlocked;
