"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const uploads_1 = require("../controllers/uploads");
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Seules les images au format JPG, JPEG, PNG et GIF sont autorisées.'));
        }
        cb(null, true);
    }
});
router.post('/', upload.single('photo_profil'), uploads_1.setPhoto);
router.delete('/', uploads_1.deletePhoto);
exports.default = router;
