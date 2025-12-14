import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'
import path from 'path'
import { app } from 'electron'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'

// Database path in user data directory
// NOTE: This module should only be imported after app.isReady()
const dbPath = path.join(app.getPath('userData'), 'sqlite.db')
console.log('Database path:', dbPath)

const sqlite = new Database(dbPath)
sqlite.pragma('foreign_keys = ON')

export const db = drizzle(sqlite, { schema })

// Run Drizzle migrations
try {
  // In production, migrations are in the resources folder
  // In development, they're in the project root
  const migrationsFolder = app.isPackaged
    ? path.join(process.resourcesPath, 'drizzle')
    : path.join(__dirname, '../../drizzle')

  console.log('Running migrations from:', migrationsFolder)
  migrate(db, { migrationsFolder })
  console.log('Migrations completed successfully')
} catch (error) {
  console.error('Migration error:', error)
}

export { sqlite }
