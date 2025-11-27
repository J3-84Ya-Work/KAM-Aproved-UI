/**
 * Centralized logging utility
 * Automatically disables logs in production
 */

const isDev = process.env.NODE_ENV === 'development'

export const logger = {
  log: (...args: any[]) => {
    if (isDev) console.log(...args)
  },

  info: (...args: any[]) => {
    if (isDev) console.info(...args)
  },

  warn: (...args: any[]) => {
    if (isDev) console.warn(...args)
  },

  error: (...args: any[]) => {
    if (isDev) console.error(...args)
  },

  debug: (...args: any[]) => {
    if (isDev) console.debug(...args)
  },

  table: (data: any) => {
    if (isDev) console.table(data)
  },
}

// For browser environment
export const clientLogger = {
  log: (...args: any[]) => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log(...args)
    }
  },

  info: (...args: any[]) => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.info(...args)
    }
  },

  warn: (...args: any[]) => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.warn(...args)
    }
  },

  error: (...args: any[]) => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.error(...args)
    }
  },

  debug: (...args: any[]) => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.debug(...args)
    }
  },
}
