import type { Config } from 'jest';

const config: Config = {
  clearMocks: true,
  testEnvironment: 'node',
  
  // Use ts-jest for TypeScript files
  preset: 'ts-jest',
  
  // Transform configuration
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'js', 'json'],
  
  // Handle .js imports in TypeScript
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  
  // Test patterns
  testMatch: [
    "**/__tests__/**/*.test.ts"
  ],
  
  // Coverage
  collectCoverage: false,
  
  // Ignore transforming node_modules except fastify
  transformIgnorePatterns: [
    "node_modules/(?!(fastify|@fastify)/)"
  ]
};

export default config;