import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'
import type { CreatePostRequest, UpdatePostRequest } from '../types/index.js'

const prisma = new PrismaClient()

interface PostParams {
  id: string
}

export async function postRoutes(fastify: FastifyInstance) {
  fastify.get('/posts', {
    schema: {
      description: 'Get all posts',
      tags: ['posts'],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              title: { type: 'string' },
              content: { type: 'string' },
              published: { type: 'boolean' },
              authorId: { type: 'number' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const posts = await prisma.post.findMany({
        include: {
          author: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      })
      return posts
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch posts' })
    }
  })

  fastify.get<{ Params: PostParams }>('/posts/:id', {
    schema: {
      description: 'Get post by ID',
      tags: ['posts'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request: FastifyRequest<{ Params: PostParams }>, reply: FastifyReply) => {
    try {
      const postId = parseInt(request.params.id)
      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      })
      
      if (!post) {
        return reply.status(404).send({ error: 'Post not found' })
      }
      
      return post
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch post' })
    }
  })

  fastify.post<{ Body: CreatePostRequest }>('/posts', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Create a new post',
      tags: ['posts'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['title', 'authorId'],
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
          published: { type: 'boolean' },
          authorId: { type: 'number' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: CreatePostRequest }>, reply: FastifyReply) => {
    try {
      const post = await prisma.post.create({
        data: request.body,
        include: {
          author: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      })
      reply.status(201).send(post)
    } catch (error) {
      reply.status(500).send({ error: 'Failed to create post' })
    }
  })

  fastify.put<{ Params: PostParams; Body: UpdatePostRequest }>('/posts/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Update post by ID',
      tags: ['posts'],
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
          title: { type: 'string' },
          content: { type: 'string' },
          published: { type: 'boolean' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: PostParams; Body: UpdatePostRequest }>, reply: FastifyReply) => {
    try {
      const postId = parseInt(request.params.id)
      const post = await prisma.post.update({
        where: { id: postId },
        data: request.body,
        include: {
          author: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      })
      return post
    } catch (error) {
      reply.status(500).send({ error: 'Failed to update post' })
    }
  })

  fastify.delete<{ Params: PostParams }>('/posts/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Delete post by ID',
      tags: ['posts'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request: FastifyRequest<{ Params: PostParams }>, reply: FastifyReply) => {
    try {
      const postId = parseInt(request.params.id)
      await prisma.post.delete({
        where: { id: postId }
      })
      reply.status(204).send()
    } catch (error) {
      reply.status(500).send({ error: 'Failed to delete post' })
    }
  })
}