export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiMeta {
  timestamp: string;
  requestId: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  meta: ApiMeta;
}

export function createMeta(requestId: string): ApiMeta {
  return {
    timestamp: new Date().toISOString(),
    requestId,
  };
}

export function successResponse<T>(
  data: T,
  requestId: string,
): ApiResponse<T> {
  return {
    success: true,
    data,
    error: null,
    meta: createMeta(requestId),
  };
}

export function errorResponse(
  code: string,
  message: string,
  requestId: string,
  details?: unknown,
): ApiResponse<null> {
  return {
    success: false,
    data: null,
    error: { code, message, details },
    meta: createMeta(requestId),
  };
}
