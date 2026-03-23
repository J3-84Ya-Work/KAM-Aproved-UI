import sql from 'mssql'
import { logger } from '@/lib/logger'

const DB_CONFIG: sql.config = {
  server: process.env.DB_SERVER || '52.66.183.53',
  port: Number(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME || 'EscalationMatrixDB',
  user: process.env.DB_USER || 'Indus',
  password: process.env.DB_PASSWORD || 'Param@99811',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  requestTimeout: 30000,
  connectionTimeout: 15000,
}

let pool: sql.ConnectionPool | null = null

export async function getPool(): Promise<sql.ConnectionPool> {
  if (pool && pool.connected) {
    return pool
  }

  try {
    pool = await new sql.ConnectionPool(DB_CONFIG).connect()
    logger.log('📦 Connected to EscalationMatrixDB')
    return pool
  } catch (error: any) {
    logger.error('📦 DB connection failed:', error.message)
    pool = null
    throw error
  }
}

export { sql }
