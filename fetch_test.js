
async function test() {
  const r = await fetch('http://localhost:3000/valorant/jethiya/021');
  const text = await r.text();
  console.log('STATUS:', r.status);
  const match = text.match(/<p class="text-red-400 font-medium">(.*?)<\/p>/);
  if (match) console.log('UI ERROR:', match[1]);
  else {
      console.log('NO UI ERROR FOUND. Checking if it rendered the Profile.');
      if (text.includes('VALORANT TRACKER')) console.log('RENDERED PROFILE OK');
      else console.log(text.substring(0, 500));
  }
}
test();
