import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'

// Use DB_PATH for Electron desktop app, DATABASE_URL for web, or default to ./sqlite.db
const dbPath = process.env.DB_PATH || process.env.DATABASE_URL || './sqlite.db'

const sqlite = new Database(dbPath)

// Enable foreign keys
sqlite.pragma('foreign_keys = ON')

export const db = drizzle(sqlite, { schema })
export { sqlite }
