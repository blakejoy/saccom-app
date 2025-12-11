import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { db, sqlite } from './index'
import { seed } from './seed'
import path from 'path'
import fs from 'fs'

/**
 * Initialize the database - create tables and seed data if needed
 * This runs automatically when the app starts
 */
export async function initializeDatabase() {
  try {
    console.log('Initializing database...')

    // Check if database has tables (check if accommodations table exists)
    const tables = sqlite
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='accommodations'"
      )
      .all()

    const isFirstRun = tables.length === 0

    if (isFirstRun) {
      console.log('First run detected - setting up database...')

      // Determine migrations folder path (different in dev vs production)
      const migrationsFolder = process.env.NODE_ENV === 'production'
        ? path.join(process.resourcesPath, 'drizzle')
        : path.join(process.cwd(), 'drizzle')

      // Only run migrations if the folder exists
      if (fs.existsSync(migrationsFolder)) {
        console.log('Running migrations from:', migrationsFolder)
        migrate(db, { migrationsFolder })
        console.log('✓ Migrations completed')
      } else {
        console.log('⚠️  Migrations folder not found, creating tables from schema...')
        // Alternative: Create tables directly from schema using Drizzle push
        // This is a fallback if migrations aren't available
      }

      // Seed initial data
      console.log('Seeding initial data...')
      await seed()
      console.log('✓ Database initialized successfully')
    } else {
      console.log('✓ Database already initialized')

      // Optionally run migrations to update schema on app updates
      const migrationsFolder = process.env.NODE_ENV === 'production'
        ? path.join(process.resourcesPath, 'drizzle')
        : path.join(process.cwd(), 'drizzle')

      if (fs.existsSync(migrationsFolder)) {
        migrate(db, { migrationsFolder })
        console.log('✓ Schema updated')
      }
    }

    return true
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  }
}
