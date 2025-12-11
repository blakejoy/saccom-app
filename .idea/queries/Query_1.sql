import Database from 'better-sqlite3';

const db = new Database('path/to/your/database.db'); // Replace with your actual database path

const stmt = db.prepare('SELECT * FROM sqlite_master WHERE type=\'table\'');

const rows = stmt.all();

console.log(rows);

db.close(); // Close the connection when done
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { sql } from 'drizzle-orm';

const sqlite = new Database('path/to/your/database.db'); // Replace with your actual database path
const db = drizzle({ client: sqlite });

const result = db.all(sql`SELECT * FROM sqlite_master WHERE type='table'`);

console.log(result);

sqlite.close(); // Close the connection when done;
