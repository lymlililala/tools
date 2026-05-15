/**
 * Creates the tools_articles table directly via PostgreSQL connection.
 * 
 * Usage:
 *   DATABASE_URL="postgresql://postgres:[DB_PASSWORD]@db.tixgzezefjjsyuzgdhcd.supabase.co:5432/postgres" \
 *   node scripts/create-table-direct.mjs
 * 
 * Get DB_PASSWORD from: Supabase Dashboard → Settings → Database → Connection string
 * 
 * OR for Pooler (Session Mode):
 *   DATABASE_URL="postgresql://postgres.tixgzezefjjsyuzgdhcd:[DB_PASSWORD]@aws-0-{REGION}.pooler.supabase.com:5432/postgres"
 */

import pkg from 'pg'
const { Client } = pkg

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error(`
❌ DATABASE_URL environment variable is required!

Set it like this:
  export DATABASE_URL="postgresql://postgres:[YOUR_DB_PASSWORD]@db.tixgzezefjjsyuzgdhcd.supabase.co:5432/postgres"
  node scripts/create-table-direct.mjs

Get your database password from:
  Supabase Dashboard → Settings → Database → Connection string
  `)
  process.exit(1)
}

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS tools_articles (
    id           BIGSERIAL    PRIMARY KEY,
    slug         TEXT         NOT NULL UNIQUE,
    tool_path    TEXT         NOT NULL,
    title        TEXT         NOT NULL,
    description  TEXT         NOT NULL,
    keywords     TEXT[]       NOT NULL DEFAULT '{}',
    category     TEXT         NOT NULL,
    published_at DATE         NOT NULL,
    content      TEXT         NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_tools_articles_slug     ON tools_articles (slug);
  CREATE INDEX IF NOT EXISTS idx_tools_articles_category ON tools_articles (category);

  ALTER TABLE tools_articles ENABLE ROW LEVEL SECURITY;

  DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = 'tools_articles' AND policyname = 'tools_articles_public_read'
    ) THEN
      CREATE POLICY tools_articles_public_read ON tools_articles
        FOR SELECT TO anon USING (true);
    END IF;
  END $$;
`

async function main() {
  console.log('🔗 Connecting to Supabase PostgreSQL...')
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } })
  
  try {
    await client.connect()
    console.log('✅ Connected!')
    
    console.log('📦 Creating tools_articles table...')
    await client.query(CREATE_TABLE_SQL)
    console.log('✅ Table created / already exists!')
    
    // Verify
    const res = await client.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tools_articles' ORDER BY ordinal_position"
    )
    console.log('\n📋 Table columns:')
    res.rows.forEach(r => console.log(`  - ${r.column_name}: ${r.data_type}`))
    
    console.log('\n🎉 Now run the seed script to upload articles:')
    console.log('   node scripts/seed-articles.mjs')
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
