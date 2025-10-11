import { ObjectId } from 'mongodb';

export type LogSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export type EventType =
  // Sales Events
  | 'SALE_CREATED'
  | 'SALE_COMPLETED'
  | 'SALE_CANCELLED'
  | 'SALE_UPDATED'
  // Stock Movement Events
  | 'STOCK_INCREASED'
  | 'STOCK_DECREASED'
  | 'STOCK_ADJUSTED'
  | 'LOW_STOCK_ALERT'
  // User Events
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'PASSWORD_CHANGED'
  | 'AUTHENTICATION_FAILED'
  // Product Events
  | 'PRODUCT_CREATED'
  | 'PRODUCT_UPDATED'
  | 'PRODUCT_DELETED'
  | 'PRODUCT_ACTIVATED'
  | 'PRODUCT_DEACTIVATED'
  // Category Events
  | 'CATEGORY_CREATED'
  | 'CATEGORY_UPDATED'
  | 'CATEGORY_DELETED'
  // Supplier Events
  | 'SUPPLIER_CREATED'
  | 'SUPPLIER_UPDATED'
  | 'SUPPLIER_DELETED'
  // System Events
  | 'SYSTEM_STARTUP'
  | 'SYSTEM_SHUTDOWN'
  | 'DATABASE_ERROR'
  | 'API_ERROR'
  | 'API_REQUEST';

export type Action = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'START' | 'STOP' | 'COMPLETE' | 'CANCEL' | 'ADJUST';

export type ResourceType = 'PRODUCT' | 'USER' | 'CATEGORY' | 'SUPPLIER' | 'SALE' | 'STOCK_MOVEMENT';

export interface ActivityLog {
  _id?: ObjectId;
  timestamp: Date;
  eventType: EventType;
  action: Action | string;
  userId?: number;
  userName?: string;
  resourceType?: ResourceType;
  resourceId?: number;
  description: string;
  metadata?: Record<string, any>;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  ipAddress?: string;
  userAgent?: string;
  statusCode?: number;
  errorMessage?: string;
  duration?: number;
  severity: LogSeverity;
}

export interface LogFilters {
  eventType?: EventType | EventType[];
  userId?: number;
  resourceType?: ResourceType;
  resourceId?: number;
  severity?: LogSeverity | LogSeverity[];
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface LogPagination {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface LogQueryResult {
  logs: ActivityLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ActivitySummary {
  totalLogs: number;
  logsByEventType: Record<string, number>;
  logsBySeverity: Record<string, number>;
  recentErrors: ActivityLog[];
  mostActiveUsers: Array<{ userId: number; userName?: string; count: number }>;
  activityByHour: Array<{ hour: number; count: number }>;
}
