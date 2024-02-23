import { getConnection } from '../services/connectionDb';
import { Request, Response } from 'express';
import * as fs from 'fs';

export const setPhoto = async (req: Request, res: Response) => {
	const id = req.user?.userId;
	const photoId = req.body.photoId;
	const file = req.file;
	const propertyName = 'photo' + photoId;

	try {
		const connection = getConnection();

		const getAndRemovePhoto: any = await new Promise((resolve, reject) => {
			connection.query(`SELECT photo${photoId} FROM user WHERE id = ?`, id, (changePhotoErr: any, changePhoto: any) => {
				if (changePhotoErr) {
					reject(new Error('An error occurred while adding photo'));
				} else {
					resolve(changePhoto);
				}
			});
		});
		if (getAndRemovePhoto[0][propertyName]) {
			fs.unlink(`uploads/${getAndRemovePhoto[0][propertyName]}`, (err: any) => {
				if (err) {
					console.error('Error while remove the file', err);
				} else {
					console.log('File deleted');
				}
			});
		}

		if (file) {
			const extension = file.originalname.split('.').pop();
			const newFileName = `${id}-${Date.now()}.${extension}`;

			fs.rename(file.path, `uploads/${newFileName}`, (err: any) => {
				if (err) {
					console.error('Error while renaming the file', err);
					res.status(500).json({ error: 'An error occurred while saving the file' });
				} else {
					console.log('File saved successfully');
				}
			});
			const query = `UPDATE user SET photo${photoId} = ? WHERE id = ?`;
			const updatePhoto: any = await new Promise((resolve, reject) => {
				connection.query(query, [newFileName, id], (changePhotoErr: any, changePhoto: any) => {
					if (changePhotoErr) {
						reject(new Error('An error occurred while adding photo'));
					} else {
						resolve(changePhoto);
					}
				});
			});
		}
		return res.status(200).json({ message: 'File saved successfully' });
	} catch (error) {
		return res.status(500).json({ message: 'An error occurred while updating photo' });
	}
};

export const deletePhoto = async (req: Request, res: Response) => {
	const id = req.user?.userId;
	const photoId = req.query.photoId;
	const propertyName = 'photo' + photoId;

	try {
		const connection = getConnection();

		const getAndRemovePhoto: any = await new Promise((resolve, reject) => {
			connection.query(`SELECT photo${photoId} FROM user WHERE id = ?`, id, (changePhotoErr: any, changePhoto: any) => {
				if (changePhotoErr) {
					reject(new Error('An error occurred while adding photo'));
				} else {
					resolve(changePhoto);
				}
			});
		});
		if (getAndRemovePhoto[0][propertyName]) {
			fs.unlink(`uploads/${getAndRemovePhoto[0][propertyName]}`, (err: any) => {
				if (err) {
					console.error('Error while remove the file', err);
				} else {
					console.log('File deleted');
				}
			});

			const query = `UPDATE user SET ${propertyName} = NULL WHERE id = ?`;
			connection.query(query, [id], (err, result) => {
				if (err) {
					console.error('Error while deleting the photo:', err);
					res.status(500).json({ error: 'Error while deleting the photo' });
				} else {
					console.log('Photo deleted successfully.');
				}
			});
		}
		return res.status(200).json({ message: 'Photo deleted successfully.' });
	} catch (error) {
		return res.status(500).json({ message: 'An error occurred while updating photo' });
	}
};
