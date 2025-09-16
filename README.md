# Estokia Backend API

A RESTful API built with Fastify, Prisma & TypeScript featuring user and post management with comprehensive validation and documentation.

## Features

- **Fastify** - Fast and low overhead web framework
- **Prisma ORM** - Type-safe database client with SQLite
- **TypeScript** - Full type safety
- **Swagger/OpenAPI** - Auto-generated API documentation
- **CORS** - Cross-origin resource sharing enabled
- **JWT Authentication** - Secure authentication with JSON Web Tokens
- **Password Hashing** - Bcrypt password hashing for security
- **Validation** - Request validation with custom error handling
- **Error Handling** - Centralized error handling middleware

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Run database migrations:
```bash
npx prisma migrate dev
npx prisma generate
```

3. Start development server:
```bash
npm run dev
```

4. Visit the API:
- API Base URL: http://localhost:3000
- Documentation: http://localhost:3000/docs

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email and password
- `GET /api/auth/me` - Get current user profile (🔒 requires JWT)

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user (with password)
- `PUT /api/users/:id` - Update user (🔒 requires JWT)
- `DELETE /api/users/:id` - Delete user (🔒 requires JWT)

### Posts
- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create new post (🔒 requires JWT)
- `PUT /api/posts/:id` - Update post (🔒 requires JWT)
- `DELETE /api/posts/:id` - Delete post (🔒 requires JWT)

## Example Usage

### Register a User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "name": "John Doe", "password": "securepassword123"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "securepassword123"}'
```

### Create a Post (with JWT)
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title": "My Post", "content": "Post content", "authorId": 1, "published": true}'
```

### Get Current User Profile
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npx prisma studio` - Open Prisma database browser

## Project Structure

```
src/
├── index.ts              # Main application entry point
├── routes/
│   ├── auth.ts          # Authentication routes
│   ├── users.ts         # User routes
│   └── posts.ts         # Post routes
├── middleware/
│   ├── auth.ts          # JWT authentication middleware
│   ├── errorHandler.ts  # Global error handling
│   └── validation.ts    # Validation utilities
├── utils/
│   └── auth.ts          # Password hashing utilities
└── types/
    └── index.ts         # TypeScript interfaces

prisma/
├── schema.prisma        # Database schema
└── migrations/          # Database migrations
```

## Database Schema

The API uses a simple blog-like schema with Users and Posts:

- **User**: id, email, name, password (hashed), createdAt, updatedAt
- **Post**: id, title, content, published, authorId, createdAt, updatedAt

## Security

- **Password Hashing**: All passwords are hashed using bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication for protected routes
- **Protected Endpoints**: Sensitive operations require valid JWT tokens
- **Input Validation**: All input is validated against defined schemas

## Development

The API is set up with comprehensive TypeScript configuration, ESM modules, and includes validation, error handling, and API documentation out of the box.