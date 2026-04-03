import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { createClient } from "@supabase/supabase-js";
import NavBar from "@/components/Navbar";
import Footer from "@/components/Footer";

declare global {
  interface Window {
    AOS?: {
      init: (options?: Record<string, unknown>) => void;
      refresh?: () => void;
    };
  }
}

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface Reference {
  id: string;
  title: string;
  url: string;
  type: "paper" | "blog";
}

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
  references?: Reference[];
}

function fromRow(row: any): BlogPost {
  const rawTags = Array.isArray(row.tags)
    ? row.tags
    : typeof row.tags === "string"
    ? row.tags.split(",")
    : [];

  const cover = typeof row.cover_image === "string" ? row.cover_image.trim() : "";

  let refs: Reference[] = [];
  if (row.references) {
    try {
      const parsed = typeof row.references === "string" ? JSON.parse(row.references) : row.references;
      if (Array.isArray(parsed)) {
        refs = parsed
          .map((r: any): Reference => ({
            id: String(r?.id || ""),
            title: String(r?.title || "").trim(),
            url: String(r?.url || "").trim(),
            type: r?.type === "paper" ? "paper" : "blog",
          }))
          .filter((r: Reference) => r.title && r.url);
      }
    } catch {
      refs = [];
    }
  }

  return {
    id: String(row.id || ""),
    title: String(row.title || ""),
    excerpt: String(row.excerpt || ""),
    content: String(row.content || ""),
    author: String(row.author || ""),
    date: String(row.date || ""),
    tags: rawTags.map((t: string) => String(t).trim()).filter(Boolean),
    published: Boolean(row.published),
    coverImage: cover || undefined,
    references: refs,
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
  const text = html.replace(/<[^>]+>/g, " ").trim();
  if (!text) return "1 min read";
  const words = text.split(/\s+/).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

function formatDate(date: string, options?: Intl.DateTimeFormatOptions): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "Unknown date";
  return d.toLocaleDateString(
    "en-US",
    options ?? { day: "numeric", month: "long", year: "numeric" }
  );
}

const POSTS_PER_PAGE = 6;

function SmartImage({
  src,
  alt,
  style,
  fallbackIcon = "ri-image-line",
}: {
  src?: string;
  alt: string;
  style?: CSSProperties;
  fallbackIcon?: string;
}) {
  const [broken, setBroken] = useState(false);

  if (!src || broken) {
    return (
      <div
        style={{
          ...style,
          background: "linear-gradient(135deg, #151622, #0D0E16)",
          display: "grid",
          placeItems: "center",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <i className={fallbackIcon} style={{ fontSize: 44, opacity: 0.28, color: "#9CA3AF" }} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setBroken(true)}
      style={style}
    />
  );
}

function TagPill({ tag, small }: { tag: string; small?: boolean }) {
  const tagStyles: Record<string, { bg: string; gradient: string; glow: string }> = {
    Product: {
      bg: "rgba(249, 115, 22, 0.14)",
      gradient: "linear-gradient(135deg, #f97316, #f59e0b)",
      glow: "0 0 14px rgba(249, 115, 22, 0.3)",
    },
    Engineering: {
      bg: "rgba(16, 185, 129, 0.14)",
      gradient: "linear-gradient(135deg, #10b981, #34d399)",
      glow: "0 0 14px rgba(16, 185, 129, 0.3)",
    },
    Design: {
      bg: "rgba(99, 102, 241, 0.14)",
      gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      glow: "0 0 14px rgba(99, 102, 241, 0.3)",
    },
    Company: {
      bg: "rgba(245, 158, 11, 0.14)",
      gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)",
      glow: "0 0 14px rgba(245, 158, 11, 0.3)",
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
        backdropFilter: "blur(6px)",
        padding: small ? "4px 10px" : "6px 14px",
        borderRadius: 20,
        fontSize: small ? 11 : 12,
        fontWeight: 700,
        letterSpacing: "0.03em",
        textTransform: "uppercase",
        fontFamily: "'Manrope', sans-serif",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "#fff",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        transition: "all 0.2s ease",
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

function Avatar({ name, size = 32, showRing = false }: { name: string; size?: number; showRing?: boolean }) {
  const safeName = name?.trim() || "A";
  const colors = ["#f97316", "#10b981", "#6366f1", "#f59e0b", "#ef4444", "#06b6d4"];
  const idx = safeName.charCodeAt(0) % colors.length;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
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
        }}
      >
        {safeName[0]?.toUpperCase()}
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

function ReferenceBadge({ refItem }: { refItem: Reference }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 11,
        color: "#c4b5fd",
        padding: "4px 10px",
        borderRadius: 16,
        border: "1px solid rgba(167,139,250,0.35)",
        background: "rgba(167,139,250,0.12)",
        fontFamily: "'Manrope', sans-serif",
      }}
      title={`${refItem.type.toUpperCase()}: ${refItem.title}`}
    >
      <i className={refItem.type === "paper" ? "ri-article-line" : "ri-global-line"} />
      {refItem.title}
    </span>
  );
}

function PostView({ post, onBack }: { post: BlogPost; onBack: () => void }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.AOS?.refresh?.();
  }, []);

  return (
    <>
      <NavBar />
      <div style={{ minHeight: "100vh", background: "#05050F", color: "#E8EDFF" }}>
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: 420,
            background: "radial-gradient(ellipse at 50% 0%, rgba(249,115,22,0.10), transparent 70%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px 80px", position: "relative", zIndex: 1 }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer",
              color: "#9CA3AF",
              fontSize: 14,
              fontWeight: 600,
              padding: "8px 18px",
              borderRadius: 40,
              marginBottom: 40,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s ease",
              backdropFilter: "blur(8px)",
              fontFamily: "'Manrope', sans-serif",
            }}
          >
            <i className="ri-arrow-left-line" />
            Back to Insights
          </button>

          {post.tags.length > 0 && (
            <div data-aos="fade-up" style={{ display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap", alignItems: "center" }}>
              {post.tags.map((t) => (
                <TagPill key={t} tag={t} />
              ))}
              <span style={{ color: "#6B7280", fontSize: 13, marginLeft: 8, fontFamily: "'Manrope', sans-serif" }}>
                {readingTime(post.content)}
              </span>
            </div>
          )}

          <h1
            data-aos="fade-up"
            data-aos-delay="60"
            style={{
              fontSize: "clamp(32px, 6vw, 56px)",
              fontWeight: 700,
              lineHeight: 1.18,
              margin: "0 0 24px",
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
            data-aos="fade-up"
            data-aos-delay="110"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 36,
              paddingBottom: 26,
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Avatar name={post.author} size={44} showRing />
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#F3F4F6", marginBottom: 4, fontFamily: "'Manrope', sans-serif" }}>
                {post.author}
              </div>
              <div style={{ fontSize: 13, color: "#6B7280", fontFamily: "'Manrope', sans-serif" }}>{formatDate(post.date)}</div>
            </div>
          </div>

          {post.coverImage && (
            <div
              data-aos="zoom-in"
              data-aos-delay="130"
              style={{
                borderRadius: 18,
                overflow: "hidden",
                marginBottom: 40,
                boxShadow: "0 20px 40px -12px rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <SmartImage
                src={post.coverImage}
                alt={post.title}
                style={{ width: "100%", maxHeight: 480, objectFit: "cover", display: "block" }}
              />
            </div>
          )}

          <div
            data-aos="fade-up"
            data-aos-delay="160"
            dangerouslySetInnerHTML={{ __html: post.content }}
            className="blog-content"
            style={{ fontSize: 17, lineHeight: 1.8, color: "#E5E7EB", fontFamily: "'Manrope', sans-serif" }}
          />

          {(post.references?.length ?? 0) > 0 && (
            <div
              style={{
                marginTop: 34,
                padding: "20px 22px",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <h4 style={{ margin: "0 0 12px", color: "#fff", fontSize: 16, fontFamily: "'Fraunces', serif" }}>
                Special References
              </h4>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {post.references!.map((ref) => (
                  <a
                    key={ref.id}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#A78BFA",
                      textDecoration: "none",
                      fontSize: 14,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      fontFamily: "'Manrope', sans-serif",
                    }}
                  >
                    <i className={ref.type === "paper" ? "ri-article-line" : "ri-global-line"} />
                    {ref.title}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: 66, paddingTop: 30, borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
            <button
              type="button"
              onClick={onBack}
              style={{
                background: "linear-gradient(135deg, rgba(249,115,22,0.12), rgba(249,115,22,0.05))",
                border: "1px solid rgba(249,115,22,0.3)",
                borderRadius: 40,
                padding: "12px 28px",
                cursor: "pointer",
                color: "#FF4B3D",
                fontSize: 14,
                fontWeight: 700,
                transition: "all 0.2s",
                fontFamily: "'Manrope', sans-serif",
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

function BlogList({ posts, onSelect }: { posts: BlogPost[]; onSelect: (p: BlogPost) => void }) {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const allTags = useMemo(() => Array.from(new Set(posts.flatMap((p) => p.tags))).sort(), [posts]);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        (p.references || []).some(
          (r) => r.title.toLowerCase().includes(q) || r.url.toLowerCase().includes(q)
        );
      const matchTag = !activeTag || p.tags.includes(activeTag);
      return matchSearch && matchTag;
    });
  }, [posts, search, activeTag]);

  const [featured, ...rest] = filtered;
  const totalPages = Math.max(1, Math.ceil(rest.length / POSTS_PER_PAGE));
  const pageRest = rest.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [search, activeTag]);

  useEffect(() => {
    window.AOS?.refresh?.();
  }, [page, filtered.length]);

  if (posts.length === 0) {
    return (
      <>
        <NavBar />
        <div style={{ minHeight: "100vh", background: "#05050F", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ textAlign: "center" }}>
            <i className="ri-sparkling-line" style={{ fontSize: 64, opacity: 0.3, color: "#9CA3AF" }} />
            <h2 style={{ color: "#6B7280", fontFamily: "'Fraunces', serif", fontWeight: 500 }}>Coming soon</h2>
            <p style={{ color: "#374151", marginTop: 12, fontFamily: "'Manrope', sans-serif" }}>Fresh insights are on their way</p>
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
        <div style={{ textAlign: "center", padding: "84px 20px 64px", position: "relative", overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              top: "20%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "80%",
              maxWidth: 860,
              height: 400,
              background: "radial-gradient(ellipse at 50% 50%, rgba(249,115,22,0.16), transparent 70%)",
              filter: "blur(60px)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(circle at 20% 80%, rgba(99,102,241,0.10), transparent 50%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative", zIndex: 2 }}>
            <div
              data-aos="fade-up"
              style={{
                display: "inline-block",
                padding: "6px 16px",
                borderRadius: 40,
                background: "rgba(249,115,22,0.12)",
                border: "1px solid rgba(249,115,22,0.3)",
                marginBottom: 24,
              }}
            >
              <span style={{ fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "#f97316", fontWeight: 700, fontFamily: "'Manrope', sans-serif" }}>
                The Finora Journal
              </span>
            </div>

            <h1
              data-aos="fade-up"
              data-aos-delay="80"
              style={{
                fontSize: "clamp(38px, 7vw, 72px)",
                fontWeight: 700,
                color: "#FFFFFF",
                margin: "0 0 18px",
                fontFamily: "'Fraunces', serif",
                letterSpacing: "-0.02em",
                lineHeight: 1.08,
              }}
            >
              Ideas that shape
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #FF4B3D, #FF4B3D)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                modern finance
              </span>
            </h1>

            <p
              data-aos="fade-up"
              data-aos-delay="140"
              style={{ color: "#9CA3AF", fontSize: 18, maxWidth: 620, margin: "0 auto", lineHeight: 1.65, fontFamily: "'Manrope', sans-serif" }}
            >
              Stories, insights, and deep dives from the forefront of digital banking
            </p>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: 24 }}>
          <div className="filter-wrap">
            <div className="tag-filter-row">
              <button
                type="button"
                onClick={() => setActiveTag(null)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 40,
                  border: !activeTag ? "1px solid rgba(249,115,22,0.6)" : "1px solid rgba(255,255,255,0.1)",
                  background: !activeTag ? "rgba(249,115,22,0.15)" : "transparent",
                  color: !activeTag ? "#f97316" : "#9CA3AF",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 700,
                  transition: "all 0.2s",
                  fontFamily: "'Manrope', sans-serif",
                }}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 40,
                    border: activeTag === tag ? "1px solid rgba(249,115,22,0.6)" : "1px solid rgba(255,255,255,0.1)",
                    background: activeTag === tag ? "rgba(249,115,22,0.15)" : "transparent",
                    color: activeTag === tag ? "#FF4B3D" : "#9CA3AF",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 700,
                    transition: "all 0.2s",
                    fontFamily: "'Manrope', sans-serif",
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
                  width: "min(280px, 100%)",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 40,
                  fontSize: 14,
                  outline: "none",
                  color: "#E5E7EB",
                  transition: "all 0.2s",
                  fontFamily: "'Manrope', sans-serif",
                }}
              />
              <i className="ri-search-line" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#6B7280", fontSize: 16 }} />
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px 80px" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "#6B7280", fontFamily: "'Manrope', sans-serif" }}>
              No posts match your filters. Try adjusting your search.
            </div>
          ) : (
            <>
              {featured && page === 1 && (
                <div
                  className="featured-post"
                  data-aos="fade-up"
                  onClick={() => onSelect(featured)}
                  style={{
                    borderRadius: 24,
                    overflow: "hidden",
                    cursor: "pointer",
                    marginBottom: 40,
                    background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                    border: "1px solid rgba(255,255,255,0.08)",
                    transition: "all 0.3s ease",
                  }}
                >
                  <div style={{ minHeight: 280, background: "#0A0A14", overflow: "hidden" }}>
                    <SmartImage
                      src={featured.coverImage}
                      alt={featured.title}
                      fallbackIcon="ri-article-line"
                      style={{ width: "100%", height: "100%", objectFit: "cover", minHeight: 280 }}
                    />
                  </div>

                  <div style={{ padding: "34px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                      {featured.tags.slice(0, 2).map((t) => (
                        <TagPill key={t} tag={t} small />
                      ))}
                      <span style={{ color: "#6B7280", fontSize: 12, fontFamily: "'Manrope', sans-serif" }}>
                        {readingTime(featured.content)}
                      </span>
                    </div>

                    <h2
                      style={{
                        fontSize: "clamp(24px, 3vw, 30px)",
                        fontWeight: 700,
                        color: "#FFFFFF",
                        margin: "0 0 14px",
                        lineHeight: 1.3,
                        fontFamily: "'Fraunces', serif",
                      }}
                    >
                      {featured.title}
                    </h2>

                    <p style={{ fontSize: 15, color: "#9CA3AF", margin: "0 0 16px", lineHeight: 1.6, fontFamily: "'Manrope', sans-serif" }}>
                      {featured.excerpt}
                    </p>

                    {(featured.references?.length ?? 0) > 0 && (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
                        {featured.references!.slice(0, 2).map((ref) => (
                          <ReferenceBadge key={ref.id} refItem={ref} />
                        ))}
                      </div>
                    )}

                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#FF4B3D", fontSize: 14, fontWeight: 700, marginBottom: 22, fontFamily: "'Manrope', sans-serif" }}>
                      Read full story <i className="ri-arrow-right-line" />
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <Avatar name={featured.author} size={36} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#E5E7EB", fontFamily: "'Manrope', sans-serif" }}>
                          {featured.author}
                        </div>
                        <div style={{ fontSize: 12, color: "#6B7280", fontFamily: "'Manrope', sans-serif" }}>
                          {formatDate(featured.date)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {pageRest.length > 0 && (
                <div className="blog-grid">
                  {pageRest.map((post) => (
                    <article
                      key={post.id}
                      onClick={() => onSelect(post)}
                      style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 20,
                        overflow: "hidden",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                      }}
                    >
                      <div style={{ height: 210, background: "#0A0A14", overflow: "hidden" }}>
                        <SmartImage
                          src={post.coverImage}
                          alt={post.title}
                          fallbackIcon="ri-sparkling-line"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>

                      <div
                        style={{
                          padding: 22,
                          display: "flex",
                          flexDirection: "column",
                          flex: 1,
                          minHeight: 230,
                        }}
                      >
                        {post.tags.length > 0 && (
                          <div style={{ marginBottom: 14 }}>
                            <TagPill tag={post.tags[0]} small />
                          </div>
                        )}

                        <h3
                          style={{
                            fontSize: 19,
                            fontWeight: 700,
                            color: "#FFFFFF",
                            margin: "0 0 10px",
                            lineHeight: 1.38,
                            fontFamily: "'Fraunces', serif",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            minHeight: "2.76em",
                          }}
                        >
                          {post.title}
                        </h3>

                        <p
                          style={{
                            fontSize: 13,
                            color: "#9CA3AF",
                            margin: "0 0 12px",
                            lineHeight: 1.6,
                            fontFamily: "'Manrope', sans-serif",
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            minHeight: "4.8em",
                          }}
                        >
                          {post.excerpt}
                        </p>

                        {(post.references?.length ?? 0) > 0 && (
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                            {post.references!.slice(0, 2).map((ref) => (
                              <ReferenceBadge key={ref.id} refItem={ref} />
                            ))}
                          </div>
                        )}

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            paddingTop: 16,
                            borderTop: "1px solid rgba(255,255,255,0.05)",
                            marginTop: "auto",
                          }}
                        >
                          <Avatar name={post.author} size={28} />
                          <div style={{ fontFamily: "'Manrope', sans-serif", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 12, color: "#D1D5DB", fontWeight: 700 }}>{post.author}</span>
                            <span style={{ fontSize: 11, color: "#6B7280" }}>
                              {formatDate(post.date, { day: "numeric", month: "short" })} · {readingTime(post.content)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 56, flexWrap: "wrap" }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
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
                        fontWeight: p === page ? 700 : 600,
                        transition: "all 0.2s",
                        fontFamily: "'Manrope', sans-serif",
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

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BlogPost | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchPublishedPosts().then((p) => {
      if (!mounted) return;
      setPosts(p);
      setLoading(false);
      setTimeout(() => window.AOS?.refresh?.(), 50);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const head = document.head;

    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=Manrope:wght@400;500;600;700;800&display=swap";

    const iconLink = document.createElement("link");
    iconLink.rel = "stylesheet";
    iconLink.href = "https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css";

    const aosCss = document.createElement("link");
    aosCss.rel = "stylesheet";
    aosCss.href = "https://unpkg.com/aos@2.3.4/dist/aos.css";

    const aosScript = document.createElement("script");
    aosScript.src = "https://unpkg.com/aos@2.3.4/dist/aos.js";
    aosScript.async = true;
    aosScript.onload = () => {
      window.AOS?.init({
        duration: 700,
        easing: "ease-out-cubic",
        once: true,
        offset: 12,
      });
      window.AOS?.refresh?.();
    };

    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes pulseRing {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(1.5); opacity: 0; }
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      * { box-sizing: border-box; }

      body {
        background: #05050F;
        margin: 0;
        overflow-x: hidden;
        font-family: 'Manrope', sans-serif;
      }

      .filter-wrap {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        padding: 18px 0 22px;
      }

      .tag-filter-row {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .featured-post {
        display: grid;
        grid-template-columns: 1fr 1.15fr;
      }

      .blog-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 24px;
      }

      .blog-content h1, .blog-content h2, .blog-content h3 {
        font-family: 'Fraunces', serif;
        font-weight: 700;
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
        padding: 16px 24px;
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
        width: 100%;
        height: auto;
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

      /* FIXED list visibility (Tailwind reset override) */
      .blog-content ul,
      .blog-content ol {
        padding-left: 28px !important;
        margin: 0 0 1.4em !important;
      }

      .blog-content ul { list-style-type: disc !important; }
      .blog-content ol { list-style-type: decimal !important; }

      .blog-content li {
        display: list-item !important;
        margin-bottom: 8px;
        color: #D1D5DB;
      }

      /* Table support */
      .blog-content table {
        width: 100%;
        border-collapse: collapse;
        margin: 1.2em 0;
        border: 1px solid rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.02);
      }

      .blog-content th,
      .blog-content td {
        border: 1px solid rgba(255,255,255,0.12);
        padding: 10px 12px;
        text-align: left;
        color: #E5E7EB;
      }

      .blog-content th {
        background: rgba(255,255,255,0.06);
        color: #FFFFFF;
        font-weight: 700;
      }

      .blog-content hr {
        border: none;
        border-top: 1px solid rgba(255,255,255,0.08);
        margin: 2.5em 0;
      }

      .blog-content strong {
        color: #FFFFFF;
        font-weight: 700;
      }

      input::placeholder { color: #6B7280; }

      @media (max-width: 980px) {
        .featured-post {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 760px) {
        .filter-wrap {
          align-items: stretch;
        }

        .tag-filter-row {
          width: 100%;
        }

        .blog-grid {
          grid-template-columns: 1fr;
        }

        .blog-content h1 { font-size: 28px; }
        .blog-content h2 { font-size: 24px; }
        .blog-content h3 { font-size: 20px; }
      }
    `;

    [fontLink, iconLink, aosCss, aosScript, style].forEach((el) => head.appendChild(el));

    return () => {
      [fontLink, iconLink, aosCss, aosScript, style].forEach((el) => {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
    };
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
            gap: 16,
            padding: "24px",
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
          <p style={{ color: "#9CA3AF", fontSize: 14, margin: 0, fontFamily: "'Manrope', sans-serif" }}>
            Loading stories...
          </p>
        </div>
        <Footer />
      </>
    );
  }

  return selected ? <PostView post={selected} onBack={() => setSelected(null)} /> : <BlogList posts={posts} onSelect={setSelected} />;
}