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
        .replace(/bg-\[#101014\]/g, 'bg-[var(--bg-primary)]')
        .replace(/bg-\[#0f1923\]/g, 'bg-[var(--bg-primary)]')
        .replace(/bg-zinc-950\/90/g, 'bg-[var(--bg-glass)]')
        .replace(/bg-zinc-950/g, 'bg-[var(--bg-primary)]')
        .replace(/bg-zinc-900/g, 'bg-[var(--bg-secondary)]')
        .replace(/bg-zinc-800\/80/g, 'bg-[var(--bg-card)]')
        .replace(/bg-zinc-800\/50/g, 'bg-[var(--bg-card-hover)]')
        .replace(/bg-zinc-800\/30/g, 'bg-[var(--bg-card-hover)]')
        .replace(/hover:bg-zinc-800\/30/g, 'hover:bg-[var(--bg-card-hover)]')
        .replace(/hover:bg-zinc-800\/50/g, 'hover:bg-[var(--bg-card-hover)]')
        .replace(/bg-zinc-800/g, 'bg-[var(--bg-card)]')
        .replace(/bg-\[#1b2023\]/g, 'bg-[var(--bg-card)]')
        .replace(/bg-\[#111518\]/g, 'bg-[var(--bg-secondary)]')
        .replace(/bg-\[#161a1d\]/g, 'bg-[var(--bg-secondary)]')
        .replace(/bg-\[#272b30\]/g, 'bg-[var(--bg-card)]')
        .replace(/hover:bg-\[#343a40\]/g, 'hover:bg-[var(--bg-card-hover)]')
        .replace(/bg-\[#2a2a30\]/g, 'bg-[var(--bg-card)]')
        .replace(/hover:bg-\[#3f3f46\]/g, 'hover:bg-[var(--bg-card-hover)]')
        .replace(/bg-\[#18231e\]/g, 'bg-green-500/10')
        .replace(/bg-\[#2a171a\]/g, 'bg-red-500/10')
        .replace(/from-\[#1b2023\]/g, 'from-[var(--bg-card)]')
        .replace(/to-\[#15191b\]/g, 'to-[var(--bg-secondary)]')
        .replace(/from-\[#101014\]/g, 'from-[var(--bg-primary)]')
        .replace(/via-\[#101014\]\/60/g, 'via-[var(--bg-primary)]/60')
        
        .replace(/border-zinc-900/g, 'border-[var(--border-color)]')
        .replace(/border-zinc-800\/80/g, 'border-[var(--border-color)]')
        .replace(/border-zinc-800\/60/g, 'border-[var(--border-color)]')
        .replace(/border-zinc-800\/50/g, 'border-[var(--border-color)]')
        .replace(/border-zinc-800\/30/g, 'border-[var(--border-color)]')
        .replace(/border-zinc-800/g, 'border-[var(--border-color)]')
        .replace(/border-zinc-700/g, 'border-[var(--border-color)]')
        .replace(/divide-zinc-800\/50/g, 'divide-[var(--border-color)]')
        .replace(/divide-zinc-800\/30/g, 'divide-[var(--border-color)]')
        .replace(/divide-zinc-800/g, 'divide-[var(--border-color)]')
        
        .replace(/text-white/g, 'text-[var(--text-primary)]')
        .replace(/text-zinc-200/g, 'text-[var(--text-primary)]')
        .replace(/text-zinc-300/g, 'text-[var(--text-secondary)]')
        .replace(/text-zinc-400/g, 'text-[var(--text-secondary)]')
        .replace(/text-zinc-500/g, 'text-[var(--text-muted)]')
        .replace(/text-zinc-600/g, 'text-[var(--text-muted)]')
        .replace(/text-gray-400/g, 'text-[var(--text-secondary)]')
        .replace(/text-gray-500/g, 'text-[var(--text-muted)]')
        .replace(/text-gray-600/g, 'text-[var(--text-muted)]');
        
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
        console.log('Updated:', fullPath);
      }
    }
  }
}

replaceInDir(path.resolve(__dirname, 'src/app/valorant'));
