import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from the Next.js project root
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const geminiApiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: geminiApiKey });

async function generateContentForEntity(type, entity) {
    let prompt = "";
    if (type === 'player') {
        prompt = `
        You are an expert esports historian and journalist.
        Write a 300-500 word highly engaging biography and playstyle analysis for the esports player: ${entity.ign} (${entity.name}).
        They play for the team ${entity.teams?.name || 'Unknown'}.
        
        Focus on:
        - Career highlights and journey
        - Unique playstyle, mechanics, or signature agent/role
        - Impact on the competitive scene
        
        Format the output purely as HTML using <p>, <strong>, <ul>, and <li> tags. Do not include a title or <h1>/<h2> tags, just the body paragraphs. Do not wrap in markdown backticks.
        `;
    } else if (type === 'team') {
        prompt = `
        You are an expert esports historian.
        Write a 300-500 word engaging organizational history and overview for the esports team: ${entity.name}.
        Region: ${entity.region || 'Global'}.
        
        Focus on:
        - When they were founded and their journey to tier 1
        - Their biggest tournament achievements and iconic rosters
        - Their traditional rivals
        - Their signature playstyle as a team
        
        Format the output purely as HTML using <p>, <strong>, <ul>, and <li> tags. Do not include a title or <h1>/<h2> tags, just the body paragraphs. Do not wrap in markdown backticks.
        `;
    } else if (type === 'tournament') {
        prompt = `
        You are an expert esports analyst.
        Write a 300-500 word exciting overview for the esports tournament: ${entity.name}.
        Prize Pool: ${entity.prize_pool || 'TBA'} ${entity.currency || 'USD'}.
        
        Focus on:
        - The prestige and history of this specific tournament series
        - What is at stake for the teams (prize money, championship points, pride)
        - The general narrative or storylines surrounding this event
        
        Format the output purely as HTML using <p>, <strong>, <ul>, and <li> tags. Do not include a title or <h1>/<h2> tags, just the body paragraphs. Do not wrap in markdown backticks.
        `;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2-flash',
            contents: prompt,
        });
        
        // Clean up markdown block formatting if Gemini adds it accidentally
        let html = response.text.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();
        return html;
    } catch (e) {
        console.error(`Error generating content for ${type} ${entity.name || entity.ign}:`, e.message);
        return null;
    }
}

async function processBatch(table, type, limit = 5) {
    console.log(`\n--- Fetching ${limit} ${table} missing editorial content ---`);
    
    // Using a select query that joins the team name for players
    let selectStr = "*";
    if (table === 'players') selectStr = "*, teams(name)";

    const { data, error } = await supabase
        .from(table)
        .select(selectStr)
        .is('editorial_content', null)
        .limit(limit);

    if (error) {
        console.error(`Error fetching ${table}:`, error.message);
        return;
    }

    if (!data || data.length === 0) {
        console.log(`No ${table} require processing!`);
        return;
    }

    for (const entity of data) {
        console.log(`Generating AI content for [${type}]: ${entity.name || entity.ign}...`);
        const htmlContent = await generateContentForEntity(type, entity);
        
        if (htmlContent) {
            const { error: updateError } = await supabase
                .from(table)
                .update({ editorial_content: htmlContent })
                .eq('id', entity.id);
                
            if (updateError) {
                console.error(`Failed to save to DB for ${entity.name || entity.ign}:`, updateError.message);
            } else {
                console.log(`✅ Saved AI content for ${entity.name || entity.ign}`);
            }
        }
        
        // Sleep to avoid rate limits (2 seconds)
        await new Promise(r => setTimeout(r, 2000));
    }
}

async function run() {
    console.log("Starting AI Editorial Content Generator...");
    
    // Process 5 of each at a time. Run this script repeatedly via cron or manually.
    await processBatch('tournaments', 'tournament', 5);
    await processBatch('teams', 'team', 5);
    await processBatch('players', 'player', 5);
    
    console.log("\nFinished processing batch!");
}

run();
