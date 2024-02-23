"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.deletePhoto = exports.setPhoto = void 0;
const connectionDb_1 = require("../services/connectionDb");
const fs = __importStar(require("fs"));
const setPhoto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const photoId = req.body.photoId;
    const file = req.file;
    const propertyName = 'photo' + photoId;
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const getAndRemovePhoto = yield new Promise((resolve, reject) => {
            connection.query(`SELECT photo${photoId} FROM user WHERE id = ?`, id, (changePhotoErr, changePhoto) => {
                if (changePhotoErr) {
                    reject(new Error('An error occurred while adding photo'));
                }
                else {
                    resolve(changePhoto);
                }
            });
        });
        if (getAndRemovePhoto[0][propertyName]) {
            fs.unlink(`uploads/${getAndRemovePhoto[0][propertyName]}`, (err) => {
                if (err) {
                    console.error('Error while remove the file', err);
                }
                else {
                    console.log('File deleted');
                }
            });
        }
        if (file) {
            const extension = file.originalname.split('.').pop();
            const newFileName = `${id}-${Date.now()}.${extension}`;
            fs.rename(file.path, `uploads/${newFileName}`, (err) => {
                if (err) {
                    console.error('Error while renaming the file', err);
                    res.status(500).json({ error: 'An error occurred while saving the file' });
                }
                else {
                    console.log('File saved successfully');
                }
            });
            const query = `UPDATE user SET photo${photoId} = ? WHERE id = ?`;
            const updatePhoto = yield new Promise((resolve, reject) => {
                connection.query(query, [newFileName, id], (changePhotoErr, changePhoto) => {
                    if (changePhotoErr) {
                        reject(new Error('An error occurred while adding photo'));
                    }
                    else {
                        resolve(changePhoto);
                    }
                });
            });
        }
        return res.status(200).json({ message: 'File saved successfully' });
    }
    catch (error) {
        return res.status(500).json({ message: 'An error occurred while updating photo' });
    }
});
exports.setPhoto = setPhoto;
const deletePhoto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const id = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
    const photoId = req.query.photoId;
    const propertyName = 'photo' + photoId;
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const getAndRemovePhoto = yield new Promise((resolve, reject) => {
            connection.query(`SELECT photo${photoId} FROM user WHERE id = ?`, id, (changePhotoErr, changePhoto) => {
                if (changePhotoErr) {
                    reject(new Error('An error occurred while adding photo'));
                }
                else {
                    resolve(changePhoto);
                }
            });
        });
        if (getAndRemovePhoto[0][propertyName]) {
            fs.unlink(`uploads/${getAndRemovePhoto[0][propertyName]}`, (err) => {
                if (err) {
                    console.error('Error while remove the file', err);
                }
                else {
                    console.log('File deleted');
                }
            });
            const query = `UPDATE user SET ${propertyName} = NULL WHERE id = ?`;
            connection.query(query, [id], (err, result) => {
                if (err) {
                    console.error('Error while deleting the photo:', err);
                    res.status(500).json({ error: 'Error while deleting the photo' });
                }
                else {
                    console.log('Photo deleted successfully.');
                }
            });
        }
        return res.status(200).json({ message: 'Photo deleted successfully.' });
    }
    catch (error) {
        return res.status(500).json({ message: 'An error occurred while updating photo' });
    }
});
exports.deletePhoto = deletePhoto;
