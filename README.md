# COSC2758 Assignment 2  
**Repository: s3947801-s3978268-a2**

This is the **Admin Dashboard** frontend for a fullstack web application built for Assignment 2 in COSC2758 at RMIT. It allows admin users to manage candidate users, courses, lecturer assignments, and block/unblock candidate accounts in real-time.

Built with **React**, **TypeScript**, **Apollo Client**, and **CSS Modules**, and connected to a GraphQL backend.

---

### Note: The ERD (Task PA a ) is placed inside the teach-team/backend, as per assignment instructions.

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/rmit-fsd-2025-s1/s3947801-s3978268-a2.git


```

### 2. Install Dependencies
- Install dependencies in all four directories:

cd admin/frontend
npm install

cd ../backend
npm install

cd ../../teach-team/frontend
npm install

cd ../backend
npm install

### 3. Setup Environment Variables

- For admin frontend only:

cd admin/frontend

Create a `.env` file:

```bash
cp .env.example .env
```

You can define:

```
PORT=4001
```

- By default, the admin frontend runs on port `4001`.

### 4. Start All Servers
- Start both frontend and backend for each application in separate terminal windows:

- For admin app:
# Admin Backend
cd admin/backend
npm run build
npm start

# Admin Frontend
cd admin/frontend
npm run build
npm start

- For teach-team app:
# Teach-Team Backend
cd teach-team/backend
npm run build
npm start

# Teach-Team Frontend
cd teach-team/frontend
npm run build
npm start

### 5. Open in Browser

- For teach-team frontend: http://localhost:3000

- For admin frontend: http://localhost:4001



