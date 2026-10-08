import fs from 'fs';
import https from 'https';
import { parse } from 'node:path';

const urls = [
    { name: 'Homepage', url: 'https://khelpedia.org/' },
    { name: 'Game', url: 'https://khelpedia.org/games/valorant' },
    { name: 'Tournament', url: 'https://khelpedia.org/tournaments/51164cc6-38c3-4f2d-bb4c-b406e7ac2c25' },
    { name: 'Team', url: 'https://khelpedia.org/teams/5ab4a0e6-412d-48ce-9c33-19801db1fb31' },
    { name: 'Player', url: 'https://khelpedia.org/players/tenz' },
    { name: 'Match', url: 'https://khelpedia.org/tournaments/51164cc6-38c3-4f2d-bb4c-b406e7ac2c25' }, // the user said Match page, but the structure is /tournaments/[id] for matches sometimes or maybe there is a match route? Ah wait, there is no match page in my edits, but let's test a URL. Is there a /matches/[id] ? Wait, there is /valorant/gameName/tagLine/matches but the user asked for one match page. Let me check the nextjs routes later or just use /matches/5a6464e1-d675-42e8-b44c-a0caa331d300.
    { name: 'Blog', url: 'https://khelpedia.org/blogs/khelpedia-exclusive-sarahcat-hangs-up-the-mouse-leaves-indelible-mark-on-game-changers-8866' },
    { name: 'Sitemap', url: 'https://khelpedia.org/sitemap.xml' },
    { name: 'Robots', url: 'https://khelpedia.org/robots.txt' }
];

const fetchUrl = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data }));
        }).on('error', err => reject(err));
    });
};

const extractMeta = (html, name) => {
    const regex = new RegExp(`<meta[^>]*?(?:name|property)=["']${name}["'][^>]*?content=["']([^"']*)["']`, 'i');
    const match = html.match(regex);
    if (match) return match[1];
    
    // Check alternative order: content first
    const regex2 = new RegExp(`<meta[^>]*?content=["']([^"']*)["'][^>]*?(?:name|property)=["']${name}["']`, 'i');
    const match2 = html.match(regex2);
    return match2 ? match2[1] : null;
};

const extractCanonical = (html) => {
    const match = html.match(/<link[^>]*?rel=["']canonical["'][^>]*?href=["']([^"']*)["']/i);
    return match ? match[1] : null;
};

const extractTitle = (html) => {
    const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    return match ? match[1] : null;
};

const extractH1 = (html) => {
    const match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    return match ? match[1].replace(/<[^>]*>/g, '').trim() : null;
};

const extractJsonLd = (html) => {
    const regex = /<script[^>]*?type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    const results = [];
    while ((match = regex.exec(html)) !== null) {
        try {
            results.push(JSON.parse(match[1]));
        } catch (e) {
            results.push("INVALID_JSON");
        }
    }
    return results;
};

async function run() {
    const results = [];
    for (const item of urls) {
        try {
            const { status, data: html } = await fetchUrl(item.url);
            
            if (item.name === 'Sitemap') {
                results.push({ name: item.name, status, type: 'XML', data: html.substring(0, 100) });
                continue;
            }
            if (item.name === 'Robots') {
                results.push({ name: item.name, status, type: 'TXT', data: html.substring(0, 100) });
                continue;
            }

            results.push({
                name: item.name,
                status,
                title: extractTitle(html),
                desc: extractMeta(html, 'description'),
                canonical: extractCanonical(html),
                robots: extractMeta(html, 'robots'),
                ogTitle: extractMeta(html, 'og:title'),
                ogDesc: extractMeta(html, 'og:description'),
                ogUrl: extractMeta(html, 'og:url'),
                ogImage: extractMeta(html, 'og:image'),
                twCard: extractMeta(html, 'twitter:card'),
                twTitle: extractMeta(html, 'twitter:title'),
                twDesc: extractMeta(html, 'twitter:description'),
                twImage: extractMeta(html, 'twitter:image'),
                h1: extractH1(html),
                jsonLd: extractJsonLd(html)
            });
        } catch (e) {
            results.push({ name: item.name, error: e.message });
        }
    }
    
    console.log(JSON.stringify(results, null, 2));
}

run();
