export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'IPC_TIMEOUT'
  | 'STATE_CONFLICT'
  | 'INTERNAL_ERROR'

export interface IpcRequest<T> {
  apiVersion: string
  correlationId: string
  payload: T
}

export interface IpcError {
  code: ErrorCode
  message: string
  details?: Record<string, unknown>
}

export interface IpcResponse<T> {
  ok: boolean
  data?: T
  error?: IpcError
  correlationId: string
}