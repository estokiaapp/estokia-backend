import { MongoClient, Db, Collection } from 'mongodb';

class MongoDBConnection {
  private static instance: MongoDBConnection;
  private client: MongoClient | null = null;
  private db: Db | null = null;

  private constructor() {}

  static getInstance(): MongoDBConnection {
    if (!MongoDBConnection.instance) {
      MongoDBConnection.instance = new MongoDBConnection();
    }
    return MongoDBConnection.instance;
  }

  async connect(): Promise<void> {
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
      const dbName = process.env.MONGODB_DATABASE || 'estokia_logs';

      this.client = new MongoClient(uri);
      await this.client.connect();

      this.db = this.client.db(dbName);

      // Create indexes for performance
      await this.createIndexes();

      console.log(`MongoDB connected successfully to database: ${dbName}`);
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      // Don't throw - allow app to start even if logging is unavailable
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.close();
        console.log('MongoDB connection closed');
      }
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
    }
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('MongoDB database not initialized. Call connect() first.');
    }
    return this.db;
  }

  getCollection(name: string): Collection {
    return this.getDb().collection(name);
  }

  private async createIndexes(): Promise<void> {
    try {
      const collectionName = process.env.MONGODB_COLLECTION || 'activity_logs';
      const collection = this.getCollection(collectionName);

      // Create indexes for common queries
      await collection.createIndex({ timestamp: -1 });
      await collection.createIndex({ eventType: 1, timestamp: -1 });
      await collection.createIndex({ userId: 1, timestamp: -1 });
      await collection.createIndex({ resourceType: 1, resourceId: 1 });
      await collection.createIndex({ severity: 1, timestamp: -1 });

      console.log('MongoDB indexes created successfully');
    } catch (error) {
      console.error('Error creating MongoDB indexes:', error);
    }
  }

  isConnected(): boolean {
    return this.client !== null && this.db !== null;
  }
}

export default MongoDBConnection;
