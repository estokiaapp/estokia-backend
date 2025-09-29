# Sales and Inventory Management System

This document describes the newly implemented sales and inventory management features for EstokIA.

## 🚀 New Features Implemented

### 1. Sales Management
- **Create sales transactions** with multiple items
- **Track sales status**: PENDING → COMPLETED → CANCELLED
- **Automatic stock reduction** when sales are completed
- **Stock restoration** when sales are cancelled
- **Sales reporting** with analytics (daily, weekly, monthly)
- **Customer information** tracking (optional)

### 2. Stock Management
- **Stock adjustments** (IN, OUT, ADJUSTMENT types)
- **Bulk stock operations** for multiple products
- **Stock movement history** with full audit trail
- **Automatic low stock alerts** when inventory drops below minimum
- **Stock validation** to prevent overselling
- **Inventory reports** with value calculations

### 3. Reporting & Analytics
- **Sales reports** grouped by day/week/month
- **Top-selling products** analysis
- **Inventory reports** with stock levels and values
- **Stock movement reports** by date range
- **Low stock alerts** dashboard

## 📋 API Endpoints

### Sales Endpoints
```
GET    /api/sales                    # List all sales with filters
GET    /api/sales/:id                # Get specific sale by ID
POST   /api/sales                    # Create new sale
PATCH  /api/sales/:id/status         # Update sale status

# Reports
GET    /api/reports/sales            # Sales reports with analytics
GET    /api/reports/top-products     # Top selling products
GET    /api/reports/sales-by-period  # Sales data grouped by period
```

### Stock Management Endpoints
```
PUT    /api/products/:id/stock       # Adjust product stock
POST   /api/stock/bulk-adjust        # Bulk stock adjustments
GET    /api/products/:id/stock-history  # Product stock movement history
GET    /api/stock/movements          # All stock movements
GET    /api/stock/low-stock          # Products with low stock
PATCH  /api/products/:id/stock-limits   # Update stock min/max limits

# Reports
GET    /api/reports/inventory        # Inventory report
GET    /api/reports/stock-value      # Stock value analysis
GET    /api/products/:id/stock-trends  # Stock movement trends
```

## 🔧 Usage Examples

### Creating a Sale
```bash
POST /api/sales
{
  "saleItems": [
    {
      "productId": "product-id-1",
      "quantity": 2,
      "unitPrice": 25.50
    },
    {
      "productId": "product-id-2",
      "quantity": 1,
      "unitPrice": 15.00
    }
  ],
  "customerInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

### Adjusting Stock
```bash
PUT /api/products/:id/stock
{
  "quantity": 50,
  "type": "IN",
  "reason": "New shipment received",
  "notes": "Supplier ABC delivery"
}
```

### Bulk Stock Adjustment
```bash
POST /api/stock/bulk-adjust
{
  "adjustments": [
    {
      "productId": "product-1",
      "quantity": 100,
      "type": "IN",
      "reason": "Restock"
    },
    {
      "productId": "product-2",
      "quantity": -10,
      "type": "ADJUSTMENT",
      "reason": "Damaged goods"
    }
  ]
}
```

## 🔄 Business Logic Flow

### Sale Process
1. **CREATE** - Sale created with PENDING status
2. **VALIDATE** - Check product availability and prices
3. **COMPLETE** - Stock automatically reduced, sale marked COMPLETED
4. **CANCEL** - If needed, stock restored, sale marked CANCELLED

### Stock Management
1. **ADJUSTMENT** - Record stock movement with reason
2. **VALIDATION** - Prevent negative stock (configurable)
3. **ALERTS** - Automatic low stock notifications
4. **AUDIT** - Full movement history tracking

## 🏗️ Architecture

### Database Models
- **Sales** - Main sale record with status and totals
- **SaleItems** - Individual products in each sale
- **StockMovements** - All stock changes with audit trail
- **Products** - Extended with current/min/max stock fields

### Service Layer
- **SalesService** - Business logic for sales operations
- **StockService** - Stock management and validation
- **Repository Layer** - Data access abstraction

### Validation
- JSON Schema validation for all endpoints
- Business rule validation in service layer
- Type safety with TypeScript

## 🧪 Testing

Run the test script to verify endpoints:
```bash
node test-api.js
```

Start the development server:
```bash
npm run dev
```

## 🔒 Authentication

All sales and stock management endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📊 Features Overview

### ✅ Implemented
- [x] Sales transaction management
- [x] Stock adjustment functionality
- [x] Automatic stock updates on sales
- [x] Comprehensive reporting
- [x] Low stock alerts
- [x] Stock movement audit trail
- [x] Bulk operations support
- [x] Customer information tracking
- [x] Sales analytics and trends

### 🔄 Business Rules
- Stock cannot go negative (prevents overselling)
- Sales must be completed to reduce stock
- Cancelled sales restore stock automatically
- Low stock alerts generated when below minimum
- All stock movements are audited
- User tracking for all operations

This implementation provides a complete sales and inventory management system with proper business logic, validation, and reporting capabilities.