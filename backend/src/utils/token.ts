import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export function generateJWT(userId: number) {
	const payload = {
		userId: userId,
	};

	const secretKey = process.env.SECRET_JWT;

	if (!secretKey) {
		throw new Error('La clé secrète JWT est manquante dans les variables d\'environnement.');
	}

	const token = jwt.sign(payload, secretKey);

	return token;
}

declare global {
	namespace Express {
		interface Request {
			user?: any;
		}
	}
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
	const token = req.header('Authorization')?.replace('Bearer ', '');
	const secretKey = process.env.SECRET_JWT;
	
	
	if (!secretKey) {
		throw new Error('La clé secrète JWT est manquante dans les variables d\'environnement.');
	}
	
	if (!token) {
		return res.status(401).json({ error: 'No token provided.' });
	}
	
	jwt.verify(token, secretKey, (err: any, user: any) => {
		if (err) {
			return res.status(403).json({ error: 'Invalid token.' });
		}
		
		req.user = user;
		next();
	});
};

export async function verifyToken(token: string, secretKey: string) {
	return new Promise((resolve, reject) => {
		jwt.verify(token, secretKey, (err, user) => {
			if (err) {
				reject('Invalid token.');
			} else {
				resolve(user);
			}
		});
	});
}
