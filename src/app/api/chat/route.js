import { GoogleGenAI } from '@google/genai';

// Initialize the Google Gen AI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are the KhelPediA Official Esports AI Assistant.
You are an expert in global esports, including games like Valorant, CS2, League of Legends, Dota 2, and BGMI.
Your goal is to answer user questions about esports, tournaments, players, meta, and strategies.
Keep your responses concise, punchy, and formatted nicely in Markdown (use bullet points, bold text for player names or teams).
Never break character. You are proud to represent KhelPediA, the epicenter of global esports.
If the user asks about the 'Esports Passport' or 'PickEms Draft', explain that these are exclusive KhelPediA features allowing users to link game accounts and draft cross-game fantasy teams.`;

export async function POST(req) {
    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return new Response(JSON.stringify({ error: 'Messages array is required' }), { status: 400 });
        }

        // Format history for the Gemini API
        const contents = messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        // Use the requested Flash Lite model
        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-3.1-flash-lite',
            contents: contents,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature: 0.7,
            }
        });

        // Convert the async iterable to a ReadableStream
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of responseStream) {
                        const chunkText = chunk.text;
                        if (chunkText) {
                            controller.enqueue(encoder.encode(chunkText));
                        }
                    }
                    controller.close();
                } catch (error) {
                    console.error('Streaming error:', error);
                    controller.error(error);
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked'
            }
        });
    } catch (error) {
        console.error('Chat API Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to process chat request' }), { status: 500 });
    }
}
