import express from 'express';
import { getUser, createUser, updateUser, deleteUser } from '../controller/user.controller.js';
import { verifyAdmin } from '../middleware/auth.middleware.js';
import { userValidator } from '../validator/user.js';

const router = express.Router();

router.get('/', verifyAdmin, getUser);
router.post('/', userValidator, verifyAdmin, createUser);
router.put('/:id', verifyAdmin, updateUser);
router.delete('/:id', verifyAdmin, deleteUser);

export default router;
