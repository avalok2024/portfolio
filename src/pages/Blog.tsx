import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  tags: string[];
  published: boolean;
  coverImage?: string;
}

const POSTS_KEY = "avalok_blog_posts";

function loadPublishedPosts(): BlogPost[] {
  try {
    const raw = localStorage.getItem(POSTS_KEY);
    const all: BlogPost[] = raw ? JSON.parse(raw) : [];
    return all.filter(p => p.published);
  } catch {
    return [];
  }
}

// ─── Reading Time ─────────────────────────────────────────────────────────────
function readingTime(html: string): string {
  const text = html.replace(/<[^>]+>/g, "");
  const words = text.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}

// ─── Single Post View ─────────────────────────────────────────────────────────
function PostView({ post, onBack }: { post: BlogPost; onBack: () => void }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px" }}>
      {/* Back */}
      <button
        onClick={onBack}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#7c3aed", fontSize: 14, fontWeight: 500, padding: 0,
          marginBottom: 32, display: "flex", alignItems: "center", gap: 6,
        }}
      >
        ← Back to Blog
      </button>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {post.tags.map(t => (
            <span key={t} style={{
              background: "#ede9fe", color: "#7c3aed",
              padding: "3px 10px", borderRadius: 6, fontSize: 12, fontWeight: 500,
            }}>
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 style={{
        fontSize: 36, fontWeight: 800, lineHeight: 1.2,
        color: "#111827", margin: "0 0 16px",
        fontFamily: "'Georgia', serif",
      }}>
        {post.title}
      </h1>

      {/* Meta */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        marginBottom: 28, color: "#6b7280", fontSize: 14,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "#7c3aed", color: "white",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700,
        }}>
          {post.author[0].toUpperCase()}
        </div>
        <span style={{ fontWeight: 500, color: "#374151" }}>{post.author}</span>
        <span>·</span>
        <span>{new Date(post.date).toLocaleDateString("en-IN", {
          day: "numeric", month: "long", year: "numeric",
        })}</span>
        <span>·</span>
        <span>{readingTime(post.content)}</span>
      </div>

      {/* Cover Image */}
      {post.coverImage && (
        <img
          src={post.coverImage}
          alt={post.title}
          style={{
            width: "100%", maxHeight: 380, objectFit: "cover",
            borderRadius: 12, marginBottom: 36,
          }}
        />
      )}

      {/* Content */}
      <div
        dangerouslySetInnerHTML={{ __html: post.content }}
        style={{
          fontSize: 17, lineHeight: 1.85, color: "#1f2937",
          fontFamily: "'Georgia', serif",
        }}
        className="blog-content"
      />

      {/* Footer */}
      <div style={{
        marginTop: 56, paddingTop: 24, borderTop: "1px solid #e5e7eb",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <button
          onClick={onBack}
          style={{
            background: "none", border: "1px solid #e5e7eb",
            borderRadius: 8, padding: "8px 18px", cursor: "pointer",
            color: "#374151", fontSize: 14,
          }}
        >
          ← More Posts
        </button>
      </div>
    </div>
  );
}

// ─── Blog List ────────────────────────────────────────────────────────────────
function BlogList({
  posts, onSelect,
}: { posts: BlogPost[]; onSelect: (p: BlogPost) => void }) {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = Array.from(new Set(posts.flatMap(p => p.tags)));

  const filtered = posts.filter(p => {
    const matchSearch = !search || 
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchTag = !activeTag || p.tags.includes(activeTag);
    return matchSearch && matchTag;
  });

  if (posts.length === 0) {
    return (
      <div style={{
        maxWidth: 600, margin: "0 auto", padding: "80px 20px", textAlign: "center",
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📖</div>
        <h2 style={{ color: "#374151", marginBottom: 8 }}>No posts yet</h2>
        <p style={{ color: "#9ca3af" }}>
          Check back soon. New posts will appear here once published.
        </p>
      </div>
    );
  }

  const [featured, ...rest] = filtered;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 20px" }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{
          fontSize: 40, fontWeight: 900, color: "#111827",
          fontFamily: "'Georgia', serif", margin: "0 0 6px",
        }}>
          Blog
        </h1>
        <p style={{ color: "#6b7280", fontSize: 16, margin: 0 }}>
          Thoughts, tutorials, and updates.
        </p>
      </div>

      {/* Search + Tags */}
      <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts..."
          style={{
            flex: 1, minWidth: 200, padding: "9px 14px",
            border: "1px solid #e5e7eb", borderRadius: 8,
            fontSize: 14, outline: "none", color: "#111827",
          }}
        />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button
            onClick={() => setActiveTag(null)}
            style={{
              padding: "6px 14px", borderRadius: 6, border: "1px solid",
              borderColor: !activeTag ? "#a78bfa" : "#e5e7eb",
              background: !activeTag ? "#ede9fe" : "white",
              color: !activeTag ? "#7c3aed" : "#6b7280",
              cursor: "pointer", fontSize: 13,
            }}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              style={{
                padding: "6px 14px", borderRadius: 6, border: "1px solid",
                borderColor: activeTag === tag ? "#a78bfa" : "#e5e7eb",
                background: activeTag === tag ? "#ede9fe" : "white",
                color: activeTag === tag ? "#7c3aed" : "#6b7280",
                cursor: "pointer", fontSize: 13,
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p style={{ color: "#9ca3af", textAlign: "center", padding: "40px 0" }}>
          No matching posts found.
        </p>
      ) : (
        <>
          {/* Featured */}
          {featured && (
            <div
              onClick={() => onSelect(featured)}
              style={{
                background: "white", border: "1px solid #e5e7eb", borderRadius: 16,
                overflow: "hidden", cursor: "pointer", marginBottom: 28,
                display: "flex", flexDirection: "column",
                transition: "box-shadow 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(124,58,237,0.1)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
            >
              {featured.coverImage && (
                <img src={featured.coverImage} alt={featured.title} style={{
                  width: "100%", height: 260, objectFit: "cover",
                }} />
              )}
              <div style={{ padding: "24px 28px" }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  {featured.tags.slice(0, 3).map(t => (
                    <span key={t} style={{
                      background: "#ede9fe", color: "#7c3aed",
                      padding: "2px 8px", borderRadius: 5, fontSize: 12, fontWeight: 500,
                    }}>{t}</span>
                  ))}
                </div>
                <h2 style={{
                  fontSize: 24, fontWeight: 800, margin: "0 0 10px",
                  color: "#111827", fontFamily: "Georgia, serif", lineHeight: 1.3,
                }}>
                  {featured.title}
                </h2>
                <p style={{ fontSize: 15, color: "#6b7280", margin: "0 0 16px", lineHeight: 1.6 }}>
                  {featured.excerpt}
                </p>
                <div style={{ fontSize: 13, color: "#9ca3af", display: "flex", gap: 10 }}>
                  <span>{new Date(featured.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  <span>·</span>
                  <span>{readingTime(featured.content)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Grid */}
          {rest.length > 0 && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 16,
            }}>
              {rest.map(post => (
                <div
                  key={post.id}
                  onClick={() => onSelect(post)}
                  style={{
                    background: "white", border: "1px solid #e5e7eb",
                    borderRadius: 12, overflow: "hidden", cursor: "pointer",
                    transition: "box-shadow 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(124,58,237,0.1)")}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
                >
                  {post.coverImage && (
                    <img src={post.coverImage} alt="" style={{
                      width: "100%", height: 140, objectFit: "cover",
                    }} />
                  )}
                  <div style={{ padding: "16px" }}>
                    {post.tags.length > 0 && (
                      <span style={{
                        background: "#ede9fe", color: "#7c3aed",
                        padding: "2px 8px", borderRadius: 5, fontSize: 11,
                        fontWeight: 500, display: "inline-block", marginBottom: 8,
                      }}>
                        {post.tags[0]}
                      </span>
                    )}
                    <h3 style={{
                      fontSize: 16, fontWeight: 700, color: "#111827",
                      margin: "0 0 6px", lineHeight: 1.35, fontFamily: "Georgia, serif",
                    }}>
                      {post.title}
                    </h3>
                    <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 10px", lineHeight: 1.5 }}>
                      {post.excerpt.slice(0, 90)}{post.excerpt.length > 90 ? "..." : ""}
                    </p>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>
                      {new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      {" · "}{readingTime(post.content)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main Blog Page ───────────────────────────────────────────────────────────
export default function Blog() {
  const [posts] = useState<BlogPost[]>(loadPublishedPosts);
  const [selected, setSelected] = useState<BlogPost | null>(null);

  // Global styles for blog content
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .blog-content h1, .blog-content h2, .blog-content h3 {
        font-family: Georgia, serif; font-weight: 700;
        margin: 1.5em 0 0.5em; color: #111827;
      }
      .blog-content h1 { font-size: 28px; }
      .blog-content h2 { font-size: 22px; }
      .blog-content h3 { font-size: 18px; }
      .blog-content p { margin: 0 0 1.2em; }
      .blog-content blockquote {
        border-left: 3px solid #7c3aed; margin: 1.5em 0;
        padding: 12px 20px; background: #faf5ff;
        color: #374151; font-style: italic; border-radius: 0 8px 8px 0;
      }
      .blog-content pre {
        background: #1f2937; color: #f9fafb; padding: 16px 20px;
        border-radius: 8px; overflow-x: auto; font-size: 14px;
        line-height: 1.7; margin: 1.5em 0;
      }
      .blog-content img { max-width: 100%; border-radius: 8px; margin: 1em 0; }
      .blog-content a { color: #7c3aed; text-decoration: underline; }
      .blog-content ul, .blog-content ol { padding-left: 24px; margin: 0 0 1.2em; }
      .blog-content li { margin-bottom: 6px; }
      .blog-content hr { border: none; border-top: 1px solid #e5e7eb; margin: 2em 0; }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  return selected
    ? <PostView post={selected} onBack={() => setSelected(null)} />
    : <BlogList posts={posts} onSelect={setSelected} />;
}