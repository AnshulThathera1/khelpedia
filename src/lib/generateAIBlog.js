import Parser from 'rss-parser';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { query } from './db.js';

export async function generateAIBlog() {
    console.log("[CRON] Starting generateAIBlog...");
    
    // Initialize API clients
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        throw new Error("GEMINI_API_KEY is not set in environment variables.");
    }
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    const parser = new Parser();

    // Fetch latest esports news
    console.log("[CRON] Fetching RSS feed from vlr.gg...");
    let feed;
    try {
        feed = await parser.parseURL('https://www.vlr.gg/rss');
    } catch (err) {
        console.error("[CRON] SOURCE_FETCH_FAILED", err);
        throw new Error("SOURCE_FETCH_FAILED");
    }
    
    if (!feed.items || feed.items.length === 0) {
        console.error("[CRON] SOURCE_FETCH_FAILED: No items found");
        throw new Error("SOURCE_FETCH_FAILED: No items found");
    }

    // Initialize Supabase Auth client for fetching users
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
        console.error("[CRON] CRON_AUTH_FAILED: Missing Supabase keys");
        throw new Error("CRON_AUTH_FAILED: Missing Supabase keys");
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Pick the first RSS item that we haven't already covered
    let topStory = null;
    for (const item of feed.items) {
        let alreadyCovered = false;

        // 1. Primary check: Exact source URL
        try {
            const existingRes = await query(
                'SELECT id FROM blogs WHERE source_url = $1 LIMIT 1',
                [item.link]
            );
            if (existingRes.rows && existingRes.rows.length > 0) {
                alreadyCovered = true;
            }
        } catch (dbErr) {
            console.warn("[CRON] DB error checking source_url:", dbErr.message);
            // Column may not exist yet, continue
        }

        // 2. Secondary check: Title similarity (only as a warning/fallback)
        if (!alreadyCovered) {
            const titlePrefix = item.title.substring(0, 40).toLowerCase();
            try {
                const similarRes = await query(
                    'SELECT id, title, source_url FROM blogs WHERE title ILIKE $1 LIMIT 1',
                    [`${titlePrefix}%`]
                );
                if (similarRes.rows && similarRes.rows.length > 0) {
                    console.log(`[CRON] DUPLICATE_WARNING: Found highly similar title for "${item.title}". Skipping to be safe.`);
                    alreadyCovered = true;
                }
            } catch {
                // Ignore error if check fails
            }
        }

        if (!alreadyCovered) {
            topStory = item;
            break;
        }
    }

    if (!topStory) {
        console.log('[CRON] All recent RSS stories have already been covered. Skipping.');
        return { slug: null, category: null, skipped: true };
    }

    console.log(`[CRON] Selected story: ${topStory.title} (${topStory.link})`);

    // Use Gemini to rewrite the article
    const prompt = `
    You are an expert esports journalist writing for KhelPediA, a comprehensive esports encyclopedia and news platform.
    
    Rewrite the following news story into an ORIGINAL, in-depth article. This is NOT a simple rewrite - you must add substantial original value through analysis, context, and expert insight.
    
    IMPORTANT: You must rely strictly on verified facts from the source. DO NOT invent or fabricate match results, player statistics, tournament dates, team rosters, scores, rankings, quotes, transfers, or sources.

    Original Title: ${topStory.title}
    Original Content / Snippet: ${topStory.contentSnippet || topStory.content}
    Original Link: ${topStory.link}

    REQUIREMENTS:
    1. Write 800-1500 words minimum. Short articles will be rejected.
    2. Structure with multiple H2 sections. Suggested structure:
       - Opening paragraph with key news
       - Background & Context (why this matters)
       - Detailed Analysis (what this means for the competitive scene)
       - Key Takeaways (bullet points summarizing main points)
       - Looking Ahead (what to watch for next)
    3. Add your own analysis and expert commentary based on facts - don't just restate facts.
    4. Use engaging, professional esports journalism tone.
    5. Include internal links where relevant using these KhelPediA URL patterns:
       - Tournament pages: /tournaments/[id]
       - Team pages: /teams/[id]
       - Player pages: /players/[id]
       - Games: /games/valorant, /games/cs2, /games/bgmi, /games/dota-2
       - Other news: /blogs
       Only link if it naturally fits and you know the entity exists.
    6. Avoid plagiarism completely. This must be 100% original writing.
    7. Include relevant statistics, historical context, or comparisons where applicable.

    Format your response STRICTLY as a JSON object with the following keys. DO NOT wrap in markdown backticks:
    - "title": A catchy, SEO-optimized title (60-70 characters ideal)
    - "excerpt": A compelling 2-3 sentence summary (150-160 characters ideal for meta description)
    - "content": The full HTML content using <h2>, <p>, <ul>, <li>, <strong>, <a>, <blockquote> tags. Do NOT use <h1>.
    - "category": One of: "news", "analysis", "guide", "preview", "opinion"
    `;

    let aiResponse;
    try {
        console.log("[CRON] Calling Gemini AI API...");
        aiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });
        console.log("[CRON] Gemini AI response received.");
    } catch (aiErr) {
        console.error("[CRON] AI_GENERATION_FAILED", aiErr);
        throw new Error("AI_GENERATION_FAILED");
    }

    let generatedData;
    try {
        let jsonText = aiResponse.text;
        // Strip Markdown fences if Gemini accidentally added them despite responseMimeType
        const match = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (match) {
            jsonText = match[1];
        }
        generatedData = JSON.parse(jsonText);
        console.log("[CRON] JSON parsed successfully.");
    } catch (parseErr) {
        console.error("[CRON] AI_INVALID_JSON", parseErr, "RAW TEXT:", aiResponse.text);
        throw new Error("AI_INVALID_JSON");
    }

    // Validation
    if (!generatedData.title || typeof generatedData.title !== 'string' || 
        !generatedData.excerpt || typeof generatedData.excerpt !== 'string' || 
        !generatedData.content || typeof generatedData.content !== 'string') {
        console.error("[CRON] VALIDATION_FAILED: Missing or invalid required fields in AI output");
        throw new Error("VALIDATION_FAILED: Missing or invalid required fields");
    }
    if (generatedData.content.length < 500) {
        console.error("[CRON] VALIDATION_FAILED: Content too short (length: " + generatedData.content.length + ")");
        throw new Error("VALIDATION_FAILED: Content too short");
    }

    // Generate URL slug
    let baseSlug = generatedData.title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
    let slug = baseSlug;

    // Handle slug collision deterministically
    try {
        let suffix = 2;
        while (true) {
            const checkSlug = await query('SELECT id FROM blogs WHERE slug = $1 LIMIT 1', [slug]);
            if (!checkSlug.rows || checkSlug.rows.length === 0) {
                break; // Slug is unique
            }
            console.log(`[CRON] SLUG_COLLISION: ${slug} already exists, trying suffix ${suffix}`);
            slug = `${baseSlug}-${suffix}`;
            suffix++;
        }
    } catch (dbErr) {
        console.error("[CRON] DATABASE_CONNECTION_FAILED during slug check", dbErr);
        throw new Error("DATABASE_CONNECTION_FAILED");
    }

    // Fetch the first available user from Supabase Auth to assign as author
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    if (userError || !userData || !userData.users || userData.users.length === 0) {
        console.error("[CRON] CRON_AUTH_FAILED: Failed to fetch author user", userError);
        throw new Error("CRON_AUTH_FAILED: Failed to find a valid user to assign as the author.");
    }
    const authorId = userData.users[0].id;

    // Insert into PostgreSQL blogs table
    let insertId = null;
    try {
        console.log(`[CRON] Inserting blog with slug: ${slug}`);
        const result = await query(
            `INSERT INTO blogs (title, slug, excerpt, content, author_id, is_published, source_url, category) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
            [
                generatedData.title,
                slug,
                generatedData.excerpt,
                generatedData.content,
                authorId,
                true,
                topStory.link,
                generatedData.category || 'news'
            ]
        );
        if (result.rows && result.rows.length > 0) {
            insertId = result.rows[0].id;
        }
        console.log(`[CRON] Successfully published blog: ${slug} (ID: ${insertId})`);
    } catch (insertError) {
        console.error("[CRON] DATABASE_INSERT_FAILED", insertError);
        throw new Error("DATABASE_INSERT_FAILED");
    }

    // Send Discord Notification
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (discordWebhookUrl) {
        try {
            await fetch(discordWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: `🚨 **New AI Article Published!**\n**${generatedData.title}**\n📂 Category: ${generatedData.category || 'news'}\nhttps://khelpedia.org/blogs/${slug}`
                })
            });
        } catch (discordError) {
            console.error("[CRON] Discord webhook failed:", discordError);
        }
    }

    return { 
        slug, 
        id: insertId,
        category: generatedData.category, 
        title: generatedData.title, 
        sourceUrl: topStory.link 
    };
}
