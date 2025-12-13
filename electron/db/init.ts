import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { db, sqlite } from './index'
import { seed } from './seed'
import path from 'path'
import fs from 'fs'
import { app } from 'electron'

export async function initializeDatabase() {
  try {
    console.log('Initializing database...')

    // Check if database has tables
    const tables = sqlite
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='accommodations'"
      )
      .all()

    const isFirstRun = tables.length === 0

    if (isFirstRun) {
      console.log('First run detected - setting up database...')

      // Determine migrations folder path
      const migrationsFolder = app.isPackaged
        ? path.join(process.resourcesPath, 'drizzle')
        : path.join(app.getAppPath(), 'drizzle')

      if (fs.existsSync(migrationsFolder)) {
        console.log('Running migrations from:', migrationsFolder)
        migrate(db, { migrationsFolder })
        console.log('✓ Migrations completed')
      } else {
        console.log('⚠️  Migrations folder not found at:', migrationsFolder)
      }

      // Seed initial data
      console.log('Seeding initial data...')
      await seed()
      console.log('✓ Database initialized successfully')
    } else {
      console.log('✓ Database already initialized')

      // Optionally run migrations to update schema on app updates
      const migrationsFolder = app.isPackaged
        ? path.join(process.resourcesPath, 'drizzle')
        : path.join(app.getAppPath(), 'drizzle')

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