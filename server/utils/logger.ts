/**
 * Structured logger for Vercel log drains.
 * Outputs JSON lines for easy parsing by Datadog, Grafana, etc.
 * Falls back to console for local development.
 */

type LogLevel = 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  requestId?: string
  [key: string]: unknown
}

function emit(entry: LogEntry): void {
  const line = {
    timestamp: new Date().toISOString(),
    service: 'youfly-api',
    ...entry,
  }

  switch (entry.level) {
    case 'error':
      console.error(JSON.stringify(line))
      break
    case 'warn':
      console.warn(JSON.stringify(line))
      break
    default:
      console.log(JSON.stringify(line))
  }
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>) {
    emit({ level: 'info', message, ...meta })
  },
  warn(message: string, meta?: Record<string, unknown>) {
    emit({ level: 'warn', message, ...meta })
  },
  error(message: string, meta?: Record<string, unknown>) {
    emit({ level: 'error', message, ...meta })
  },
}
