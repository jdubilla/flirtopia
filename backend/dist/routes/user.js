"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../controllers/user");
const acceptJsonOnly_1 = __importDefault(require("../middlewares/acceptJsonOnly"));
const router = express_1.default.Router();
router.get('/', user_1.users);
router.get('/suggestions', user_1.getSuggestions);
//router.get('/email', sendVerificationEmail);
router.get('/photo/:id', user_1.photoUserById);
router.get('/manyUsers', user_1.manyUsers);
router.get('/likes', user_1.getLikes);
router.get('/history', user_1.getHistory);
router.get('/mutualBlock/:idUser', user_1.getMutualBlockCheck);
router.get('/tags', user_1.getTags);
router.get('/conversations', user_1.getConversationsByUserId);
router.get('/blockList', user_1.getBlockList);
router.get('/notificationsMessages', user_1.getNotificationsMessages);
router.get('/notifications', user_1.getNotifications);
router.get('/lastMessage/:convId', user_1.getLastMessageById);
router.get('/conversation/:convId', user_1.getConversationById);
router.get('/messages/:convId', user_1.getMessagesById);
router.get('/:id', user_1.userById);
router.get('/relation/:userId', user_1.getRelation);
router.post('/birthDate', acceptJsonOnly_1.default, user_1.setBirth);
router.post('/gender', acceptJsonOnly_1.default, user_1.setGender);
router.post('/preference', acceptJsonOnly_1.default, user_1.setPreference);
router.post('/description', acceptJsonOnly_1.default, user_1.setDescription);
router.post('/interest', acceptJsonOnly_1.default, user_1.setInterest);
router.post('/notificationsMessages', acceptJsonOnly_1.default, user_1.updateNotificationsMessages);
router.post('/reportUser', acceptJsonOnly_1.default, user_1.reportUser);
router.patch('/readNotif', user_1.setReadNotifications);
router.patch('/addInterest', acceptJsonOnly_1.default, user_1.addInterest);
router.patch('/delInterest', acceptJsonOnly_1.default, user_1.delInterest);
router.patch('/delBlockUser', acceptJsonOnly_1.default, user_1.delBlockUser);
router.patch('/allInfosSet', acceptJsonOnly_1.default, user_1.setAllInfosSet);
router.patch('/username', acceptJsonOnly_1.default, user_1.updateUsername);
router.patch('/firstName', acceptJsonOnly_1.default, user_1.updateFirstName);
router.patch('/lastName', acceptJsonOnly_1.default, user_1.updateLastName);
//router.patch('/email', acceptJsonOnly, updateEmail);
router.patch('/password', acceptJsonOnly_1.default, user_1.updatePassword);
router.post('/location', acceptJsonOnly_1.default, user_1.updateLocation);
exports.default = router;
