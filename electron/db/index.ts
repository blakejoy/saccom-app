import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'
import path from 'path'
import { app } from 'electron'

// Database path in user data directory
// NOTE: This module should only be imported after app.isReady()
const dbPath = path.join(app.getPath('userData'), 'sqlite.db')
console.log('Database path:', dbPath)

const sqlite = new Database(dbPath)
sqlite.pragma('foreign_keys = ON')

export const db = drizzle(sqlite, { schema })
export { sqlite }
