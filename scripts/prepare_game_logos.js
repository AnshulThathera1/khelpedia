const fs = require('fs');
const path = require('path');

const gamesDir = path.join(__dirname, '..', 'public', 'images', 'games');

// 1. CS2: Make letters white (#FFFFFF) and 2 orange (#E5A93C)
const cs2Path = path.join(gamesDir, 'cs2.svg');
if (fs.existsSync(cs2Path)) {
  let cs2 = fs.readFileSync(cs2Path, 'utf8');
  cs2 = cs2.replace(/stroke="#1E202F"\s+stroke-width="5"/g, 'fill="#E5A93C" stroke="#E5A93C" stroke-width="2"');
  cs2 = cs2.replace(/fill="#1E202F"/g, 'fill="#FFFFFF"');
  fs.writeFileSync(cs2Path, cs2, 'utf8');
  console.log('CS2 updated');
}

// 2. Dota 2: Make DOTA letters white, and symbol #E63946
const dotaPath = path.join(gamesDir, 'dota2.svg');
if (fs.existsSync(dotaPath)) {
  let dota = fs.readFileSync(dotaPath, 'utf8');
  dota = dota.split('#837670').join('#FFFFFF');
  dota = dota.split('#9b3425').join('#E63946');
  fs.writeFileSync(dotaPath, dota, 'utf8');
  console.log('Dota 2 updated');
}

// 3. Free Fire: Make uncolored text paths #FFFFFF
const ffPath = path.join(gamesDir, 'free_fire.svg');
if (fs.existsSync(ffPath)) {
  let ff = fs.readFileSync(ffPath, 'utf8');
  ff = ff.split('fill:#ffb900').join('fill:#FF7849');
  ff = ff.replace(/<path\s+d="M234\.7/g, '<path fill="#FFFFFF" d="M234.7');
  ff = ff.replace(/<path\s+d="M276\.71/g, '<path fill="#FFFFFF" d="M276.71');
  ff = ff.replace(/<path\s+d="M314\.6/g, '<path fill="#FFFFFF" d="M314.6');
  ff = ff.replace(/<path\s+d="M356\.09/g, '<path fill="#FFFFFF" d="M356.09');
  ff = ff.replace(/<path\s+d="M406\.09/g, '<path fill="#FFFFFF" d="M406.09');
  ff = ff.replace(/<path\s+d="M469\.67/g, '<path fill="#FFFFFF" d="M469.67');
  ff = ff.replace(/<path\s+d="M505\.86/g, '<path fill="#FFFFFF" d="M505.86');
  fs.writeFileSync(ffPath, ff, 'utf8');
  console.log('Free Fire updated');
}

// 4. PUBG Mobile: Make fill #F59E0B
const pubgPath = path.join(gamesDir, 'pubg_mobile.svg');
if (fs.existsSync(pubgPath)) {
  let pubg = fs.readFileSync(pubgPath, 'utf8');
  pubg = pubg.split('#050000').join('#F59E0B');
  fs.writeFileSync(pubgPath, pubg, 'utf8');
  console.log('PUBG Mobile updated');
}
