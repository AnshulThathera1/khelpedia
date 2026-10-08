const { Client } = require('pg');

const client = new Client({ 
    connectionString: process.env.DATABASE_URL || 'postgresql://khelpedia_db:Anshul%4012@127.0.0.1:5433/khelpedia' 
});

async function run() {
    try {
        await client.connect();

        console.log("=== 1. VERIFY THE PRODUCTION BLOG SCHEMA ===");
        const schemaRes = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'blogs'
        `);
        console.table(schemaRes.rows);

        const constraintsRes = await client.query(`
            SELECT tc.constraint_type, kcu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'blogs'
        `);
        console.log("Constraints:");
        console.table(constraintsRes.rows);

        const indexesRes = await client.query(`
            SELECT indexname, indexdef
            FROM pg_indexes
            WHERE tablename = 'blogs'
        `);
        console.log("Indexes:");
        console.table(indexesRes.rows);

        console.log("\n=== 2. VERIFY SOURCE URL PROVENANCE ===");
        const duplicatesRes = await client.query(`
            SELECT source_url, COUNT(*)
            FROM blogs
            WHERE source_url IS NOT NULL
            GROUP BY source_url
            HAVING COUNT(*) > 1
        `);
        if (duplicatesRes.rows.length > 0) {
            console.log("DUPLICATES FOUND:");
            console.table(duplicatesRes.rows);
        } else {
            console.log("No duplicates found.");
        }

        console.log("\n=== 3. VERIFY EXISTING BLOG DATA ===");
        const statsRes = await client.query(`
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN is_published = true THEN 1 ELSE 0 END) as published,
                SUM(CASE WHEN is_published = false THEN 1 ELSE 0 END) as unpublished,
                SUM(CASE WHEN source_url IS NOT NULL THEN 1 ELSE 0 END) as with_source_url,
                SUM(CASE WHEN source_url IS NULL THEN 1 ELSE 0 END) as without_source_url,
                SUM(CASE WHEN category IS NOT NULL THEN 1 ELSE 0 END) as with_category,
                SUM(CASE WHEN category IS NULL THEN 1 ELSE 0 END) as without_category
            FROM blogs
        `);
        console.table(statsRes.rows);

        console.log("\n=== 5. VERIFY THE EXISTING ARTICLE ===");
        const articleRes = await client.query(`
            SELECT id, title, slug, source_url, category, is_published, created_at, updated_at
            FROM blogs
            WHERE slug = 'loud-silences-edward-gaming-americas-momentum-undeniable-in-shanghai'
        `);
        console.table(articleRes.rows);

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await client.end();
    }
}

run();
