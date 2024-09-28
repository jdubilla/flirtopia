import { Request, Response } from 'express';
import { getConnection } from '../services/connectionDb';
import { generateJWT, verifyToken } from '../utils/token';
import { SentMessageInfo } from 'nodemailer';
import nodemailer from 'nodemailer';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

export const signin = async (req: Request, res: Response) => {
	try {
		const { username, password } = req.body;
		
		if (!username || !password) {
			throw new Error('Missing required parameters');
		}
		
		const connection = getConnection();

		const sql = 'SELECT * FROM user WHERE username = ?;';

		const queryAsync = () => {
			return new Promise((resolve, reject) => {
				connection.query(sql, username, (err: any, results: any) => {
					if (err) {
						reject(err);
					} else {
						resolve(results);
					}
				});
			});
		};

		const results: any = await queryAsync();

		if (results.length === 0) {
			res.status(401).json({ error: 'User not found' });
		} else {
			const user = results[0];
			const storedPassword = user.password;
			const isMatch = await argon2.verify(storedPassword, password);
			if (isMatch) {
				const token = generateJWT(user.id);
				return res.json({ token: token });
			} else {
				res.status(401).json({ error: 'Incorrect username or password' });
			}
		}
	} catch (error: any) {
		res.status(400).json({ error: error.message });
	}
};

export const signup = async (req: Request, res: Response) => {
	const { username, firstName, lastName, password } = req.body;

	if (!username || !firstName || !lastName || !password) {
		return res.status(401).json({ error: 'Missing required parameters.' });
	}

	const connection = getConnection();

	const checkUserQuery = 'SELECT * FROM user WHERE username = ?';
	try {
		const checkUserResult: any = await new Promise((resolve, reject) => {
			connection.query(checkUserQuery, username, (checkUserErr: any, checkUserResults: any) => {
				if (checkUserErr) {
					reject(new Error('Une erreur est survenue lors de la vérification du nom d\'utilisateur.'));
				} else {
					resolve(checkUserResults);
				}
			});
		});
		if (checkUserResult.length > 0) {
			return res.status(409).json({ error: 'Username already taken.' });
		}
	} catch (error) {
		return res.status(500).json({ error: 'Internal server error. Please try again later.' });
	}

	const hashedPassword = await argon2.hash(password);
	const sql = 'INSERT INTO user (username, firstName, lastName, password) VALUES (?, ?, ?, ?);';
	const values = [username, firstName, lastName, hashedPassword];

	connection.query(sql, values, (err: any, result: any) => {
		if (err) {
			return res.status(500).json({ error: 'Internal error, please try again later' });
		}
		const token = generateJWT(result.insertId);
		return res.json({ token: token });
	});
};

export const checkToken = async (req: Request, res: Response ) => {
	try {
		const token = req.header('Authorization')?.replace('Bearer ', '');
		const secretKey = process.env.SECRET_JWT;

		if (!secretKey) {
			throw new Error('La clé secrète JWT est manquante dans les variables d\'environnement.');
		}

		if (!token) {
			return res.status(401).json({ error: 'No token provided.' });
		}

		const user = await verifyToken(token, secretKey);
		return res.status(200).json(user);
	} catch(error) {
		return res.status(403).json({ error: 'Invalid token.' });
	}
};

export const verifyTokenEmail = async (req: Request, res: Response) => {
	const token = req.query.token;

	try {
		const connection = getConnection();

		const getUserQuery = 'SELECT * FROM user WHERE verified_token = ?';

		const idUserVerified: any = await new Promise((resolve, reject) => {
			connection.query(getUserQuery, [token], (err: any, results: any) => {
				if (err) {
					reject(new Error('Error occurred while updating password'));
				} else {
					resolve(results);
				}
			});
		});

		if (idUserVerified.length === 0) {
			return res.status(500).json({ error: 'Error: invalid Token' });
		}

		const verifiedQuery = 'UPDATE user SET verified = TRUE, verified_token = NULL WHERE id = ?';

		await new Promise<void>((resolve, reject) => {
			connection.query(verifiedQuery, idUserVerified[0].id, (err: any, results: any) => {
				if (err) {
					reject(new Error('Error occurred while updating password'));
				} else {
					resolve(results);
				}
			});
		});

		const tokenJWT = generateJWT(idUserVerified[0].id);

		

		return res.json({ message: 'Your account is now verified', token: tokenJWT });
	} catch (error) {
		return res.status(500).json({ error: 'Error: invalid Token' });
	}
}

export const resetPassword = async (req: Request, res: Response) => {
	const { password, confPassword, token } = req.body;

	try {
		const connection = getConnection();

		if (password !== confPassword) {
			return res.status(400).json({ error: 'Passwords must be the same' });
		}

		const userQuery = 'SELECT id FROM user WHERE password_token = ?';

		const user: any = await new Promise((resolve, reject) => {
			connection.query(userQuery, token, (err: any, results: any) => {
				if (err) {
					reject(new Error('Une erreur est survenue'));
				} else {
					resolve(results);
				}
			});
		});

		if (user.length === 0) {
			return res.status(404).json({ error: 'Wrong token' });
		}

		const hashedPassword = await argon2.hash(password);
		const updateUsernameQuery = 'UPDATE user SET password = ? WHERE id = ?';

		await new Promise<void>((resolve, reject) => {
			connection.query(updateUsernameQuery, [hashedPassword, user[0].id], (err: any, results: any) => {
				if (err) {
					reject(new Error('Error occurred while updating password'));
				} else {
					resolve();
				}
			});
		});
		return res.json({ message: 'Password updated' });
	} catch (error) {
		return res.status(500).json({ error: 'Error: invalid Token' });
	}
}