import https from 'https';

const urls = [
    "https://khelpedia.org/tournaments/1628d9f7-3ff4-4a1d-83a9-ef124bbb3f6d",
    "https://khelpedia.org/teams/5ab4a0e6-412d-48ce-9c33-19801db1fb31",
    "https://khelpedia.org/players/tenz",
    "https://khelpedia.org/games/valorant",
    "https://khelpedia.org/blogs/khelpedia-exclusive-sarahcat-hangs-up-the-mouse-leaves-indelible-mark-on-game-changers-8866"
];

async function checkUrl(url) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const titleMatch = data.match(/<title[^>]*>([^<]+)<\/title>/i);
                const canonicalMatch = data.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
                const robotsMatch = data.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>/i);
                const h1Match = data.match(/<h1[^>]*>([^<]+)<\/h1>/i);
                const jsonLdMatch = data.match(/type=["']application\/ld\+json["']/i);
                
                resolve({
                    url,
                    status: res.statusCode,
                    title: titleMatch ? titleMatch[1] : null,
                    canonical: canonicalMatch ? canonicalMatch[1] : null,
                    robots: robotsMatch ? robotsMatch[1] : null,
                    h1: h1Match ? h1Match[1] : null,
                    hasJsonLd: !!jsonLdMatch
                });
            });
        }).on('error', (err) => {
            resolve({ url, error: err.message });
        });
    });
}

async function run() {
    for (const url of urls) {
        const res = await checkUrl(url);
        console.log(`\nURL: ${res.url}`);
        console.log(`Status: ${res.status}`);
        console.log(`Title: ${res.title}`);
        console.log(`H1: ${res.h1}`);
        console.log(`Canonical: ${res.canonical}`);
        console.log(`Robots Meta: ${res.robots}`);
        console.log(`Has JSON-LD: ${res.hasJsonLd}`);
    }
}

run();
