# QuickChicken Server

This is the backend server for the QuickChicken application, providing APIs for managing users, orders, authentication, and other core functionalities.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
- [Scripts](#scripts)
- [Environment Variables](#environment-variables)
- [Database Management](#database-management)
- [License](#license)

---

## Features
- User authentication and authorization using **JWT**.
- Order management with VNPAY integration for payments.
- File upload support using **Multer** and **Cloudinary**.
- Input validation using **Express Validator**.
- Robust error handling and logging with **Winston**.

---

## Technologies Used
- **Node.js**: Runtime environment.
- **Express.js**: Web framework.
- **Prisma**: Database ORM.
- **JWT**: Authentication and authorization.
- **Cloudinary**: Media management.
- **VNPAY**: Payment gateway integration.

---

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/nhnhien/quickchicken_server.git
   cd quickchicken_server
2. Install dependencies:
npm install

3. Set up environment variables: Create a .env file in the root directory and add the following:
DATABASE_URL= ""
PORT = ""
JWT_SECRET_KEY = ""
JWT_REFRESH_KEY = ""

4. Run database migrations:
npm run db:migrate

5. Seed the database
npm run db:seed

6. Start the server:
npm run start:dev
