import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    
    if (!webhookUrl) {
      return NextResponse.json({ success: false, error: "No webhook URL configured." }, { status: 500 });
    }

    let urlPath = "Unknown";
    try {
      const body = await request.json();
      if (body.path) urlPath = body.path;
    } catch(e) {}

    // 1. Get the user's IP Address
    let ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null;
    if (ip) {
      ip = ip.split(',')[0].trim();
    }

    // 2. Fetch geolocation data based on IP
    let location = "Unknown Location 🌍";
    if (ip) {
      try {
        const geoResponse = await fetch(`http://ip-api.com/json/${ip}`);
        const geoData = await geoResponse.json();
        if (geoData.status === "success") {
          location = `${geoData.city}, ${geoData.country} (${geoData.countryCode}) ${geoData.countryCode === 'IN' ? '🇮🇳' : '🌍'}`;
        }
      } catch (e) {
        console.error("Geo fetch failed", e);
      }
    }

    const payload = {
      content: null,
      embeds: [
        {
          title: "🚨 New Site Visitor!",
          description: `Someone just opened KhelPediA!\n\n**Page:** \`${urlPath}\`\n**Location:** ${location}`,
          color: 5814783, // blurple color
          timestamp: new Date().toISOString()
        }
      ],
      username: "KhelPediA Tracker",
      avatar_url: "https://khelpedia.com/favicon.ico"
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Discord notify error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
