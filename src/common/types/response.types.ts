/**
 * Base response interface for all API responses
 */
export interface BaseResponse {
  /** Whether the request was successful */
  success: boolean;
  /** Metadata about the response */
  meta: {
    /** Timestamp of the response */
    timestamp: string;
    /** API version */
    version: string;
    /** Optional request ID for tracking */
    requestId?: string;
  };
}

/**
 * Success response interface
 */
export interface SuccessResponse<T = any> extends BaseResponse {
  success: true;
  /** Response data */
  data: T;
  /** Optional success message */
  message?: string;
}

/**
 * Error response interface
 */
export interface ErrorResponse extends BaseResponse {
  success: false;
  /** Error details */
  error: {
    /** Error code */
    code: string;
    /** Error message */
    message: string;
    /** Optional additional error details */
    details?: Record<string, unknown>;
  };
}

/**
 * Pagination information interface
 */
export interface PaginationInfo {
  /** Current page number (1-based) */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Total number of items */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there is a next page */
  hasNext: boolean;
  /** Whether there is a previous page */
  hasPrev: boolean;
}

/**
 * Paginated response interface
 */
export interface PaginatedSuccessResponse<T = any> extends SuccessResponse<T[]> {
  /** Pagination information */
  pagination: PaginationInfo;
}

/**
 * Raw response wrapper to bypass the response interceptor
 */
export interface RawResponse<T = any> {
  __raw: true;
  data: T;
}

/**
 * Helper function to create a raw response that bypasses the interceptor
 */
export function createRawResponse<T = any>(data: T): RawResponse<T> {
  return {
    __raw: true,
    data,
  };
}

/**
 * Type guard to check if a response is a raw response
 */
export function isRawResponse(data: any): data is RawResponse {
  return data && typeof data === 'object' && data.__raw === true;
}