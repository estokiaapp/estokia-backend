export const GET_ALL_USERS_SCHEMA = {
      description: 'Get all users',
      tags: ['users'],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              email: { type: 'string' },
              name: { type: 'string' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' }
            }
          }
        }
      }
    }

export const GET_USER_SCHEMA = {
      description: 'Get user by ID',
      tags: ['users'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer' }
        },
        required: ['id']
      }
    }

export const CREATE_USER_SCHEMA = {
      description: 'Create a new user',
      tags: ['users'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          password: { type: 'string', minLength: 6 }
        }
      }
    }

export const UPDATE_USER_SCHEMA = {
      description: 'Update user by ID',
      tags: ['users'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          name: { type: 'string' }
        }
      }
    }

export const DELETE_USER_SCHEMA = {
      description: 'Delete user by ID',
      tags: ['users'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer' }
        },
        required: ['id']
      }
    }