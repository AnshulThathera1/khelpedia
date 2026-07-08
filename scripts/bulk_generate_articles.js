import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
    console.error("Missing GEMINI_API_KEY in .env.local");
    process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: geminiApiKey });

const TOPICS = [
    { title: "The Best Valorant Teams to Watch in 2026", category: "preview" },
    { title: "CS2 Meta Analysis: How the Economy Updates Changed Everything", category: "analysis" },
    { title: "VCT Pacific Stage 2: Comprehensive Preview & Predictions", category: "preview" },
    { title: "Esports Transfer Window: Biggest Roster Moves of the Season", category: "news" },
    { title: "Team Spirit CS2 Roster Analysis: Rebuilding a Dynasty", category: "analysis" },
    
    // General Esports / Business
    { title: "How Esports Organizations are Diversifying Revenue", category: "analysis" },
    { title: "The Importance of Coaching Staff in Tier 1 Esports", category: "analysis" },
    { title: "Esports Mental Health: The Fight Against Burnout", category: "analysis" },
    { title: "Riot Games' Strategy for Tier 2 Esports Ecosystems", category: "analysis" },
    { title: "The Growth of Collegiate Esports Programs", category: "news" },
    { title: "Why Brands are Investing Heavily in Mobile Gaming Tournaments", category: "analysis" },
];

async function generateArticle(topic) {
    const prompt = `
    You are an expert esports journalist writing for KhelPediA, a comprehensive esports encyclopedia and news platform.
    
    Write an ORIGINAL, in-depth article (800 - 1200 words) on the following topic:
    Topic: "${topic.title}"
    Category: ${topic.category}

    REQUIREMENTS:
    1. Structure with multiple <h2> sections. 
    2. Add your own expert analysis, context, and engaging commentary. Make it sound like a real piece of high-quality journalism.
    3. Use engaging, professional esports journalism tone.
    4. Include relevant (even if slightly extrapolated/fictionalized but highly plausible for 2026) statistics, context, or comparisons.
    
    Format your response EXACTLY as a JSON object with the following keys:
    - "title": "${topic.title}"
    - "excerpt": A compelling 2-3 sentence summary (150-160 characters ideal for meta description)
    - "content": The full HTML content using <h2>, <p>, <ul>, <li>, <strong> tags. Do NOT use <h1>. DO NOT wrap the JSON in markdown backticks.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });
        return JSON.parse(response.text);
    } catch (e) {
        console.error(`Error generating article "${topic.title}":`, e.message);
        return null;
    }
}

async function run() {
    console.log(`Starting generation of ${TOPICS.length} articles...`);

    // Fetch the first available user to assign as the author (requires service_role key)
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    if (userError || !userData || !userData.users || userData.users.length === 0) {
        console.error("Failed to find a valid user to assign as the author.", userError);
        process.exit(1);
    }
    const authorId = userData.users[0].id;
    console.log(`Found author ID: ${authorId}`);

    let count = 0;
    for (const topic of TOPICS) {
        console.log(`\nGenerating [${count + 1}/${TOPICS.length}]: ${topic.title}`);
        
        const generatedData = await generateArticle(topic);
        if (!generatedData) {
            console.log("Skipping due to generation failure.");
            continue;
        }

        const slug = topic.title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "") + "-" + Date.now().toString().slice(-4);

        const insertData = {
            title: generatedData.title,
            slug: slug,
            excerpt: generatedData.excerpt,
            content: generatedData.content,
            author_id: authorId,
            category: topic.category,
            is_published: true,
            created_at: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString() // Randomize date over last 30 days
        };

        const { error } = await supabase.from('blogs').insert([insertData]);

        if (error) {
            // If category column doesn't exist, retry without it
            if (error.message && error.message.includes('category')) {
                delete insertData.category;
                const { error: retryError } = await supabase.from('blogs').insert([insertData]);
                if (retryError) {
                    console.error("Failed to insert into DB:", retryError.message);
                } else {
                    console.log(`✅ Saved article (without category): ${topic.title}`);
                    count++;
                }
            } else {
                console.error("Failed to insert into DB:", error.message);
            }
        } else {
            console.log(`✅ Saved article: ${topic.title}`);
            count++;
        }

        // Sleep to avoid rate limits
        await new Promise(r => setTimeout(r, 4000));
    }
    
    console.log(`\nFinished! Successfully published ${count} articles.`);
}

run();
