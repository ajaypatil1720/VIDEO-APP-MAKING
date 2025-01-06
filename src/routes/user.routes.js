// import { verify } from 'jsonwebtoken';
import { logoutUser, registerUser } from '../controllers/user.controller.js';
import { Router } from 'express';
import { verifyJwt } from '../middlewares/AuthMiddleware.mid.js';
import { upload } from '../middlewares/MulterStorage.middelware.js';

const router = Router();
router.route('/register').post(
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
  ]),
  registerUser
);
router.route('logout').post(verifyJwt, logoutUser);

export default router;
