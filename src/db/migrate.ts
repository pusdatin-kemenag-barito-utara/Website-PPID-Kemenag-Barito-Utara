import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  console.log("Running migrations...");
  const migrationClient = postgres(process.env.DATABASE_URL!, { max: 1 });
  const db = drizzle(migrationClient);
  
  await migrate(db, { migrationsFolder: './src/db/migrations' });
  console.log("Migrations applied successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed!");
  console.error(err);
  process.exit(1);
});
