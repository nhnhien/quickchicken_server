import express from 'express';
import userRouter from './router/user.js';

const app = express();

app.use(express.json());

//Routes
app.use('/api/user', userRouter);

export default app;
