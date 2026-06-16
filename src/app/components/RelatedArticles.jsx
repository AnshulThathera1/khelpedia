import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";

export default async function RelatedArticles({ currentSlug }) {
  const supabase = await createClient();

  const { data: relatedBlogs } = await supabase
    .from("blogs")
    .select("title, slug, cover_image_url, created_at")
    .eq("is_published", true)
    .neq("slug", currentSlug)
    .order("created_at", { ascending: false })
    .limit(3);

  if (!relatedBlogs || relatedBlogs.length === 0) return null;

  return (
    <div style={{ marginTop: "4rem", borderTop: "1px solid var(--border-color)", paddingTop: "3rem" }}>
      <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "1.5rem", fontFamily: '"Rajdhani", sans-serif', textTransform: "uppercase" }}>
        Read Next
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
        {relatedBlogs.map((blog) => (
          <Link href={`/blogs/${blog.slug}`} key={blog.slug} style={{ textDecoration: "none", display: "flex", flexDirection: "column", gap: "0.75rem", transition: "transform 0.2s ease" }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={{ width: "100%", height: "140px", borderRadius: "8px", overflow: "hidden", position: "relative", background: "var(--bg-secondary)", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
              {blog.cover_image_url ? (
                <Image src={blog.cover_image_url} alt={blog.title} fill style={{ objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "var(--gradient-primary)" }} />
              )}
            </div>
            <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3, fontFamily: '"Rajdhani", sans-serif' }}>
              {blog.title}
            </h4>
            <time style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>
              {new Date(blog.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </time>
          </Link>
        ))}
      </div>
    </div>
  );
}
