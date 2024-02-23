import { getConnection } from "./connectionDb";

export const insertMessage = async (conversation_id: number, message_content: string, recipient_id: number, sender_id: number) => {
	try {

		const connection = getConnection();

		const convQuery = 'SELECT * FROM privateMessages WHERE conversation_id = ?';
		
		const conv: any = await new Promise((resolve, reject) => {
			connection.query(convQuery, conversation_id, (err: any, results: any) => {
				if (err) {
					reject(new Error('Erreur lors de l\'exécution de la requête'));
				} else {
					resolve(results);
				}
			});
		});

		const notFirstMessage = conv.some((obj: any) => {
			return obj.sender_id === sender_id;
		});

		if (conv.length === 0) {
			await updatePopularityScore(sender_id, 10);
		} else if (!notFirstMessage) {
			await updatePopularityScore(sender_id, 5);
		}

		const query = 'INSERT INTO privateMessages (conversation_id, sender_id, recipient_id, message_content, timestamp) VALUES (?, ?, ?, ?, NOW())';
		
		await new Promise((resolve, reject) => {
			connection.query(query, [conversation_id, sender_id, recipient_id, message_content], (err: any, results: any) => {
				if (err) {
					reject(new Error('Erreur lors de l\'exécution de la requête'));
				} else {
					resolve(results);
				}
			});
		});
	} catch (error) {
		console.log('Erreur lors de l\'exécution de la requête');
	}
}

export const insertLike = async (id_user_source: number, id_user_target: number) => {

	try {
		const connection = getConnection();

		await new Promise<void>((resolve, reject) => {
				const insertQuery = 'INSERT INTO likes (id_user_source, id_user_target) VALUES (?, ?)';
				const values = [id_user_source, id_user_target];

				connection.query(insertQuery, values, (error) => {
					if (error) {
						reject(new Error('Error occurred while liked user'));
					} else {
						resolve();
					}
				});
		});
	} catch (error) {
		console.log('Erreur lors de l\'exécution de la requête');
	}
}

export const deleteLike = async (id_user_source: number, id_user_target: number) => {

	try {
		const connection = getConnection();

		await new Promise<void>((resolve, reject) => {
				const insertQuery = 'DELETE FROM likes WHERE id_user_source = ? AND id_user_target = ?';
				const values = [id_user_source, id_user_target];

				connection.query(insertQuery, values, (error) => {
					if (error) {
						reject(new Error('Error occurred while dislike user'));
					} else {
						resolve();
					}
				});
		});
	} catch (error) {
		console.log('Erreur lors de l\'exécution de la requête');
	}
}

export const insertNotif = async (id_user_source: number, id_user_target: number, notification: string) => {

	try {
		const connection = getConnection();

		await new Promise<void>((resolve, reject) => {
				const insertQuery = 'INSERT INTO notifications (user_source_id, user_target_id, notification_type, timestamp)\
				VALUES (?, ?, ?, NOW());';
				const values = [id_user_source, id_user_target, notification];

				connection.query(insertQuery, values, (error) => {
					if (error) {
						reject(new Error('Erreur lors de l\'exécution de la requête'));
					} else {
						resolve();
					}
				});
		});
	} catch (error) {
		console.log('Erreur lors de l\'exécution de la requête');
	}
}

export const getRelaion = async (id_user_source: number, id_user_target: number) => {

	try {
		const connection = getConnection();

		const relation = await new Promise((resolve, reject) => {
			const query = 'SELECT * FROM likes WHERE (id_user_source = ? AND id_user_target = ?) \
			OR (id_user_source = ? AND id_user_target = ?)';

			connection.query(query, [id_user_source, id_user_target, id_user_target, id_user_source], (err: any, results: any) => {
				if (err) {
					reject(new Error('Erreur lors de l\'exécution de la requête'));
				} else {
					resolve(results);
				}
			});
		});
		return relation;
	} catch (error) {
		console.log('Erreur lors de l\'exécution de la requête');
	}
}

export const createChannel = async (id_user_source: number, id_user_target: number) => {

	try {
		const connection = getConnection();

		const channel: any = await new Promise((resolve, reject) => {
			const query = 'SELECT * FROM conversations WHERE user1_id = ? AND user2_id = ? OR user1_id = ? and user2_id = ?';

			connection.query(query, [id_user_source, id_user_target, id_user_target, id_user_source], (err: any, results: any) => {
				if (err) {
					reject(new Error('Erreur lors de l\'exécution de la requête'));
				} else {
					resolve(results);
				}
			});
		});
		
		if (channel.length === 1) {
			return ;
		}

		await new Promise((resolve, reject) => {
			const query = 'INSERT INTO conversations (user1_id, user2_id, creation_date) VALUES (?, ?, NOW())';

			connection.query(query, [id_user_source, id_user_target], (err: any, results: any) => {
				if (err) {
					reject(new Error('Erreur lors de l\'exécution de la requête'));
				} else {
					resolve(results);
				}
			});
		});

	} catch (error) {
		console.log('Erreur lors de l\'exécution de la requête');
	}
}

export const deleteChannel = async (id_user_source: number, id_user_target: number) => {

	try {
		const connection = getConnection();

		const channel: any = await new Promise((resolve, reject) => {
			const query = 'SELECT * FROM conversations WHERE user1_id = ? AND user2_id = ? OR user1_id = ? and user2_id = ?';

			connection.query(query, [id_user_source, id_user_target, id_user_target, id_user_source], (err: any, results: any) => {
				if (err) {
					reject(new Error('Erreur lors de l\'exécution de la requête'));
				} else {
					resolve(results);
				}
			});
		});
		if (channel.length !== 1) {
			return ;
		}

		await updatePopularityScore(id_user_source, -30);
		await updatePopularityScore(id_user_target, -30);

		const channelId = channel[0].conversation_id;

		await new Promise((resolve, reject) => {
			const query = 'DELETE from privateMessages WHERE conversation_id = ?';

			connection.query(query, [channelId], (err: any, results: any) => {
				if (err) {
					reject(new Error('Erreur lors de l\'exécution de la requête'));
				} else {
					resolve(results);
				}
			});
		});

		await new Promise((resolve, reject) => {
			const query = 'DELETE from conversations WHERE conversation_id = ?';

			connection.query(query, [channelId], (err: any, results: any) => {
				if (err) {
					reject(new Error('Erreur lors de l\'exécution de la requête'));
				} else {
					resolve(results);
				}
			});
		});

	} catch (error) {
		console.log('Erreur lors de l\'exécution de la requête');
	}
}

export const insertHistory = async (id_user_source: number, id_user_target: number) => {

	try {
		const connection = getConnection();

		await new Promise<void>((resolve, reject) => {
				const insertQuery = 'INSERT INTO history (id_user_source, id_user_target) VALUES (?, ?)';
				const values = [id_user_source, id_user_target];

				connection.query(insertQuery, values, (error) => {
					if (error) {
						reject(new Error('Error occurred while insert visit'));
					} else {
						resolve();
					}
				});
		});
	} catch (error) {
		console.log('Erreur lors de l\'exécution de la requête');
	}
}

export const userConnected = async (idUser: number) => {

	try {
		const connection = getConnection();
		const currentDateTime: any = new Date();
		const localDateTime = currentDateTime.toISOString().replace('T', ' ').slice(0, 19);

		await new Promise<void>((resolve, reject) => {
				const insertQuery = 'UPDATE user SET online = ?, lastConnection = ? WHERE id = ?';
				const values = [true, localDateTime, idUser];

				connection.query(insertQuery, values, (error) => {
					if (error) {
						reject(new Error('Error'));
					} else {
						resolve();
					}
				});
		});
	} catch (error) {
		console.log('Erreur lors de l\'exécution de la requête:', error);
	}
}

export const userDisonnected = async (idUser: number) => {

	try {
		const connection = getConnection();
		const currentDateTime: any = new Date();
		const localDateTime = currentDateTime.toISOString().replace('T', ' ').slice(0, 19);

		await new Promise<void>((resolve, reject) => {
				const insertQuery = 'UPDATE user SET online = ?, lastConnection = ? WHERE id = ?';
				const values = [false, localDateTime, idUser];

				connection.query(insertQuery, values, (error) => {
					if (error) {
						reject(new Error('Error'));
					} else {
						resolve();
					}
				});
		});
	} catch (error) {
		console.log('Erreur lors de l\'exécution de la requête:', error);
	}
}

export const blockUser = async (id: any, idUserBlock: any) => {

	try {

		await deleteChannel(id, idUserBlock);
		await deleteLike(id, idUserBlock);

		const connection = getConnection();

			const query = 'INSERT INTO blockUser (id_user_source, id_user_target)\
			VALUES (?, ?);';

			await new Promise((resolve, reject) => {
				connection.query(query, [id, idUserBlock], (err: any, results: any) => {
					if (err) {
						reject(new Error('Erreur lors de l\'exécution de la requête'));
					} else {
						resolve(results);
					}
				});
			});

	} catch (error) {
		console.log(error);
	}
}

export const deleteNotifsMessages = async (id: any, idUserBlock: any) => {

	try {

		await deleteChannel(id, idUserBlock);
		await deleteLike(id, idUserBlock);

		const connection = getConnection();

			const query = 'DELETE FROM notificationsMessages \
			WHERE (user_id_source = ? AND user_id = ?) OR\
			(user_id_source = ? AND user_id = ?);';

			await new Promise((resolve, reject) => {
				connection.query(query, [id, idUserBlock, idUserBlock, id], (err: any, results: any) => {
					if (err) {
						reject(new Error('Erreur lors de l\'exécution de la requête'));
					} else {
						resolve(results);
					}
				});
			});

	} catch (error) {
		console.log(error);
	}
}

export const updatePopularityScore = async (id:number, score: number) => {

	try {
		const connection = getConnection();

			const query = 'SELECT * FROM user WHERE id = ?';

			const user: any = await new Promise((resolve, reject) => {
				connection.query(query, [id], (err: any, results: any) => {
					if (err) {
						reject(new Error('Erreur lors de l\'exécution de la requête'));
					} else {
						resolve(results);
					}
				});
			});

			if (user.length === 0) {
				return ;
			}

			let newScore = user[0].popularity + score;

			if (newScore < 0) {
				newScore = 0;
			} else if (newScore > 1000) {
				newScore = 1000;
			}

			const popularityQuery = 'UPDATE user SET popularity = ? WHERE id = ?';

			await new Promise((resolve, reject) => {
				connection.query(popularityQuery, [newScore, id], (err: any, results: any) => {
					if (err) {
						reject(new Error('Erreur lors de l\'exécution de la requête'));
					} else {
						resolve(results);
					}
				});
			});

	} catch (error) {
		console.log(error);
	}
}

export const addNotifMessage = async (id: any, conversation_id: any, sender_id: any, message_content: any) => {

	try {

		const connection = getConnection();

		const query = 'INSERT INTO notificationsMessages (user_id, conversation_id, user_id_source, message_content)\
		VALUES (?, ?, ?, ?);';

			await new Promise((resolve, reject) => {
				connection.query(query, [id, conversation_id, sender_id, message_content], (err: any, results: any) => {
					if (err) {
						reject(new Error('Erreur lors de l\'exécution de la requête'));
					} else {
						resolve(results);
					}
				});
			});

	} catch (error) {
		console.log(error);
	}
}