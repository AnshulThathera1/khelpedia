import { query } from "@/lib/db";

export async function GET() {
  try {
    const res = await query(
      "SELECT title, slug, excerpt, created_at, cover_image_url FROM blogs WHERE is_published = true ORDER BY created_at DESC LIMIT 20"
    );
    const blogs = res.rows || [];

    const baseUrl = "https://khelpedia.org";

    const escapeXml = (unsafe) => {
      if (!unsafe) return "";
      return unsafe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
    };

    const itemsXml = blogs
      .map((blog) => {
        return `
          <item>
            <title><![CDATA[${blog.title}]]></title>
            <link>${baseUrl}/blogs/${blog.slug}</link>
            <guid>${baseUrl}/blogs/${blog.slug}</guid>
            <pubDate>${new Date(blog.created_at).toUTCString()}</pubDate>
            <description><![CDATA[${blog.excerpt}]]></description>
            ${blog.cover_image_url ? `<enclosure url="${escapeXml(blog.cover_image_url)}" type="image/jpeg" />` : ""}
          </item>
        `;
      })
      .join("");

    const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
      <rss version="2.0">
        <channel>
          <title>KhelPediA News</title>
          <link>${baseUrl}</link>
          <description>Latest Esports Tournaments, Stats and Rankings</description>
          <language>en-us</language>
          <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
          ${itemsXml}
        </channel>
      </rss>
    `;

    return new Response(rssFeed, {
      headers: {
        "Content-Type": "text/xml",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("RSS route error:", error);
    return new Response("Error generating RSS feed", { status: 500 });
  }
}
