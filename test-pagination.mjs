async function run() {
  const [t1, t2] = await Promise.all([
    fetch('http://localhost:3000/players').then(r=>r.text()),
    fetch('http://localhost:3000/players?page=2').then(r=>r.text())
  ]);

  const p1Items = (t1.match(/href="\/players\/[a-zA-Z0-9-]+"/g) || []).length;
  const p2Items = (t2.match(/href="\/players\/[a-zA-Z0-9-]+"/g) || []).length;

  console.log('Players Page 1 items:', p1Items);
  console.log('Players Page 2 items:', p2Items);

  const [b1, b2] = await Promise.all([
    fetch('http://localhost:3000/blogs').then(r=>r.text()),
    fetch('http://localhost:3000/blogs?page=2').then(r=>r.text())
  ]);

  const b1Items = (b1.match(/href="\/blogs\/[a-zA-Z0-9-]+"/g) || []).length;
  const b2Items = (b2.match(/href="\/blogs\/[a-zA-Z0-9-]+"/g) || []).length;

  console.log('Blogs Page 1 items:', b1Items);
  console.log('Blogs Page 2 items:', b2Items);
}
run();
