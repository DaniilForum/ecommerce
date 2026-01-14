E-Commerce Project — Quick Overview

A compact MERN-style e-commerce demo with admin panel and auth.

Tech stack:

Backend: Node.js, Express, MongoDB (Mongoose)

Auth: JWT (jsonwebtoken)

Frontend: React (Vite, React Router)

HTTP client: Axios

npm run dev

Backend: http://localhost:5000
Frontend: http://localhost:5173

Important env variables

backend: .env keys

MONGO_URI (default: mongodb://localhost:27017/ecommerce)

JWT_SECRET (default used: 'secret_key')

PORT (default: 5000)

frontend:

VITE_API_BASE_URL (default: http://localhost:5000/api)

Admin protection (key places)

Backend: backend/middleware/auth.js
authMiddleware verifies JWT and sets req.user.
adminMiddleware checks req.user.role === 'admin' and returns 403 if not.

Admin routes use both middlewares (e.g., backend/routes/adminRoutes.js, productRoutes, categoryRoutes).

Frontend: frontend/src/components/AdminRoute.jsx — protects /admin/* routes by fetching /auth/profile and allowing access only when role === 'admin'.

UI: frontend/src/components/Navbar.jsx only shows the Admin link when user.role === 'admin'.

Note: frontend checks are for UX only — always rely on backend middleware for real security.

Data & seeds

Example JSON data: ecommerce/*.json (users, products, categories, carts) — useful for seeding or data reference.

Short map

Backend

server entry: backend/server.js
auth logic: backend/controllers/authController.js
admin/user actions: backend/controllers/userController.js
auth middleware: backend/middleware/auth.js

Frontend

routing: frontend/src/App.jsx, frontend/src/pages/AdminPage.jsx
admin guard: frontend/src/components/AdminRoute.jsx
api: frontend/src/api/* (authApi, adminApi, axiosConfig)