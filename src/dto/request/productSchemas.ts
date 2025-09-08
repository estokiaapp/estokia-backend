export const CREATE_PRODUCT_SCHEMA = {
  description: 'Create a new product',
  tags: ['products'],
  body: {
    type: 'object',
    required: ['name', 'sku'],
    properties: {
      name: { type: 'string' },
      sku: { type: 'string' },
      categoryId: { type: 'string' },
      supplierId: { type: 'string' },
      costPrice: { type: 'number', minimum: 0 },
      sellingPrice: { type: 'number', minimum: 0 },
      currentStock: { type: 'number', minimum: 0 },
      minimumStock: { type: 'number', minimum: 0 },
      maximumStock: { type: 'number', minimum: 0 },
      unitOfMeasure: { type: 'string' },
      description: { type: 'string' }
    }
  },
  response: {
    201: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        sku: { type: 'string' },
        categoryId: { type: 'string' },
        supplierId: { type: 'string' },
        costPrice: { type: 'number' },
        sellingPrice: { type: 'number' },
        currentStock: { type: 'number' },
        minimumStock: { type: 'number' },
        maximumStock: { type: 'number' },
        unitOfMeasure: { type: 'string' },
        description: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' }
      }
    }
  }
}

export const UPDATE_PRODUCT_SCHEMA = {
  description: 'Update product by ID',
  tags: ['products'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' }
    },
    required: ['id']
  },
  body: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      sku: { type: 'string' },
      categoryId: { type: 'string' },
      supplierId: { type: 'string' },
      costPrice: { type: 'number', minimum: 0 },
      sellingPrice: { type: 'number', minimum: 0 },
      currentStock: { type: 'number', minimum: 0 },
      minimumStock: { type: 'number', minimum: 0 },
      maximumStock: { type: 'number', minimum: 0 },
      unitOfMeasure: { type: 'string' },
      description: { type: 'string' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        sku: { type: 'string' },
        categoryId: { type: 'string' },
        supplierId: { type: 'string' },
        costPrice: { type: 'number' },
        sellingPrice: { type: 'number' },
        currentStock: { type: 'number' },
        minimumStock: { type: 'number' },
        maximumStock: { type: 'number' },
        unitOfMeasure: { type: 'string' },
        description: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' }
      }
    }
  }
}

export const GET_PRODUCTS_SCHEMA = {
  description: 'Get all products with optional filters',
  tags: ['products'],
  querystring: {
    type: 'object',
    properties: {
      categoryId: { type: 'string' },
      supplierId: { type: 'string' },
      minPrice: { type: 'number', minimum: 0 },
      maxPrice: { type: 'number', minimum: 0 },
      inStock: { type: 'boolean' }
    }
  },
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          sku: { type: 'string' },
          categoryId: { type: 'string' },
          supplierId: { type: 'string' },
          costPrice: { type: 'number' },
          sellingPrice: { type: 'number' },
          currentStock: { type: 'number' },
          minimumStock: { type: 'number' },
          maximumStock: { type: 'number' },
          unitOfMeasure: { type: 'string' },
          description: { type: 'string' },
          createdAt: { type: 'string' },
          updatedAt: { type: 'string' }
        }
      }
    }
  }
}

export const GET_PRODUCT_SCHEMA = {
  description: 'Get product by ID',
  tags: ['products'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' }
    },
    required: ['id']
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        sku: { type: 'string' },
        categoryId: { type: 'string' },
        supplierId: { type: 'string' },
        costPrice: { type: 'number' },
        sellingPrice: { type: 'number' },
        currentStock: { type: 'number' },
        minimumStock: { type: 'number' },
        maximumStock: { type: 'number' },
        unitOfMeasure: { type: 'string' },
        description: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' }
      }
    }
  }
}

export const DELETE_PRODUCT_SCHEMA = {
  description: 'Delete product by ID',
  tags: ['products'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' }
    },
    required: ['id']
  },
  response: {
    204: {
      type: 'null'
    }
  }
}