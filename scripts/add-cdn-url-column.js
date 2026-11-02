#!/usr/bin/env node
/**
 * Migration: Add cdn_url + cdn_url_updated_at columns to LI_STORAGE_MAP
 * Run once: node scripts/add-cdn-url-column.js
 *
 * cdn_url           — cached Telegram CDN download URL (expires ~1h, refreshed on demand)
 * cdn_url_updated_at — when cdn_url was last fetched; used for TTL expiry check (50 min)
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 4000,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
  });

  console.log('Connected. Running migration...');

  // Add cdn_url column if it doesn't exist
  try {
    await conn.execute(`
      ALTER TABLE LI_STORAGE_MAP
      ADD COLUMN IF NOT EXISTS cdn_url VARCHAR(1000) DEFAULT NULL
    `);
    console.log('✓ cdn_url column added to LI_STORAGE_MAP');
  } catch (err) {
    if (err.message?.includes('Duplicate column')) {
      console.log('✓ cdn_url column already exists — skipping');
    } else {
      console.error('cdn_url migration failed:', err.message);
      process.exit(1);
    }
  }

  // Add cdn_url_updated_at column if it doesn't exist
  try {
    await conn.execute(`
      ALTER TABLE LI_STORAGE_MAP
      ADD COLUMN IF NOT EXISTS cdn_url_updated_at TIMESTAMP NULL DEFAULT NULL
    `);
    console.log('✓ cdn_url_updated_at column added to LI_STORAGE_MAP');
  } catch (err) {
    if (err.message?.includes('Duplicate column')) {
      console.log('✓ cdn_url_updated_at column already exists — skipping');
    } else {
      console.error('cdn_url_updated_at migration failed:', err.message);
      process.exit(1);
    }
  }

  // Add index for fast UUID + cdn_url lookup
  try {
    await conn.execute(`
      CREATE INDEX IF NOT EXISTS idx_storage_cdn ON LI_STORAGE_MAP (file_uuid, cdn_url(100))
    `);
    console.log('✓ Index idx_storage_cdn created');
  } catch {
    // index may already exist — ignore
    console.log('✓ Index already exists — skipping');
  }

  await conn.end();
  console.log('\n✅ Migration complete. cdn_url + cdn_url_updated_at columns are ready.\n');
  console.log('💡 TIP: Existing rows have cdn_url_updated_at = NULL, which means they will');
  console.log('   automatically re-fetch a fresh CDN URL on next request (correct behavior).\n');
}

migrate();
