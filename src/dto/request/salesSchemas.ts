export const CREATE_SALE_SCHEMA = {
  description: 'Create a new sale transaction',
  tags: ['sales'],
  body: {
    type: 'object',
    required: ['saleItems'],
    properties: {
      saleItems: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: ['productId', 'quantity', 'unitPrice'],
          properties: {
            productId: { type: 'integer', minimum: 1 },
            quantity: { type: 'integer', minimum: 1 },
            unitPrice: { type: 'number', minimum: 0 }
          }
        }
      },
      customerInfo: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' }
        }
      }
    }
  },
  response: {
    201: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        saleNumber: { type: 'string' },
        userId: { type: 'integer' },
        totalAmount: { type: 'number' },
        status: { type: 'string' },
        saleDate: { type: 'string' },
        saleItems: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              productId: { type: 'integer' },
              quantity: { type: 'integer' },
              unitPrice: { type: 'number' },
              subtotal: { type: 'number' }
            }
          }
        }
      }
    }
  }
}

export const UPDATE_SALE_STATUS_SCHEMA = {
  description: 'Update sale status',
  tags: ['sales'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'integer', minimum: 1 }
    },
    required: ['id']
  },
  body: {
    type: 'object',
    required: ['status'],
    properties: {
      status: {
        type: 'string',
        enum: ['PENDING', 'COMPLETED', 'CANCELLED']
      }
    }
  }
}

export const GET_SALES_SCHEMA = {
  description: 'Get sales with optional filters',
  tags: ['sales'],
  querystring: {
    type: 'object',
    properties: {
      startDate: { type: 'string', format: 'date' },
      endDate: { type: 'string', format: 'date' },
      status: {
        type: 'string',
        enum: ['PENDING', 'COMPLETED', 'CANCELLED']
      },
      userId: { type: 'integer' },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
      offset: { type: 'integer', minimum: 0, default: 0 }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        sales: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              saleNumber: { type: 'string' },
              userId: { type: 'integer' },
              totalAmount: { type: 'number' },
              status: { type: 'string' },
              saleDate: { type: 'string' },
              saleItems: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer' },
                    productId: { type: 'integer' },
                    quantity: { type: 'integer' },
                    unitPrice: { type: 'number' },
                    subtotal: { type: 'number' }
                  }
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

export const GET_SALE_SCHEMA = {
  description: 'Get sale by ID',
  tags: ['sales'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'integer', minimum: 1 }
    },
    required: ['id']
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        saleNumber: { type: 'string' },
        userId: { type: 'integer' },
        totalAmount: { type: 'number' },
        status: { type: 'string' },
        saleDate: { type: 'string' },
        saleItems: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              productId: { type: 'integer' },
              quantity: { type: 'integer' },
              unitPrice: { type: 'number' },
              subtotal: { type: 'number' }
            }
          }
        }
      }
    }
  }
}

export const SALES_REPORT_SCHEMA = {
  description: 'Generate sales reports',
  tags: ['reports'],
  querystring: {
    type: 'object',
    required: ['startDate', 'endDate'],
    properties: {
      startDate: { type: 'string', format: 'date' },
      endDate: { type: 'string', format: 'date' },
      groupBy: {
        type: 'string',
        enum: ['day', 'week', 'month'],
        default: 'day'
      },
      categoryId: { type: 'integer', minimum: 1 },
      supplierId: { type: 'integer', minimum: 1 }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        summary: {
          type: 'object',
          properties: {
            totalSales: { type: 'number' },
            totalRevenue: { type: 'number' },
            averageOrderValue: { type: 'number' },
            totalItems: { type: 'integer' }
          }
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              period: { type: 'string' },
              sales: { type: 'integer' },
              revenue: { type: 'number' },
              items: { type: 'integer' }
            }
          }
        }
      }
    }
  }
}