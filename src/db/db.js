require("dotenv").config();
const Database = require("better-sqlite3");
const { drizzle } = require("drizzle-orm/better-sqlite3");

const dbFile = process.env.DATABASE_FILE || "dev.db";

const sqlite = new Database(dbFile);
const db = drizzle(sqlite);

module.exports = { db };
