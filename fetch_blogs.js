require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  console.log("Fetching all blogs...");
  const { data, error } = await supabase.from('blogs').select('*');
  console.log("Error:", error);
  console.log("Blogs:", data);
  
  if (data && data.length > 0) {
      console.log("is_published type:", typeof data[0].is_published, "value:", data[0].is_published);
  }
}

check();
