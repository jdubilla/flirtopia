import express from 'express';
import { deletePhoto, setPhoto } from '../controllers/uploads';
import multer from 'multer';

const router = express.Router();

const upload = multer({
	dest: 'uploads/',
	fileFilter: (req, file, cb) => {
		if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
			return cb(new Error('Seules les images au format JPG, JPEG, PNG et GIF sont autorisées.'));
		}
		cb(null, true);
	}
});

router.post('/', upload.single('photo_profil'), setPhoto);
router.delete('/', deletePhoto);

export default router;
