/**
 * Standardized API Response Wrapper
 * Provides consistent response structures across all API routes
 */

/**
 * Standard success response structure
 * All successful API responses should wrap data in this format
 */
export interface ApiResponse<T> {
  data: T
  meta?: {
    total?: number
    limit?: number
    offset?: number
    hasMore?: boolean
  }
}

/**
 * Standard error response structure
 * All error responses should follow this format
 */
export interface ApiError {
  error: string
  code?: string
  details?: unknown
}

/**
 * Creates a standardized success response
 * @param data - The response payload
 * @param meta - Optional pagination/metadata
 * @returns Response object with consistent structure
 */
export function successResponse<T>(
  data: T,
  meta?: ApiResponse<T>['meta']
): Response {
  const body: ApiResponse<T> = { data }
  if (meta) {
    body.meta = meta
  }
  return Response.json(body)
}

/**
 * Creates a standardized error response
 * @param error - Human-readable error message
 * @param status - HTTP status code (default: 400)
 * @param details - Optional additional error details
 * @param code - Optional machine-readable error code
 * @returns Response object with consistent error structure
 */
export function errorResponse(
  error: string,
  status: number = 400,
  details?: unknown,
  code?: string
): Response {
  const body: ApiError = { error }
  if (code) {
    body.code = code
  }
  if (details !== undefined) {
    body.details = details
  }
  return Response.json(body, { status })
}

/**
 * Creates a NextResponse-compatible success response
 * Use when you need to add custom headers (e.g., rate limiting)
 */
export function createSuccessBody<T>(
  data: T,
  meta?: ApiResponse<T>['meta']
): ApiResponse<T> {
  const body: ApiResponse<T> = { data }
  if (meta) {
    body.meta = meta
  }
  return body
}

/**
 * Creates a NextResponse-compatible error body
 * Use when you need to add custom headers (e.g., rate limiting)
 */
export function createErrorBody(
  error: string,
  details?: unknown,
  code?: string
): ApiError {
  const body: ApiError = { error }
  if (code) {
    body.code = code
  }
  if (details !== undefined) {
    body.details = details
  }
  return body
}
