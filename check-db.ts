import postgres from 'postgres';
import { config } from 'dotenv';
config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
  const schemas = await sql`SELECT schema_name FROM information_schema.schemata;`;
  console.log("Schemas:", schemas.map(s => s.schema_name).filter(s => s.includes('kemenag')));
  
  try {
    const tables = await sql`SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema LIKE 'kemenag%';`;
    console.log("Tables:", tables);
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
main();
