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