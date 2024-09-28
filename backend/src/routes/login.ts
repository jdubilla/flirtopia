import express from 'express';
import { checkToken, resetPassword, signin, signup, verifyTokenEmail } from '../controllers/login';
import acceptJsonOnly from '../middlewares/acceptJsonOnly';

const router = express.Router();

router.post('/signin', acceptJsonOnly, signin);
router.post('/signup', acceptJsonOnly, signup);
router.post('/resetPasword', resetPassword);
router.get('/token', checkToken);
//router.get('/verifyToken', verifyTokenEmail);
//router.get('/sendEmailResetPassword', sendEmailResetPassword);

export default router;