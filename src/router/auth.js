import express from 'express';
import { signIn, signUp } from '../controller/auth.controller.js';
import { signUpValidator } from '../validator/auth.js';

const router = express.Router();

router.post('/sign-in', signIn);
router.post('/sign-up', signUpValidator, signUp);

export default router;
