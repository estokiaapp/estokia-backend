// Mock data for testing

export const mockUsers = {
  validUser: {
    id: '1',
    email: 'test@example.com',
    name: 'Test User'
  },
  validUserArray: [
    { id: '1', email: 'user1@example.com', name: 'User 1' },
    { id: '2', email: 'user2@example.com', name: 'User 2' }
  ],
  createUserRequest: {
    email: 'newuser@example.com',
    name: 'New User',
    password: 'password123'
  },
  updateUserRequest: {
    name: 'Updated Name',
    email: 'updated@example.com'
  }
};

export const mockProducts = {
  validProduct: {
    id: '1',
    name: 'Product 1',
    sku: 'SKU001',
    sellingPrice: 100,
    currentStock: 50,
    categoryId: 'cat1'
  },
  validProductArray: [
    {
      id: '1',
      name: 'Product 1',
      sku: 'SKU001',
      sellingPrice: 100,
      currentStock: 50
    },
    {
      id: '2',
      name: 'Product 2',
      sku: 'SKU002',
      sellingPrice: 200,
      currentStock: 25
    }
  ],
  createProductRequest: {
    name: 'New Product',
    sku: 'SKU001',
    sellingPrice: 100,
    currentStock: 50,
    categoryId: 'cat1',
    description: 'Test product'
  },
  updateProductRequest: {
    name: 'Updated Product',
    sellingPrice: 150,
    currentStock: 75
  }
};

export const mockAuth = {
  loginRequest: {
    email: 'test@example.com',
    password: 'password123'
  },
  invalidLoginRequest: {
    email: 'test@example.com',
    password: 'wrongpassword'
  },
  loginResponse: {
    token: 'mock-jwt-token',
    user: {
      id: '1',
      email: 'test@example.com',
      name: 'Test User'
    }
  }
};

export const mockSales = {
  createSaleRequest: {
    saleItems: [
      {
        productId: '1',
        quantity: 2,
        unitPrice: 100
      },
      {
        productId: '2',
        quantity: 1,
        unitPrice: 50
      }
    ],
    customerInfo: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890'
    }
  },
  validSale: {
    id: 'sale-1',
    saleNumber: 'SALE-001',
    userId: 1,
    totalAmount: 250,
    status: 'PENDING',
    saleDate: '2023-12-01T10:00:00Z',
    saleItems: [
      {
        id: 'item-1',
        productId: '1',
        quantity: 2,
        unitPrice: 100,
        subtotal: 200
      },
      {
        id: 'item-2',
        productId: '2',
        quantity: 1,
        unitPrice: 50,
        subtotal: 50
      }
    ]
  },
  updateStatusRequest: {
    status: 'COMPLETED'
  }
};

export const mockStock = {
  stockAdjustmentRequest: {
    quantity: 50,
    type: 'IN',
    reason: 'New shipment',
    notes: 'Received from supplier ABC'
  },
  bulkStockAdjustmentRequest: {
    adjustments: [
      {
        productId: '1',
        quantity: 100,
        type: 'IN',
        reason: 'Restock'
      },
      {
        productId: '2',
        quantity: -10,
        type: 'ADJUSTMENT',
        reason: 'Damaged goods'
      }
    ]
  },
  stockMovement: {
    id: 'movement-1',
    productId: '1',
    userId: 1,
    type: 'IN',
    quantity: 50,
    unitPrice: 80,
    reason: 'New shipment',
    movementDate: '2023-12-01T10:00:00Z'
  },
  inventoryReport: {
    summary: {
      totalProducts: 10,
      totalValue: 15000,
      lowStockProducts: 2,
      outOfStockProducts: 1
    },
    products: [
      {
        id: '1',
        name: 'Product 1',
        sku: 'SKU001',
        currentStock: 50,
        minimumStock: 10,
        maximumStock: 100,
        costPrice: 80,
        sellingPrice: 100,
        stockValue: 4000,
        isLowStock: false,
        isOutOfStock: false
      }
    ]
  }
};