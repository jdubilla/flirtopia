import { getConnection } from '../services/connectionDb';
import { Request, Response } from 'express';
import { promisify } from 'util';
import { calculateDistance } from '../utils/userUtils';
import nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer';
import sharp from 'sharp';
import imageSize from 'image-size';
import sizeOf from 'image-size';
import * as fs from 'fs';
import argon2 from 'argon2';
import { deleteChannel, deleteLike, updatePopularityScore } from '../services/db';

export const users = async (req: Request, res: Response) => {

	const connection = getConnection();
	
	const query = 'SELECT * FROM user';

	connection.query(query, (err: any, results: any) => {
		if (err) {
			res.status(500).json({ error: 'Erreur lors de la récupération des éléments.' });
		} else {
			res.json(results);
		}
	});
};

export const userById = async (req: Request, res: Response) => {

	const { id } = req.params;
	const myId = req.user?.userId;

	try {
		const connection = getConnection();
		const checkUserQuery = 'SELECT *, NULL AS password FROM user WHERE id = ?';

		const user: any = await new Promise((resolve, reject) => {
			connection.query(checkUserQuery, id, (checkUserErr: any, checkUserResults: any) => {
				if (checkUserErr) {
					reject(new Error('Une erreur est survenue lors de la vérification du nom d\'utilisateur.'));
				} else {
					resolve(checkUserResults);
				}
			});
		});
		if (!user.length) {
			return res.status(404).json({ error: 'User not found' });
		}

		const checkTagsQuery = 'SELECT user_tag.tag_id FROM user JOIN user_tag ON user.id = user_tag.user_id JOIN tag ON tag.tag_id = user_tag.tag_id WHERE user.id = ?';

		const tags: any = await new Promise((resolve, reject) => {
			connection.query(checkTagsQuery, id, (checkTagErr: any, checkTagResults: any) => {
				if (checkTagErr) {
					reject(new Error('Une erreur est survenue lors de la recuperation des tags'));
				} else {
					resolve(checkTagResults);
				}
			});
		});
		user[0].interests = tags.map((tag: any) => tag.tag_id);

		const checkImageQuery = 'SELECT photo1 FROM user WHERE id = ?';

		const photo: any = await new Promise((resolve, reject) => {
			connection.query(checkImageQuery, id, (checkimgErr: any, checkimgResults: any) => {
				if (checkimgErr) {
					reject(new Error('Une erreur est survenue lors de la recuperation des images'));
				} else {
					resolve(checkimgResults);
				}
			});
		});

		if (photo[0].photo1)
		{
			const photoTobase64 = await new Promise((resolve, reject) => {
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

		await new Promise((resolve, reject) => {
			connection.query(checkLocationQuery, myId, (checkLocationErr: any, checkLocationResults: any) => {
				if (checkLocationErr) {
					reject(new Error('Une erreur est survenue lors de la recuperation de la localisation'));
				} else {
					const distance = calculateDistance(user[0].location, checkLocationResults[0].location);
					user[0].distance = distance;
					resolve(checkLocationResults);
				}
			});
		});

		const checkReportQuery = 'SELECT * FROM reportUser WHERE id_user_source = ? AND id_user_target = ?;';
			
		await new Promise((resolve, reject) => {
			connection.query(checkReportQuery, [myId, id], (reportErr: any, reportResults: any) => {
				if (reportErr) {
					reject(new Error('Une erreur est survenue lors de la recuperation de la localisation'));
				} else {
					if (reportResults.length > 0) {
						user[0].report = true;
					} else {
						user[0].report = false;
					}
					resolve(reportResults);
				}
			});
		});


		function getAge() {
			const birth: any = new Date(user[0].birth);
			const currentDate: any = new Date();
			const differenceInMillisec = currentDate - birth;
			const age = differenceInMillisec / (1000 * 60 * 60 * 24 * 365.25);
			return Math.floor(age);
		}

		user[0].age = getAge();

		return res.json(user[0]);
	} catch (error) {
		console.error('Erreur lors de la recherche de l\'utilisateur par son ID:', error);
		return res.status(500).json({ error: 'Une erreur est survenue lors de la recherche de l\'utilisateur.' });
	}
};

export const manyUsers = async (req: Request, res: Response) => {
	const ids: any = req.query.ids;
	const myId = req.user?.userId;

	let arrayOfStrings: string[] = ids.split(",");

	let parsedIds: number[] = arrayOfStrings.map(Number);

	try {
		const connection = getConnection();
		const checkUserQuery = 'SELECT * FROM user WHERE id IN (?)';
		const escapedIds = parsedIds.join(', ');
		const finalQuery = checkUserQuery.replace('?', escapedIds);

		const users: any = await new Promise((resolve, reject) => {
			connection.query(finalQuery, (checkUserErr: any, checkUserResults: any) => {
				if (checkUserErr) {
					reject(new Error('Une erreur est survenue lors de la vérification du nom d\'utilisateur.'));
				} else {
					resolve(checkUserResults);
				}
			});
		});

		for (const user of users) {
			const checkTagsQuery = 'SELECT user_tag.tag_id FROM user JOIN user_tag ON user.id = user_tag.user_id JOIN tag ON tag.tag_id = user_tag.tag_id WHERE user.id = ?';

			const tags: any = await new Promise((resolve, reject) => {
				connection.query(checkTagsQuery, user.id, (checkTagErr: any, checkTagResults: any) => {
					if (checkTagErr) {
						reject(new Error('Une erreur est survenue lors de la recuperation des tags'));
					} else {
						resolve(checkTagResults);
					}
				});
			});
			user.interests = tags.map((tag: any) => tag.tag_id);
			
			const checkImageQuery = 'SELECT photo1 FROM user WHERE id = ?';
			
			const photo: any = await new Promise((resolve, reject) => {
				connection.query(checkImageQuery, user.id, (checkimgErr: any, checkimgResults: any) => {
					if (checkimgErr) {
						reject(new Error('Une erreur est survenue lors de la recuperation des images'));
					} else {
						resolve(checkimgResults);
					}
				});
			});

			
			if (photo[0].photo1)
			{
				await new Promise((resolve, reject) => {
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
			
			await new Promise((resolve, reject) => {
				connection.query(checkLocationQuery, myId, (checkLocationErr: any, checkLocationResults: any) => {
					if (checkLocationErr) {
						reject(new Error('Une erreur est survenue lors de la recuperation de la localisation'));
					} else {
						const distance = calculateDistance(user.location, checkLocationResults[0].location);
						user.distance = distance;
						resolve(checkLocationResults);
					}
				});
			});



			function getAge() {
				const birth: any = new Date(user.birth);
				const currentDate: any = new Date();
				const differenceInMillisec = currentDate - birth;
				const age = differenceInMillisec / (1000 * 60 * 60 * 24 * 365.25);
				return Math.floor(age);
			}
			user.age = getAge();
		}

		return res.json(users);
	} catch (error) {
		return res.status(500).json({ error: 'Une erreur est survenue lors de la recherche de l\'utilisateur.' });
	}
};

export const photoUserById = async (req: Request, res: Response) => {

	try {
		const { id } = req.params;
		const connection = getConnection();

		const checkImageQuery = 'SELECT photo1, photo2, photo3, photo4, photo5 FROM user WHERE id = ?';

		const photo: any = await new Promise((resolve, reject) => {
			connection.query(checkImageQuery, id, (checkimgErr: any, checkimgResults: any) => {
				if (checkimgErr) {
					reject(new Error('Une erreur est survenue lors de la recuperation des images'));
				} else {
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

			const readFileAsync = promisify(fs.readFile);
			const data = await readFileAsync('uploads/' + photoFileName);
			const base64Image = Buffer.from(data).toString('base64');
			photo[0][photoField] = base64Image;
		}

		return res.json(photo[0]);
	} catch (error) {
		return res.status(500).json({ message: 'An error occurred while retrieving the images' });
	}
};

export const setBirth = async (req: Request, res: Response) => {
	const id = req.user?.userId;
	const { birthDate } = req.body;

	try {
		const connection = getConnection();

		if (!birthDate) {
			return res.status(400).json({ message: 'Birth date must be provided' });
		}

		const isAdult: any = await new Promise<void> ((resolve, reject) => {
			const dateOfBirthObj = new Date(birthDate);
			const currentDate = new Date();
			let age = currentDate.getFullYear() - dateOfBirthObj.getFullYear();

			const birthdayHasPassed =
				currentDate.getMonth() > dateOfBirthObj.getMonth() ||
				(currentDate.getMonth() === dateOfBirthObj.getMonth() &&
					currentDate.getDate() >= dateOfBirthObj.getDate());

			if (!birthdayHasPassed) {
				age--;
			}

			if (age >= 18) {
				resolve();
			} else {
				return res.status(403).json({ error: 'User must be adult' });
			}
		});

		const updatedBirth: any = await new Promise((resolve, reject) => {
			connection.query('UPDATE user SET birth = ? WHERE id = ?', [birthDate, id], (changeBirthErr: any, changeBirth: any) => {
				if (changeBirthErr) {
					reject(new Error('An error occurred while adding the birth date'));
				} else {
					resolve(changeBirth);
				}
			});
		});
		return res.json({ message: 'Birth date successfully set' });
	} catch (error) {
		return res.status(500).json({ message: 'An error occurred while updating the birth date' });
	}
};

export const setGender = async (req: Request, res: Response) => {

	const id = req.user?.userId;
	const { gender } = req.body;

	if (gender !== 'man' && gender !== 'woman') {
		return res.status(400).json({ error: 'Bad request' });
	}

	try {
		const connection = getConnection();

		const updatedGender: any = await new Promise((resolve, reject) => {
			connection.query('UPDATE user SET gender = ? WHERE id = ?', [gender, id], (changeGenderhErr: any, changeGender: any) => {
				if (changeGenderhErr) {
					reject(new Error('An error occurred while adding gender'));
				} else {
					resolve(changeGender);
				}
			});
		});
		return res.json({ message: 'Gender successfully set' });
	} catch (error) {
		return res.status(500).json({ message: 'An error occurred while updating gende' });
	}
};

export const setPreference = async (req: Request, res: Response) => {

	const id = req.user?.userId;
	const { preference } = req.body;

	if (preference !== 'man' && preference !== 'woman'&& preference !== 'both') {
		return res.status(400).json({ error: 'Bad request' });
	}

	try {
		const connection = getConnection();

		const updatedPreference: any = await new Promise((resolve, reject) => {
			connection.query('UPDATE user SET preference = ? WHERE id = ?', [preference, id], (changePreferenceErr: any, changePreference: any) => {
				if (changePreferenceErr) {
					reject(new Error('An error occurred while adding gender'));
				} else {
					resolve(changePreference);
				}
			});
		});
		return res.json({ message: 'Preference successfully set' });
	} catch (error) {
		return res.status(500).json({ message: 'An error occurred while updating preference' });
	}
};

export const setDescription = async (req: Request, res: Response) => {

	const id = req.user?.userId;
	const { description } = req.body;

	if (!description || description.length === 0) {
		return res.status(400).json({ error: 'You must set a description' });
	}

	try {
		const connection = getConnection();

		const updatedDescription: any = await new Promise((resolve, reject) => {
			connection.query('UPDATE user SET description = ? WHERE id = ?', [description, id], (changeDescriptionErr: any, changeDescription: any) => {
				if (changeDescriptionErr) {
					reject(new Error('An error occurred while adding a description'));
				} else {
					resolve(changeDescription);
				}
			});
		});
		return res.json({ message: 'Description successfully set' });
	} catch (error) {
		return res.status(500).json({ message: 'An error occurred while updating a description' });
	}
};

export const setInterest = async (req: Request, res: Response) => {

	const id = req.user?.userId;
	const { interests } = req.body;

	if (!interests || interests.length === 0) {
		return res.status(400).json({ error: 'You must set a tags' });
	}

	try {
		const connection = getConnection();

		const updatedInterest: any = await new Promise<void>((resolve, reject) => {
			for (const tagId of interests) {
				const insertQuery = 'INSERT INTO user_tag (user_id, tag_id) VALUES (?, ?)';
				const values = [id, tagId + 1];

				connection.query(insertQuery, values, (error) => {
					if (error) {
						reject(new Error('Error occurred while inserting the tag'));
					} else {
						resolve();
					}
				});
			}
		});
		return res.json({ message: 'Tags successfully set' });
	} catch (error) {
		return res.status(500).json({ message: 'Error occurred while inserting the tag' });
	}
};

export const addInterest = async (req: Request, res: Response) => {

	const id = req.user?.userId;
	const { idInterest } = req.body;

	try {
		const connection = getConnection();

		const addInterest: any = await new Promise<void>((resolve, reject) => {
				const insertQuery = 'INSERT INTO user_tag (user_id, tag_id) VALUES (?, ?)';
				const values = [id, idInterest];
			  
				connection.query(insertQuery, values, (error) => {
				  if (error) {
					reject(new Error('Error occurred while inserting the tag'));
				  } else {
					resolve();
				  }
				});
		});
		return res.json({ message: 'Tags successfully set' });
	} catch (error) {
		return res.status(500).json({ message: 'Error occurred while inserting the tag' });
	}
};

export const delInterest = async (req: Request, res: Response) => {

	const id = req.user?.userId;
	const { idInterest } = req.body;

	try {
		const connection = getConnection();

		const delInterest: any = await new Promise<void>((resolve, reject) => {
				const insertQuery = 'DELETE FROM user_tag WHERE user_id = ? AND tag_id = ?';
				const values = [id, idInterest];
			  
				connection.query(insertQuery, values, (error) => {
				  if (error) {
					reject(new Error('Error occurred while inserting the tag'));
				  } else {
					resolve();
				  }
				});
		});
		return res.json({ message: 'Tags successfully set' });
	} catch (error) {
		return res.status(500).json({ message: 'Error occurred while inserting the tag' });
	}
};

export const setAllInfosSet = async (req: Request, res: Response) => {

	const id = req.user?.userId;

	try {
		const connection = getConnection();

		const updatedDescription: any = await new Promise<void>((resolve, reject) => {
			const insertQuery = 'UPDATE user SET all_infos_set = true WHERE id = ?;';

			connection.query(insertQuery, id, (error) => {
				if (error) {
					reject(new Error('Error occurred while setting all_infos_set'));
				} else {
					resolve();
				}
			});
		});
		return res.json({ message: 'all_infos_set successfully set' });
	} catch (error) {
		return res.status(500).json({ message: 'Error occurred while setting all_infos_set' });
	}
};

export const updateUsername = async (req: Request, res: Response) => {
	const id = req.user?.userId;
	const { username } = req.body;

	try {
		const connection = getConnection();

		const searchUsernameQuery = 'SELECT COUNT(*) AS count FROM user WHERE username = ?';

		const searchUsername: any = await new Promise((resolve, reject) => {
			connection.query(searchUsernameQuery, [username], (err: any, results: any) => {
				if (err) {
					reject(new Error('Error occurred while updating username'));
				} else {
					resolve(results);
				}
			});
		});
		if (searchUsername[0].count !== 0) {
			return res.status(409).json({ error: 'Error: Username already taken' });
		}

		const updateUsernameQuery = 'UPDATE user SET username = ? WHERE id = ?';

		const updateUsername: any = await new Promise<void>((resolve, reject) => {
			connection.query(updateUsernameQuery, [username, id], (err: any, results: any) => {
				if (err) {
					reject(new Error('Error occurred while updating username'));
				} else {
					resolve();
				}
			});
		});
		return res.json({ message: 'Username updated' });
	} catch (error) {
		return res.status(500).json({ error: 'Error occurred while updating username' });
	}
};

export const updateFirstName = async (req: Request, res: Response) => {
	const id = req.user?.userId;
	const { firstName } = req.body;

	try {
		const connection = getConnection();

		const updateUsernameQuery = 'UPDATE user SET firstName = ? WHERE id = ?';

		const updateFirstName: any = await new Promise<void>((resolve, reject) => {
			connection.query(updateUsernameQuery, [firstName, id], (err: any, results: any) => {
				if (err) {
					reject(new Error('Error occurred while updating First Name'));
				} else {
					resolve();
				}
			});
		});
		return res.json({ message: 'First Name updated' });
	} catch (error) {
		return res.status(500).json({ error: 'Error occurred while updating First Name' });
	}
};

export const updateLastName = async (req: Request, res: Response) => {
	const id = req.user?.userId;
	const { lastName } = req.body;

	try {
		const connection = getConnection();

		const updateUsernameQuery = 'UPDATE user SET lastName = ? WHERE id = ?';

		const updateLastName: any = await new Promise<void>((resolve, reject) => {
			connection.query(updateUsernameQuery, [lastName, id], (err: any, results: any) => {
				if (err) {
					reject(new Error('Error occurred while updating Last Name'));
				} else {
					resolve();
				}
			});
		});
		return res.json({ message: 'Last Name updated' });
	} catch (error) {
		return res.status(500).json({ error: 'Error occurred while updating Last Name' });
	}
};

export const updateEmail = async (req: Request, res: Response) => {
	const id = req.user?.userId;
	const { email } = req.body;

	try {
		const connection = getConnection();

		const checkEmailQuery = 'SELECT * FROM user WHERE email = ?';
		try {
			const checkEmailResult: any = await new Promise((resolve, reject) => {
				connection.query(checkEmailQuery, email, (checkEmailErr: any, checkEmailResults: any) => {
					if (checkEmailErr) {
						reject(new Error('Une erreur est survenue lors de la vérification de l\'email.'));
					} else {
						resolve(checkEmailResults);
					}
				});
			});
			if (checkEmailResult.length > 0) {
				return res.status(409).json({ error: 'Email already taken.' });
			}
		} catch (error) {
			return res.status(500).json({ error: 'Internal server error. Please try again later.' });
		}

		const updateUsernameQuery = 'UPDATE user SET email = ? WHERE id = ?';

		await new Promise<void>((resolve, reject) => {
			connection.query(updateUsernameQuery, [email, id], (err: any, results: any) => {
				if (err) {
					reject(new Error('Error occurred while updating email'));
				} else {
					resolve();
				}
			});
		});
		return res.json({ message: 'Email updated' });
	} catch (error) {
		return res.status(500).json({ error: 'Error occurred while updating email' });
	}
};

export const updatePassword = async (req: Request, res: Response) => {
	const id = req.user?.userId;
	const { password } = req.body;

	try {
		const connection = getConnection();

		const hashedPassword = await argon2.hash(password);
		const updateUsernameQuery = 'UPDATE user SET password = ? WHERE id = ?';

		await new Promise<void>((resolve, reject) => {
			connection.query(updateUsernameQuery, [hashedPassword, id], (err: any, results: any) => {
				if (err) {
					reject(new Error('Error occurred while updating password'));
				} else {
					resolve();
				}
			});
		});
		return res.json({ message: 'Password updated' });
	} catch (error) {
		return res.status(500).json({ error: 'Error occurred while updating password' });
	}
};

export const updateLocation = async (req: Request, res: Response) => {

	const id = req.user?.userId;
	const { location } = req.body;

	try {
		const connection = getConnection();

		if (!location) {
			return res.status(400).json({ message: 'Location must be provided' });
		}

		const updateLocationQuery = 'UPDATE user SET location = ? WHERE id = ?';

		const updatedLocation: any = await new Promise((resolve, reject) => {
			connection.query(updateLocationQuery, [location, id], (changeLocationhErr: any, changeBirth: any) => {
				if (changeLocationhErr) {
					reject(new Error('An error occurred while adding the birth date'));
				} else {
					resolve(changeBirth);
				}
			});
		});
		return res.json({ message: 'Location successfully set' });
	} catch (error) {
		return res.status(500).json({ message: 'An error occurred while updating location' });
	}
};

export const getSuggestions = async (req: Request, res: Response) => {
	const id = req.user?.userId;
	const maxDistance: any = req.query.maxDistance;
	const differencePopularity: any = req.query.differencePopularity;
	const ageFrom: any = req.query.ageFrom;
	const ageTo: any = req.query.ageTo;
	const interests: any = req.query.interests;
	let interestsNumber: number[] = [];

	//if (interests) {
	//	interestsNumber = interests.map((interest: any) => parseInt(interest, 10));
	//}

	try {

		const query = 'SELECT id, gender, preference, location, birth, popularity FROM user';
		
		const connection = getConnection();
		
		const users: any = await new Promise((resolve, reject) => {
			connection.query(query, (err: any, results: any) => {
				if (err) {
					reject(new Error('Erreur lors de l\'exécution de la requête'));
				} else {
					resolve(results);
				}
			});
		});

		const activeUser = users.find((user: any) => user.id === id);
		const myGender = activeUser.gender;
		const myPreference = activeUser.preference;

		const filteredPreferenceUsers = users.filter((user: any) => {
			if (myGender === "man" && myPreference === "woman") {
				return (user.gender === "woman" && (user.preference === "man" || user.preference === "both"));
			} else if (myGender === "woman" && myPreference === "man") {
				return (user.gender === "man" && (user.preference === "woman" || user.preference === "both"));
			} else if (myGender === "woman" && myPreference === "both") {
				return (user.gender === "woman" && (user.preference === "woman" || user.preference === "both")) || (user.gender === "man" && (user.preference === "woman" || user.preference === "both"));
			} else if (myGender === "man" && myPreference === "both") {
				return (user.gender === "woman" && (user.preference === "man" || user.preference === "both")) || (user.gender === "man" && (user.preference === "man" || user.preference === "both"));
			} else if (myGender === "man" && myPreference === "man") {
				return (user.gender === "man" && (user.preference === "man" || user.preference === "both"));
			} else if (myGender === "woman" && myPreference === "woman") {
				return (user.gender === "woman" && (user.preference === "woman" || user.preference === "both"));
			}
		});

		const filteredLocationUsers = filteredPreferenceUsers.filter((user: any) => {
			return (calculateDistance(activeUser.location, user.location) <= maxDistance);
		})

		const filteredPopularityUsers = filteredLocationUsers.filter((user: any) => {
			return (user.popularity >= (activeUser.popularity - differencePopularity) &&
			user.popularity <= (activeUser.popularity + differencePopularity));
		})

		function getAge(user: any) {
			const birth: any = new Date(user.birth);
			const currentDate: any = new Date();
			const differenceInMillisec = currentDate - birth;
			const age = differenceInMillisec / (1000 * 60 * 60 * 24 * 365.25);
			return Math.floor(age);
		}
		
		const filteredAgeUsers = filteredPopularityUsers.filter((user: any) => {
			const age = getAge(user);
			return (age >= ageFrom && age <= ageTo);
		})


		const checkTagsQuery = 'SELECT user_tag.tag_id FROM user JOIN user_tag ON user.id = user_tag.user_id JOIN tag ON tag.tag_id = user_tag.tag_id WHERE user.id = ?';

		for (const user of filteredAgeUsers) {
			const tags: any = await new Promise((resolve, reject) => {
				connection.query(checkTagsQuery, user.id, (checkTagErr: any, checkTagResults: any) => {
					if (checkTagErr) {
						reject(new Error('Une erreur est survenue lors de la recuperation des tags'));
					} else {
						resolve(checkTagResults);
					}
				});
			});
			user.interests = tags.map((tag: any) => tag.tag_id);
		}

		let filteredInterestsUsers;
		if (interests) {
			filteredInterestsUsers = filteredAgeUsers.filter((user: any) => {
				return interestsNumber.every((interest: any) => user.interests.includes(interest))
			})
		} else {
			filteredInterestsUsers = filteredAgeUsers;
		}

		function geographicalScore(user: any) {
			const dist = calculateDistance(activeUser.location, user.location);
			if (dist <= 50) {
				user.note += 10;
			} else if (dist <= 100) {
				user.note += 8;
			} else if (dist <= 150) {
				user.note += 6;
			} else if (dist <= 200) {
				user.note += 4;
			} else {
				user.note += 2;
			}
		}

		function popularityScore(user: any) {
			if (user.popularity <= 50) {
				user.note += 1;
			} else if (user.popularity <= 100) {
				user.note += 3;
			} else if (user.popularity <= 150) {
				user.note += 4;
			} else if (user.popularity <= 200) {
				user.note += 5;
			} else if (user.popularity <= 250) {
				user.note += 6;
			} else if (user.popularity <= 300) {
				user.note += 7;
			} else if (user.popularity <= 350) {
				user.note += 8;
			} else if (user.popularity <= 400) {
				user.note += 9;
			} else if (user.popularity <= 450) {
				user.note += 10;
			} else {
				user.note += 13;
			}
		}

		function findCommonTags(tags1: any, tags2: any) {
			const tags1Ids = tags1.map((tag: any) => tag.tag_id);
			const commonTags = tags2.filter((tag: any) => tags1Ids.includes(tag));
			return commonTags.length;
		}

		async function tagScore(user: any) {
			const tagsQuery = 'SELECT user_tag.tag_id FROM user JOIN user_tag ON user.id = user_tag.user_id JOIN tag ON tag.tag_id = user_tag.tag_id WHERE user.id = ?';

			const actualUserTags: any = await new Promise((resolve, reject) => {
				connection.query(tagsQuery, id, (checkTagErr: any, checkTagResults: any) => {
					if (checkTagErr) {
						reject(new Error('Une erreur est survenue lors de la recuperation des tags'));
					} else {
						resolve(checkTagResults);
					}
				});
			});

			const commonTags = findCommonTags(actualUserTags, user.interests);
			user.commonTags = commonTags;
			const gradeNote = [0, 2, 4, 6, 8, 10];
			user.note += gradeNote[commonTags];
		}

		for (const user of filteredInterestsUsers) {
			user.note = 0;
			geographicalScore(user)
			popularityScore(user);
			await tagScore(user);
		}

		const retArray = filteredInterestsUsers.map((obj: any) => ({
			id: obj.id,
			commonTags: obj.commonTags,
			note: obj.note
		}));

		let filterArray = retArray.filter((user: any) => user.id !== id);

		const likedQuery = 'SELECT * FROM likes WHERE id_user_source = ?';

		const likedUsers: any = await new Promise((resolve, reject) => {
			connection.query(likedQuery, activeUser.id, (checkTagErr: any, checkTagResults: any) => {
				if (checkTagErr) {
					reject(new Error('Une erreur est survenue lors de la recuperation des tags'));
				} else {
					resolve(checkTagResults);
				}
			});
		});

		const removeLikedUserArray = filterArray.filter((item: any) =>
			!likedUsers.some((likedUser: any) => likedUser.id_user_target === item.id)
		);

		const blockedQuery = 'SELECT * FROM blockUser WHERE id_user_source = ?';

		const blockedUsers: any = await new Promise((resolve, reject) => {
			connection.query(blockedQuery, activeUser.id, (checkTagErr: any, checkTagResults: any) => {
				if (checkTagErr) {
					reject(new Error('Une erreur est survenue lors de la recuperation des tags'));
				} else {
					resolve(checkTagResults);
				}
			});
		});

		const removeBlockedUserArray = removeLikedUserArray.filter((item: any) =>
			!blockedUsers.some((likedUser: any) => likedUser.id_user_target === item.id)
		);

		const secondBlockedQuery = 'SELECT * FROM blockUser WHERE id_user_target = ?';

		const secondBlockedUsers: any = await new Promise((resolve, reject) => {
			connection.query(secondBlockedQuery, activeUser.id, (checkTagErr: any, checkTagResults: any) => {
				if (checkTagErr) {
					reject(new Error('Une erreur est survenue lors de la recuperation des tags'));
				} else {
					resolve(checkTagResults);
				}
			});
		});

		const removeSecondBlockedUserArray = removeBlockedUserArray.filter((item: any) =>
			!secondBlockedUsers.some((likedUser: any) => likedUser.id_user_source === item.id)
		);

		removeSecondBlockedUserArray.sort((a: any, b: any) => b.note - a.note);
		const finalArray = removeSecondBlockedUserArray.slice(0, 200);
		finalArray.sort((a: any, b: any) => a.id - b.id);

		return res.json(finalArray);
	} catch (error) {
		return res.status(500).json({ message: 'Error retrieving suggestions' });
	}
}

export const getTags = async (req: Request, res: Response) => {
	try {

		const connection = getConnection();

		const query = 'SELECT * FROM tag';
		
		const tags: any = await new Promise((resolve, reject) => {
			connection.query(query, (err: any, results: any) => {
				if (err) {
					reject(new Error('Erreur lors de l\'exécution de la requête'));
				} else {
					resolve(results);
				}
			});
		});

		return res.json(tags);
	} catch (error) {
		return res.status(500).json({ message: 'Error while retrieving tags' });
	}
}

export const getRelation = async (req: Request, res: Response) => {
	const id = req.user?.userId;
	const { userId } = req.params;

	try {

		const connection = getConnection();

		const query = 'SELECT * FROM likes WHERE (id_user_source = ? AND id_user_target = ?) \
		OR (id_user_source = ? AND id_user_target = ?)';

		const relation: any = await new Promise((resolve, reject) => {
			connection.query(query, [id, userId, userId, id], (err: any, results: any) => {
				if (err) {
					reject(new Error('Erreur lors de l\'exécution de la requête'));
				} else {
					resolve(results);
				}
			});
		});
	
		return res.json(relation);
	} catch (error) {
		return res.status(500).json({ message: 'Error' });
	}
}

export const getConversationsByUserId = async (req: Request, res: Response) => {
	const id = req.user?.userId;

	try {

		const connection = getConnection();

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

		const conversations: any = await new Promise((resolve, reject) => {
			connection.query(query, [id, id], (err: any, results: any) => {
				if (err) {
					reject(new Error('Erreur lors de l\'exécution de la requête'));
				} else {
					resolve(results);
				}
			});
		});

		const conversationIdMap = new Map<number, boolean>();
		const resultat = conversations.reduce((acc: any, objet: any) => {
			if (!conversationIdMap.has(objet.conversation_id)) {
				conversationIdMap.set(objet.conversation_id, true);
				acc.push(objet);
			}
			return acc;
		}, []);

		return res.json(resultat);
	} catch (error) {
		return res.status(500).json({ message: 'Error' });
	}
}

export const getConversationById = async (req: Request, res: Response) => {
	const id = req.user?.userId;
	const { convId } = req.params;

	try {

		const connection = getConnection();

		const query = 'SELECT * FROM conversations WHERE conversation_id = ?';

		const conversation: any = await new Promise((resolve, reject) => {
			connection.query(query, convId, (err: any, results: any) => {
				if (err) {
					reject(new Error('Erreur lors de l\'exécution de la requête'));
				} else {
					resolve(results);
				}
			});
		});
	
		return res.json(conversation[0]);
	} catch (error) {
		return res.status(500).json({ message: 'Error' });
	}
}

export const getMessagesById = async (req: Request, res: Response) => {
	const id = req.user?.userId;
	const { convId } = req.params;

	try {

		const connection = getConnection();

		const query = 'SELECT privateMessages.conversation_id, privateMessages.sender_id, privateMessages.recipient_id, privateMessages.message_content, privateMessages.timestamp FROM privateMessages WHERE privateMessages.conversation_id = ? ORDER BY privateMessages.timestamp';

		const messages: any = await new Promise((resolve, reject) => {
			connection.query(query, convId, (err: any, results: any) => {
				if (err) {
					reject(new Error('Erreur lors de l\'exécution de la requête'));
				} else {
					resolve(results);
				}
			});
		});
	
		return res.json(messages);
	} catch (error) {
		return res.status(500).json({ message: 'Error' });
	}
}

export const getLastMessageById = async (req: Request, res: Response) => {
	const id = req.user?.userId;
	const { convId } = req.params;

	try {

		const connection = getConnection();

		const query = 'SELECT message_content FROM privateMessages WHERE conversation_id = ? ORDER BY timestamp DESC LIMIT 1;';

		const message: any = await new Promise((resolve, reject) => {
			connection.query(query, convId, (err: any, results: any) => {
				if (err) {
					reject(new Error('Erreur lors de l\'exécution de la requête'));
				} else {
					resolve(results);
				}
			});
		});

		return res.json(message[0]);
	} catch (error) {
		return res.status(500).json({ message: 'Error' });
	}
}

export const updateNotificationsMessages = async (req: Request, res: Response) => {
	const id = req.user?.userId;
	const { notifications } = req.body;

	try {

		const connection = getConnection();

		const query = 'DELETE FROM notificationsMessages WHERE user_id = ?;';

		await new Promise((resolve, reject) => {
			connection.query(query, id, (err: any, results: any) => {
				if (err) {
					reject(new Error('Erreur lors de l\'exécution de la requête updateNotificationsMessages'));
				} else {
					resolve(results);
				}
			});
		});

		for (const notif of notifications) {
			const query = 'INSERT INTO notificationsMessages (user_id, user_id_source, conversation_id, message_content)\
			VALUES (?, ?, ?, ?);';

			await new Promise((resolve, reject) => {
					connection.query(query, [id, notif.sender_id, notif.conversation_id, notif.message_content], (err: any, results: any) => {
					if (err) {
						reject(new Error('Erreur lors de l\'exécution de la requête updateNotificationsMessages'));
					} else {
						resolve(results);
					}
				});
			});
		}

		return res.json({ message: 'OK' });
	} catch (error) {
		return res.status(500).json({ message: 'Error' });
	}
}

export const getNotificationsMessages = async (req: Request, res: Response) => {
	const id = req.user?.userId;

	try {

		const connection = getConnection();

		const query = 'SELECT * FROM notificationsMessages WHERE user_id = ?;';

		const notifications: any = await new Promise((resolve, reject) => {
			connection.query(query, id, (err: any, results: any) => {
				if (err) {
					reject(new Error('Erreur lors de l\'exécution de la requête getNotificationsMessages'));
				} else {
					resolve(results);
				}
			});
		});

		const combinedBlockedQuery = 'SELECT * FROM blockUser WHERE id_user_source = ? OR id_user_target = ?';

		const blockedUsers: any = await new Promise((resolve, reject) => {
			connection.query( combinedBlockedQuery, [id, id], (checkTagErr: any, checkTagResults: any) => {
					if (checkTagErr) {
						reject(new Error('Une erreur est survenue lors de la récupération users bloques'));
					} else {
						resolve(checkTagResults);
					}
				}
			);
		});

		const removeBlockedUserArray = notifications.filter((item: any) =>
			!blockedUsers.some((blockedUser: any) =>
				(blockedUser.id_user_source === item.user_id_source &&
					blockedUser.id_user_target === id) ||
				(blockedUser.id_user_source === id &&
					blockedUser.id_user_target === item.user_id_source)
			)
		);

		return res.json(removeBlockedUserArray);
	} catch (error) {
		return res.status(500).json({ message: 'Error' });
	}
}

export const getNotifications = async (req: Request, res: Response) => {
	const id = req.user?.userId;

	try {

		const connection = getConnection();

		const query = 'SELECT * FROM notifications WHERE user_target_id = ?;';

		const notifications: any = await new Promise((resolve, reject) => {
			connection.query(query, id, (err: any, results: any) => {
				if (err) {
					reject(new Error('Erreur lors de l\'exécution de la requête'));
				} else {
					resolve(results);
				}
			});
		});

		const combinedBlockedQuery = 'SELECT * FROM blockUser WHERE id_user_source = ? OR id_user_target = ?';

		const blockedUsers: any = await new Promise((resolve, reject) => {
			connection.query( combinedBlockedQuery, [id, id], (checkTagErr: any, checkTagResults: any) => {
					if (checkTagErr) {
						reject(new Error('Une erreur est survenue lors de la récupération des tags'));
					} else {
						resolve(checkTagResults);
					}
				}
			);
		});

		const removeBlockedUserArray = notifications.filter((item: any) =>
			!blockedUsers.some((blockedUser: any) =>
					blockedUser.id_user_source === item.user_source_id ||
					blockedUser.id_user_target === item.user_source_id
			)
		);

		return res.json(removeBlockedUserArray);
	} catch (error) {
		return res.status(500).json({ message: 'Error' });
	}
}

export const getLikes = async (req: Request, res: Response) => {
	const id = req.user?.userId;

	try {

		const connection = getConnection();

		const query = 'SELECT * FROM likes WHERE id_user_target = ?;';

		const likes: any = await new Promise((resolve, reject) => {
			connection.query(query, id, (err: any, results: any) => {
				if (err) {
					reject(new Error('Erreur lors de l\'exécution de la requête'));
				} else {
					resolve(results);
				}
			});
		});

		const combinedBlockedQuery = 'SELECT * FROM blockUser WHERE id_user_source = ? OR id_user_target = ?';

		const blockedUsers: any = await new Promise((resolve, reject) => {
			connection.query( combinedBlockedQuery, [id, id], (checkTagErr: any, checkTagResults: any) => {
					if (checkTagErr) {
						reject(new Error('Une erreur est survenue lors de la récupération des tags'));
					} else {
						resolve(checkTagResults);
					}
				}
			);
		});

		const removeBlockedUserArray = likes.filter((item: any) =>
			!blockedUsers.some((blockedUser: any) =>
					blockedUser.id_user_source === item.id_user_source ||
					blockedUser.id_user_target === item.id_user_source
			)
		);

		return res.json(removeBlockedUserArray);
	} catch (error) {
		return res.status(500).json({ message: 'Error' });
	}
}

export const getHistory = async (req: Request, res: Response) => {
	const id = req.user?.userId;

	try {

		const connection = getConnection();

		const query = 'SELECT * FROM history WHERE id_user_target = ?;';

		const history: any = await new Promise((resolve, reject) => {
			connection.query(query, id, (err: any, results: any) => {
				if (err) {
					reject(new Error('Erreur lors de l\'exécution de la requête'));
				} else {
					resolve(results);
				}
			});
		});

		const combinedBlockedQuery = 'SELECT * FROM blockUser WHERE id_user_source = ? OR id_user_target = ?';

		const blockedUsers: any = await new Promise((resolve, reject) => {
			connection.query( combinedBlockedQuery, [id, id], (checkTagErr: any, checkTagResults: any) => {
					if (checkTagErr) {
						reject(new Error('Une erreur est survenue lors de la récupération des tags'));
					} else {
						resolve(checkTagResults);
					}
				}
			);
		});

		const removeBlockedUserArray = history.filter((item: any) =>
			!blockedUsers.some((blockedUser: any) =>
					blockedUser.id_user_source === item.id_user_source ||
					blockedUser.id_user_target === item.id_user_source
			)
		);

		return res.json(removeBlockedUserArray);
	} catch (error) {
		return res.status(500).json({ message: 'Error' });
	}
}

export const setReadNotifications = async (req: Request, res: Response) => {
	const id = req.user?.userId;

	try {

		const connection = getConnection();

		const query = 'UPDATE notifications SET is_read = true WHERE user_target_id = ?;';

		await new Promise((resolve, reject) => {
			connection.query(query, id, (err: any, results: any) => {
				if (err) {
					reject(new Error('Erreur lors de l\'exécution de la requête'));
				} else {
					resolve(results);
				}
			});
		});

		return res.json({ message: 'OK' });
	} catch (error) {
		return res.status(500).json({ message: 'Error' });
	}
}

export const reportUser = async (req: Request, res: Response) => {
	const id = req.user?.userId;
	const { idUserBlock } = req.body;

	try {

		const connection = getConnection();

			const query = 'INSERT INTO reportUser (id_user_source, id_user_target)\
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

			await updatePopularityScore(idUserBlock, -25);

		return res.json({ message: 'OK' });
	} catch (error) {
		return res.status(500).json({ message: 'Error' });
	}
}

export const getBlockList = async (req: Request, res: Response) => {
	const id = req.user?.userId;
	
	try {
		
		const connection = getConnection();
		
		const query = 'SELECT id_user_target FROM blockUser WHERE id_user_source = ?';
		
		const blockList = await new Promise((resolve, reject) => {
			connection.query(query, id, (err: any, results: any) => {
				if (err) {
					reject(new Error('Erreur lors de l\'exécution de la requête'));
				} else {
					resolve(results);
				}
			});
		});
		
		return res.json(blockList);
	} catch (error) {
		return res.status(500).json({ message: 'Error' });
	}
}

export const delBlockUser = async (req: Request, res: Response) => {

	const id = req.user?.userId;
	const { idUserBlock } = req.body;

	try {
		const connection = getConnection();

		await new Promise<void>((resolve, reject) => {
				const insertQuery = 'DELETE FROM blockUser WHERE id_user_source = ? AND id_user_target = ?';
				const values = [id, idUserBlock];
			  
				connection.query(insertQuery, values, (error) => {
				  if (error) {
					reject(new Error('Error'));
				  } else {
					resolve();
				  }
				});
		});
		return res.json({ message: 'OK' });
	} catch (error) {
		return res.status(500).json({ message: 'Error' });
	}
};

export const getMutualBlockCheck = async (req: Request, res: Response) => {
	const id = req.user?.userId;
	const { idUser } = req.params;

	try {
		
		const connection = getConnection();
		
		const query = 'SELECT * FROM blockUser WHERE id_user_source = ? AND id_user_target = ? OR \
		id_user_target = ? AND id_user_source = ?';
		
		const blockList = await new Promise((resolve, reject) => {
			connection.query(query, [id, idUser, id, idUser], (err: any, results: any) => {
				if (err) {
					reject(new Error('Erreur lors de l\'exécution de la requête'));
				} else {
					resolve(results);
				}
			});
		});
		
		return res.json(blockList);
	} catch (error) {
		return res.status(500).json({ message: 'Error' });
	}
}
