import pg from 'pg';

const { Client } = pg;
const connectionString = 'postgresql://neondb_owner:npg_o8SHW2RkbuGp@ep-lively-scene-an1teuso-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function testConnection() {
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    await client.connect();
    console.log('✅ Connection successful!');

    // Get database version
    const versionResult = await client.query('SELECT version();');
    console.log('\n📊 PostgreSQL Version:');
    console.log(versionResult.rows[0].version);

    // Get tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Tables in public schema:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Count records in each table
    console.log('\n📈 Record counts:');
    for (const row of tablesResult.rows) {
      const countResult = await client.query(`SELECT COUNT(*) FROM ${row.table_name};`);
      console.log(`  - ${row.table_name}: ${countResult.rows[0].count} records`);
    }

    // Show some sample data
    console.log('\n📝 Sample data:');
    
    const utilizadoresResult = await client.query('SELECT id, email, role FROM utilizadores LIMIT 3;');
    if (utilizadoresResult.rows.length > 0) {
      console.log('  Utilizadores (first 3):');
      utilizadoresResult.rows.forEach(row => {
        console.log(`    - ID: ${row.id}, Email: ${row.email}, Role: ${row.role}`);
      });
    }

    await client.end();
    console.log('\n✅ All database tests passed!');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }
}

testConnection();
