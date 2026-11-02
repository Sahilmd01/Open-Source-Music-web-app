#!/usr/bin/env node

/**
 * Database Data Clear Script
 * Clears all data from the Listenify database while preserving the schema
 * Usage: node clear-data.js
 */

const mysql = require("mysql2/promise");
require("dotenv").config();

// Database configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 4000,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 60000,
  enableKeepAlive: true,
};

/**
 * List of tables to clear (in order to avoid foreign key conflicts)
 * Tables are ordered by dependency to ensure foreign keys don't block deletion
 */
const tablesToClear = [
  // User interaction tables (no dependencies on other user tables)
  "LI_LISTENING_HISTORY",
  "LI_USER_LIKED_TRACKS",
  "LI_USER_LIKED_ALBUMS",
  "LI_USER_LIKED_PLAYLISTS",
  "LI_USER_FOLLOWS",

  // Playlist related
  "LI_PLAYLIST_TRACKS",
  "LI_PLAYLISTS",

  // Notifications
  "LI_NOTIFICATIONS",

  // Reports
  "LI_CONTENT_REPORTS",
  "LI_COPYRIGHT_INFRINGEMENT_REPORTS",

  // Music catalog
  "LI_TRACKS",
  "LI_ALBUMS",
  "LI_STATIONS",
  "LI_ARTISTS",

  // Sessions and auth
  "LI_SESSIONS",
  "LI_USER_OAUTH_ACCOUNTS",
  "LI_USER_PREFERENCES",
  "LI_USERS",

  // Infrastructure
  "LI_STORAGE_MAP",
  "LI_OTP_TRANSACTIONS",
];

async function clearDatabase() {
  let connection;

  try {
    console.log("🔄 Connecting to database...");
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Connected to database successfully\n");

    console.log("⚠️  Starting data deletion process...\n");

    // Disable foreign key checks temporarily
    await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
    console.log("🔓 Foreign key constraints disabled\n");

    let deletedCount = 0;

    // Delete data from each table
    for (const table of tablesToClear) {
      try {
        // Check if table exists first
        const [tables] = await connection.execute(
          `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
          [process.env.DB_NAME, table]
        );

        if (tables.length === 0) {
          console.log(`  ○ ${table.padEnd(30)} - (table not found)`);
          continue;
        }

        const [result] = await connection.execute(`DELETE FROM \`${table}\``);
        const affectedRows = result.affectedRows;

        if (affectedRows > 0) {
          console.log(`  ✓ ${table.padEnd(30)} - ${affectedRows} rows deleted`);
          deletedCount += affectedRows;
        } else {
          console.log(`  ○ ${table.padEnd(30)} - (empty)`);
        }
      } catch (error) {
        console.error(`  ✗ ${table.padEnd(30)} - Error: ${error.message}`);
      }
    }

    // Re-enable foreign key checks
    await connection.execute("SET FOREIGN_KEY_CHECKS = 1");
    console.log("\n🔒 Foreign key constraints re-enabled");

    // Reset auto-increment values for important tables
    console.log("\n📊 Resetting auto-increment counters...");
    const tablesWithAutoIncrement = ["LI_OTP_TRANSACTIONS", "LI_STORAGE_MAP"];

    for (const table of tablesWithAutoIncrement) {
      try {
        await connection.execute(`ALTER TABLE \`${table}\` AUTO_INCREMENT = 1`);
        console.log(`  ✓ ${table} - auto-increment reset`);
      } catch (error) {
        // Silently skip if table doesn't exist
      }
    }

    console.log(`\n${"=".repeat(60)}`);
    console.log(`✨ Database cleared successfully!`);
    console.log(`   Total rows deleted: ${deletedCount}`);
    console.log(`${"=".repeat(60)}\n`);

    console.log("📋 Summary:");
    console.log(`  • Database: ${process.env.DB_NAME}`);
    console.log(`  • Host: ${process.env.DB_HOST}`);
    console.log(`  • Tables processed: ${tablesToClear.length}`);
    console.log(`  • All data has been cleared`);
    console.log(`  • Database schema is intact\n`);
  } catch (error) {
    console.error("\n❌ Error occurred during database clearing:");
    console.error(`   ${error.message}\n`);

    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.error("   Issue: Database authentication failed");
      console.error("   Check your DB_USER and DB_PASSWORD in .env file\n");
    } else if (error.code === "PROTOCOL_CONNECTION_LOST") {
      console.error("   Issue: Could not connect to database");
      console.error("   Check your DB_HOST and DB_PORT in .env file\n");
    }

    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔌 Database connection closed\n");
    }
  }
}

// Confirmation prompt
async function askForConfirmation() {
  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    console.log("\n⚠️  WARNING: This will PERMANENTLY delete all data from the database!");
    console.log("   Database: " + process.env.DB_NAME);
    console.log("   Host: " + process.env.DB_HOST);
    console.log("\n📋 This will clear:");
    console.log("   • All users and sessions");
    console.log("   • All music catalog (artists, albums, tracks)");
    console.log("   • All playlists and playlist tracks");
    console.log("   • All user interactions (likes, follows, history)");
    console.log("   • All notifications and reports");
    console.log("   • All uploaded files and storage metadata");
    console.log("\n✅ The database SCHEMA will remain intact.\n");

    rl.question(
      'Type "DELETE_ALL_DATA" to confirm and proceed: ',
      (answer) => {
        rl.close();
        resolve(answer === "DELETE_ALL_DATA");
      }
    );
  });
}

// Main execution
(async () => {
  console.log("\n");
  console.log("╔" + "═".repeat(58) + "╗");
  console.log(
    "║" + " Listenify Database - Complete Data Clear Script ".padEnd(59) + "║"
  );
  console.log("╚" + "═".repeat(58) + "╝");

  const confirmed = await askForConfirmation();

  if (!confirmed) {
    console.log("❌ Operation cancelled. No data was deleted.\n");
    process.exit(0);
  }

  await clearDatabase();
})();
