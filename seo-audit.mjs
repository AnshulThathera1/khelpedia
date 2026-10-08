import https from 'https';
import http from 'http';
import { parseStringPromise } from 'xml2js';

async function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
        }).on('error', reject);
    });
}

async function runAudit() {
    console.log("=== KHELPEDIA SEO AUDIT ===");
    const domain = "https://khelpedia.org";

    // 1. Robots.txt
    console.log("\n[1] ROBOTS.TXT");
    try {
        const robots = await fetchUrl(`${domain}/robots.txt`);
        console.log(`Status: ${robots.status}`);
        console.log(robots.data.substring(0, 500) + '...\n');
    } catch (e) {
        console.error("Failed to fetch robots.txt", e);
    }

    // 2. Sitemap
    console.log("\n[2] SITEMAP");
    try {
        const sitemapIndexRes = await fetchUrl(`${domain}/sitemap.xml`);
        console.log(`Sitemap Index Status: ${sitemapIndexRes.status}`);
        
        const sitemapIndex = await parseStringPromise(sitemapIndexRes.data);
        const sitemaps = sitemapIndex.sitemapindex.sitemap.map(s => s.loc[0]);
        console.log(`Found ${sitemaps.length} child sitemaps:`);
        
        const counts = {};
        let totalUrls = 0;
        let sampleUrls = {};

        for (const smUrl of sitemaps) {
            console.log(`  Fetching ${smUrl}...`);
            const smRes = await fetchUrl(smUrl);
            const smData = await parseStringPromise(smRes.data);
            const urls = smData.urlset.url;
            
            const count = urls ? urls.length : 0;
            totalUrls += count;
            const type = smUrl.split('/').pop().replace('sitemap.xml', '') || smUrl.split('/')[4] || 'unknown';
            counts[type] = count;
            
            console.log(`    -> ${count} URLs`);
            if (count > 0) {
                sampleUrls[type] = urls[0].loc[0];
            }
        }
        console.log(`Total URLs in Sitemaps: ${totalUrls}`);
        console.log("Samples:", sampleUrls);
    } catch (e) {
        console.error("Failed to fetch/parse sitemap", e);
    }
}

runAudit();
