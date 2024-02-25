"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const login_1 = require("../controllers/login");
const acceptJsonOnly_1 = __importDefault(require("../middlewares/acceptJsonOnly"));
const router = express_1.default.Router();
router.post('/signin', acceptJsonOnly_1.default, login_1.signin);
router.post('/signup', acceptJsonOnly_1.default, login_1.signup);
router.post('/resetPasword', login_1.resetPassword);
router.get('/token', login_1.checkToken);
//router.get('/verifyToken', verifyTokenEmail);
//router.get('/sendEmailResetPassword', sendEmailResetPassword);
exports.default = router;
