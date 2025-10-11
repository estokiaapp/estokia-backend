import { Collection } from 'mongodb';
import MongoDBConnection from '../config/mongodb.js';
import type {
  ActivityLog,
  LogFilters,
  LogPagination,
  LogQueryResult,
  ActivitySummary,
  EventType,
  LogSeverity,
  Action,
  ResourceType,
} from '../types/logs.js';

class LogService {
  private collection: Collection<ActivityLog> | null = null;
  private collectionName: string;

  constructor() {
    this.collectionName = process.env.MONGODB_COLLECTION || 'activity_logs';
    this.initializeCollection();
  }

  private initializeCollection(): void {
    try {
      const mongodb = MongoDBConnection.getInstance();
      if (mongodb.isConnected()) {
        this.collection = mongodb.getCollection(this.collectionName) as any;
      }
    } catch (error) {
      console.error('Failed to initialize log collection:', error);
    }
  }

  async log(logData: any): Promise<void> {
    try {
      // Re-initialize if collection is not available
      if (!this.collection) {
        this.initializeCollection();
      }

      if (!this.collection) {
        console.error('Log collection not available, skipping log');
        return;
      }

      // Build log object, removing undefined values
      const log: any = {
        timestamp: new Date(),
        severity: 'INFO',
      };

      // Only add defined properties
      Object.keys(logData).forEach((key) => {
        const value = (logData as any)[key];
        if (value !== undefined) {
          log[key] = value;
        }
      });

      await this.collection.insertOne(log);
    } catch (error) {
      // Log to console but don't throw - logging should never break the app
      console.error('Failed to write log to MongoDB:', error);
    }
  }

  async logSale(action: Action, saleData: any, userId?: number, userName?: string): Promise<void> {
    const eventTypeMap: Record<string, EventType> = {
      CREATE: 'SALE_CREATED',
      COMPLETE: 'SALE_COMPLETED',
      CANCEL: 'SALE_CANCELLED',
      UPDATE: 'SALE_UPDATED',
    };

    await this.log({
      eventType: eventTypeMap[action] || 'SALE_UPDATED',
      action,
      userId,
      userName,
      resourceType: 'SALE',
      resourceId: saleData.saleId || saleData.id,
      description: `Sale ${saleData.saleNumber || saleData.sale_number || ''} ${action.toLowerCase()}d`,
      metadata: {
        saleNumber: saleData.saleNumber || saleData.sale_number,
        totalAmount: saleData.totalAmount || saleData.total_amount,
        status: saleData.status,
        itemCount: saleData.items?.length,
      },
      severity: 'INFO',
    });
  }

  async logStockMovement(movementData: any, userId?: number, userName?: string): Promise<void> {
    const eventType: EventType =
      movementData.movement_type === 'IN'
        ? 'STOCK_INCREASED'
        : movementData.movement_type === 'OUT'
        ? 'STOCK_DECREASED'
        : 'STOCK_ADJUSTED';

    await this.log({
      eventType,
      action: 'ADJUST',
      userId,
      userName,
      resourceType: 'STOCK_MOVEMENT',
      resourceId: movementData.id,
      description: `Stock ${movementData.movement_type === 'IN' ? 'increased' : 'decreased'} for product ${movementData.product_id}`,
      metadata: {
        productId: movementData.product_id,
        quantity: movementData.quantity,
        movementType: movementData.movement_type,
        reason: movementData.reason,
        referenceType: movementData.reference_type,
        referenceId: movementData.reference_id,
      },
      severity: 'INFO',
    });
  }

  async logUserAction(
    eventType: EventType,
    action: Action,
    userData: any,
    userId?: number,
    userName?: string
  ): Promise<void> {
    await this.log({
      eventType,
      action,
      userId,
      userName,
      resourceType: 'USER',
      resourceId: userData.id || userData.userId,
      description: userData.description || `User ${action.toLowerCase()}`,
      metadata: {
        email: userData.email,
        role: userData.role,
        ...userData.metadata,
      },
      severity: eventType === 'AUTHENTICATION_FAILED' ? 'WARNING' : 'INFO',
    });
  }

  async logError(error: Error, context: any, userId?: number, userName?: string): Promise<void> {
    await this.log({
      eventType: context.eventType || 'API_ERROR',
      action: context.action || 'ERROR',
      userId,
      userName,
      resourceType: context.resourceType,
      resourceId: context.resourceId,
      description: `Error: ${error.message}`,
      errorMessage: error.stack || error.message,
      metadata: {
        operation: context.operation,
        ...context.metadata,
      },
      severity: 'ERROR',
    });
  }

  async getLogs(filters: LogFilters = {}, pagination: LogPagination = {}): Promise<LogQueryResult> {
    try {
      if (!this.collection) {
        this.initializeCollection();
      }

      if (!this.collection) {
        return { logs: [], total: 0, page: 1, limit: 50, totalPages: 0 };
      }

      const page = pagination.page || 1;
      const limit = pagination.limit || 50;
      const sortBy = pagination.sortBy || 'timestamp';
      const sortOrder = pagination.sortOrder === 'asc' ? 1 : -1;

      // Build query
      const query: any = {};

      if (filters.eventType) {
        query.eventType = Array.isArray(filters.eventType)
          ? { $in: filters.eventType }
          : filters.eventType;
      }

      if (filters.userId) {
        query.userId = filters.userId;
      }

      if (filters.resourceType) {
        query.resourceType = filters.resourceType;
      }

      if (filters.resourceId) {
        query.resourceId = filters.resourceId;
      }

      if (filters.severity) {
        query.severity = Array.isArray(filters.severity)
          ? { $in: filters.severity }
          : filters.severity;
      }

      if (filters.startDate || filters.endDate) {
        query.timestamp = {};
        if (filters.startDate) {
          query.timestamp.$gte = filters.startDate;
        }
        if (filters.endDate) {
          query.timestamp.$lte = filters.endDate;
        }
      }

      if (filters.search) {
        query.$or = [
          { description: { $regex: filters.search, $options: 'i' } },
          { userName: { $regex: filters.search, $options: 'i' } },
        ];
      }

      // Count total
      const total = await this.collection.countDocuments(query);

      // Get logs
      const logs = await this.collection
        .find(query)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();

      const totalPages = Math.ceil(total / limit);

      return {
        logs,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      console.error('Error fetching logs:', error);
      return { logs: [], total: 0, page: 1, limit: 50, totalPages: 0 };
    }
  }

  async getLogsByUser(userId: number, limit: number = 100): Promise<ActivityLog[]> {
    try {
      if (!this.collection) {
        this.initializeCollection();
      }

      if (!this.collection) {
        return [];
      }

      return await this.collection
        .find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error('Error fetching user logs:', error);
      return [];
    }
  }

  async getLogsByResource(resourceType: ResourceType, resourceId: number): Promise<ActivityLog[]> {
    try {
      if (!this.collection) {
        this.initializeCollection();
      }

      if (!this.collection) {
        return [];
      }

      return await this.collection
        .find({ resourceType, resourceId })
        .sort({ timestamp: -1 })
        .toArray();
    } catch (error) {
      console.error('Error fetching resource logs:', error);
      return [];
    }
  }

  async getRecentLogs(limit: number = 100): Promise<ActivityLog[]> {
    try {
      if (!this.collection) {
        this.initializeCollection();
      }

      if (!this.collection) {
        return [];
      }

      return await this.collection
        .find()
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error('Error fetching recent logs:', error);
      return [];
    }
  }

  async getErrorLogs(startDate?: Date, endDate?: Date): Promise<ActivityLog[]> {
    try {
      if (!this.collection) {
        this.initializeCollection();
      }

      if (!this.collection) {
        return [];
      }

      const query: any = {
        severity: { $in: ['ERROR', 'CRITICAL'] },
      };

      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) {
          query.timestamp.$gte = startDate;
        }
        if (endDate) {
          query.timestamp.$lte = endDate;
        }
      }

      return await this.collection
        .find(query)
        .sort({ timestamp: -1 })
        .toArray();
    } catch (error) {
      console.error('Error fetching error logs:', error);
      return [];
    }
  }

  async getActivitySummary(startDate?: Date, endDate?: Date): Promise<ActivitySummary> {
    try {
      if (!this.collection) {
        this.initializeCollection();
      }

      if (!this.collection) {
        return {
          totalLogs: 0,
          logsByEventType: {},
          logsBySeverity: {},
          recentErrors: [],
          mostActiveUsers: [],
          activityByHour: [],
        };
      }

      const query: any = {};
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) {
          query.timestamp.$gte = startDate;
        }
        if (endDate) {
          query.timestamp.$lte = endDate;
        }
      }

      // Total logs
      const totalLogs = await this.collection.countDocuments(query);

      // Logs by event type
      const eventTypeAgg = await this.collection
        .aggregate([
          { $match: query },
          { $group: { _id: '$eventType', count: { $sum: 1 } } },
        ])
        .toArray();
      const logsByEventType: Record<string, number> = {};
      eventTypeAgg.forEach((item: any) => {
        logsByEventType[item._id] = item.count;
      });

      // Logs by severity
      const severityAgg = await this.collection
        .aggregate([
          { $match: query },
          { $group: { _id: '$severity', count: { $sum: 1 } } },
        ])
        .toArray();
      const logsBySeverity: Record<string, number> = {};
      severityAgg.forEach((item: any) => {
        logsBySeverity[item._id] = item.count;
      });

      // Recent errors
      const recentErrors = await this.collection
        .find({ severity: { $in: ['ERROR', 'CRITICAL'] } })
        .sort({ timestamp: -1 })
        .limit(10)
        .toArray();

      // Most active users
      const userActivityAgg = await this.collection
        .aggregate([
          { $match: { ...query, userId: { $exists: true } } },
          {
            $group: {
              _id: '$userId',
              userName: { $first: '$userName' },
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ])
        .toArray();
      const mostActiveUsers = userActivityAgg.map((item: any) => ({
        userId: item._id,
        userName: item.userName,
        count: item.count,
      }));

      // Activity by hour
      const hourlyActivityAgg = await this.collection
        .aggregate([
          { $match: query },
          {
            $group: {
              _id: { $hour: '$timestamp' },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray();
      const activityByHour = hourlyActivityAgg.map((item: any) => ({
        hour: item._id,
        count: item.count,
      }));

      return {
        totalLogs,
        logsByEventType,
        logsBySeverity,
        recentErrors,
        mostActiveUsers,
        activityByHour,
      };
    } catch (error) {
      console.error('Error fetching activity summary:', error);
      return {
        totalLogs: 0,
        logsByEventType: {},
        logsBySeverity: {},
        recentErrors: [],
        mostActiveUsers: [],
        activityByHour: [],
      };
    }
  }
}

export default LogService;
