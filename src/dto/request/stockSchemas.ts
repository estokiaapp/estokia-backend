export const STOCK_ADJUSTMENT_SCHEMA = {
  description: 'Adjust product stock levels',
  tags: ['stock'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' }
    },
    required: ['id']
  },
  body: {
    type: 'object',
    required: ['quantity', 'type'],
    properties: {
      quantity: { type: 'integer' },
      type: {
        type: 'string',
        enum: ['IN', 'OUT', 'ADJUSTMENT']
      },
      reason: { type: 'string' },
      notes: { type: 'string' },
      unitPrice: { type: 'number', minimum: 0 }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        currentStock: { type: 'integer' },
        movement: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            quantity: { type: 'integer' },
            type: { type: 'string' },
            reason: { type: 'string' },
            movementDate: { type: 'string' }
          }
        }
      }
    }
  }
}

export const BULK_STOCK_ADJUSTMENT_SCHEMA = {
  description: 'Adjust multiple products stock levels',
  tags: ['stock'],
  body: {
    type: 'object',
    required: ['adjustments'],
    properties: {
      adjustments: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: ['productId', 'quantity', 'type'],
          properties: {
            productId: { type: 'string', minLength: 1 },
            quantity: { type: 'integer' },
            type: {
              type: 'string',
              enum: ['IN', 'OUT', 'ADJUSTMENT']
            },
            reason: { type: 'string' },
            notes: { type: 'string' },
            unitPrice: { type: 'number', minimum: 0 }
          }
        }
      }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        processed: { type: 'integer' },
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'string' },
              success: { type: 'boolean' },
              currentStock: { type: 'integer' },
              error: { type: 'string' }
            }
          }
        }
      }
    }
  }
}

export const GET_STOCK_HISTORY_SCHEMA = {
  description: 'Get stock movement history for a product',
  tags: ['stock'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' }
    },
    required: ['id']
  },
  querystring: {
    type: 'object',
    properties: {
      startDate: { type: 'string', format: 'date' },
      endDate: { type: 'string', format: 'date' },
      type: {
        type: 'string',
        enum: ['IN', 'OUT', 'ADJUSTMENT']
      },
      userId: { type: 'integer' },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
      offset: { type: 'integer', minimum: 0, default: 0 }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        product: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            sku: { type: 'string' },
            currentStock: { type: 'integer' }
          }
        },
        movements: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string' },
              quantity: { type: 'integer' },
              unitPrice: { type: 'number' },
              reason: { type: 'string' },
              notes: { type: 'string' },
              movementDate: { type: 'string' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  name: { type: 'string' }
                }
              }
            }
          }
        },
        total: { type: 'integer' }
      }
    }
  }
}

export const INVENTORY_REPORT_SCHEMA = {
  description: 'Generate inventory reports',
  tags: ['reports'],
  querystring: {
    type: 'object',
    properties: {
      categoryId: { type: 'string' },
      supplierId: { type: 'string' },
      lowStockOnly: { type: 'boolean', default: false },
      includeInactive: { type: 'boolean', default: false }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        summary: {
          type: 'object',
          properties: {
            totalProducts: { type: 'integer' },
            totalValue: { type: 'number' },
            lowStockProducts: { type: 'integer' },
            outOfStockProducts: { type: 'integer' }
          }
        },
        products: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              sku: { type: 'string' },
              currentStock: { type: 'integer' },
              minimumStock: { type: 'integer' },
              maximumStock: { type: 'integer' },
              costPrice: { type: 'number' },
              sellingPrice: { type: 'number' },
              stockValue: { type: 'number' },
              category: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' }
                }
              },
              supplier: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' }
                }
              },
              isLowStock: { type: 'boolean' },
              isOutOfStock: { type: 'boolean' }
            }
          }
        }
      }
    }
  }
}