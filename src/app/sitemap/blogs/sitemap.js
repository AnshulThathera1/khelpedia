import { createClient } from "@/utils/supabase/server";

export default async function sitemap() {
  const supabase = await createClient();
  const baseUrl = "https://khelpedia.org";

  // Get dynamic blogs
  const { data: blogs } = await supabase
    .from("blogs")
    .select("slug, updated_at")
    .eq("is_published", true);

  return (blogs || []).map((blog) => ({
    url: `${baseUrl}/blogs/${blog.slug}`,
    lastModified: blog.updated_at ? new Date(blog.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
}
