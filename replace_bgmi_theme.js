const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let newContent = content
        .replace(/rgba\(11,\s*17,\s*22,\s*0\.98\)/g, 'var(--bg-primary)')
        .replace(/bg-\[#0b1116\]\/[0-9]+/g, 'bg-[var(--bg-card)]')
        .replace(/bg-\[#0b1116\]/g, 'bg-[var(--bg-card)]')
        .replace(/bg-zinc-900\/[0-9]+/g, 'bg-[var(--bg-card)]')
        .replace(/bg-zinc-950/g, 'bg-[var(--bg-secondary)]')
        .replace(/bg-black/g, 'bg-[var(--bg-secondary)]')
        .replace(/bg-zinc-800/g, 'bg-[var(--border-color)]')
        .replace(/bg-zinc-900/g, 'bg-[var(--bg-card)]')
        .replace(/border-zinc-800/g, 'border-[var(--border-color)]')
        .replace(/border-\[#2d3748\]/g, 'border-[var(--border-color)]')
        .replace(/text-zinc-500/g, 'text-[var(--text-muted)]')
        .replace(/text-zinc-400/g, 'text-[var(--text-secondary)]')
        .replace(/text-zinc-300/g, 'text-[var(--text-secondary)]')
        .replace(/text-gray-400/g, 'text-[var(--text-secondary)]')
        .replace(/text-white/g, 'text-[var(--text-primary)]')
        .replace(/text-\[#e0e0e0\]/g, 'text-[var(--text-primary)]');
        
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
        console.log('Updated:', fullPath);
      }
    }
  }
}

replaceInDir(path.resolve(__dirname, 'src/app/bgmi'));
