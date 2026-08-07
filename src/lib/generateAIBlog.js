import Parser from 'rss-parser';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

export async function generateAIBlog() {
    // Initialize API clients
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        throw new Error("GEMINI_API_KEY is not set in environment variables.");
    }
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    const parser = new Parser();

    // Fetch latest esports news (We use vlr.gg or a general esports feed)
    const feed = await parser.parseURL('https://www.vlr.gg/rss');
    
    if (!feed.items || feed.items.length === 0) {
        throw new Error("No news items found in RSS feed.");
    }

    // Initialize Supabase early so we can check for duplicates
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Pick the first RSS item that we haven't already covered
    let topStory = null;
    for (const item of feed.items) {
        let alreadyCovered = false;

        // First try to match by source_url (if the column exists)
        try {
            const { data: existing } = await supabase
                .from('blogs')
                .select('id')
                .eq('source_url', item.link)
                .limit(1);
            if (existing && existing.length > 0) {
                alreadyCovered = true;
            }
        } catch {
            // source_url column may not exist yet — skip this check
        }

        // Also check for very similar titles (first 40 chars match)
        if (!alreadyCovered) {
            const titlePrefix = item.title.substring(0, 40).toLowerCase();
            const { data: similarTitle } = await supabase
                .from('blogs')
                .select('id, title')
                .ilike('title', `${titlePrefix}%`)
                .limit(1);

            if (similarTitle && similarTitle.length > 0) {
                alreadyCovered = true;
            }
        }

        if (!alreadyCovered) {
            topStory = item;
            break;
        }
    }

    if (!topStory) {
        console.log('All recent RSS stories have already been covered. Skipping.');
        return { slug: null, category: null, skipped: true };
    }

    // Use Gemini to rewrite the article with much higher quality
    const prompt = `
    You are an expert esports journalist writing for KhelPediA, a comprehensive esports encyclopedia and news platform.
    
    Rewrite the following news story into an ORIGINAL, in-depth article. This is NOT a simple rewrite — you must add substantial original value through analysis, context, and expert insight.

    Original Title: ${topStory.title}
    Original Content / Snippet: ${topStory.contentSnippet || topStory.content}
    Original Link: ${topStory.link}

    REQUIREMENTS:
    1. Write 800–1500 words minimum. Short articles will be rejected.
    2. Structure with multiple H2 sections. Suggested structure:
       - Opening paragraph with key news
       - Background & Context (why this matters)
       - Detailed Analysis (what this means for the competitive scene)
       - Key Takeaways (bullet points summarizing main points)
       - Looking Ahead (what to watch for next)
    3. Add your own analysis and expert commentary — don't just restate facts.
    4. Use engaging, professional esports journalism tone.
    5. Include internal links where relevant using these KhelPediA URL patterns:
       - Tournament pages: /tournaments/[id]
       - Team pages: /teams/[id]
       - Player pages: /players/[id]
       - Games: /games/valorant, /games/cs2, /games/bgmi, /games/dota-2
       - Other news: /blogs
    6. Avoid plagiarism completely. This must be 100% original writing.
    7. Include relevant statistics, historical context, or comparisons where applicable.

    Format your response as a JSON object with the following keys:
    - "title": A catchy, SEO-optimized title (60-70 characters ideal)
    - "excerpt": A compelling 2-3 sentence summary (150-160 characters ideal for meta description)
    - "content": The full HTML content using <h2>, <p>, <ul>, <li>, <strong>, <a>, <blockquote> tags. Do NOT use <h1>. DO NOT wrap the JSON in markdown backticks.
    - "category": One of: "news", "analysis", "guide", "preview", "opinion"
    `;

    const aiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        }
    });

    const generatedData = JSON.parse(aiResponse.text);

    // Generate URL slug
    const slug = generatedData.title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "") + "-" + Date.now().toString().slice(-4);

    // Save to Supabase (client already initialized above)

    // Fetch the first available user to assign as the author (requires service_role key)
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    if (userError || !userData || !userData.users || userData.users.length === 0) {
        throw new Error("Failed to find a valid user to assign as the author. Make sure SUPABASE_SERVICE_ROLE_KEY is correct.");
    }
    const authorId = userData.users[0].id;

    const insertData = {
        title: generatedData.title,
        slug: slug,
        excerpt: generatedData.excerpt,
        content: generatedData.content,
        author_id: authorId,
        is_published: true,
        source_url: topStory.link, // Track source to prevent duplicate generation
    };

    // Add category if the column exists (gracefully handle if it doesn't)
    if (generatedData.category) {
        insertData.category = generatedData.category;
    }

    const { data, error } = await supabase.from('blogs').insert([insertData]);

    if (error) {
        // If source_url or category column doesn't exist, retry without them
        if (error.message && (error.message.includes('source_url') || error.message.includes('category'))) {
            delete insertData.source_url;
            delete insertData.category;
            const { error: retryError } = await supabase.from('blogs').insert([insertData]);
            if (retryError) throw retryError;
        } else {
            throw error;
        }
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
            console.error("Discord webhook failed:", discordError);
        }
    }

    return { slug, category: generatedData.category };
}
