import Parser from 'rss-parser';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from the Next.js project root
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const geminiApiKey = process.env.GEMINI_API_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!geminiApiKey || !supabaseUrl || !supabaseKey) {
    console.error("Missing required environment variables!");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: geminiApiKey });
const parser = new Parser();
const supabase = createClient(supabaseUrl, supabaseKey);

async function generateSingleNews(story, authorId) {
    const prompt = `
    You are an expert esports journalist writing for KhelPediA, a comprehensive esports encyclopedia and news platform.
    
    Rewrite the following news story into an ORIGINAL, in-depth article. This is NOT a simple rewrite — you must add substantial original value through analysis, context, and expert insight.

    Original Title: ${story.title}
    Original Content / Snippet: ${story.contentSnippet || story.content || "Breaking esports news."}
    Original Link: ${story.link}

    REQUIREMENTS:
    1. Write 800–1500 words minimum.
    2. Structure with multiple H2 sections (Background, Analysis, Key Takeaways).
    3. Add your own analysis and expert commentary.
    4. Use engaging, professional esports journalism tone.
    5. Avoid plagiarism completely.
    6. Include relevant statistics or comparisons where applicable.

    Format your response as a JSON object with the following keys:
    - "title": A catchy, SEO-optimized title (60-70 characters ideal)
    - "excerpt": A compelling 2-3 sentence summary (150-160 characters ideal for meta description)
    - "content": The full HTML content using <h2>, <p>, <ul>, <li>, <strong>, <a>, <blockquote> tags. Do NOT use <h1>. DO NOT wrap the JSON in markdown backticks.
    - "category": One of: "news", "analysis", "guide", "preview", "opinion"
    `;

    try {
        const aiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        const generatedData = JSON.parse(aiResponse.text);
        const slug = generatedData.title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "") + "-" + Date.now().toString().slice(-4);

        const insertData = {
            title: generatedData.title,
            slug: slug,
            excerpt: generatedData.excerpt,
            content: generatedData.content,
            author_id: authorId,
            is_published: true,
        };

        if (generatedData.category) {
            insertData.category = generatedData.category;
        }

        const { error } = await supabase.from('blogs').insert([insertData]);

        if (error) {
            if (error.message && error.message.includes('category')) {
                delete insertData.category;
                const { error: retryError } = await supabase.from('blogs').insert([insertData]);
                if (retryError) throw retryError;
            } else {
                throw error;
            }
        }

        console.log(`✅ Successfully published: ${generatedData.title}`);
        return true;

    } catch (e) {
        console.error(`❌ Failed to process story "${story.title}":`, e.message);
        return false;
    }
}

async function runBulkGeneration() {
    console.log("Fetching RSS Feed (vlr.gg)...");
    
    // We can also add HLTV or others if needed
    let feed;
    try {
        feed = await parser.parseURL('https://www.vlr.gg/rss');
    } catch(e) {
        console.error("Failed to fetch RSS feed", e);
        return;
    }

    if (!feed.items || feed.items.length === 0) {
        console.error("No news items found in RSS feed.");
        return;
    }

    // Get Author ID
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    if (userError || !userData || !userData.users || userData.users.length === 0) {
        console.error("Failed to find a valid user to assign as the author.");
        return;
    }
    const authorId = userData.users[0].id;

    // Process top 15 items
    const itemsToProcess = feed.items.slice(0, 15);
    console.log(`Found ${feed.items.length} stories. Processing top ${itemsToProcess.length}...`);

    for (let i = 0; i < itemsToProcess.length; i++) {
        console.log(`\n[${i + 1}/${itemsToProcess.length}] Processing: ${itemsToProcess[i].title}`);
        await generateSingleNews(itemsToProcess[i], authorId);
        
        // Wait 10 seconds between requests to respect API rate limits (15RPM for Gemini free tier)
        if (i < itemsToProcess.length - 1) {
            console.log("Waiting 10 seconds to avoid rate limits...");
            await new Promise(r => setTimeout(r, 10000));
        }
    }

    console.log("\n🎉 Bulk News Generation Complete!");
}

runBulkGeneration();
