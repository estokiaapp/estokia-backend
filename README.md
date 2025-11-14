# Estokia Backend API

A RESTful API built with Fastify, Prisma & TypeScript for inventory management with demand forecasting, sales tracking, and comprehensive analytics.

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
- **ML Integration** - Python-based demand forecasting with confidence levels
- **MongoDB Logging** - Audit trails and analytics logging

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

3. Seed the database (optional):
```bash
npm run seed
```

4. Start development server:
```bash
npm run dev
```

5. Visit the API:
- API Base URL: http://localhost:8080
- Documentation: http://localhost:8080/docs

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email and password
- `GET /api/auth/me` - Get current user profile (🔒 requires JWT)

### Users
- `GET /api/users` - Get all users (🔒 requires JWT)
- `GET /api/users/:id` - Get user by ID (🔒 requires JWT)
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user (🔒 requires JWT)
- `DELETE /api/users/:id` - Delete user (🔒 requires JWT)

### Categories
- `GET /api/categories` - Get all categories (🔒 requires JWT)
- `GET /api/categories/:id` - Get category by ID (🔒 requires JWT)
- `POST /api/categories` - Create new category (🔒 requires JWT)
- `PUT /api/categories/:id` - Update category (🔒 requires JWT)
- `DELETE /api/categories/:id` - Delete category (🔒 requires JWT)

### Products
- `GET /api/products` - Get all products with filters (🔒 requires JWT)
- `GET /api/products/:id` - Get product by ID (🔒 requires JWT)
- `POST /api/products` - Create new product (🔒 requires JWT)
- `PUT /api/products/:id` - Update product (🔒 requires JWT)
- `DELETE /api/products/:id` - Delete product (🔒 requires JWT)
- `GET /api/products/low-stock` - Get products with low stock (🔒 requires JWT)

### Sales
- `GET /api/sales` - Get all sales with filters (🔒 requires JWT)
- `GET /api/sales/:id` - Get sale by ID (🔒 requires JWT)
- `POST /api/sales` - Create new sale (🔒 requires JWT)
- `PATCH /api/sales/:id/status` - Update sale status (🔒 requires JWT)
- `GET /api/reports/sales` - Get sales report (🔒 requires JWT)
- `GET /api/reports/top-products` - Get top selling products (🔒 requires JWT)
- `GET /api/reports/sales-by-period` - Get sales grouped by period (🔒 requires JWT)

### Stock Management
- `GET /api/stock/movements` - Get stock movements (🔒 requires JWT)
- `POST /api/stock/movements` - Record stock movement (🔒 requires JWT)
- `GET /api/stock/alerts` - Get stock alerts (🔒 requires JWT)

### Demand Forecasts (ML-powered)
- `GET /api/predictions/sales/:userId` - Get demand forecasts for user (🔒 requires JWT)
- `POST /api/predictions/sales/:userId` - Run ML prediction for user (🔒 requires JWT)
- `POST /api/predictions/daily` - Run daily predictions for all users (🔒 requires JWT)

### Logs & Analytics
- `GET /api/logs` - Get system logs with filters (🔒 requires JWT)
- `GET /api/logs/analytics` - Get analytics data (🔒 requires JWT)

## Example Usage

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@estokia.com", "password": "admin123"}'
```

**Default credentials after seeding:**
- Admin: `admin@estokia.com` / `admin123`
- Operator: `operator@estokia.com` / `operator123`

### Create a Product (with JWT)
```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Wireless Keyboard",
    "sku": "ELEC-005",
    "categoryId": 1,
    "costPrice": 25.00,
    "sellingPrice": 49.99,
    "currentStock": 100,
    "minimumStock": 15,
    "alertThresholdDays": 7,
    "unitOfMeasure": "UN"
  }'
```

### Get Demand Forecasts
```bash
curl http://localhost:8080/api/predictions/sales/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run seed` - Seed the database with test data (373 sales across different confidence levels)
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npx prisma studio` - Open Prisma database browser
- `npx prisma migrate dev` - Create and apply new migration

## Project Structure

```
src/
├── index.ts                # Main application entry point
├── routes/
│   ├── authRoutes.ts      # Authentication routes
│   ├── userRoutes.ts      # User management routes
│   ├── categoryRoutes.ts  # Category routes
│   ├── productRoutes.ts   # Product routes
│   ├── salesRoutes.ts     # Sales routes
│   ├── stockRoutes.ts     # Stock management routes
│   ├── predictionRoutes.ts # ML prediction routes
│   └── logRoutes.ts       # Logging and analytics routes
├── controllers/           # Business logic handlers
├── services/              # Business logic layer
├── repositories/          # Data access layer
├── middleware/
│   ├── auth.ts           # JWT authentication middleware
│   ├── errorHandler.ts   # Global error handling
│   └── logging.ts        # Request logging middleware
├── dto/
│   └── request/          # Request validation schemas
├── config/
│   └── mongodb.ts        # MongoDB connection config
└── utils/
    └── auth.ts           # Password hashing utilities

prisma/
├── schema.prisma         # Database schema
├── seed.ts              # Database seeding script
└── migrations/          # Database migrations
```

## Database Schema

The API uses an inventory management schema:

- **User**: id, email, name, password (hashed), type (ADMIN/OPERATOR), active, createdAt, updatedAt
- **Category**: id, name, description, createdAt, updatedAt
- **Product**: id, name, sku, categoryId, costPrice, sellingPrice, currentStock, minimumStock, alertThresholdDays, unitOfMeasure, description, active, createdAt, updatedAt
- **Sale**: id, saleNumber, userId, totalAmount, status (PENDING/COMPLETED/CANCELLED), saleDate, createdAt, updatedAt
- **SaleItem**: id, saleId, productId, quantity, unitPrice, subtotal, createdAt
- **DemandForecast**: id, productId, userId, daysToStockout, averageDailyDemand, confidenceLevel (VERY_LOW/LOW/MEDIUM/HIGH/VERY_HIGH), calculationDate, createdAt

### Confidence Levels

The ML forecasting system assigns confidence levels based on historical data:

| Level | Sales Records | Expected R² | Description |
|-------|---------------|-------------|-------------|
| VERY_LOW | 1-7 | < 0.3 | Insufficient data |
| LOW | 8-14 | 0.3-0.5 | Fair predictions |
| MEDIUM | 15-29 | 0.5-0.7 | Good predictions |
| HIGH | 30-59 | 0.7-0.85 | Reliable forecasts |
| VERY_HIGH | 60+ | > 0.85 | Highly accurate |

## Security

- **Password Hashing**: All passwords are hashed using bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication for protected routes
- **Protected Endpoints**: Sensitive operations require valid JWT tokens
- **Input Validation**: All input is validated against defined schemas

## Development

The API is set up with comprehensive TypeScript configuration, ESM modules, and includes validation, error handling, and API documentation out of the box.

### Seeded Data

After running `npm run seed`, the database contains:
- 2 users (admin and operator)
- 4 categories (Periféricos, Hardware de PC, Videogames, Apple)
- 10 tech products (in Portuguese)
- 373 sales distributed across different confidence levels for ML testing:
  - **VERY_LOW** (5 sales): Película de Vidro
  - **LOW** (12 sales each): Teclado Mecânico RGB, Fone Bluetooth Premium
  - **MEDIUM** (22 sales each): Mouse Gamer RGB, SSD 480GB SATA
  - **HIGH** (45 sales each): Memória RAM 16GB DDR4, PlayStation 5
  - **VERY_HIGH** (70 sales each): Xbox Series X, MacBook Pro M3, iPhone 15 Pro

### ML Predictions

**Generate forecasts for a specific user:**
```bash
curl -X POST http://localhost:8080/api/predictions/sales/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Run daily predictions for all users:**
```bash
curl -X POST http://localhost:8080/api/predictions/daily \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

The prediction scripts:
1. Analyze historical sales data
2. Calculate average daily demand
3. Assign confidence levels based on data volume
4. Store forecasts in the database

## Tech Stack

- **Backend**: Node.js, Fastify, TypeScript
- **Database**: SQLite (Prisma ORM)
- **Logging**: MongoDB
- **ML**: Python (scikit-learn, pandas)
- **Testing**: Vitest
- **Documentation**: Swagger/OpenAPI