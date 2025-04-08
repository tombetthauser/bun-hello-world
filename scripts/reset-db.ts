// scripts/resetDatabase.ts
import { pool } from "../src/db.ts";

async function resetDatabase() {
  await pool.query(`
    DO $$ DECLARE
      r RECORD;
    BEGIN
      -- disable referential integrity temporarily
      EXECUTE 'DROP SCHEMA public CASCADE';
      EXECUTE 'CREATE SCHEMA public';
    END $$;
  `);

  console.log("✅ Database reset (all tables dropped)");
  process.exit(0);
}

resetDatabase().catch((err) => {
  console.error("❌ Failed to reset database:", err);
  process.exit(1);
});
