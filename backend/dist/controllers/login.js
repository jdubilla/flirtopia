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
exports.resetPassword = exports.verifyTokenEmail = exports.checkToken = exports.signup = exports.signin = void 0;
const connectionDb_1 = require("../services/connectionDb");
const token_1 = require("../utils/token");
const argon2_1 = __importDefault(require("argon2"));
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            throw new Error('Missing required parameters');
        }
        const connection = (0, connectionDb_1.getConnection)();
        const sql = 'SELECT * FROM user WHERE username = ?;';
        const queryAsync = () => {
            return new Promise((resolve, reject) => {
                connection.query(sql, username, (err, results) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(results);
                    }
                });
            });
        };
        const results = yield queryAsync();
        if (results.length === 0) {
            res.status(401).json({ error: 'User not found' });
        }
        else {
            const user = results[0];
            const storedPassword = user.password;
            const isMatch = yield argon2_1.default.verify(storedPassword, password);
            if (isMatch) {
                const token = (0, token_1.generateJWT)(user.id);
                return res.json({ token: token });
            }
            else {
                res.status(401).json({ error: 'Incorrect username or password' });
            }
        }
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.signin = signin;
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, firstName, lastName, password } = req.body;
    if (!username || !firstName || !lastName || !password) {
        return res.status(401).json({ error: 'Missing required parameters.' });
    }
    const connection = (0, connectionDb_1.getConnection)();
    const checkUserQuery = 'SELECT * FROM user WHERE username = ?';
    try {
        const checkUserResult = yield new Promise((resolve, reject) => {
            connection.query(checkUserQuery, username, (checkUserErr, checkUserResults) => {
                if (checkUserErr) {
                    reject(new Error('Une erreur est survenue lors de la vérification du nom d\'utilisateur.'));
                }
                else {
                    resolve(checkUserResults);
                }
            });
        });
        if (checkUserResult.length > 0) {
            return res.status(409).json({ error: 'Username already taken.' });
        }
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal server error. Please try again later.' });
    }
    const hashedPassword = yield argon2_1.default.hash(password);
    const sql = 'INSERT INTO user (username, firstName, lastName, password) VALUES (?, ?, ?, ?);';
    const values = [username, firstName, lastName, hashedPassword];
    connection.query(sql, values, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Internal error, please try again later' });
        }
        const token = (0, token_1.generateJWT)(result.insertId);
        return res.json({ token: token });
    });
});
exports.signup = signup;
const checkToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        const secretKey = process.env.SECRET_JWT;
        if (!secretKey) {
            throw new Error('La clé secrète JWT est manquante dans les variables d\'environnement.');
        }
        if (!token) {
            return res.status(401).json({ error: 'No token provided.' });
        }
        const user = yield (0, token_1.verifyToken)(token, secretKey);
        return res.status(200).json(user);
    }
    catch (error) {
        return res.status(403).json({ error: 'Invalid token.' });
    }
});
exports.checkToken = checkToken;
const verifyTokenEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.query.token;
    try {
        const connection = (0, connectionDb_1.getConnection)();
        const getUserQuery = 'SELECT * FROM user WHERE verified_token = ?';
        const idUserVerified = yield new Promise((resolve, reject) => {
            connection.query(getUserQuery, [token], (err, results) => {
                if (err) {
                    reject(new Error('Error occurred while updating password'));
                }
                else {
                    resolve(results);
                }
            });
        });
        if (idUserVerified.length === 0) {
            return res.status(500).json({ error: 'Error: invalid Token' });
        }
        const verifiedQuery = 'UPDATE user SET verified = TRUE, verified_token = NULL WHERE id = ?';
        yield new Promise((resolve, reject) => {
            connection.query(verifiedQuery, idUserVerified[0].id, (err, results) => {
                if (err) {
                    reject(new Error('Error occurred while updating password'));
                }
                else {
                    resolve(results);
                }
            });
        });
        const tokenJWT = (0, token_1.generateJWT)(idUserVerified[0].id);
        return res.json({ message: 'Your account is now verified', token: tokenJWT });
    }
    catch (error) {
        return res.status(500).json({ error: 'Error: invalid Token' });
    }
});
exports.verifyTokenEmail = verifyTokenEmail;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, confPassword, token } = req.body;
    try {
        const connection = (0, connectionDb_1.getConnection)();
        if (password !== confPassword) {
            return res.status(400).json({ error: 'Passwords must be the same' });
        }
        const userQuery = 'SELECT id FROM user WHERE password_token = ?';
        const user = yield new Promise((resolve, reject) => {
            connection.query(userQuery, token, (err, results) => {
                if (err) {
                    reject(new Error('Une erreur est survenue'));
                }
                else {
                    resolve(results);
                }
            });
        });
        if (user.length === 0) {
            return res.status(404).json({ error: 'Wrong token' });
        }
        const hashedPassword = yield argon2_1.default.hash(password);
        const updateUsernameQuery = 'UPDATE user SET password = ? WHERE id = ?';
        yield new Promise((resolve, reject) => {
            connection.query(updateUsernameQuery, [hashedPassword, user[0].id], (err, results) => {
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
        return res.status(500).json({ error: 'Error: invalid Token' });
    }
});
exports.resetPassword = resetPassword;
