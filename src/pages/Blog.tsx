import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import NavBar from "@/components/Navbar";
import Footer from "@/components/Footer";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

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

function fromRow(row: any): BlogPost {
  return {
    id: String(row.id || ""),
    title: String(row.title || ""),
    excerpt: String(row.excerpt || ""),
    content: String(row.content || ""),
    author: String(row.author || ""),
    date: String(row.date || ""),
    tags: row.tags ? String(row.tags).split(",").map((t: string) => t.trim()).filter(Boolean) : [],
    published: Boolean(row.published),
    coverImage: String(row.cover_image || ""),
  };
}

async function fetchPublishedPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("date", { ascending: false });
  if (error) {
    console.error(error.message);
    return [];
  }
  return (data || []).map(fromRow);
}

function readingTime(html: string): string {
  const words = html.replace(/<[^>]+>/g, "").trim().split(/\s+/).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

const POSTS_PER_PAGE = 6;

// ─── Enhanced Tag Pill with Gradients ────────────────────────────────────────
function TagPill({ tag, small }: { tag: string; small?: boolean }) {
  const tagStyles: Record<string, { bg: string; gradient: string; glow: string }> = {
    Product: {
      bg: "rgba(249, 115, 22, 0.12)",
      gradient: "linear-gradient(135deg, #f97316, #f59e0b)",
      glow: "0 0 12px rgba(249, 115, 22, 0.3)",
    },
    Engineering: {
      bg: "rgba(16, 185, 129, 0.12)",
      gradient: "linear-gradient(135deg, #10b981, #34d399)",
      glow: "0 0 12px rgba(16, 185, 129, 0.3)",
    },
    Design: {
      bg: "rgba(99, 102, 241, 0.12)",
      gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      glow: "0 0 12px rgba(99, 102, 241, 0.3)",
    },
    Company: {
      bg: "rgba(245, 158, 11, 0.12)",
      gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)",
      glow: "0 0 12px rgba(245, 158, 11, 0.3)",
    },
  };
  const style = tagStyles[tag] || {
    bg: "rgba(255, 255, 255, 0.08)",
    gradient: "linear-gradient(135deg, #6b7280, #9ca3af)",
    glow: "none",
  };
  return (
    <span
      style={{
        background: style.bg,
        backdropFilter: "blur(4px)",
        padding: small ? "4px 10px" : "6px 14px",
        borderRadius: 20,
        fontSize: small ? 11 : 12,
        fontWeight: 600,
        letterSpacing: "0.03em",
        textTransform: "uppercase",
        fontFamily: "'Inter', monospace",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#fff",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        transition: "all 0.2s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = style.glow;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: style.gradient,
          display: "inline-block",
        }}
      />
      {tag}
    </span>
  );
}

// ─── Enhanced Avatar with Status Ring ────────────────────────────────────────
function Avatar({ name, size = 32, showRing = false }: { name: string; size?: number; showRing?: boolean }) {
  const colors = ["#f97316", "#10b981", "#6366f1", "#f59e0b", "#ef4444", "#06b6d4"];
  const idx = name.charCodeAt(0) % colors.length;
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${colors[idx]}, ${colors[(idx + 2) % colors.length]})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: size * 0.4,
          fontWeight: 700,
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          transition: "transform 0.2s ease",
        }}
      >
        {name[0]?.toUpperCase()}
      </div>
      {showRing && (
        <div
          style={{
            position: "absolute",
            inset: -2,
            borderRadius: "50%",
            border: "2px solid rgba(249, 115, 22, 0.5)",
            animation: "pulseRing 2s infinite",
          }}
        />
      )}
    </div>
  );
}

// ─── Single Post View (Redesigned) ───────────────────────────────────────────
function PostView({ post, onBack }: { post: BlogPost; onBack: () => void }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      <NavBar />
      <div style={{ minHeight: "100vh", background: "#05050F", color: "#E8EDFF" }}>
        {/* Decorative gradient */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: 400,
            background: "radial-gradient(ellipse at 50% 0%, rgba(249,115,22,0.08), transparent 70%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 28px", position: "relative", zIndex: 1 }}>
          <button
            onClick={onBack}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer",
              color: "#9CA3AF",
              fontSize: 14,
              fontWeight: 500,
              padding: "8px 18px",
              borderRadius: 40,
              marginBottom: 48,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              backdropFilter: "blur(8px)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(249,115,22,0.1)";
              e.currentTarget.style.borderColor = "rgba(249,115,22,0.4)";
              e.currentTarget.style.color = "#f97316";
              e.currentTarget.style.transform = "translateX(-4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.color = "#9CA3AF";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            ← Back to Insights
          </button>

          {post.tags.length > 0 && (
            <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
              {post.tags.map((t) => (
                <TagPill key={t} tag={t} />
              ))}
              <span
                style={{
                  color: "#6B7280",
                  fontSize: 13,
                  marginLeft: 8,
                  fontFamily: "'Inter', monospace",
                }}
              >
                {readingTime(post.content)}
              </span>
            </div>
          )}

          <h1
            style={{
              fontSize: "clamp(36px, 6vw, 56px)",
              fontWeight: 700,
              lineHeight: 1.2,
              color: "#FFFFFF",
              margin: "0 0 28px",
              fontFamily: "'Fraunces', serif",
              letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #FFFFFF, #E8EDFF)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {post.title}
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 48,
              paddingBottom: 32,
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Avatar name={post.author} size={44} showRing />
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#F3F4F6", marginBottom: 4 }}>{post.author}</div>
              <div style={{ fontSize: 13, color: "#6B7280" }}>
                {new Date(post.date).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>

          {post.coverImage && (
            <div
              style={{
                borderRadius: 20,
                overflow: "hidden",
                marginBottom: 48,
                boxShadow: "0 20px 40px -12px rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <img
                src={post.coverImage}
                alt={post.title}
                style={{
                  width: "100%",
                  maxHeight: 480,
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          )}

          <div
            dangerouslySetInnerHTML={{ __html: post.content }}
            className="blog-content"
            style={{
              fontSize: 17,
              lineHeight: 1.8,
              color: "#E5E7EB",
              fontFamily: "'Inter', serif",
            }}
          />

          <div
            style={{
              marginTop: 72,
              paddingTop: 32,
              borderTop: "1px solid rgba(255,255,255,0.06)",
              textAlign: "center",
            }}
          >
            <button
              onClick={onBack}
              style={{
                background: "linear-gradient(135deg, rgba(249,115,22,0.1), rgba(249,115,22,0.05))",
                border: "1px solid rgba(249,115,22,0.3)",
                borderRadius: 40,
                padding: "12px 28px",
                cursor: "pointer",
                color: "#f97316",
                fontSize: 14,
                fontWeight: 600,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(249,115,22,0.2), rgba(249,115,22,0.1))";
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(249,115,22,0.1), rgba(249,115,22,0.05))";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              Browse All Articles
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

// ─── Blog List (Redesigned with Cards, Animations, Gradient Elements) ────────
function BlogList({ posts, onSelect }: { posts: BlogPost[]; onSelect: (p: BlogPost) => void }) {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags)));

  const filtered = posts.filter((p) => {
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchTag = !activeTag || p.tags.includes(activeTag);
    return matchSearch && matchTag;
  });

  const totalPages = Math.ceil(Math.max(filtered.length - 1, 0) / POSTS_PER_PAGE);
  const [featured, ...rest] = filtered;
  const pageRest = rest.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  useEffect(() => setPage(1), [search, activeTag]);

  if (posts.length === 0) {
    return (
      <>
        <NavBar />
        <div
          style={{
            minHeight: "100vh",
            background: "#05050F",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 20, opacity: 0.3 }}>✨</div>
            <h2 style={{ color: "#6B7280", fontFamily: "'Fraunces', serif", fontWeight: 500 }}>Coming soon</h2>
            <p style={{ color: "#374151", marginTop: 12 }}>Fresh insights are on their way</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div style={{ minHeight: "100vh", background: "#05050F" }}>
        {/* Hero Section with Glow Effect */}
        <div
          style={{
            textAlign: "center",
            padding: "96px 24px 72px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "20%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "80%",
              maxWidth: 800,
              height: 400,
              background: "radial-gradient(ellipse at 50% 50%, rgba(249,115,22,0.15), transparent 70%)",
              filter: "blur(60px)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "radial-gradient(circle at 20% 80%, rgba(99,102,241,0.08), transparent 50%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative", zIndex: 2 }}>
            <div
              style={{
                display: "inline-block",
                padding: "6px 16px",
                borderRadius: 40,
                background: "rgba(249,115,22,0.12)",
                border: "1px solid rgba(249,115,22,0.3)",
                marginBottom: 24,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#f97316",
                  fontWeight: 600,
                }}
              >
                The Finora Journal
              </span>
            </div>
            <h1
              style={{
                fontSize: "clamp(44px, 8vw, 72px)",
                fontWeight: 700,
                color: "#FFFFFF",
                margin: "0 0 20px",
                fontFamily: "'Fraunces', serif",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              Ideas that shape
              <br />
              <span style={{ background: "linear-gradient(135deg, #f97316, #f59e0b)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                modern finance
              </span>
            </h1>
            <p style={{ color: "#9CA3AF", fontSize: 18, maxWidth: 560, margin: "0 auto", lineHeight: 1.6 }}>
              Stories, insights, and deep dives from the forefront of digital banking
            </p>
          </div>
        </div>

        {/* Filters Section */}
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "24px 28px 0",
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            marginBottom: 32,
          }}
        >
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => setActiveTag(null)}
              style={{
                padding: "8px 20px",
                borderRadius: 40,
                border: !activeTag ? "1px solid rgba(249,115,22,0.6)" : "1px solid rgba(255,255,255,0.1)",
                background: !activeTag ? "rgba(249,115,22,0.15)" : "transparent",
                color: !activeTag ? "#f97316" : "#9CA3AF",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: !activeTag ? 600 : 400,
                transition: "all 0.2s",
              }}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 40,
                  border: activeTag === tag ? "1px solid rgba(249,115,22,0.6)" : "1px solid rgba(255,255,255,0.1)",
                  background: activeTag === tag ? "rgba(249,115,22,0.15)" : "transparent",
                  color: activeTag === tag ? "#f97316" : "#9CA3AF",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: activeTag === tag ? 600 : 400,
                  transition: "all 0.2s",
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          <div style={{ position: "relative" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              style={{
                padding: "10px 18px 10px 42px",
                width: 260,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 40,
                fontSize: 14,
                outline: "none",
                color: "#E5E7EB",
                transition: "all 0.2s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(249,115,22,0.5)";
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              }}
            />
            <span
              style={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6B7280",
                fontSize: 16,
                pointerEvents: "none",
              }}
            >
              🔍
            </span>
          </div>
        </div>

        {/* Posts Grid */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 28px 80px" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <p style={{ color: "#6B7280", fontSize: 16 }}>No posts match your filters. Try adjusting your search.</p>
            </div>
          ) : (
            <>
              {/* Featured Post */}
              {featured && page === 1 && (
                <div
                  onClick={() => onSelect(featured)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1.2fr",
                    gap: 0,
                    borderRadius: 24,
                    overflow: "hidden",
                    cursor: "pointer",
                    marginBottom: 48,
                    background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                    border: "1px solid rgba(255,255,255,0.08)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.borderColor = "rgba(249,115,22,0.4)";
                    e.currentTarget.style.boxShadow = "0 20px 40px -12px rgba(0,0,0,0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ height: 380, background: "#0A0A14", overflow: "hidden" }}>
                    {featured.coverImage ? (
                      <img
                        src={featured.coverImage}
                        alt={featured.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.5s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: "linear-gradient(135deg, #1A1A24, #0F0F18)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span style={{ fontSize: 64, opacity: 0.2 }}>📖</span>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                      {featured.tags.slice(0, 2).map((t) => (
                        <TagPill key={t} tag={t} small />
                      ))}
                      <span style={{ color: "#6B7280", fontSize: 12 }}>{readingTime(featured.content)}</span>
                    </div>
                    <h2
                      style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: "#FFFFFF",
                        margin: "0 0 16px",
                        lineHeight: 1.3,
                        fontFamily: "'Fraunces', serif",
                      }}
                    >
                      {featured.title}
                    </h2>
                    <p style={{ fontSize: 15, color: "#9CA3AF", margin: "0 0 28px", lineHeight: 1.6 }}>{featured.excerpt}</p>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        color: "#f97316",
                        fontSize: 14,
                        fontWeight: 600,
                        marginBottom: 28,
                      }}
                    >
                      Read full story <span style={{ fontSize: 16 }}>→</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        paddingTop: 20,
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <Avatar name={featured.author} size={36} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#E5E7EB" }}>{featured.author}</div>
                        <div style={{ fontSize: 12, color: "#6B7280" }}>
                          {new Date(featured.date).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid Cards */}
              {pageRest.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 28 }}>
                  {pageRest.map((post, idx) => (
                    <div
                      key={post.id}
                      onClick={() => onSelect(post)}
                      style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 20,
                        overflow: "hidden",
                        cursor: "pointer",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-6px)";
                        e.currentTarget.style.borderColor = "rgba(249,115,22,0.4)";
                        e.currentTarget.style.boxShadow = "0 20px 40px -12px rgba(0,0,0,0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div style={{ height: 200, background: "#0A0A14", overflow: "hidden" }}>
                        {post.coverImage ? (
                          <img
                            src={post.coverImage}
                            alt=""
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              transition: "transform 0.4s ease",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              background: "linear-gradient(135deg, #161620, #0C0C14)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <span style={{ fontSize: 40, opacity: 0.2 }}>✨</span>
                          </div>
                        )}
                      </div>
                      <div style={{ padding: "24px" }}>
                        {post.tags.length > 0 && (
                          <div style={{ marginBottom: 14 }}>
                            <TagPill tag={post.tags[0]} small />
                          </div>
                        )}
                        <h3
                          style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: "#FFFFFF",
                            margin: "0 0 10px",
                            lineHeight: 1.4,
                            fontFamily: "'Fraunces', serif",
                          }}
                        >
                          {post.title}
                        </h3>
                        <p style={{ fontSize: 13, color: "#9CA3AF", margin: "0 0 20px", lineHeight: 1.55 }}>
                          {post.excerpt.slice(0, 100)}
                          {post.excerpt.length > 100 ? "…" : ""}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            paddingTop: 16,
                            borderTop: "1px solid rgba(255,255,255,0.05)",
                          }}
                        >
                          <Avatar name={post.author} size={28} />
                          <div>
                            <span style={{ fontSize: 12, color: "#D1D5DB", fontWeight: 500 }}>{post.author}</span>
                            <span style={{ fontSize: 11, color: "#6B7280", marginLeft: 8 }}>
                              {new Date(post.date).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                              {" · "}
                              {readingTime(post.content)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 64 }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setPage(p);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        border: p === page ? "1px solid rgba(249,115,22,0.6)" : "1px solid rgba(255,255,255,0.1)",
                        background: p === page ? "rgba(249,115,22,0.2)" : "transparent",
                        color: p === page ? "#f97316" : "#9CA3AF",
                        cursor: "pointer",
                        fontSize: 15,
                        fontWeight: p === page ? 700 : 500,
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (p !== page) {
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                          e.currentTarget.style.color = "#FFFFFF";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (p !== page) {
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                          e.currentTarget.style.color = "#9CA3AF";
                        }
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

// ─── Main Component with Global Styles ───────────────────────────────────────
export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BlogPost | null>(null);

  useEffect(() => {
    fetchPublishedPosts().then((p) => {
      setPosts(p);
      setLoading(false);
    });

    // Add global styles and animations
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes pulseRing {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(1.5); opacity: 0; }
      }
      
      * {
        box-sizing: border-box;
      }
      
      body {
        background: #05050F;
        margin: 0;
        overflow-x: hidden;
      }
      
      .blog-content h1, .blog-content h2, .blog-content h3 {
        font-family: 'Fraunces', serif;
        font-weight: 600;
        color: #FFFFFF;
        margin: 1.6em 0 0.6em;
      }
      
      .blog-content h1 { font-size: 32px; }
      .blog-content h2 { font-size: 26px; }
      .blog-content h3 { font-size: 22px; }
      
      .blog-content p {
        margin: 0 0 1.4em;
        line-height: 1.8;
      }
      
      .blog-content blockquote {
        border-left: 3px solid #f97316;
        margin: 2em 0;
        padding: 16px 28px;
        background: rgba(249,115,22,0.08);
        color: #D1D5DB;
        font-style: italic;
        border-radius: 0 12px 12px 0;
      }
      
      .blog-content pre {
        background: #0F0F1A;
        color: #E5E7EB;
        border: 1px solid rgba(255,255,255,0.08);
        padding: 20px 24px;
        border-radius: 16px;
        overflow-x: auto;
        font-size: 14px;
        line-height: 1.7;
        margin: 1.6em 0;
        font-family: 'Monaco', 'Menlo', monospace;
      }
      
      .blog-content code {
        background: rgba(249,115,22,0.15);
        color: #f97316;
        padding: 2px 8px;
        border-radius: 6px;
        font-size: 0.9em;
        font-family: 'Monaco', 'Menlo', monospace;
      }
      
      .blog-content pre code {
        background: none;
        color: inherit;
        padding: 0;
      }
      
      .blog-content img {
        max-width: 100%;
        border-radius: 16px;
        margin: 1.5em 0;
        border: 1px solid rgba(255,255,255,0.08);
      }
      
      .blog-content a {
        color: #f97316;
        text-decoration: none;
        border-bottom: 1px solid rgba(249,115,22,0.4);
        transition: border-color 0.2s;
      }
      
      .blog-content a:hover {
        border-bottom-color: #f97316;
      }
      
      .blog-content ul, .blog-content ol {
        padding-left: 28px;
        margin: 0 0 1.4em;
      }
      
      .blog-content li {
        margin-bottom: 8px;
        color: #D1D5DB;
      }
      
      .blog-content hr {
        border: none;
        border-top: 1px solid rgba(255,255,255,0.08);
        margin: 2.5em 0;
      }
      
      .blog-content strong {
        color: #FFFFFF;
        font-weight: 600;
      }
      
      input::placeholder {
        color: #6B7280;
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  if (loading) {
    return (
      <>
        <NavBar />
        <div
          style={{
            minHeight: "100vh",
            background: "#05050F",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: "3px solid rgba(249,115,22,0.2)",
              borderTopColor: "#f97316",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p style={{ color: "#9CA3AF", fontSize: 14 }}>Loading stories...</p>
          <style>
            {`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
        <Footer />
      </>
    );
  }

  return selected ? <PostView post={selected} onBack={() => setSelected(null)} /> : <BlogList posts={posts} onSelect={setSelected} />;
}