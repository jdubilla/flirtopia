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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMutualBlockCheck = exports.delBlockUser = exports.getBlockList = exports.reportUser = exports.setReadNotifications = exports.getHistory = exports.getLikes = exports.getNotifications = exports.getNotificationsMessages = exports.updateNotificationsMessages = exports.getLastMessageById = exports.getMessagesById = exports.getConversationById = exports.getConversationsByUserId = exports.getRelation = exports.getTags = exports.getSuggestions = exports.updateLocation = exports.updatePassword = exports.updateEmail = exports.updateLastName = exports.updateFirstName = exports.updateUsername = exports.setAllInfosSet = exports.delInterest = exports.addInterest = exports.setInterest = exports.setDescription = exports.setPreference = exports.setGender = exports.setBirth = exports.photoUserById = exports.manyUsers = exports.userById = exports.users = void 0;
const connectionDb_1 = require("../services/connectionDb");
const util_1 = require("util");
const userUtils_1 = require("../utils/userUtils");
const fs = __importStar(require("fs"));
const argon2_1 = __importDefault(require("argon2"));
const db_1 = require("../services/db");
const users = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = (0, connectionDb_1.getConnection)();
    const query = 'SELECT * FROM user';
    connection.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Erreur lors de la récupération des éléments.' });
        }
        else {
            res.json(results);
        }
    });
});
exports.users = users;
const userById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const myId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const checkUserQuery = 'SELECT *, NULL AS password FROM user WHERE id = ?';
        const user = yield new Promise((resolve, reject) => {
            connection.query(checkUserQuery, id, (checkUserErr, checkUserResults) => {
                if (checkUserErr) {
                    reject(new Error('Une erreur est survenue lors de la vérification du nom d\'utilisateur.'));
                }
                else {
                    resolve(checkUserResults);
                }
            });
        });
        if (!user.length) {
            return res.status(404).json({ error: 'User not found' });
        }
        const checkTagsQuery = 'SELECT user_tag.tag_id FROM user JOIN user_tag ON user.id = user_tag.user_id JOIN tag ON tag.tag_id = user_tag.tag_id WHERE user.id = ?';
        const tags = yield new Promise((resolve, reject) => {
            connection.query(checkTagsQuery, id, (checkTagErr, checkTagResults) => {
                if (checkTagErr) {
                    reject(new Error('Une erreur est survenue lors de la recuperation des tags'));
                }
                else {
                    resolve(checkTagResults);
                }
            });
        });
        user[0].interests = tags.map((tag) => tag.tag_id);
        const checkImageQuery = 'SELECT photo1 FROM user WHERE id = ?';
        const photo = yield new Promise((resolve, reject) => {
            connection.query(checkImageQuery, id, (checkimgErr, checkimgResults) => {
                if (checkimgErr) {
                    reject(new Error('Une erreur est survenue lors de la recuperation des images'));
                }
                else {
                    resolve(checkimgResults);
                }
            });
        });
        if (photo[0].photo1) {
            const photoTobase64 = yield new Promise((resolve, reject) => {
                fs.readFile('uploads/' + photo[0].photo1, (err, data) => {
                    if (err) {
                        reject(new Error('Une erreur est survenue lors de la recuperation des images'));
                    }
                    const base64Image = Buffer.from(data).toString('base64');
                    user[0].mainPhoto = base64Image;
                    resolve(data);
                });
            });
        }
        const checkLocationQuery = 'SELECT location FROM user WHERE id = ?';
        yield new Promise((resolve, reject) => {
            connection.query(checkLocationQuery, myId, (checkLocationErr, checkLocationResults) => {
                if (checkLocationErr) {
                    reject(new Error('Une erreur est survenue lors de la recuperation de la localisation'));
                }
                else {
                    const distance = (0, userUtils_1.calculateDistance)(user[0].location, checkLocationResults[0].location);
                    user[0].distance = distance;
                    resolve(checkLocationResults);
                }
            });
        });
        const checkReportQuery = 'SELECT * FROM reportUser WHERE id_user_source = ? AND id_user_target = ?;';
        yield new Promise((resolve, reject) => {
            connection.query(checkReportQuery, [myId, id], (reportErr, reportResults) => {
                if (reportErr) {
                    reject(new Error('Une erreur est survenue lors de la recuperation de la localisation'));
                }
                else {
                    if (reportResults.length > 0) {
                        user[0].report = true;
                    }
                    else {
                        user[0].report = false;
                    }
                    resolve(reportResults);
                }
            });
        });
        function getAge() {
            const birth = new Date(user[0].birth);
            const currentDate = new Date();
            const differenceInMillisec = currentDate - birth;
            const age = differenceInMillisec / (1000 * 60 * 60 * 24 * 365.25);
            return Math.floor(age);
        }
        user[0].age = getAge();
        return res.json(user[0]);
    }
    catch (error) {
        console.error('Erreur lors de la recherche de l\'utilisateur par son ID:', error);
        return res.status(500).json({ error: 'Une erreur est survenue lors de la recherche de l\'utilisateur.' });
    }
});
exports.userById = userById;
const manyUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const ids = req.query.ids;
    const myId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
    let arrayOfStrings = ids.split(",");
    let parsedIds = arrayOfStrings.map(Number);
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const checkUserQuery = 'SELECT * FROM user WHERE id IN (?)';
        const escapedIds = parsedIds.join(', ');
        const finalQuery = checkUserQuery.replace('?', escapedIds);
        const users = yield new Promise((resolve, reject) => {
            connection.query(finalQuery, (checkUserErr, checkUserResults) => {
                if (checkUserErr) {
                    reject(new Error('Une erreur est survenue lors de la vérification du nom d\'utilisateur.'));
                }
                else {
                    resolve(checkUserResults);
                }
            });
        });
        for (const user of users) {
            const checkTagsQuery = 'SELECT user_tag.tag_id FROM user JOIN user_tag ON user.id = user_tag.user_id JOIN tag ON tag.tag_id = user_tag.tag_id WHERE user.id = ?';
            const tags = yield new Promise((resolve, reject) => {
                connection.query(checkTagsQuery, user.id, (checkTagErr, checkTagResults) => {
                    if (checkTagErr) {
                        reject(new Error('Une erreur est survenue lors de la recuperation des tags'));
                    }
                    else {
                        resolve(checkTagResults);
                    }
                });
            });
            user.interests = tags.map((tag) => tag.tag_id);
            const checkImageQuery = 'SELECT photo1 FROM user WHERE id = ?';
            const photo = yield new Promise((resolve, reject) => {
                connection.query(checkImageQuery, user.id, (checkimgErr, checkimgResults) => {
                    if (checkimgErr) {
                        reject(new Error('Une erreur est survenue lors de la recuperation des images'));
                    }
                    else {
                        resolve(checkimgResults);
                    }
                });
            });
            if (photo[0].photo1) {
                yield new Promise((resolve, reject) => {
                    fs.readFile('uploads/' + photo[0].photo1, (err, data) => {
                        if (err) {
                            reject(new Error('Une erreur est survenue lors de la recuperation des images'));
                        }
                        const base64Image = Buffer.from(data).toString('base64');
                        user.mainPhoto = base64Image;
                        resolve(data);
                    });
                });
            }
            const checkLocationQuery = 'SELECT location FROM user WHERE id = ?';
            yield new Promise((resolve, reject) => {
                connection.query(checkLocationQuery, myId, (checkLocationErr, checkLocationResults) => {
                    if (checkLocationErr) {
                        reject(new Error('Une erreur est survenue lors de la recuperation de la localisation'));
                    }
                    else {
                        const distance = (0, userUtils_1.calculateDistance)(user.location, checkLocationResults[0].location);
                        user.distance = distance;
                        resolve(checkLocationResults);
                    }
                });
            });
            function getAge() {
                const birth = new Date(user.birth);
                const currentDate = new Date();
                const differenceInMillisec = currentDate - birth;
                const age = differenceInMillisec / (1000 * 60 * 60 * 24 * 365.25);
                return Math.floor(age);
            }
            user.age = getAge();
        }
        return res.json(users);
    }
    catch (error) {
        return res.status(500).json({ error: 'Une erreur est survenue lors de la recherche de l\'utilisateur.' });
    }
});
exports.manyUsers = manyUsers;
const photoUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const connection = (0, connectionDb_1.getConnection)();
        const checkImageQuery = 'SELECT photo1, photo2, photo3, photo4, photo5 FROM user WHERE id = ?';
        const photo = yield new Promise((resolve, reject) => {
            connection.query(checkImageQuery, id, (checkimgErr, checkimgResults) => {
                if (checkimgErr) {
                    reject(new Error('Une erreur est survenue lors de la recuperation des images'));
                }
                else {
                    resolve(checkimgResults);
                }
            });
        });
        for (let i = 1; i <= 5; i++) {
            const photoField = `photo${i}`;
            const photoFileName = photo[0][photoField];
            if (!photoFileName) {
                continue;
            }
            const readFileAsync = (0, util_1.promisify)(fs.readFile);
            const data = yield readFileAsync('uploads/' + photoFileName);
            const base64Image = Buffer.from(data).toString('base64');
            photo[0][photoField] = base64Image;
        }
        return res.json(photo[0]);
    }
    catch (error) {
        return res.status(500).json({ message: 'An error occurred while retrieving the images' });
    }
});
exports.photoUserById = photoUserById;
const setBirth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const id = (_c = req.user) === null || _c === void 0 ? void 0 : _c.userId;
    const { birthDate } = req.body;
    try {
        const connection = (0, connectionDb_1.getConnection)();
        if (!birthDate) {
            return res.status(400).json({ message: 'Birth date must be provided' });
        }
        const isAdult = yield new Promise((resolve, reject) => {
            const dateOfBirthObj = new Date(birthDate);
            const currentDate = new Date();
            let age = currentDate.getFullYear() - dateOfBirthObj.getFullYear();
            const birthdayHasPassed = currentDate.getMonth() > dateOfBirthObj.getMonth() ||
                (currentDate.getMonth() === dateOfBirthObj.getMonth() &&
                    currentDate.getDate() >= dateOfBirthObj.getDate());
            if (!birthdayHasPassed) {
                age--;
            }
            if (age >= 18) {
                resolve();
            }
            else {
                return res.status(403).json({ error: 'User must be adult' });
            }
        });
        const updatedBirth = yield new Promise((resolve, reject) => {
            connection.query('UPDATE user SET birth = ? WHERE id = ?', [birthDate, id], (changeBirthErr, changeBirth) => {
                if (changeBirthErr) {
                    reject(new Error('An error occurred while adding the birth date'));
                }
                else {
                    resolve(changeBirth);
                }
            });
        });
        return res.json({ message: 'Birth date successfully set' });
    }
    catch (error) {
        return res.status(500).json({ message: 'An error occurred while updating the birth date' });
    }
});
exports.setBirth = setBirth;
const setGender = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const id = (_d = req.user) === null || _d === void 0 ? void 0 : _d.userId;
    const { gender } = req.body;
    if (gender !== 'man' && gender !== 'woman') {
        return res.status(400).json({ error: 'Bad request' });
    }
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const updatedGender = yield new Promise((resolve, reject) => {
            connection.query('UPDATE user SET gender = ? WHERE id = ?', [gender, id], (changeGenderhErr, changeGender) => {
                if (changeGenderhErr) {
                    reject(new Error('An error occurred while adding gender'));
                }
                else {
                    resolve(changeGender);
                }
            });
        });
        return res.json({ message: 'Gender successfully set' });
    }
    catch (error) {
        return res.status(500).json({ message: 'An error occurred while updating gende' });
    }
});
exports.setGender = setGender;
const setPreference = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const id = (_e = req.user) === null || _e === void 0 ? void 0 : _e.userId;
    const { preference } = req.body;
    if (preference !== 'man' && preference !== 'woman' && preference !== 'both') {
        return res.status(400).json({ error: 'Bad request' });
    }
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const updatedPreference = yield new Promise((resolve, reject) => {
            connection.query('UPDATE user SET preference = ? WHERE id = ?', [preference, id], (changePreferenceErr, changePreference) => {
                if (changePreferenceErr) {
                    reject(new Error('An error occurred while adding gender'));
                }
                else {
                    resolve(changePreference);
                }
            });
        });
        return res.json({ message: 'Preference successfully set' });
    }
    catch (error) {
        return res.status(500).json({ message: 'An error occurred while updating preference' });
    }
});
exports.setPreference = setPreference;
const setDescription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    const id = (_f = req.user) === null || _f === void 0 ? void 0 : _f.userId;
    const { description } = req.body;
    if (!description || description.length === 0) {
        return res.status(400).json({ error: 'You must set a description' });
    }
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const updatedDescription = yield new Promise((resolve, reject) => {
            connection.query('UPDATE user SET description = ? WHERE id = ?', [description, id], (changeDescriptionErr, changeDescription) => {
                if (changeDescriptionErr) {
                    reject(new Error('An error occurred while adding a description'));
                }
                else {
                    resolve(changeDescription);
                }
            });
        });
        return res.json({ message: 'Description successfully set' });
    }
    catch (error) {
        return res.status(500).json({ message: 'An error occurred while updating a description' });
    }
});
exports.setDescription = setDescription;
const setInterest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g;
    const id = (_g = req.user) === null || _g === void 0 ? void 0 : _g.userId;
    const { interests } = req.body;
    if (!interests || interests.length === 0) {
        return res.status(400).json({ error: 'You must set a tags' });
    }
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const updatedInterest = yield new Promise((resolve, reject) => {
            for (const tagId of interests) {
                const insertQuery = 'INSERT INTO user_tag (user_id, tag_id) VALUES (?, ?)';
                const values = [id, tagId + 1];
                connection.query(insertQuery, values, (error) => {
                    if (error) {
                        reject(new Error('Error occurred while inserting the tag'));
                    }
                    else {
                        resolve();
                    }
                });
            }
        });
        return res.json({ message: 'Tags successfully set' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error occurred while inserting the tag' });
    }
});
exports.setInterest = setInterest;
const addInterest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _h;
    const id = (_h = req.user) === null || _h === void 0 ? void 0 : _h.userId;
    const { idInterest } = req.body;
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const addInterest = yield new Promise((resolve, reject) => {
            const insertQuery = 'INSERT INTO user_tag (user_id, tag_id) VALUES (?, ?)';
            const values = [id, idInterest];
            connection.query(insertQuery, values, (error) => {
                if (error) {
                    reject(new Error('Error occurred while inserting the tag'));
                }
                else {
                    resolve();
                }
            });
        });
        return res.json({ message: 'Tags successfully set' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error occurred while inserting the tag' });
    }
});
exports.addInterest = addInterest;
const delInterest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _j;
    const id = (_j = req.user) === null || _j === void 0 ? void 0 : _j.userId;
    const { idInterest } = req.body;
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const delInterest = yield new Promise((resolve, reject) => {
            const insertQuery = 'DELETE FROM user_tag WHERE user_id = ? AND tag_id = ?';
            const values = [id, idInterest];
            connection.query(insertQuery, values, (error) => {
                if (error) {
                    reject(new Error('Error occurred while inserting the tag'));
                }
                else {
                    resolve();
                }
            });
        });
        return res.json({ message: 'Tags successfully set' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error occurred while inserting the tag' });
    }
});
exports.delInterest = delInterest;
const setAllInfosSet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _k;
    const id = (_k = req.user) === null || _k === void 0 ? void 0 : _k.userId;
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const updatedDescription = yield new Promise((resolve, reject) => {
            const insertQuery = 'UPDATE user SET all_infos_set = true WHERE id = ?;';
            connection.query(insertQuery, id, (error) => {
                if (error) {
                    reject(new Error('Error occurred while setting all_infos_set'));
                }
                else {
                    resolve();
                }
            });
        });
        return res.json({ message: 'all_infos_set successfully set' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error occurred while setting all_infos_set' });
    }
});
exports.setAllInfosSet = setAllInfosSet;
const updateUsername = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _l;
    const id = (_l = req.user) === null || _l === void 0 ? void 0 : _l.userId;
    const { username } = req.body;
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const searchUsernameQuery = 'SELECT COUNT(*) AS count FROM user WHERE username = ?';
        const searchUsername = yield new Promise((resolve, reject) => {
            connection.query(searchUsernameQuery, [username], (err, results) => {
                if (err) {
                    reject(new Error('Error occurred while updating username'));
                }
                else {
                    resolve(results);
                }
            });
        });
        if (searchUsername[0].count !== 0) {
            return res.status(409).json({ error: 'Error: Username already taken' });
        }
        const updateUsernameQuery = 'UPDATE user SET username = ? WHERE id = ?';
        const updateUsername = yield new Promise((resolve, reject) => {
            connection.query(updateUsernameQuery, [username, id], (err, results) => {
                if (err) {
                    reject(new Error('Error occurred while updating username'));
                }
                else {
                    resolve();
                }
            });
        });
        return res.json({ message: 'Username updated' });
    }
    catch (error) {
        return res.status(500).json({ error: 'Error occurred while updating username' });
    }
});
exports.updateUsername = updateUsername;
const updateFirstName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _m;
    const id = (_m = req.user) === null || _m === void 0 ? void 0 : _m.userId;
    const { firstName } = req.body;
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const updateUsernameQuery = 'UPDATE user SET firstName = ? WHERE id = ?';
        const updateFirstName = yield new Promise((resolve, reject) => {
            connection.query(updateUsernameQuery, [firstName, id], (err, results) => {
                if (err) {
                    reject(new Error('Error occurred while updating First Name'));
                }
                else {
                    resolve();
                }
            });
        });
        return res.json({ message: 'First Name updated' });
    }
    catch (error) {
        return res.status(500).json({ error: 'Error occurred while updating First Name' });
    }
});
exports.updateFirstName = updateFirstName;
const updateLastName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _o;
    const id = (_o = req.user) === null || _o === void 0 ? void 0 : _o.userId;
    const { lastName } = req.body;
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const updateUsernameQuery = 'UPDATE user SET lastName = ? WHERE id = ?';
        const updateLastName = yield new Promise((resolve, reject) => {
            connection.query(updateUsernameQuery, [lastName, id], (err, results) => {
                if (err) {
                    reject(new Error('Error occurred while updating Last Name'));
                }
                else {
                    resolve();
                }
            });
        });
        return res.json({ message: 'Last Name updated' });
    }
    catch (error) {
        return res.status(500).json({ error: 'Error occurred while updating Last Name' });
    }
});
exports.updateLastName = updateLastName;
const updateEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _p;
    const id = (_p = req.user) === null || _p === void 0 ? void 0 : _p.userId;
    const { email } = req.body;
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const checkEmailQuery = 'SELECT * FROM user WHERE email = ?';
        try {
            const checkEmailResult = yield new Promise((resolve, reject) => {
                connection.query(checkEmailQuery, email, (checkEmailErr, checkEmailResults) => {
                    if (checkEmailErr) {
                        reject(new Error('Une erreur est survenue lors de la vérification de l\'email.'));
                    }
                    else {
                        resolve(checkEmailResults);
                    }
                });
            });
            if (checkEmailResult.length > 0) {
                return res.status(409).json({ error: 'Email already taken.' });
            }
        }
        catch (error) {
            return res.status(500).json({ error: 'Internal server error. Please try again later.' });
        }
        const updateUsernameQuery = 'UPDATE user SET email = ? WHERE id = ?';
        yield new Promise((resolve, reject) => {
            connection.query(updateUsernameQuery, [email, id], (err, results) => {
                if (err) {
                    reject(new Error('Error occurred while updating email'));
                }
                else {
                    resolve();
                }
            });
        });
        return res.json({ message: 'Email updated' });
    }
    catch (error) {
        return res.status(500).json({ error: 'Error occurred while updating email' });
    }
});
exports.updateEmail = updateEmail;
const updatePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _q;
    const id = (_q = req.user) === null || _q === void 0 ? void 0 : _q.userId;
    const { password } = req.body;
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const hashedPassword = yield argon2_1.default.hash(password);
        const updateUsernameQuery = 'UPDATE user SET password = ? WHERE id = ?';
        yield new Promise((resolve, reject) => {
            connection.query(updateUsernameQuery, [hashedPassword, id], (err, results) => {
                if (err) {
                    reject(new Error('Error occurred while updating password'));
                }
                else {
                    resolve();
                }
            });
        });
        return res.json({ message: 'Password updated' });
    }
    catch (error) {
        return res.status(500).json({ error: 'Error occurred while updating password' });
    }
});
exports.updatePassword = updatePassword;
const updateLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _r;
    const id = (_r = req.user) === null || _r === void 0 ? void 0 : _r.userId;
    const { location } = req.body;
    try {
        const connection = (0, connectionDb_1.getConnection)();
        if (!location) {
            return res.status(400).json({ message: 'Location must be provided' });
        }
        const updateLocationQuery = 'UPDATE user SET location = ? WHERE id = ?';
        const updatedLocation = yield new Promise((resolve, reject) => {
            connection.query(updateLocationQuery, [location, id], (changeLocationhErr, changeBirth) => {
                if (changeLocationhErr) {
                    reject(new Error('An error occurred while adding the birth date'));
                }
                else {
                    resolve(changeBirth);
                }
            });
        });
        return res.json({ message: 'Location successfully set' });
    }
    catch (error) {
        return res.status(500).json({ message: 'An error occurred while updating location' });
    }
});
exports.updateLocation = updateLocation;
const getSuggestions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _s;
    const id = (_s = req.user) === null || _s === void 0 ? void 0 : _s.userId;
    const maxDistance = req.query.maxDistance;
    const differencePopularity = req.query.differencePopularity;
    const ageFrom = req.query.ageFrom;
    const ageTo = req.query.ageTo;
    const interests = req.query.interests;
    let interestsNumber = [];
    //if (interests) {
    //	interestsNumber = interests.map((interest: any) => parseInt(interest, 10));
    //}
    try {
        const query = 'SELECT id, gender, preference, location, birth, popularity FROM user';
        const connection = (0, connectionDb_1.getConnection)();
        const users = yield new Promise((resolve, reject) => {
            connection.query(query, (err, results) => {
                if (err) {
                    reject(new Error('Erreur lors de l\'exécution de la requête'));
                }
                else {
                    resolve(results);
                }
            });
        });
        const activeUser = users.find((user) => user.id === id);
        const myGender = activeUser.gender;
        const myPreference = activeUser.preference;
        const filteredPreferenceUsers = users.filter((user) => {
            if (myGender === "man" && myPreference === "woman") {
                return (user.gender === "woman" && (user.preference === "man" || user.preference === "both"));
            }
            else if (myGender === "woman" && myPreference === "man") {
                return (user.gender === "man" && (user.preference === "woman" || user.preference === "both"));
            }
            else if (myGender === "woman" && myPreference === "both") {
                return (user.gender === "woman" && (user.preference === "woman" || user.preference === "both")) || (user.gender === "man" && (user.preference === "woman" || user.preference === "both"));
            }
            else if (myGender === "man" && myPreference === "both") {
                return (user.gender === "woman" && (user.preference === "man" || user.preference === "both")) || (user.gender === "man" && (user.preference === "man" || user.preference === "both"));
            }
            else if (myGender === "man" && myPreference === "man") {
                return (user.gender === "man" && (user.preference === "man" || user.preference === "both"));
            }
            else if (myGender === "woman" && myPreference === "woman") {
                return (user.gender === "woman" && (user.preference === "woman" || user.preference === "both"));
            }
        });
        const filteredLocationUsers = filteredPreferenceUsers.filter((user) => {
            return ((0, userUtils_1.calculateDistance)(activeUser.location, user.location) <= maxDistance);
        });
        const filteredPopularityUsers = filteredLocationUsers.filter((user) => {
            return (user.popularity >= (activeUser.popularity - differencePopularity) &&
                user.popularity <= (activeUser.popularity + differencePopularity));
        });
        function getAge(user) {
            const birth = new Date(user.birth);
            const currentDate = new Date();
            const differenceInMillisec = currentDate - birth;
            const age = differenceInMillisec / (1000 * 60 * 60 * 24 * 365.25);
            return Math.floor(age);
        }
        const filteredAgeUsers = filteredPopularityUsers.filter((user) => {
            const age = getAge(user);
            return (age >= ageFrom && age <= ageTo);
        });
        const checkTagsQuery = 'SELECT user_tag.tag_id FROM user JOIN user_tag ON user.id = user_tag.user_id JOIN tag ON tag.tag_id = user_tag.tag_id WHERE user.id = ?';
        for (const user of filteredAgeUsers) {
            const tags = yield new Promise((resolve, reject) => {
                connection.query(checkTagsQuery, user.id, (checkTagErr, checkTagResults) => {
                    if (checkTagErr) {
                        reject(new Error('Une erreur est survenue lors de la recuperation des tags'));
                    }
                    else {
                        resolve(checkTagResults);
                    }
                });
            });
            user.interests = tags.map((tag) => tag.tag_id);
        }
        let filteredInterestsUsers;
        if (interests) {
            filteredInterestsUsers = filteredAgeUsers.filter((user) => {
                return interestsNumber.every((interest) => user.interests.includes(interest));
            });
        }
        else {
            filteredInterestsUsers = filteredAgeUsers;
        }
        function geographicalScore(user) {
            const dist = (0, userUtils_1.calculateDistance)(activeUser.location, user.location);
            if (dist <= 50) {
                user.note += 10;
            }
            else if (dist <= 100) {
                user.note += 8;
            }
            else if (dist <= 150) {
                user.note += 6;
            }
            else if (dist <= 200) {
                user.note += 4;
            }
            else {
                user.note += 2;
            }
        }
        function popularityScore(user) {
            if (user.popularity <= 50) {
                user.note += 1;
            }
            else if (user.popularity <= 100) {
                user.note += 3;
            }
            else if (user.popularity <= 150) {
                user.note += 4;
            }
            else if (user.popularity <= 200) {
                user.note += 5;
            }
            else if (user.popularity <= 250) {
                user.note += 6;
            }
            else if (user.popularity <= 300) {
                user.note += 7;
            }
            else if (user.popularity <= 350) {
                user.note += 8;
            }
            else if (user.popularity <= 400) {
                user.note += 9;
            }
            else if (user.popularity <= 450) {
                user.note += 10;
            }
            else {
                user.note += 13;
            }
        }
        function findCommonTags(tags1, tags2) {
            const tags1Ids = tags1.map((tag) => tag.tag_id);
            const commonTags = tags2.filter((tag) => tags1Ids.includes(tag));
            return commonTags.length;
        }
        function tagScore(user) {
            return __awaiter(this, void 0, void 0, function* () {
                const tagsQuery = 'SELECT user_tag.tag_id FROM user JOIN user_tag ON user.id = user_tag.user_id JOIN tag ON tag.tag_id = user_tag.tag_id WHERE user.id = ?';
                const actualUserTags = yield new Promise((resolve, reject) => {
                    connection.query(tagsQuery, id, (checkTagErr, checkTagResults) => {
                        if (checkTagErr) {
                            reject(new Error('Une erreur est survenue lors de la recuperation des tags'));
                        }
                        else {
                            resolve(checkTagResults);
                        }
                    });
                });
                const commonTags = findCommonTags(actualUserTags, user.interests);
                user.commonTags = commonTags;
                const gradeNote = [0, 2, 4, 6, 8, 10];
                user.note += gradeNote[commonTags];
            });
        }
        for (const user of filteredInterestsUsers) {
            user.note = 0;
            geographicalScore(user);
            popularityScore(user);
            yield tagScore(user);
        }
        const retArray = filteredInterestsUsers.map((obj) => ({
            id: obj.id,
            commonTags: obj.commonTags,
            note: obj.note
        }));
        let filterArray = retArray.filter((user) => user.id !== id);
        const likedQuery = 'SELECT * FROM likes WHERE id_user_source = ?';
        const likedUsers = yield new Promise((resolve, reject) => {
            connection.query(likedQuery, activeUser.id, (checkTagErr, checkTagResults) => {
                if (checkTagErr) {
                    reject(new Error('Une erreur est survenue lors de la recuperation des tags'));
                }
                else {
                    resolve(checkTagResults);
                }
            });
        });
        const removeLikedUserArray = filterArray.filter((item) => !likedUsers.some((likedUser) => likedUser.id_user_target === item.id));
        const blockedQuery = 'SELECT * FROM blockUser WHERE id_user_source = ?';
        const blockedUsers = yield new Promise((resolve, reject) => {
            connection.query(blockedQuery, activeUser.id, (checkTagErr, checkTagResults) => {
                if (checkTagErr) {
                    reject(new Error('Une erreur est survenue lors de la recuperation des tags'));
                }
                else {
                    resolve(checkTagResults);
                }
            });
        });
        const removeBlockedUserArray = removeLikedUserArray.filter((item) => !blockedUsers.some((likedUser) => likedUser.id_user_target === item.id));
        const secondBlockedQuery = 'SELECT * FROM blockUser WHERE id_user_target = ?';
        const secondBlockedUsers = yield new Promise((resolve, reject) => {
            connection.query(secondBlockedQuery, activeUser.id, (checkTagErr, checkTagResults) => {
                if (checkTagErr) {
                    reject(new Error('Une erreur est survenue lors de la recuperation des tags'));
                }
                else {
                    resolve(checkTagResults);
                }
            });
        });
        const removeSecondBlockedUserArray = removeBlockedUserArray.filter((item) => !secondBlockedUsers.some((likedUser) => likedUser.id_user_source === item.id));
        removeSecondBlockedUserArray.sort((a, b) => b.note - a.note);
        const finalArray = removeSecondBlockedUserArray.slice(0, 200);
        finalArray.sort((a, b) => a.id - b.id);
        return res.json(finalArray);
    }
    catch (error) {
        return res.status(500).json({ message: 'Error retrieving suggestions' });
    }
});
exports.getSuggestions = getSuggestions;
const getTags = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const query = 'SELECT * FROM tag';
        const tags = yield new Promise((resolve, reject) => {
            connection.query(query, (err, results) => {
                if (err) {
                    reject(new Error('Erreur lors de l\'exécution de la requête'));
                }
                else {
                    resolve(results);
                }
            });
        });
        return res.json(tags);
    }
    catch (error) {
        return res.status(500).json({ message: 'Error while retrieving tags' });
    }
});
exports.getTags = getTags;
const getRelation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _t;
    const id = (_t = req.user) === null || _t === void 0 ? void 0 : _t.userId;
    const { userId } = req.params;
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const query = 'SELECT * FROM likes WHERE (id_user_source = ? AND id_user_target = ?) \
		OR (id_user_source = ? AND id_user_target = ?)';
        const relation = yield new Promise((resolve, reject) => {
            connection.query(query, [id, userId, userId, id], (err, results) => {
                if (err) {
                    reject(new Error('Erreur lors de l\'exécution de la requête'));
                }
                else {
                    resolve(results);
                }
            });
        });
        return res.json(relation);
    }
    catch (error) {
        return res.status(500).json({ message: 'Error' });
    }
});
exports.getRelation = getRelation;
const getConversationsByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _u;
    const id = (_u = req.user) === null || _u === void 0 ? void 0 : _u.userId;
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const query = 'SELECT\
		c.conversation_id,\
		c.user1_id,\
		c.user2_id,\
		c.creation_date,\
		pm.message_id AS last_message_id,\
		pm.sender_id AS last_message_sender_id,\
		pm.recipient_id AS last_message_recipient_id,\
		pm.message_content AS last_message_content,\
		pm.timestamp AS last_message_timestamp\
		FROM\
		conversations AS c\
		LEFT JOIN\
		privateMessages AS pm ON c.conversation_id = pm.conversation_id\
		AND pm.timestamp = (\
			SELECT MAX(timestamp) FROM privateMessages WHERE conversation_id = c.conversation_id\
		)\
		WHERE\
		c.user1_id = ? OR c.user2_id = ?';
        const conversations = yield new Promise((resolve, reject) => {
            connection.query(query, [id, id], (err, results) => {
                if (err) {
                    reject(new Error('Erreur lors de l\'exécution de la requête'));
                }
                else {
                    resolve(results);
                }
            });
        });
        const conversationIdMap = new Map();
        const resultat = conversations.reduce((acc, objet) => {
            if (!conversationIdMap.has(objet.conversation_id)) {
                conversationIdMap.set(objet.conversation_id, true);
                acc.push(objet);
            }
            return acc;
        }, []);
        return res.json(resultat);
    }
    catch (error) {
        return res.status(500).json({ message: 'Error' });
    }
});
exports.getConversationsByUserId = getConversationsByUserId;
const getConversationById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _v;
    const id = (_v = req.user) === null || _v === void 0 ? void 0 : _v.userId;
    const { convId } = req.params;
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const query = 'SELECT * FROM conversations WHERE conversation_id = ?';
        const conversation = yield new Promise((resolve, reject) => {
            connection.query(query, convId, (err, results) => {
                if (err) {
                    reject(new Error('Erreur lors de l\'exécution de la requête'));
                }
                else {
                    resolve(results);
                }
            });
        });
        return res.json(conversation[0]);
    }
    catch (error) {
        return res.status(500).json({ message: 'Error' });
    }
});
exports.getConversationById = getConversationById;
const getMessagesById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _w;
    const id = (_w = req.user) === null || _w === void 0 ? void 0 : _w.userId;
    const { convId } = req.params;
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const query = 'SELECT privateMessages.conversation_id, privateMessages.sender_id, privateMessages.recipient_id, privateMessages.message_content, privateMessages.timestamp FROM privateMessages WHERE privateMessages.conversation_id = ? ORDER BY privateMessages.timestamp';
        const messages = yield new Promise((resolve, reject) => {
            connection.query(query, convId, (err, results) => {
                if (err) {
                    reject(new Error('Erreur lors de l\'exécution de la requête'));
                }
                else {
                    resolve(results);
                }
            });
        });
        return res.json(messages);
    }
    catch (error) {
        return res.status(500).json({ message: 'Error' });
    }
});
exports.getMessagesById = getMessagesById;
const getLastMessageById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _x;
    const id = (_x = req.user) === null || _x === void 0 ? void 0 : _x.userId;
    const { convId } = req.params;
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const query = 'SELECT message_content FROM privateMessages WHERE conversation_id = ? ORDER BY timestamp DESC LIMIT 1;';
        const message = yield new Promise((resolve, reject) => {
            connection.query(query, convId, (err, results) => {
                if (err) {
                    reject(new Error('Erreur lors de l\'exécution de la requête'));
                }
                else {
                    resolve(results);
                }
            });
        });
        return res.json(message[0]);
    }
    catch (error) {
        return res.status(500).json({ message: 'Error' });
    }
});
exports.getLastMessageById = getLastMessageById;
const updateNotificationsMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _y;
    const id = (_y = req.user) === null || _y === void 0 ? void 0 : _y.userId;
    const { notifications } = req.body;
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const query = 'DELETE FROM notificationsMessages WHERE user_id = ?;';
        yield new Promise((resolve, reject) => {
            connection.query(query, id, (err, results) => {
                if (err) {
                    reject(new Error('Erreur lors de l\'exécution de la requête updateNotificationsMessages'));
                }
                else {
                    resolve(results);
                }
            });
        });
        for (const notif of notifications) {
            const query = 'INSERT INTO notificationsMessages (user_id, user_id_source, conversation_id, message_content)\
			VALUES (?, ?, ?, ?);';
            yield new Promise((resolve, reject) => {
                connection.query(query, [id, notif.sender_id, notif.conversation_id, notif.message_content], (err, results) => {
                    if (err) {
                        reject(new Error('Erreur lors de l\'exécution de la requête updateNotificationsMessages'));
                    }
                    else {
                        resolve(results);
                    }
                });
            });
        }
        return res.json({ message: 'OK' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error' });
    }
});
exports.updateNotificationsMessages = updateNotificationsMessages;
const getNotificationsMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _z;
    const id = (_z = req.user) === null || _z === void 0 ? void 0 : _z.userId;
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const query = 'SELECT * FROM notificationsMessages WHERE user_id = ?;';
        const notifications = yield new Promise((resolve, reject) => {
            connection.query(query, id, (err, results) => {
                if (err) {
                    reject(new Error('Erreur lors de l\'exécution de la requête getNotificationsMessages'));
                }
                else {
                    resolve(results);
                }
            });
        });
        const combinedBlockedQuery = 'SELECT * FROM blockUser WHERE id_user_source = ? OR id_user_target = ?';
        const blockedUsers = yield new Promise((resolve, reject) => {
            connection.query(combinedBlockedQuery, [id, id], (checkTagErr, checkTagResults) => {
                if (checkTagErr) {
                    reject(new Error('Une erreur est survenue lors de la récupération users bloques'));
                }
                else {
                    resolve(checkTagResults);
                }
            });
        });
        const removeBlockedUserArray = notifications.filter((item) => !blockedUsers.some((blockedUser) => (blockedUser.id_user_source === item.user_id_source &&
            blockedUser.id_user_target === id) ||
            (blockedUser.id_user_source === id &&
                blockedUser.id_user_target === item.user_id_source)));
        return res.json(removeBlockedUserArray);
    }
    catch (error) {
        return res.status(500).json({ message: 'Error' });
    }
});
exports.getNotificationsMessages = getNotificationsMessages;
const getNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _0;
    const id = (_0 = req.user) === null || _0 === void 0 ? void 0 : _0.userId;
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const query = 'SELECT * FROM notifications WHERE user_target_id = ?;';
        const notifications = yield new Promise((resolve, reject) => {
            connection.query(query, id, (err, results) => {
                if (err) {
                    reject(new Error('Erreur lors de l\'exécution de la requête'));
                }
                else {
                    resolve(results);
                }
            });
        });
        const combinedBlockedQuery = 'SELECT * FROM blockUser WHERE id_user_source = ? OR id_user_target = ?';
        const blockedUsers = yield new Promise((resolve, reject) => {
            connection.query(combinedBlockedQuery, [id, id], (checkTagErr, checkTagResults) => {
                if (checkTagErr) {
                    reject(new Error('Une erreur est survenue lors de la récupération des tags'));
                }
                else {
                    resolve(checkTagResults);
                }
            });
        });
        const removeBlockedUserArray = notifications.filter((item) => !blockedUsers.some((blockedUser) => blockedUser.id_user_source === item.user_source_id ||
            blockedUser.id_user_target === item.user_source_id));
        return res.json(removeBlockedUserArray);
    }
    catch (error) {
        return res.status(500).json({ message: 'Error' });
    }
});
exports.getNotifications = getNotifications;
const getLikes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _1;
    const id = (_1 = req.user) === null || _1 === void 0 ? void 0 : _1.userId;
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const query = 'SELECT * FROM likes WHERE id_user_target = ?;';
        const likes = yield new Promise((resolve, reject) => {
            connection.query(query, id, (err, results) => {
                if (err) {
                    reject(new Error('Erreur lors de l\'exécution de la requête'));
                }
                else {
                    resolve(results);
                }
            });
        });
        const combinedBlockedQuery = 'SELECT * FROM blockUser WHERE id_user_source = ? OR id_user_target = ?';
        const blockedUsers = yield new Promise((resolve, reject) => {
            connection.query(combinedBlockedQuery, [id, id], (checkTagErr, checkTagResults) => {
                if (checkTagErr) {
                    reject(new Error('Une erreur est survenue lors de la récupération des tags'));
                }
                else {
                    resolve(checkTagResults);
                }
            });
        });
        const removeBlockedUserArray = likes.filter((item) => !blockedUsers.some((blockedUser) => blockedUser.id_user_source === item.id_user_source ||
            blockedUser.id_user_target === item.id_user_source));
        return res.json(removeBlockedUserArray);
    }
    catch (error) {
        return res.status(500).json({ message: 'Error' });
    }
});
exports.getLikes = getLikes;
const getHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _2;
    const id = (_2 = req.user) === null || _2 === void 0 ? void 0 : _2.userId;
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const query = 'SELECT * FROM history WHERE id_user_target = ?;';
        const history = yield new Promise((resolve, reject) => {
            connection.query(query, id, (err, results) => {
                if (err) {
                    reject(new Error('Erreur lors de l\'exécution de la requête'));
                }
                else {
                    resolve(results);
                }
            });
        });
        const combinedBlockedQuery = 'SELECT * FROM blockUser WHERE id_user_source = ? OR id_user_target = ?';
        const blockedUsers = yield new Promise((resolve, reject) => {
            connection.query(combinedBlockedQuery, [id, id], (checkTagErr, checkTagResults) => {
                if (checkTagErr) {
                    reject(new Error('Une erreur est survenue lors de la récupération des tags'));
                }
                else {
                    resolve(checkTagResults);
                }
            });
        });
        const removeBlockedUserArray = history.filter((item) => !blockedUsers.some((blockedUser) => blockedUser.id_user_source === item.id_user_source ||
            blockedUser.id_user_target === item.id_user_source));
        return res.json(removeBlockedUserArray);
    }
    catch (error) {
        return res.status(500).json({ message: 'Error' });
    }
});
exports.getHistory = getHistory;
const setReadNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _3;
    const id = (_3 = req.user) === null || _3 === void 0 ? void 0 : _3.userId;
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const query = 'UPDATE notifications SET is_read = true WHERE user_target_id = ?;';
        yield new Promise((resolve, reject) => {
            connection.query(query, id, (err, results) => {
                if (err) {
                    reject(new Error('Erreur lors de l\'exécution de la requête'));
                }
                else {
                    resolve(results);
                }
            });
        });
        return res.json({ message: 'OK' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error' });
    }
});
exports.setReadNotifications = setReadNotifications;
const reportUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _4;
    const id = (_4 = req.user) === null || _4 === void 0 ? void 0 : _4.userId;
    const { idUserBlock } = req.body;
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const query = 'INSERT INTO reportUser (id_user_source, id_user_target)\
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
        yield (0, db_1.updatePopularityScore)(idUserBlock, -25);
        return res.json({ message: 'OK' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error' });
    }
});
exports.reportUser = reportUser;
const getBlockList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _5;
    const id = (_5 = req.user) === null || _5 === void 0 ? void 0 : _5.userId;
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const query = 'SELECT id_user_target FROM blockUser WHERE id_user_source = ?';
        const blockList = yield new Promise((resolve, reject) => {
            connection.query(query, id, (err, results) => {
                if (err) {
                    reject(new Error('Erreur lors de l\'exécution de la requête'));
                }
                else {
                    resolve(results);
                }
            });
        });
        return res.json(blockList);
    }
    catch (error) {
        return res.status(500).json({ message: 'Error' });
    }
});
exports.getBlockList = getBlockList;
const delBlockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _6;
    const id = (_6 = req.user) === null || _6 === void 0 ? void 0 : _6.userId;
    const { idUserBlock } = req.body;
    try {
        const connection = (0, connectionDb_1.getConnection)();
        yield new Promise((resolve, reject) => {
            const insertQuery = 'DELETE FROM blockUser WHERE id_user_source = ? AND id_user_target = ?';
            const values = [id, idUserBlock];
            connection.query(insertQuery, values, (error) => {
                if (error) {
                    reject(new Error('Error'));
                }
                else {
                    resolve();
                }
            });
        });
        return res.json({ message: 'OK' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error' });
    }
});
exports.delBlockUser = delBlockUser;
const getMutualBlockCheck = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _7;
    const id = (_7 = req.user) === null || _7 === void 0 ? void 0 : _7.userId;
    const { idUser } = req.params;
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const query = 'SELECT * FROM blockUser WHERE id_user_source = ? AND id_user_target = ? OR \
		id_user_target = ? AND id_user_source = ?';
        const blockList = yield new Promise((resolve, reject) => {
            connection.query(query, [id, idUser, id, idUser], (err, results) => {
                if (err) {
                    reject(new Error('Erreur lors de l\'exécution de la requête'));
                }
                else {
                    resolve(results);
                }
            });
        });
        return res.json(blockList);
    }
    catch (error) {
        return res.status(500).json({ message: 'Error' });
    }
});
exports.getMutualBlockCheck = getMutualBlockCheck;
