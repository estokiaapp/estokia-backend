export const GET_ALL_CATEGORIES_SCHEMA = {
  description: 'Get all categories',
  tags: ['categories'],
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          createdAt: { type: 'string' },
          updatedAt: { type: 'string' },
          _count: {
            type: 'object',
            properties: {
              products: { type: 'integer' }
            }
          }
        }
      }
    }
  }
}

export const GET_CATEGORY_SCHEMA = {
  description: 'Get category by ID',
  tags: ['categories'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' }
    },
    required: ['id']
  }
}

export const CREATE_CATEGORY_SCHEMA = {
  description: 'Create a new category',
  tags: ['categories'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', minLength: 1 },
      description: { type: 'string' }
    }
  }
}

export const UPDATE_CATEGORY_SCHEMA = {
  description: 'Update category by ID',
  tags: ['categories'],
  security: [{ bearerAuth: [] }],
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
      name: { type: 'string', minLength: 1 },
      description: { type: 'string' }
    }
  }
}

export const DELETE_CATEGORY_SCHEMA = {
  description: 'Delete category by ID',
  tags: ['categories'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' }
    },
    required: ['id']
  }
}