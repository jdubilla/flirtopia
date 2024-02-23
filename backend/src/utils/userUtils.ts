import { getConnection } from "../services/connectionDb";

export function calculateDistance(user1: string, user2: string): number {
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

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const distance = R * c;

	return parseFloat(distance.toFixed(1));
}

export async function isBlocked(idUser1: string, idUser2: string) {
	try {
		const connection = getConnection();
		const combinedBlockedQuery = 'SELECT * FROM blockUser WHERE id_user_source = ? OR id_user_target = ?';

		const blockedUsers: any = await new Promise((resolve, reject) => {
			connection.query(combinedBlockedQuery, [idUser1, idUser1], (checkTagErr: any, checkResults: any) => {
				if (checkTagErr) {
					reject(new Error('Une erreur est survenue'));
				} else {
					resolve(checkResults);
				}
			}
			);
		});

		const containId = blockedUsers.some((obj: any) => {
			return obj.id_user_source === idUser2 || obj.id_user_target === idUser2;
		});

		return containId;
	} catch (error) {
		console.log(error);
	}
}
