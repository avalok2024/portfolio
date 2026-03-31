import { useState, useRef, useCallback, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase client ──────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ─── Types ────────────────────────────────────────────────────────────────────
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

// Supabase row shape (snake_case) → our app shape (camelCase)
function fromRow(row: any): BlogPost {
  return {
    id:         String(row.id || ""),
    title:      String(row.title || ""),
    excerpt:    String(row.excerpt || ""),
    content:    String(row.content || ""),
    author:     String(row.author || ""),
    date:       String(row.date || ""),
    tags:       row.tags ? String(row.tags).split(",").map((t: string) => t.trim()).filter(Boolean) : [],
    published:  Boolean(row.published),
    coverImage: String(row.cover_image || ""),
  };
}

function toRow(post: BlogPost) {
  return {
    id:          post.id,
    title:       post.title,
    excerpt:     post.excerpt,
    content:     post.content,
    author:      post.author,
    date:        post.date || new Date().toISOString(),
    tags:        Array.isArray(post.tags) ? post.tags.join(",") : "",
    published:   post.published,
    cover_image: post.coverImage || "",
  };
}

// ─── Access Control from .env ─────────────────────────────────────────────────
interface AuthUser { username: string; role: "admin" | "writer"; }

function getAllowedUsers(): Record<string, { password: string; role: "admin" | "writer" }> {
  const users: Record<string, { password: string; role: "admin" | "writer" }> = {};
  const adminUser = import.meta.env.VITE_ADMIN_USER;
  const adminPass = import.meta.env.VITE_ADMIN_PASS;
  if (adminUser && adminPass) users[adminUser] = { password: adminPass, role: "admin" };
  for (let i = 1; i <= 10; i++) {
    const u = import.meta.env[`VITE_WRITER_${i}_USER`];
    const p = import.meta.env[`VITE_WRITER_${i}_PASS`];
    if (u && p) users[u] = { password: p, role: "writer" };
  }
  return users;
}

const AUTH_KEY = "avalok_blog_auth";

// ─── Supabase DB helpers ──────────────────────────────────────────────────────
async function dbFetchAllPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("date", { ascending: false });
  if (error) { console.error("Fetch error:", error.message); return []; }
  return (data || []).map(fromRow);
}

async function dbSavePost(post: BlogPost): Promise<{ ok: boolean; error?: string }> {
  const row = toRow(post);
  const { error } = await supabase
    .from("blog_posts")
    .upsert(row, { onConflict: "id" });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

async function dbDeletePost(id: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from("blog_posts")
    .delete()
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ─── Toolbar Button ───────────────────────────────────────────────────────────
function ToolbarBtn({ title, onClick, active, children }: {
  title: string; onClick: () => void; active?: boolean; children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      style={{
        padding: "4px 8px", border: active ? "1px solid #a78bfa" : "1px solid #d1d5db",
        borderRadius: 6, background: active ? "#ede9fe" : "transparent",
        cursor: "pointer", fontSize: 13, fontWeight: 500,
        color: active ? "#7c3aed" : "#374151", lineHeight: 1,
      }}
    >{children}</button>
  );
}

// ─── WYSIWYG Editor ───────────────────────────────────────────────────────────
function RichEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [fmt, setFmt] = useState<Record<string, boolean>>({});

  const exec = useCallback((cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const checkFmt = useCallback(() => {
    setFmt({
      bold:                document.queryCommandState("bold"),
      italic:              document.queryCommandState("italic"),
      underline:           document.queryCommandState("underline"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      insertOrderedList:   document.queryCommandState("insertOrderedList"),
    });
  }, []);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 4, padding: "8px 10px",
        background: "#f9fafb", borderBottom: "1px solid #e5e7eb",
      }}>
        <ToolbarBtn title="Bold"      active={fmt.bold}      onClick={() => exec("bold")}><b>B</b></ToolbarBtn>
        <ToolbarBtn title="Italic"    active={fmt.italic}    onClick={() => exec("italic")}><i>I</i></ToolbarBtn>
        <ToolbarBtn title="Underline" active={fmt.underline} onClick={() => exec("underline")}><u>U</u></ToolbarBtn>
        <div style={{ width: 1, background: "#d1d5db", margin: "0 4px" }} />
        <ToolbarBtn title="H1" onClick={() => exec("formatBlock", "H1")}>H1</ToolbarBtn>
        <ToolbarBtn title="H2" onClick={() => exec("formatBlock", "H2")}>H2</ToolbarBtn>
        <ToolbarBtn title="H3" onClick={() => exec("formatBlock", "H3")}>H3</ToolbarBtn>
        <ToolbarBtn title="Paragraph" onClick={() => exec("formatBlock", "P")}>¶</ToolbarBtn>
        <div style={{ width: 1, background: "#d1d5db", margin: "0 4px" }} />
        <ToolbarBtn title="Bullet List"   active={fmt.insertUnorderedList} onClick={() => exec("insertUnorderedList")}>• List</ToolbarBtn>
        <ToolbarBtn title="Numbered List" active={fmt.insertOrderedList}   onClick={() => exec("insertOrderedList")}>1. List</ToolbarBtn>
        <div style={{ width: 1, background: "#d1d5db", margin: "0 4px" }} />
        <ToolbarBtn title="Quote" onClick={() => exec("formatBlock", "BLOCKQUOTE")}>" Quote</ToolbarBtn>
        <ToolbarBtn title="Code"  onClick={() => exec("formatBlock", "PRE")}>{"</>"}</ToolbarBtn>
        <div style={{ width: 1, background: "#d1d5db", margin: "0 4px" }} />
        <ToolbarBtn title="Link"  onClick={() => { const u = prompt("URL:"); if (u) exec("createLink", u); }}>🔗</ToolbarBtn>
        <ToolbarBtn title="Image" onClick={() => { const u = prompt("Image URL:"); if (u) exec("insertImage", u); }}>🖼</ToolbarBtn>
        <ToolbarBtn title="Line"  onClick={() => exec("insertHorizontalRule")}>─</ToolbarBtn>
        <div style={{ width: 1, background: "#d1d5db", margin: "0 4px" }} />
        <ToolbarBtn title="Undo" onClick={() => exec("undo")}>↩</ToolbarBtn>
        <ToolbarBtn title="Redo" onClick={() => exec("redo")}>↪</ToolbarBtn>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => { if (editorRef.current) onChange(editorRef.current.innerHTML); checkFmt(); }}
        onKeyUp={checkFmt}
        onMouseUp={checkFmt}
        style={{
          minHeight: 400, padding: "20px 24px", outline: "none",
          fontSize: 16, lineHeight: 1.8, color: "#111827", fontFamily: "'Georgia', serif",
        }}
      />
    </div>
  );
}

// ─── Login Modal ──────────────────────────────────────────────────────────────
function LoginModal({ onLogin }: { onLogin: (u: AuthUser) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");

  const handleLogin = () => {
    const allowed = getAllowedUsers();
    const found   = allowed[username];
    if (!found || found.password !== password) {
      setError("Invalid username or password.");
      return;
    }
    onLogin({ username, role: found.role });
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 999, pointerEvents: "auto",
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
          }}
          placeholder="your username"
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
          }}
          placeholder="••••••••"
        />

        {error && <p style={{ color: "#dc2626", fontSize: 13, margin: "0 0 12px" }}>{error}</p>}

        <button
          onClick={handleLogin}
          style={{
            width: "100%", padding: 11, background: "#7c3aed", color: "white",
            border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600,
            cursor: "pointer", marginTop: 4,
          }}
        >Sign In</button>

        <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 16, textAlign: "center" }}>
          Only invited writers can access this panel.
        </p>
      </div>
    </div>
  );
}

// ─── Post Editor ──────────────────────────────────────────────────────────────
function PostEditor({ post, onSave, onCancel, user }: {
  post: Partial<BlogPost>;
  onSave: (p: BlogPost) => void;
  onCancel: () => void;
  user: AuthUser;
}) {
  const [title,      setTitle]      = useState(post.title      || "");
  const [excerpt,    setExcerpt]    = useState(post.excerpt    || "");
  const [content,    setContent]    = useState(post.content    || "");
  const [tags,       setTags]       = useState(post.tags?.join(", ") || "");
  const [coverImage, setCoverImage] = useState(post.coverImage || "");
  const [saving,     setSaving]     = useState(false);
  const [saveMsg,    setSaveMsg]    = useState("");

  const handleSave = async (publish: boolean) => {
    if (!title.trim()) { alert("Please add a title."); return; }
    setSaving(true);
    setSaveMsg("Saving to Supabase...");

    const saved: BlogPost = {
      id:         post.id || Date.now().toString(),
      title:      title.trim(),
      excerpt:    excerpt.trim() || title.trim(),
      content,
      author:     user.username,
      date:       post.date || new Date().toISOString(),
      tags:       tags.split(",").map(t => t.trim()).filter(Boolean),
      published:  publish,
      coverImage: coverImage.trim(),
    };

    const result = await dbSavePost(saved);
    setSaving(false);

    if (result.ok) {
      setSaveMsg("✓ Saved to Supabase!");
      setTimeout(() => setSaveMsg(""), 3000);
      onSave(saved);
    } else {
      setSaveMsg(`⚠ Error: ${result.error}`);
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <button onClick={onCancel} style={{
          padding: "7px 14px", border: "1px solid #e5e7eb", borderRadius: 8,
          background: "transparent", cursor: "pointer", fontSize: 14, color: "#374151",
        }}>← Back</button>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827", flex: 1 }}>
          {post.id ? "Edit Post" : "New Post"}
        </h1>
        <span style={{
          background: user.role === "admin" ? "#ede9fe" : "#dcfce7",
          color: user.role === "admin" ? "#7c3aed" : "#16a34a",
          padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600,
        }}>
          {user.role === "admin" ? "👑 Admin" : "✍️ Writer"} — {user.username}
        </span>
      </div>

      <input
        value={title} onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title..."
        style={{
          width: "100%", padding: "14px 0", border: "none",
          borderBottom: "2px solid #e5e7eb", fontSize: 28, fontWeight: 700,
          color: "#111827", outline: "none", marginBottom: 20,
          boxSizing: "border-box", fontFamily: "Georgia, serif", background: "transparent",
        }}
      />

      <textarea
        value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
        placeholder="Short excerpt shown on blog listing..."
        rows={2}
        style={{
          width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb",
          borderRadius: 8, fontSize: 14, color: "#374151", outline: "none",
          marginBottom: 16, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit",
        }}
      />

      <input
        value={coverImage} onChange={(e) => setCoverImage(e.target.value)}
        placeholder="Cover image URL (optional)..."
        style={{
          width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb",
          borderRadius: 8, fontSize: 14, color: "#374151", outline: "none",
          marginBottom: coverImage ? 12 : 16, boxSizing: "border-box",
        }}
      />
      {coverImage && (
        <img src={coverImage} alt="cover" style={{
          width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8, marginBottom: 16,
        }} />
      )}

      <RichEditor value={content} onChange={setContent} />

      <input
        value={tags} onChange={(e) => setTags(e.target.value)}
        placeholder="Tags (comma separated, e.g. React, Design)..."
        style={{
          width: "100%", marginTop: 16, padding: "10px 12px",
          border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14,
          color: "#374151", outline: "none", boxSizing: "border-box",
        }}
      />

      <div style={{
        display: "flex", gap: 12, marginTop: 24, paddingTop: 20,
        borderTop: "1px solid #e5e7eb", alignItems: "center",
      }}>
        <button onClick={() => handleSave(false)} disabled={saving} style={{
          padding: "10px 20px", background: "#f3f4f6", color: "#374151",
          border: "1px solid #d1d5db", borderRadius: 8, cursor: "pointer",
          fontSize: 14, fontWeight: 500, opacity: saving ? 0.6 : 1,
        }}>
          {saving ? "Saving..." : "Save Draft"}
        </button>
        <button onClick={() => handleSave(true)} disabled={saving} style={{
          padding: "10px 20px", background: "#7c3aed", color: "white",
          border: "none", borderRadius: 8, cursor: "pointer",
          fontSize: 14, fontWeight: 600, opacity: saving ? 0.6 : 1,
        }}>
          {saving ? "Publishing..." : "Publish Post"}
        </button>
        {saveMsg && (
          <span style={{ fontSize: 13, color: saveMsg.startsWith("✓") ? "#16a34a" : "#d97706" }}>
            {saveMsg}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function BlogEditor() {
  const [user,      setUser]     = useState<AuthUser | null>(() => {
    try { return JSON.parse(sessionStorage.getItem(AUTH_KEY) || "null"); } catch { return null; }
  });
  const [showLogin, setShowLogin] = useState(false);
  const [posts,     setPosts]     = useState<BlogPost[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [editing,   setEditing]   = useState<Partial<BlogPost> | "new" | null>(null);
  const [filter,    setFilter]    = useState<"all" | "published" | "draft">("all");

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    dbFetchAllPosts().then(p => { setPosts(p); setLoading(false); });
  }, [user]);

  const handleLogin = (u: AuthUser) => {
    setUser(u);
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(u));
    setShowLogin(false);
  };

  const handleLogout = () => {
    setUser(null); setPosts([]);
    sessionStorage.removeItem(AUTH_KEY);
  };

  const handleSave = (post: BlogPost) => {
    setPosts(prev => {
      const idx = prev.findIndex(p => p.id === post.id);
      return idx >= 0 ? prev.map(p => p.id === post.id ? post : p) : [post, ...prev];
    });
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post permanently from Supabase?")) return;
    const result = await dbDeletePost(id);
    if (result.ok) setPosts(prev => prev.filter(p => p.id !== id));
    else alert(`Delete failed: ${result.error}`);
  };

  const filtered = posts.filter(p =>
    filter === "published" ? p.published :
    filter === "draft"     ? !p.published : true
  );

  const isConnected = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", background: "#fafaf9",
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
            Private writing area. Only authorized writers can create and manage posts.
          </p>
          <button onClick={() => setShowLogin(true)} style={{
            padding: "12px 32px", background: "#7c3aed", color: "white",
            border: "none", borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: "pointer",
          }}>Sign In to Write</button>
        </div>
      </div>
    );
  }

  // ── Editing ───────────────────────────────────────────────────────────────
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
        padding: "0 24px", display: "flex", alignItems: "center", height: 60, gap: 16,
      }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827", flex: 1 }}>
          ✍️ Blog Dashboard
        </h1>
        <span style={{ fontSize: 13, color: "#6b7280" }}>
          {user.role === "admin" ? "👑" : "✍️"} {user.username}
        </span>
        <button onClick={() => setEditing("new")} style={{
          padding: "8px 18px", background: "#7c3aed", color: "white",
          border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600,
        }}>+ New Post</button>
        <button onClick={handleLogout} style={{
          padding: "8px 14px", background: "transparent", color: "#6b7280",
          border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer", fontSize: 13,
        }}>Sign Out</button>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px" }}>
        {/* Connection status */}
        <div style={{
          background: isConnected ? "#f0fdf4" : "#fff7ed",
          border: `1px solid ${isConnected ? "#86efac" : "#fed7aa"}`,
          borderRadius: 8, padding: "8px 14px", marginBottom: 20,
          fontSize: 13, color: isConnected ? "#15803d" : "#c2410c",
        }}>
          {isConnected
            ? "✓ Connected to Supabase — all posts sync automatically"
            : "⚠ VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing in .env"}
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Total Posts", value: posts.length },
            { label: "Published",   value: posts.filter(p => p.published).length },
            { label: "Drafts",      value: posts.filter(p => !p.published).length },
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

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
          {(["all", "published", "draft"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "7px 16px", borderRadius: 7, border: "1px solid",
              borderColor: filter === f ? "#a78bfa" : "#e5e7eb",
              background: filter === f ? "#ede9fe" : "white",
              color: filter === f ? "#7c3aed" : "#374151",
              cursor: "pointer", fontSize: 13, fontWeight: 500, textTransform: "capitalize",
            }}>{f}</button>
          ))}
        </div>

        {/* Posts list */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
            Loading posts from Supabase...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
            <p>No posts yet. Click "+ New Post" to start writing.</p>
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
                    width: 80, height: 56, objectFit: "cover", borderRadius: 6, flexShrink: 0,
                  }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                      background: post.published ? "#dcfce7" : "#fef3c7",
                      color: post.published ? "#16a34a" : "#92400e",
                    }}>{post.published ? "Published" : "Draft"}</span>
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
                        }}>{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button onClick={() => setEditing(post)} style={{
                    padding: "7px 14px", background: "#f3f4f6", color: "#374151",
                    border: "1px solid #e5e7eb", borderRadius: 7, cursor: "pointer", fontSize: 13,
                  }}>Edit</button>
                  {user.role === "admin" && (
                    <button onClick={() => handleDelete(post.id)} style={{
                      padding: "7px 14px", background: "#fff1f2", color: "#e11d48",
                      border: "1px solid #fecdd3", borderRadius: 7, cursor: "pointer", fontSize: 13,
                    }}>Delete</button>
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