import { generateAIBlog } from './src/lib/generateAIBlog.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
    try {
        const result = await generateAIBlog();
        console.log("Success:", result);
    } catch (e) {
        console.error("Failed:", e.message);
    }
    process.exit(0);
}
run();
