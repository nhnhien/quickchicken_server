import express from 'express';
import userRouter from './router/user.js';
import authRouter from './router/auth.js';

const app = express();

app.use(express.json());

//Routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

export default app;
