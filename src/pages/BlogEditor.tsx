import { useState, useRef, useCallback, useEffect } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
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

interface AuthUser {
  username: string;
  role: "admin" | "writer";
}

// ─── Access Control ───────────────────────────────────────────────────────────
// Add or remove users here. Passwords are plain text for simplicity;
// in production use hashed passwords + a real backend.
const ALLOWED_USERS: Record<string, { password: string; role: "admin" | "writer" }> = {
  admin: { password: "admin123", role: "admin" },    // ← your account
  // "alice": { password: "alice-pass", role: "writer" }, // ← example invited writer
};

// ─── Storage helpers ──────────────────────────────────────────────────────────
const POSTS_KEY = "avalok_blog_posts";
const AUTH_KEY = "avalok_blog_auth";

function loadPosts(): BlogPost[] {
  try {
    const raw = localStorage.getItem(POSTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePosts(posts: BlogPost[]) {
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

// ─── Toolbar Button ───────────────────────────────────────────────────────────
function ToolbarBtn({
  title, onClick, active, children,
}: { title: string; onClick: () => void; active?: boolean; children: React.ReactNode }) {
  return (
    <button
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      style={{
        padding: "4px 8px",
        border: active ? "1px solid #a78bfa" : "1px solid #d1d5db",
        borderRadius: 6,
        background: active ? "#ede9fe" : "transparent",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 500,
        color: active ? "#7c3aed" : "#374151",
        lineHeight: 1,
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}

// ─── WYSIWYG Editor ───────────────────────────────────────────────────────────
function RichEditor({
  value, onChange,
}: { value: string; onChange: (html: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});

  const exec = useCallback((cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const checkFormats = useCallback(() => {
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
    });
  }, []);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  const insertImage = () => {
    const url = prompt("Enter image URL:");
    if (url) exec("insertImage", url);
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) exec("createLink", url);
  };

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 4, padding: "8px 10px",
        background: "#f9fafb", borderBottom: "1px solid #e5e7eb",
      }}>
        <ToolbarBtn title="Bold" active={activeFormats.bold} onClick={() => exec("bold")}><b>B</b></ToolbarBtn>
        <ToolbarBtn title="Italic" active={activeFormats.italic} onClick={() => exec("italic")}><i>I</i></ToolbarBtn>
        <ToolbarBtn title="Underline" active={activeFormats.underline} onClick={() => exec("underline")}><u>U</u></ToolbarBtn>
        <div style={{ width: 1, background: "#d1d5db", margin: "0 4px" }} />
        <ToolbarBtn title="Heading 1" onClick={() => exec("formatBlock", "H1")}>H1</ToolbarBtn>
        <ToolbarBtn title="Heading 2" onClick={() => exec("formatBlock", "H2")}>H2</ToolbarBtn>
        <ToolbarBtn title="Heading 3" onClick={() => exec("formatBlock", "H3")}>H3</ToolbarBtn>
        <ToolbarBtn title="Paragraph" onClick={() => exec("formatBlock", "P")}>¶</ToolbarBtn>
        <div style={{ width: 1, background: "#d1d5db", margin: "0 4px" }} />
        <ToolbarBtn title="Bullet List" active={activeFormats.insertUnorderedList} onClick={() => exec("insertUnorderedList")}>• List</ToolbarBtn>
        <ToolbarBtn title="Numbered List" active={activeFormats.insertOrderedList} onClick={() => exec("insertOrderedList")}>1. List</ToolbarBtn>
        <div style={{ width: 1, background: "#d1d5db", margin: "0 4px" }} />
        <ToolbarBtn title="Quote" onClick={() => exec("formatBlock", "BLOCKQUOTE")}>" Quote</ToolbarBtn>
        <ToolbarBtn title="Code" onClick={() => exec("formatBlock", "PRE")}>{"</>"}</ToolbarBtn>
        <div style={{ width: 1, background: "#d1d5db", margin: "0 4px" }} />
        <ToolbarBtn title="Insert Link" onClick={insertLink}>🔗</ToolbarBtn>
        <ToolbarBtn title="Insert Image" onClick={insertImage}>🖼</ToolbarBtn>
        <ToolbarBtn title="Horizontal Rule" onClick={() => exec("insertHorizontalRule")}>─</ToolbarBtn>
        <div style={{ width: 1, background: "#d1d5db", margin: "0 4px" }} />
        <ToolbarBtn title="Undo" onClick={() => exec("undo")}>↩</ToolbarBtn>
        <ToolbarBtn title="Redo" onClick={() => exec("redo")}>↪</ToolbarBtn>
      </div>

      {/* Editable Area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => {
          if (editorRef.current) onChange(editorRef.current.innerHTML);
          checkFormats();
        }}
        onKeyUp={checkFormats}
        onMouseUp={checkFormats}
        style={{
          minHeight: 400,
          padding: "20px 24px",
          outline: "none",
          fontSize: 16,
          lineHeight: 1.8,
          color: "#111827",
          fontFamily: "'Georgia', serif",
        }}
        className="rich-editor"
      />
    </div>
  );
}

// ─── Login Modal ──────────────────────────────────────────────────────────────
function LoginModal({ onLogin }: { onLogin: (user: AuthUser) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const user = ALLOWED_USERS[username];
    if (!user || user.password !== password) {
      setError("Invalid username or password.");
      return;
    }
    onLogin({ username, role: user.role });
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999,
      pointerEvents: "auto",
    }}>
      <div style={{
        background: "white", borderRadius: 16, padding: "40px 48px",
        width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#111827" }}>
          Writer Access
        </h2>
        <p style={{ margin: "0 0 24px", color: "#6b7280", fontSize: 14 }}>
          Enter your credentials to write or edit posts.
        </p>

        <label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Username</label>
        <input
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          style={{
            display: "block", width: "100%", marginTop: 4, marginBottom: 14,
            padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8,
            fontSize: 14, boxSizing: "border-box", outline: "none",
            color: "#111827", background: "white", pointerEvents: "auto",
            WebkitUserSelect: "text", userSelect: "text",
          }}
          placeholder="admin"
        />

        <label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Password</label>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          style={{
            display: "block", width: "100%", marginTop: 4, marginBottom: 8,
            padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8,
            fontSize: 14, boxSizing: "border-box", outline: "none",
            color: "#111827", background: "white", pointerEvents: "auto",
            WebkitUserSelect: "text", userSelect: "text",
          }}
          placeholder="••••••••"
        />

        {error && (
          <p style={{ color: "#dc2626", fontSize: 13, margin: "0 0 12px" }}>{error}</p>
        )}

        <button
          onClick={handleLogin}
          style={{
            width: "100%", padding: "11px", background: "#7c3aed",
            color: "white", border: "none", borderRadius: 8, fontSize: 15,
            fontWeight: 600, cursor: "pointer", marginTop: 4,
          }}
        >
          Sign In
        </button>

        <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 16, textAlign: "center" }}>
          Only invited writers can access this panel.
        </p>
      </div>
    </div>
  );
}

// ─── Post Editor Page ─────────────────────────────────────────────────────────
function PostEditor({
  post, onSave, onCancel, user,
}: {
  post: Partial<BlogPost> | null;
  onSave: (p: BlogPost) => void;
  onCancel: () => void;
  user: AuthUser;
}) {
  const [title, setTitle] = useState(post?.title || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [content, setContent] = useState(post?.content || "");
  const [tags, setTags] = useState(post?.tags?.join(", ") || "");
  const [coverImage, setCoverImage] = useState(post?.coverImage || "");
  const [published, setPublished] = useState(post?.published || false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (publish?: boolean) => {
    if (!title.trim()) { alert("Please add a title."); return; }
    setSaving(true);
    const saved: BlogPost = {
      id: post?.id || Date.now().toString(),
      title: title.trim(),
      excerpt: excerpt.trim() || title.trim(),
      content,
      author: user.username,
      date: post?.date || new Date().toISOString(),
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      published: publish ?? published,
      coverImage: coverImage.trim(),
    };
    await new Promise(r => setTimeout(r, 400));
    onSave(saved);
    setSaving(false);
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <button onClick={onCancel} style={{
          padding: "7px 14px", border: "1px solid #e5e7eb", borderRadius: 8,
          background: "transparent", cursor: "pointer", fontSize: 14, color: "#374151",
        }}>
          ← Back
        </button>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827", flex: 1 }}>
          {post?.id ? "Edit Post" : "New Post"}
        </h1>
        <span style={{
          background: user.role === "admin" ? "#ede9fe" : "#dcfce7",
          color: user.role === "admin" ? "#7c3aed" : "#16a34a",
          padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600,
        }}>
          {user.role === "admin" ? "👑 Admin" : "✍️ Writer"} — {user.username}
        </span>
      </div>

      {/* Title */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title..."
        style={{
          width: "100%", padding: "14px 0", border: "none", borderBottom: "2px solid #e5e7eb",
          fontSize: 28, fontWeight: 700, color: "#111827", outline: "none",
          marginBottom: 20, boxSizing: "border-box", fontFamily: "Georgia, serif",
          background: "transparent",
        }}
      />

      {/* Excerpt */}
      <textarea
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        placeholder="Short excerpt / summary (shown on blog listing)..."
        rows={2}
        style={{
          width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb",
          borderRadius: 8, fontSize: 14, color: "#374151", outline: "none",
          marginBottom: 16, resize: "vertical", boxSizing: "border-box",
          fontFamily: "inherit",
        }}
      />

      {/* Cover Image URL */}
      <input
        value={coverImage}
        onChange={(e) => setCoverImage(e.target.value)}
        placeholder="Cover image URL (optional)..."
        style={{
          width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb",
          borderRadius: 8, fontSize: 14, color: "#374151", outline: "none",
          marginBottom: 16, boxSizing: "border-box",
        }}
      />
      {coverImage && (
        <img src={coverImage} alt="cover preview" style={{
          width: "100%", maxHeight: 200, objectFit: "cover",
          borderRadius: 8, marginBottom: 16,
        }} />
      )}

      {/* Rich Editor */}
      <RichEditor value={content} onChange={setContent} />

      {/* Tags */}
      <div style={{ marginTop: 16 }}>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (comma separated, e.g. React, Design, Portfolio)..."
          style={{
            width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb",
            borderRadius: 8, fontSize: 14, color: "#374151", outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Actions */}
      <div style={{
        display: "flex", gap: 12, marginTop: 24, paddingTop: 20,
        borderTop: "1px solid #e5e7eb", alignItems: "center",
      }}>
        <button
          onClick={() => handleSave(false)}
          disabled={saving}
          style={{
            padding: "10px 20px", background: "#f3f4f6", color: "#374151",
            border: "1px solid #d1d5db", borderRadius: 8, cursor: "pointer",
            fontSize: 14, fontWeight: 500,
          }}
        >
          {saving ? "Saving..." : "Save Draft"}
        </button>
        <button
          onClick={() => handleSave(true)}
          disabled={saving}
          style={{
            padding: "10px 20px", background: "#7c3aed", color: "white",
            border: "none", borderRadius: 8, cursor: "pointer",
            fontSize: 14, fontWeight: 600,
          }}
        >
          {saving ? "Publishing..." : "Publish Post"}
        </button>
        {published && (
          <button
            onClick={() => handleSave(false)}
            style={{
              padding: "10px 20px", background: "#fef3c7", color: "#92400e",
              border: "1px solid #fbbf24", borderRadius: 8, cursor: "pointer",
              fontSize: 14, fontWeight: 500, marginLeft: "auto",
            }}
          >
            Unpublish
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Blog Editor ─────────────────────────────────────────────────────────
export default function BlogEditor() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = sessionStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });
  const [showLogin, setShowLogin] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>(loadPosts);
  const [editing, setEditing] = useState<Partial<BlogPost> | null | "new">(null);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const handleLogin = (u: AuthUser) => {
    setUser(u);
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(u));
    setShowLogin(false);
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem(AUTH_KEY);
  };

  const handleSave = (post: BlogPost) => {
    setPosts(prev => {
      const idx = prev.findIndex(p => p.id === post.id);
      const next = idx >= 0
        ? prev.map(p => p.id === post.id ? post : p)
        : [post, ...prev];
      savePosts(next);
      return next;
    });
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setPosts(prev => {
      const next = prev.filter(p => p.id !== id);
      savePosts(next);
      return next;
    });
  };

  const filtered = posts.filter(p => {
    if (filter === "published") return p.published;
    if (filter === "draft") return !p.published;
    return true;
  });

  // ── If not authenticated ──────────────────────────────────────────────────
  if (!user) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 16,
        background: "#fafaf9",
      }}>
        {showLogin && <LoginModal onLogin={handleLogin} />}
        <div style={{ textAlign: "center", maxWidth: 420, padding: 40 }}>
          <div style={{
            width: 56, height: 56, background: "#7c3aed", borderRadius: 14,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, margin: "0 auto 20px", color: "white",
          }}>✍️</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111827", margin: "0 0 8px" }}>
            Blog Dashboard
          </h1>
          <p style={{ color: "#6b7280", lineHeight: 1.6, marginBottom: 28 }}>
            This is a private writing area. Only authorized writers can create and manage blog posts.
          </p>
          <button
            onClick={() => setShowLogin(true)}
            style={{
              padding: "12px 32px", background: "#7c3aed", color: "white",
              border: "none", borderRadius: 10, fontSize: 16, fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Sign In to Write
          </button>
        </div>
      </div>
    );
  }

  // ── If editing ────────────────────────────────────────────────────────────
  if (editing !== null) {
    return (
      <PostEditor
        post={editing === "new" ? {} : editing as BlogPost}
        onSave={handleSave}
        onCancel={() => setEditing(null)}
        user={user}
      />
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#fafaf9" }}>
      {/* Top Bar */}
      <div style={{
        background: "white", borderBottom: "1px solid #e5e7eb",
        padding: "0 24px", display: "flex", alignItems: "center",
        height: 60, gap: 16,
      }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827", flex: 1 }}>
          ✍️ Blog Dashboard
        </h1>
        <span style={{ fontSize: 13, color: "#6b7280" }}>
          {user.role === "admin" ? "👑" : "✍️"} {user.username}
        </span>
        <button
          onClick={() => setEditing("new")}
          style={{
            padding: "8px 18px", background: "#7c3aed", color: "white",
            border: "none", borderRadius: 8, cursor: "pointer",
            fontSize: 14, fontWeight: 600,
          }}
        >
          + New Post
        </button>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 14px", background: "transparent", color: "#6b7280",
            border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer",
            fontSize: 13,
          }}
        >
          Sign Out
        </button>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px" }}>
        {/* Stats */}
        <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Total Posts", value: posts.length },
            { label: "Published", value: posts.filter(p => p.published).length },
            { label: "Drafts", value: posts.filter(p => !p.published).length },
          ].map(s => (
            <div key={s.label} style={{
              flex: 1, background: "white", border: "1px solid #e5e7eb",
              borderRadius: 10, padding: "16px 20px",
            }}>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: "#111827" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
          {(["all", "published", "draft"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "7px 16px", borderRadius: 7, border: "1px solid",
                borderColor: filter === f ? "#a78bfa" : "#e5e7eb",
                background: filter === f ? "#ede9fe" : "white",
                color: filter === f ? "#7c3aed" : "#374151",
                cursor: "pointer", fontSize: 13, fontWeight: 500,
                textTransform: "capitalize",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Posts List */}
        {filtered.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "60px 0", color: "#9ca3af",
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
            <p style={{ fontSize: 16 }}>No posts yet. Click "New Post" to start writing.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map(post => (
              <div key={post.id} style={{
                background: "white", border: "1px solid #e5e7eb", borderRadius: 12,
                padding: "16px 20px", display: "flex", gap: 16, alignItems: "flex-start",
              }}>
                {post.coverImage && (
                  <img src={post.coverImage} alt="" style={{
                    width: 80, height: 56, objectFit: "cover", borderRadius: 6,
                    flexShrink: 0,
                  }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                      background: post.published ? "#dcfce7" : "#fef3c7",
                      color: post.published ? "#16a34a" : "#92400e",
                    }}>
                      {post.published ? "Published" : "Draft"}
                    </span>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>
                      {new Date(post.date).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })} · by {post.author}
                    </span>
                  </div>
                  <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#111827" }}>
                    {post.title}
                  </h3>
                  <p style={{ margin: "0 0 8px", fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
                    {post.excerpt}
                  </p>
                  {post.tags.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {post.tags.map(t => (
                        <span key={t} style={{
                          background: "#f3f4f6", color: "#6b7280",
                          padding: "2px 8px", borderRadius: 4, fontSize: 11,
                        }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => setEditing(post)}
                    style={{
                      padding: "7px 14px", background: "#f3f4f6", color: "#374151",
                      border: "1px solid #e5e7eb", borderRadius: 7, cursor: "pointer",
                      fontSize: 13, fontWeight: 500,
                    }}
                  >
                    Edit
                  </button>
                  {user.role === "admin" && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      style={{
                        padding: "7px 14px", background: "#fff1f2", color: "#e11d48",
                        border: "1px solid #fecdd3", borderRadius: 7, cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}