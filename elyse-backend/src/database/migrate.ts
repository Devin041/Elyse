import fs from 'fs';
import path from 'path';
import pool, { query } from '../config/database.config';
import logger from '../utils/logger';

/**
 * Migration Runner
 * Runs SQL migration files in order
 */

interface Migration {
    filename: string;
    number: number;
    sql: string;
}

// Create migrations table to track applied migrations
async function createMigrationsTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP DEFAULT NOW()
    );
  `;

    await query(sql);
    logger.info('Migrations tracking table ready');
}

// Get list of applied migrations
async function getAppliedMigrations(): Promise<string[]> {
    const result = await query('SELECT filename FROM migrations ORDER BY id');
    return result.rows.map((row: any) => row.filename);
}

// Get all migration files from migrations directory
function getMigrationFiles(): Migration[] {
    const migrationsDir = path.join(__dirname, 'migrations');

    if (!fs.existsSync(migrationsDir)) {
        logger.warn('Migrations directory not found');
        return [];
    }

    const files = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();

    return files.map(filename => {
        const filepath = path.join(migrationsDir, filename);
        const sql = fs.readFileSync(filepath, 'utf-8');
        const number = parseInt(filename.split('_')[0]);

        return { filename, number, sql };
    });
}

// Run a single migration
async function runMigration(migration: Migration) {
    logger.info(`Running migration: ${migration.filename}`);

    try {
        // Run migration SQL
        await query(migration.sql);

        // Record migration as applied
        await query(
            'INSERT INTO migrations (filename) VALUES ($1)',
            [migration.filename]
        );

        logger.info(`✅ Migration completed: ${migration.filename}`);
    } catch (error) {
        logger.error(`❌ Migration failed: ${migration.filename}`, { error });
        throw error;
    }
}

// Main migration function
export async function runMigrations() {
    try {
        logger.info('Starting database migrations...');

        // Create migrations tracking table
        await createMigrationsTable();

        // Get applied and available migrations
        const appliedMigrations = await getAppliedMigrations();
        const availableMigrations = getMigrationFiles();

        // Filter out already applied migrations
        const pendingMigrations = availableMigrations.filter(
            migration => !appliedMigrations.includes(migration.filename)
        );

        if (pendingMigrations.length === 0) {
            logger.info('No pending migrations');
            return;
        }

        logger.info(`Found ${pendingMigrations.length} pending migrations`);

        // Run each pending migration
        for (const migration of pendingMigrations) {
            await runMigration(migration);
        }

        logger.info(`🎉 All migrations completed successfully!`);
        logger.info(`Total applied: ${appliedMigrations.length + pendingMigrations.length}`);

    } catch (error) {
        logger.error('Migration process failed', { error });
        throw error;
    }
}

// Rollback last migration (for development)
export async function rollbackMigration() {
    try {
        const result = await query(
            'SELECT filename FROM migrations ORDER BY id DESC LIMIT 1'
        );

        if (result.rows.length === 0) {
            logger.warn('No migrations to rollback');
            return;
        }

        const lastMigration = result.rows[0].filename;
        logger.warn(`Rolling back migration: ${lastMigration}`);

        // Remove from migrations table
        await query('DELETE FROM migrations WHERE filename = $1', [lastMigration]);

        logger.info(`⚠️  Migration ${lastMigration} rolled back (manual cleanup may be needed)`);
    } catch (error) {
        logger.error('Rollback failed', { error });
        throw error;
    }
}

// CLI interface
if (require.main === module) {
    const command = process.argv[2];

    (async () => {
        try {
            if (command === 'rollback') {
                await rollbackMigration();
            } else {
                await runMigrations();
            }
            process.exit(0);
        } catch (error) {
            process.exit(1);
        } finally {
            await pool.end();
        }
    })();
}
