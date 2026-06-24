const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, 'src/app/bgmi/tournaments/[slug]/TournamentTabs.jsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content
  .replace(/bg-\[#121a23\]/g, 'bg-[var(--bg-card)]')
  .replace(/bg-\[#1a2430\]/g, 'bg-[var(--bg-secondary)]')
  .replace(/hover:bg-\[#1a2430\]/g, 'hover:bg-[var(--bg-card-hover)]')
  .replace(/divide-\[#2d3748\]/g, 'divide-[var(--border-color)]')
  .replace(/text-gray-300/g, 'text-[var(--text-secondary)]')
  .replace(/text-gray-500/g, 'text-[var(--text-muted)]')
  .replace(/text-gray-200/g, 'text-[var(--text-primary)]')
  .replace(/bg-gray-800/g, 'bg-[var(--bg-secondary)]')
  .replace(/text-gray-400/g, 'text-[var(--text-secondary)]')
  // We missed some colors from the earlier node script which didn't touch these specific Tailwind classes
  ;

fs.writeFileSync(filePath, content);
console.log('Fixed TournamentTabs.jsx theme');
