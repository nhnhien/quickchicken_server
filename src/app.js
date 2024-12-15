import express from 'express';
import cors from 'cors';
import userRouter from './router/user.js';
import authRouter from './router/auth.js';
import productRouter from './router/product.js';
import categoryRouter from './router/category.js';
import discountRouter from './router/discount.js';
const app = express();

app.use(express.json());

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

//Routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/category', categoryRouter);
app.use('/api/discount/', discountRouter);

export default app;
