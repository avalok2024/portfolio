import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type CSSProperties,
  type ChangeEvent,
  type RefObject,
} from "react";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase client ───────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || "blog-images";

// ─── Types ─────────────────────────────────────────────────────────────────────
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

interface AuthUser {
  username: string;
  role: "admin" | "writer";
}

// ─── DB row conversion ─────────────────────────────────────────────────────────
function fromRow(row: Record<string, unknown>): BlogPost {
  let refs: Reference[] = [];
  if (row.references) {
    try {
      const parsed = typeof row.references === "string" ? JSON.parse(row.references) : row.references;
      if (Array.isArray(parsed)) refs = parsed as Reference[];
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
    tags: row.tags
      ? String(row.tags)
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean)
      : [],
    published: Boolean(row.published),
    coverImage: String(row.cover_image || ""),
    references: refs,
  };
}

function toRow(post: BlogPost): Record<string, unknown> {
  const row: Record<string, unknown> = {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    author: post.author,
    date: post.date || new Date().toISOString(),
    tags: Array.isArray(post.tags) ? post.tags.join(",") : "",
    published: post.published,
    cover_image: post.coverImage || "",
  };

  // Keep references as json-compatible array when available
  if (post.references !== undefined) {
    row.references = post.references || [];
  }
  return row;
}

// ─── Auth helpers ──────────────────────────────────────────────────────────────
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

// ─── DB helpers ────────────────────────────────────────────────────────────────
async function dbFetchAllPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("Fetch error:", error.message);
    return [];
  }

  return (data || []).map(fromRow);
}

async function dbSavePost(post: BlogPost): Promise<{ ok: boolean; error?: string }> {
  const row = toRow(post);

  const { error } = await supabase.from("blog_posts").upsert(row, { onConflict: "id" });

  if (error) {
    // references column fallback
    if (error.message.includes("references") || error.message.includes("schema cache")) {
      const { references: _r, ...rowWithout } = row as Record<string, unknown> & { references?: unknown };
      void _r;
      const { error: e2 } = await supabase.from("blog_posts").upsert(rowWithout, { onConflict: "id" });
      if (e2) return { ok: false, error: e2.message };
      return { ok: true };
    }
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

async function dbDeletePost(id: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

async function uploadImageToStorage(file: File): Promise<{ url?: string; error?: string }> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, { upsert: true });
  if (error) return { error: error.message };

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}

// ─── Utility ───────────────────────────────────────────────────────────────────
function estimateReadTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

// ─── CSS-in-JS globals injected once ──────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
  @import url('https://cdn.jsdelivr.net/npm/remixicon@4.3.0/fonts/remixicon.css');

  *, *::before, *::after { box-sizing: border-box; }

  :root {
    --bg: #0c0c14;
    --surface: #13131f;
    --surface2: #1a1a2a;
    --border: rgba(255,255,255,0.08);
    --border-hover: rgba(255,255,255,0.18);
    --text: #e8e8f0;
    --muted: #7a7a95;
    --accent: #6c63ff;
    --accent2: #a78bfa;
    --success: #22c55e;
    --danger: #ef4444;
    --warning: #f59e0b;
    --font-display: 'DM Serif Display', Georgia, serif;
    --font-body: 'DM Sans', system-ui, sans-serif;
    --radius: 12px;
    --radius-lg: 20px;
    --shadow: 0 4px 24px rgba(0,0,0,0.4);
    --shadow-lg: 0 12px 48px rgba(0,0,0,0.5);
  }

  body { margin: 0; font-family: var(--font-body); background: var(--bg); color: var(--text); }

  .be-scrollbar::-webkit-scrollbar { width: 6px; }
  .be-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .be-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
  .be-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); }

  .be-editor-content {
    min-height: 400px;
    padding: 28px;
    outline: none;
    font-family: var(--font-body);
    font-size: 16px;
    line-height: 1.85;
    color: var(--text);
    background: transparent;
  }

  .be-editor-content h1 { font-family: var(--font-display); font-size: 2em; color: #fff; margin: 1em 0 .4em; }
  .be-editor-content h2 { font-family: var(--font-display); font-size: 1.5em; color: #f0f0ff; margin: .9em 0 .35em; }
  .be-editor-content h3 { font-family: var(--font-display); font-size: 1.2em; color: #e0e0f8; margin: .8em 0 .3em; }
  .be-editor-content p { margin-bottom: .8em; }
  .be-editor-content a { color: var(--accent2); text-decoration: underline; }

  /* Fixed list rendering */
  .be-editor-content ul,
  .be-editor-content ol {
    margin: 0 0 .9em 0;
    padding-left: 1.6em;
  }
  .be-editor-content ul { list-style: disc outside !important; }
  .be-editor-content ol { list-style: decimal outside !important; }
  .be-editor-content li { display: list-item !important; margin-bottom: .3em; }

  .be-editor-content blockquote {
    border-left: 3px solid var(--accent);
    padding: .5em 1em;
    margin: 1em 0;
    color: var(--muted);
    background: rgba(108,99,255,0.06);
    border-radius: 0 8px 8px 0;
  }

  .be-editor-content pre {
    background: rgba(0,0,0,0.5);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1em;
    font-family: 'Fira Code', monospace;
    font-size: 14px;
    overflow-x: auto;
    margin: 1em 0;
    color: #c9d1d9;
  }

  /* Table rendering */
  .be-editor-content table {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
    border: 1px solid var(--border);
  }
  .be-editor-content th,
  .be-editor-content td {
    border: 1px solid var(--border);
    padding: 8px 10px;
    text-align: left;
  }
  .be-editor-content th { background: rgba(255,255,255,0.06); color: #fff; }

  .be-editor-content img { max-width: 100%; border-radius: 8px; margin: .5em 0; display: block; }
  .be-editor-content hr { border: none; border-top: 1px solid var(--border); margin: 1.5em 0; }

  .be-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: rgba(255,255,255,0.04);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.18s ease;
    white-space: nowrap;
  }
  .be-btn:hover { border-color: var(--border-hover); background: rgba(255,255,255,0.08); }
  .be-btn.primary {
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
    font-weight: 600;
  }
  .be-btn.primary:hover { background: #7c74ff; border-color: #7c74ff; }
  .be-btn.danger { background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.3); color: var(--danger); }
  .be-btn.danger:hover { background: rgba(239,68,68,0.22); }
  .be-btn.success { background: rgba(34,197,94,0.12); border-color: rgba(34,197,94,0.3); color: var(--success); }
  .be-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .be-input {
    width: 100%;
    padding: 10px 14px;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    font-family: var(--font-body);
    font-size: 14px;
    outline: none;
    transition: border-color 0.18s;
  }
  .be-input:focus { border-color: var(--accent); }
  .be-input::placeholder { color: var(--muted); }

  .be-select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%237a7a95' d='M6 8L0 0h12z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 32px;
  }

  .be-chip {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 10px;
    background: rgba(255,255,255,0.06);
    border: 1px solid var(--border);
    border-radius: 20px;
    font-size: 11px;
    font-weight: 500;
    color: var(--muted);
  }
  .be-chip.accent { background: rgba(108,99,255,0.12); border-color: rgba(108,99,255,0.3); color: var(--accent2); }
  .be-chip.success { background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.25); color: var(--success); }
  .be-chip.warning { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.25); color: var(--warning); }

  .be-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    transition: border-color 0.2s, transform 0.2s;
  }
  .be-card:hover { border-color: rgba(108,99,255,0.3); }

  .be-toolbar-btn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 34px; height: 34px;
    border-radius: 6px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--muted);
    font-size: 16px;
    cursor: pointer;
    transition: all 0.15s;
    flex-shrink: 0;
  }
  .be-toolbar-btn:hover { background: rgba(255,255,255,0.07); color: var(--text); border-color: var(--border); }
  .be-toolbar-btn.active { background: rgba(108,99,255,0.18); color: var(--accent2); border-color: rgba(108,99,255,0.35); }

  @media (max-width: 768px) {
    .be-hide-mobile { display: none !important; }

    .be-editor-layout { flex-direction: column !important; padding: 0 !important; }
    .be-toolbar-panel {
      width: 100% !important;
      max-height: 160px;
      overflow-x: auto;
      overflow-y: hidden;
      border-left: none !important;
      border-top: 1px solid var(--border) !important;
      flex-direction: row !important;
      padding: 8px 10px !important;
    }
    .be-toolbar-panel .be-toolbar-inner {
      flex-direction: row !important;
      flex-wrap: wrap;
      gap: 4px;
    }
    .be-toolbar-sep { width: 1px !important; height: 24px !important; margin: 0 4px !important; }

    .be-nav-search { display: none !important; }
    .be-nav-role { display: none !important; }

    .be-dashboard-body { padding: 16px !important; }
    .be-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .be-list-thumb { display: none !important; }
    .be-editor-meta { padding: 16px !important; }

    .be-cover-row { flex-direction: column !important; }
    .be-cover-row .be-btn { width: 100% !important; justify-content: center; }

    .be-ref-row { flex-direction: column !important; }
    .be-ref-row .be-input, .be-ref-row .be-btn { width: 100% !important; flex: unset !important; }

    .be-editor-topbar-save-text { display: none !important; }

    .be-toast { left: 12px !important; right: 12px !important; bottom: 12px !important; max-width: unset !important; }
  }

  @media (max-width: 480px) {
    .be-stats-grid { grid-template-columns: 1fr !important; }
    .be-filter-bar { flex-wrap: wrap; }
  }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .be-fadein { animation: fadeIn 0.25s ease forwards; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .be-spin { animation: spin 0.8s linear infinite; }
`;

function InjectGlobalCSS() {
  useEffect(() => {
    const id = "be-global-css";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);
  return null;
}

// ─── Icon shorthand ────────────────────────────────────────────────────────────
function Ic({ name, size = 16, style }: { name: string; size?: number; style?: CSSProperties }) {
  return <i className={`ri-${name}`} style={{ fontSize: size, lineHeight: 1, ...style }} />;
}

// ─── Broken image fallback ─────────────────────────────────────────────────────
function CoverImage({ src, alt, style }: { src: string; alt?: string; style?: CSSProperties }) {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div
        style={{
          ...style,
          background: "var(--surface2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--muted)",
        }}
      >
        <Ic name="image-2-line" size={28} />
      </div>
    );
  }
  return <img src={src} alt={alt || ""} style={style} onError={() => setError(true)} />;
}

// ─── Toast notification ────────────────────────────────────────────────────────
function Toast({
  message,
  type,
  onDone,
}: {
  message: string;
  type: "success" | "error" | "info";
  onDone: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);

  const color = type === "success" ? "var(--success)" : type === "error" ? "var(--danger)" : "var(--accent2)";
  const bg =
    type === "success"
      ? "rgba(34,197,94,0.12)"
      : type === "error"
      ? "rgba(239,68,68,0.12)"
      : "rgba(108,99,255,0.12)";

  return (
    <div
      className="be-toast"
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        zIndex: 9999,
        border: `1px solid ${color}`,
        borderRadius: 12,
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "var(--shadow-lg)",
        color,
        background: bg,
        fontSize: 14,
        fontFamily: "var(--font-body)",
        animation: "fadeIn 0.2s ease",
        maxWidth: 340,
      }}
    >
      <Ic
        name={
          type === "success"
            ? "checkbox-circle-fill"
            : type === "error"
            ? "error-warning-fill"
            : "information-fill"
        }
        size={18}
      />
      {message}
    </div>
  );
}

// ─── Toolbar ───────────────────────────────────────────────────────────────────
interface ToolbarAction {
  icon: string;
  title: string;
  cmd?: string;
  arg?: string;
  custom?: () => void;
  separator?: never;
}
interface ToolbarSep {
  separator: true;
}
type ToolbarItem = ToolbarAction | ToolbarSep;

function EditorToolbar({
  editorRef,
  onImageUpload,
}: {
  editorRef: RefObject<HTMLDivElement | null>;
  onImageUpload: () => void;
}) {
  const [active, setActive] = useState<Record<string, boolean>>({});
  const savedRangeRef = useRef<Range | null>(null);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (editorRef.current?.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  }, [editorRef]);

  const restoreSelection = useCallback(() => {
    const range = savedRangeRef.current;
    if (!range) return;
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
  }, []);

  const checkActive = useCallback(() => {
    setActive({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
    });
  }, []);

  const exec = useCallback(
    (cmd: string, arg?: string) => {
      editorRef.current?.focus();
      restoreSelection();

      let ok = false;
      try {
        if (cmd === "formatBlock" && arg) {
          ok =
            document.execCommand("formatBlock", false, arg) ||
            document.execCommand("formatBlock", false, `<${arg.toLowerCase()}>`);
        } else {
          ok = document.execCommand(cmd, false, arg ?? undefined);
        }
      } catch {
        ok = false;
      }

      if (!ok && (cmd === "insertUnorderedList" || cmd === "insertOrderedList")) {
        const tag = cmd === "insertUnorderedList" ? "ul" : "ol";
        document.execCommand("insertHTML", false, `<${tag}><li>List item</li></${tag}><p><br/></p>`);
      }

      saveSelection();
      checkActive();
    },
    [editorRef, restoreSelection, saveSelection, checkActive]
  );

  useEffect(() => {
    const onSelection = () => {
      saveSelection();
      checkActive();
    };
    document.addEventListener("selectionchange", onSelection);
    return () => document.removeEventListener("selectionchange", onSelection);
  }, [saveSelection, checkActive]);

  const insertTable = useCallback(() => {
    editorRef.current?.focus();
    restoreSelection();

    const rows = Number(prompt("Rows?", "3") || 0);
    const cols = Number(prompt("Columns?", "3") || 0);
    if (!rows || !cols || rows < 1 || cols < 1) return;

    const head = `<tr>${Array.from({ length: cols })
      .map((_, i) => `<th>Header ${i + 1}</th>`)
      .join("")}</tr>`;
    const body = Array.from({ length: rows - 1 })
      .map(() => `<tr>${Array.from({ length: cols }).map(() => `<td>Cell</td>`).join("")}</tr>`)
      .join("");

    document.execCommand(
      "insertHTML",
      false,
      `<table><thead>${head}</thead><tbody>${body}</tbody></table><p><br/></p>`
    );

    saveSelection();
    checkActive();
  }, [editorRef, restoreSelection, saveSelection, checkActive]);

  const items: ToolbarItem[] = [
    { icon: "bold", title: "Bold", cmd: "bold" },
    { icon: "italic", title: "Italic", cmd: "italic" },
    { icon: "underline", title: "Underline", cmd: "underline" },
    { icon: "strikethrough-2", title: "Strikethrough", cmd: "strikeThrough" },
    { separator: true },

    { icon: "h-1", title: "Heading 1", cmd: "formatBlock", arg: "H1" },
    { icon: "h-2", title: "Heading 2", cmd: "formatBlock", arg: "H2" },
    { icon: "h-3", title: "Heading 3", cmd: "formatBlock", arg: "H3" },
    { icon: "text", title: "Paragraph", cmd: "formatBlock", arg: "P" },
    { separator: true },

    { icon: "list-unordered", title: "Bullet List", cmd: "insertUnorderedList" },
    { icon: "list-ordered", title: "Numbered List", cmd: "insertOrderedList" },
    { icon: "table-line", title: "Insert Table", custom: insertTable },
    { separator: true },

    { icon: "double-quotes-l", title: "Blockquote", cmd: "formatBlock", arg: "BLOCKQUOTE" },
    { icon: "code-s-slash-line", title: "Code Block", cmd: "formatBlock", arg: "PRE" },
    { separator: true },

    {
      icon: "link-m",
      title: "Insert Link",
      custom: () => {
        const url = prompt("URL:");
        if (url) exec("createLink", url);
      },
    },
    {
      icon: "image-add-line",
      title: "Image by URL",
      custom: () => {
        const url = prompt("Image URL:");
        if (url) exec("insertImage", url);
      },
    },
    { icon: "upload-cloud-2-line", title: "Upload Image", custom: onImageUpload },
    { separator: true },

    { icon: "separator", title: "Horizontal Rule", cmd: "insertHorizontalRule" },
    { separator: true },

    { icon: "arrow-go-back-line", title: "Undo", cmd: "undo" },
    { icon: "arrow-go-forward-line", title: "Redo", cmd: "redo" },
  ];

  const TEXT_LABELS: Record<string, string> = {
    "h-1": "H1",
    "h-2": "H2",
    "h-3": "H3",
    text: "¶",
    separator: "—",
  };

  return (
    <div
      className="be-toolbar-panel"
      style={{
        width: 52,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderLeft: "none",
        borderRadius: "0 var(--radius) var(--radius) 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "10px 6px",
        gap: 2,
        overflowY: "auto",
        flexShrink: 0,
      }}
    >
      <div
        className="be-toolbar-inner"
        style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center", width: "100%" }}
      >
        {items.map((item, i) => {
          if ("separator" in item) {
            return (
              <div
                key={i}
                className="be-toolbar-sep"
                style={{
                  width: 28,
                  height: 1,
                  background: "var(--border)",
                  margin: "4px 0",
                  flexShrink: 0,
                }}
              />
            );
          }

          const act = item.cmd ? active[item.cmd] : false;
          const label = TEXT_LABELS[item.icon];

          return (
            <button
              key={i}
              className={`be-toolbar-btn${act ? " active" : ""}`}
              title={item.title}
              style={{ width: 38, height: 34, fontSize: label ? 11 : 15, fontWeight: label ? 700 : 400 }}
              onMouseDown={(e) => {
                e.preventDefault();
                if (item.custom) item.custom();
                else if (item.cmd) exec(item.cmd, item.arg);
              }}
            >
              {label ? label : <Ic name={item.icon} size={15} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Reference Manager ─────────────────────────────────────────────────────────
function ReferenceManager({
  references,
  onChange,
  onInsert,
}: {
  references: Reference[];
  onChange: (refs: Reference[]) => void;
  onInsert: (html: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<"paper" | "blog">("blog");

  const add = () => {
    if (!title.trim() || !url.trim()) return;
    const ref: Reference = {
      id: Date.now().toString(),
      title: title.trim(),
      url: url.trim(),
      type,
    };
    onChange([...references, ref]);
    setTitle("");
    setUrl("");
  };

  const remove = (id: string) => onChange(references.filter((r) => r.id !== id));

  const insert = (ref: Reference) => {
    const html = `<a href="${ref.url}" target="_blank" rel="noopener noreferrer">${ref.title}</a>`;
    onInsert(html);
  };

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: 20,
      }}
    >
      <h4
        style={{
          fontFamily: "var(--font-display)",
          color: "#fff",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Ic name="bookmark-3-line" size={16} />
        Special References
      </h4>

      <div className="be-ref-row" style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <input
          className="be-input"
          style={{ flex: "1 1 180px" }}
          placeholder="Reference title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="be-input"
          style={{ flex: "2 1 200px" }}
          placeholder="https://..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <select
          className="be-input be-select"
          style={{ flex: "0 0 90px", width: "auto" }}
          value={type}
          onChange={(e) => setType(e.target.value as "paper" | "blog")}
        >
          <option value="blog">Blog</option>
          <option value="paper">Paper</option>
        </select>
        <button className="be-btn primary" onClick={add} style={{ flex: "0 0 auto" }}>
          <Ic name="add-line" /> Add
        </button>
      </div>

      {references.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 8 }}>No references yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
          {references.map((ref) => (
            <div
              key={ref.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
              }}
            >
              <Ic name={ref.type === "paper" ? "article-line" : "global-line"} size={15} />
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--accent2)", fontSize: 13, flex: 1, textDecoration: "none", fontWeight: 500 }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
              >
                {ref.title}
              </a>
              <span className="be-chip" style={{ fontSize: 10 }}>
                {ref.type === "paper" ? "Paper" : "Blog"}
              </span>
              <button
                className="be-btn"
                style={{ padding: "5px 10px", fontSize: 12 }}
                title="Insert into content"
                onClick={() => insert(ref)}
              >
                <Ic name="insert-column-right" size={12} /> Insert
              </button>
              <button
                className="be-toolbar-btn"
                style={{ color: "var(--danger)" }}
                onClick={() => remove(ref.id)}
                title="Remove"
              >
                <Ic name="delete-bin-6-line" size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Post Editor ───────────────────────────────────────────────────────────────
function PostEditor({
  post,
  onSave,
  onCancel,
  user,
}: {
  post: Partial<BlogPost>;
  onSave: (p: BlogPost) => void;
  onCancel: () => void;
  user: AuthUser;
}) {
  const [title, setTitle] = useState(post.title || "");
  const [excerpt, setExcerpt] = useState(post.excerpt || "");
  const [tags, setTags] = useState((post.tags || []).join(", "));
  const [coverImage, setCoverImage] = useState(post.coverImage || "");
  const [references, setReferences] = useState<Reference[]>(post.references || []);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [coverError, setCoverError] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const imgFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = post.content || "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getContent = () => editorRef.current?.innerHTML || "";

  const insertHtml = useCallback((html: string) => {
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, html);
  }, []);

  const handleImageUpload = useCallback(() => {
    imgFileRef.current?.click();
  }, []);

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    setToast({ msg: "Uploading image...", type: "info" });
    const result = await uploadImageToStorage(file);
    setUploadingImg(false);

    if (result.url) {
      document.execCommand("insertImage", false, result.url);
      editorRef.current?.focus();
      setToast({ msg: "Image uploaded!", type: "success" });
    } else {
      setToast({ msg: `Upload failed: ${result.error}`, type: "error" });
    }

    e.target.value = "";
  };

  const handleSave = async (publish: boolean) => {
    if (!title.trim()) {
      setToast({ msg: "Please enter a title.", type: "error" });
      return;
    }

    setSaving(true);
    const saved: BlogPost = {
      id: post.id || Date.now().toString(),
      title: title.trim(),
      excerpt: excerpt.trim() || title.trim(),
      content: getContent(),
      author: user.username,
      date: post.date || new Date().toISOString(),
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      published: publish,
      coverImage: coverImage.trim(),
      references,
    };

    const result = await dbSavePost(saved);
    setSaving(false);

    if (result.ok) {
      setToast({ msg: publish ? "Published!" : "Draft saved.", type: "success" });
      setTimeout(() => onSave(saved), 1200);
    } else {
      setToast({ msg: `Error: ${result.error}`, type: "error" });
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      {toast && <Toast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      <input ref={imgFileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFileChange} />

      <div
        style={{
          height: 60,
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          gap: 12,
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <button className="be-btn" onClick={onCancel} style={{ padding: "6px 14px" }}>
          <Ic name="arrow-left-line" /> Back
        </button>

        <span style={{ fontFamily: "var(--font-display)", fontSize: 17, color: "#fff", flex: 1 }}>
          {post.id ? "Edit Post" : "New Post"}
        </span>

        <span
          style={{
            fontSize: 12,
            padding: "4px 12px",
            borderRadius: 20,
            background: user.role === "admin" ? "rgba(108,99,255,0.15)" : "rgba(34,197,94,0.1)",
            color: user.role === "admin" ? "var(--accent2)" : "var(--success)",
            border:
              user.role === "admin"
                ? "1px solid rgba(108,99,255,0.3)"
                : "1px solid rgba(34,197,94,0.25)",
            fontWeight: 600,
          }}
        >
          {user.role === "admin" ? "Admin" : "Writer"} — {user.username}
        </span>

        <button className="be-btn" onClick={() => handleSave(false)} disabled={saving} style={{ padding: "7px 18px" }}>
          <Ic name="save-3-line" />
          <span className="be-editor-topbar-save-text">{saving ? "Saving..." : "Save Draft"}</span>
        </button>

        <button
          className="be-btn primary"
          onClick={() => handleSave(true)}
          disabled={saving}
          style={{ padding: "7px 18px" }}
        >
          <Ic name="send-plane-fill" />
          <span className="be-editor-topbar-save-text">{saving ? "Publishing..." : "Publish"}</span>
        </button>
      </div>

      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <div className="be-scrollbar" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <div className="be-editor-meta" style={{ padding: "28px 32px 0", width: "100%" }}>
            <input
              className="be-input"
              style={{
                fontSize: 28,
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                padding: "10px 0",
                background: "transparent",
                border: "none",
                borderBottom: "2px solid var(--border)",
                borderRadius: 0,
                marginBottom: 20,
                color: "#fff",
              }}
              placeholder="Post title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={(e) => (e.currentTarget.style.borderBottomColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderBottomColor = "var(--border)")}
            />

            <textarea
              className="be-input"
              style={{ resize: "vertical", marginBottom: 16, minHeight: 60 }}
              placeholder="Short excerpt shown on listing..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />

            <div
              className="be-cover-row"
              style={{
                display: "flex",
                gap: 10,
                marginBottom: coverImage ? 12 : 16,
                alignItems: "center",
              }}
            >
              <div style={{ flex: 1, position: "relative" }}>
                <input
                  className="be-input"
                  placeholder="Cover image URL..."
                  value={coverImage}
                  onChange={(e) => {
                    setCoverImage(e.target.value);
                    setCoverError(false);
                  }}
                  style={{ paddingRight: 40 }}
                />
                <Ic
                  name="image-line"
                  size={14}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--muted)",
                  }}
                />
              </div>

              <button
                className="be-btn"
                style={{ padding: "9px 14px", flexShrink: 0 }}
                disabled={uploadingImg}
                onClick={async () => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = async (ev) => {
                    const file = (ev.target as HTMLInputElement).files?.[0];
                    if (!file) return;
                    setUploadingImg(true);
                    setToast({ msg: "Uploading cover...", type: "info" });
                    const result = await uploadImageToStorage(file);
                    setUploadingImg(false);
                    if (result.url) {
                      setCoverImage(result.url);
                      setCoverError(false);
                      setToast({ msg: "Cover uploaded!", type: "success" });
                    } else {
                      setToast({ msg: `Upload failed: ${result.error}`, type: "error" });
                    }
                  };
                  input.click();
                }}
                title="Upload cover image"
              >
                <Ic name="upload-2-line" /> Upload Cover
              </button>
            </div>

            {coverImage && !coverError && (
              <div
                style={{
                  marginBottom: 16,
                  borderRadius: "var(--radius)",
                  overflow: "hidden",
                  border: "1px solid var(--border)",
                }}
              >
                <img
                  src={coverImage}
                  alt="Cover preview"
                  style={{ width: "100%", maxHeight: 200, objectFit: "cover", display: "block" }}
                  onError={() => setCoverError(true)}
                />
              </div>
            )}

            {coverImage && coverError && (
              <div
                style={{
                  marginBottom: 16,
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border)",
                  height: 100,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--muted)",
                  fontSize: 13,
                  gap: 8,
                  background: "var(--surface2)",
                }}
              >
                <Ic name="image-2-line" size={18} /> Image not found
              </div>
            )}

            <input
              className="be-input"
              style={{ marginBottom: 20 }}
              placeholder="Tags (comma-separated, e.g. Product, Design, Engineering)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div
            className="be-editor-layout"
            style={{
              flex: 1,
              display: "flex",
              padding: "0 0 0 32px",
            }}
          >
            <div
              style={{
                flex: 1,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRight: "none",
                borderRadius: "var(--radius) 0 0 var(--radius)",
                overflow: "hidden",
                minHeight: 480,
              }}
            >
              <div ref={editorRef} className="be-editor-content" contentEditable suppressContentEditableWarning />
            </div>

            <EditorToolbar editorRef={editorRef} onImageUpload={handleImageUpload} />
          </div>

          <div style={{ padding: "24px 32px 40px" }}>
            <ReferenceManager references={references} onChange={setReferences} onInsert={insertHtml} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Login Modal ───────────────────────────────────────────────────────────────
function LoginModal({ onLogin, onClose }: { onLogin: (u: AuthUser) => void; onClose: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const allowed = getAllowedUsers();
    const found = allowed[username];
    if (!found || found.password !== password) {
      setError("Invalid username or password.");
      return;
    }
    onLogin({ username, role: found.role });
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="be-fadein"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 24,
          padding: "40px 44px",
          width: 400,
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: "var(--accent)",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Ic name="quill-pen-fill" size={26} />
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              color: "#fff",
              marginBottom: 6,
            }}
          >
            Writer Access
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 13 }}>Enter your credentials to continue</p>
        </div>

        <label
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--muted)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            display: "block",
            marginBottom: 6,
          }}
        >
          Username
        </label>
        <input
          className="be-input"
          style={{ marginBottom: 16 }}
          type="text"
          autoComplete="username"
          placeholder="your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />

        <label
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--muted)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            display: "block",
            marginBottom: 6,
          }}
        >
          Password
        </label>
        <input
          className="be-input"
          style={{ marginBottom: 8 }}
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />

        {error && (
          <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{error}</p>
        )}

        <button
          className="be-btn primary"
          onClick={handleLogin}
          style={{ width: "100%", justifyContent: "center", padding: "11px", marginTop: 8, fontSize: 14, borderRadius: 10 }}
        >
          <Ic name="login-box-line" /> Sign In
        </button>

        <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 20, textAlign: "center" }}>
          Only invited writers can access this area
        </p>
      </div>
    </div>
  );
}

// ─── Post Card (Grid) ──────────────────────────────────────────────────────────
function PostCardGrid({
  post,
  onEdit,
  onDelete,
  isAdmin,
}: {
  post: BlogPost;
  onEdit: () => void;
  onDelete: () => void;
  isAdmin: boolean;
}) {
  const readTime = estimateReadTime(post.content);

  return (
    <div className="be-card be-fadein" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ height: 160, position: "relative", overflow: "hidden" }}>
        <CoverImage
          src={post.coverImage || ""}
          alt={post.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6 }}>
          <span
            className={`be-chip ${post.published ? "success" : "warning"}`}
            style={{ fontSize: 10, backdropFilter: "blur(4px)" }}
          >
            <Ic name={post.published ? "checkbox-circle-line" : "draft-line"} size={10} />
            {post.published ? "Published" : "Draft"}
          </span>
        </div>
      </div>

      <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 16,
            color: "#fff",
            marginBottom: 8,
            lineHeight: 1.35,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {post.title}
        </h3>

        <p
          style={{
            fontSize: 13,
            color: "var(--muted)",
            lineHeight: 1.55,
            flex: 1,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          {post.excerpt}
        </p>

        {post.tags.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {post.tags.slice(0, 3).map((t) => (
              <span key={t} className="be-chip" style={{ fontSize: 10 }}>
                {t}
              </span>
            ))}
          </div>
        )}

        {(post.references?.length ?? 0) > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {post.references!.slice(0, 2).map((ref) => (
              <a
                key={ref.id}
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="be-chip accent"
                style={{ textDecoration: "none" }}
              >
                <Ic name={ref.type === "paper" ? "article-line" : "global-line"} size={10} />
                {ref.title}
              </a>
            ))}
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 11,
            color: "var(--muted)",
            borderTop: "1px solid var(--border)",
            paddingTop: 10,
            marginTop: "auto",
          }}
        >
          <Ic name="user-line" size={11} />
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {post.author}
          </span>
          <Ic name="calendar-line" size={11} />
          <span style={{ flexShrink: 0 }}>{formatDate(post.date)}</span>
          <Ic name="time-line" size={11} />
          <span style={{ flexShrink: 0 }}>{readTime}m</span>
        </div>
      </div>

      <div style={{ padding: "10px 18px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
        <button className="be-btn" onClick={onEdit} style={{ flex: 1, justifyContent: "center", padding: "7px 0", fontSize: 12 }}>
          <Ic name="edit-line" size={12} /> Edit
        </button>
        {isAdmin && (
          <button
            className="be-btn danger"
            onClick={onDelete}
            style={{ flex: 1, justifyContent: "center", padding: "7px 0", fontSize: 12 }}
          >
            <Ic name="delete-bin-6-line" size={12} /> Delete
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Post Row (List) ───────────────────────────────────────────────────────────
function PostRowList({
  post,
  onEdit,
  onDelete,
  isAdmin,
}: {
  post: BlogPost;
  onEdit: () => void;
  onDelete: () => void;
  isAdmin: boolean;
}) {
  const readTime = estimateReadTime(post.content);

  return (
    <div
      className="be-card be-fadein"
      style={{
        display: "flex",
        gap: 16,
        padding: "16px 20px",
        alignItems: "flex-start",
      }}
    >
      <div
        className="be-list-thumb"
        style={{ width: 88, height: 64, flexShrink: 0, borderRadius: 8, overflow: "hidden" }}
      >
        <CoverImage
          src={post.coverImage || ""}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
          <span className={`be-chip ${post.published ? "success" : "warning"}`} style={{ fontSize: 10 }}>
            {post.published ? "Published" : "Draft"}
          </span>
          {post.tags.slice(0, 3).map((t) => (
            <span key={t} className="be-chip" style={{ fontSize: 10 }}>
              {t}
            </span>
          ))}
        </div>

        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 15,
            color: "#fff",
            marginBottom: 4,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {post.title}
        </h3>

        <p
          style={{
            fontSize: 12,
            color: "var(--muted)",
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            marginBottom: 8,
          }}
        >
          {post.excerpt}
        </p>

        {(post.references?.length ?? 0) > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {post.references!.slice(0, 2).map((ref) => (
              <a
                key={ref.id}
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="be-chip accent"
                style={{ textDecoration: "none", fontSize: 10 }}
              >
                <Ic name={ref.type === "paper" ? "article-line" : "global-line"} size={10} />
                {ref.title}
              </a>
            ))}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: "var(--muted)" }}>
          <Ic name="user-line" size={11} />
          <span>{post.author}</span>
          <span style={{ opacity: 0.3 }}>·</span>
          <Ic name="calendar-line" size={11} />
          <span>{formatDate(post.date)}</span>
          <span style={{ opacity: 0.3 }}>·</span>
          <Ic name="time-line" size={11} />
          <span>{readTime} min read</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
        <button className="be-btn" onClick={onEdit} style={{ padding: "7px 14px", fontSize: 12 }}>
          <Ic name="edit-line" size={12} /> Edit
        </button>
        {isAdmin && (
          <button className="be-btn danger" onClick={onDelete} style={{ padding: "7px 14px", fontSize: 12 }}>
            <Ic name="delete-bin-6-line" size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({
  user,
  posts,
  loading,
  onNewPost,
  onEditPost,
  onDeletePost,
  onLogout,
}: {
  user: AuthUser;
  posts: BlogPost[];
  loading: boolean;
  onNewPost: () => void;
  onEditPost: (p: BlogPost) => void;
  onDeletePost: (id: string) => void;
  onLogout: () => void;
}) {
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");

  const isConnected = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

  const filtered = posts.filter((p) => {
    const matchFilter = filter === "all" ? true : filter === "published" ? p.published : !p.published;
    const q = search.toLowerCase();

    const matchSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)) ||
      p.author.toLowerCase().includes(q) ||
      (p.references || []).some(
        (r) => r.title.toLowerCase().includes(q) || r.url.toLowerCase().includes(q)
      );

    return matchFilter && matchSearch;
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <nav
        style={{
          height: 64,
          background: "rgba(19,19,31,0.9)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          padding: "0 28px",
          gap: 14,
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
          <Ic name="quill-pen-fill" size={22} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "#fff" }}>Blog Dashboard</span>
        </div>

        <div className="be-nav-search" style={{ position: "relative" }}>
          <Ic
            name="search-line"
            size={14}
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }}
          />
          <input
            className="be-input"
            style={{ paddingLeft: 34, width: 220 }}
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <span
          className="be-nav-role"
          style={{
            fontSize: 12,
            padding: "4px 12px",
            borderRadius: 20,
            background: user.role === "admin" ? "rgba(108,99,255,0.15)" : "rgba(34,197,94,0.1)",
            color: user.role === "admin" ? "var(--accent2)" : "var(--success)",
            border:
              user.role === "admin"
                ? "1px solid rgba(108,99,255,0.3)"
                : "1px solid rgba(34,197,94,0.25)",
            fontWeight: 600,
          }}
        >
          {user.role === "admin" ? "Admin" : "Writer"} — {user.username}
        </span>

        <button className="be-btn primary" onClick={onNewPost} style={{ padding: "7px 18px" }}>
          <Ic name="add-line" /> New Post
        </button>

        <button className="be-btn" onClick={onLogout} style={{ padding: "7px 14px" }}>
          <Ic name="logout-box-r-line" />
        </button>
      </nav>

      <div className="be-dashboard-body" style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 28px" }}>
        {!isConnected && (
          <div
            style={{
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: "var(--radius)",
              padding: "12px 18px",
              marginBottom: 24,
              fontSize: 13,
              color: "var(--warning)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Ic name="error-warning-fill" size={16} />
            VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing — database connection unavailable.
          </div>
        )}

        <div
          className="be-stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
            marginBottom: 36,
          }}
        >
          {[
            { label: "Total Posts", value: posts.length, icon: "article-line", color: "var(--accent2)" },
            {
              label: "Published",
              value: posts.filter((p) => p.published).length,
              icon: "send-plane-fill",
              color: "var(--success)",
            },
            {
              label: "Drafts",
              value: posts.filter((p) => !p.published).length,
              icon: "draft-line",
              color: "var(--warning)",
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: s.color,
                  flexShrink: 0,
                }}
              >
                <Ic name={s.icon} size={20} />
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {(["all", "published", "draft"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="be-btn"
                style={{
                  background: filter === f ? "rgba(108,99,255,0.18)" : undefined,
                  borderColor: filter === f ? "rgba(108,99,255,0.4)" : undefined,
                  color: filter === f ? "var(--accent2)" : undefined,
                  fontWeight: filter === f ? 600 : 400,
                  padding: "7px 16px",
                  fontSize: 13,
                  textTransform: "capitalize",
                }}
              >
                {f === "all" ? "All" : f === "published" ? "Published" : "Drafts"}
              </button>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          <div
            style={{
              display: "flex",
              border: "1px solid var(--border)",
              borderRadius: 8,
              overflow: "hidden",
              background: "var(--surface)",
            }}
          >
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: "7px 14px",
                  border: "none",
                  background: view === v ? "rgba(108,99,255,0.2)" : "transparent",
                  color: view === v ? "var(--accent2)" : "var(--muted)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Ic name={v === "grid" ? "layout-grid-line" : "list-check"} size={15} />
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--muted)" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "3px solid rgba(108,99,255,0.2)",
                borderTopColor: "var(--accent)",
                margin: "0 auto 16px",
              }}
              className="be-spin"
            />
            <p style={{ fontSize: 14 }}>Loading posts...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--muted)" }}>
            <Ic name="inbox-unarchive-line" size={48} />
            <p style={{ marginTop: 16, fontSize: 14 }}>
              {search ? "No posts match your search." : "No posts yet — click New Post to get started."}
            </p>
          </div>
        ) : view === "grid" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {filtered.map((post) => (
              <PostCardGrid
                key={post.id}
                post={post}
                onEdit={() => onEditPost(post)}
                onDelete={() => onDeletePost(post.id)}
                isAdmin={user.role === "admin"}
              />
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((post) => (
              <PostRowList
                key={post.id}
                post={post}
                onEdit={() => onEditPost(post)}
                onDelete={() => onDeletePost(post.id)}
                isAdmin={user.role === "admin"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────────
export default function BlogEditor() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      return JSON.parse(sessionStorage.getItem(AUTH_KEY) || "null");
    } catch {
      return null;
    }
  });

  const [showLogin, setShowLogin] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Partial<BlogPost> | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    dbFetchAllPosts().then((p) => {
      setPosts(p);
      setLoading(false);
    });
  }, [user]);

  const handleLogin = (u: AuthUser) => {
    setUser(u);
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(u));
    setShowLogin(false);
  };

  const handleLogout = () => {
    setUser(null);
    setPosts([]);
    setEditing(null);
    sessionStorage.removeItem(AUTH_KEY);
  };

  const handleSave = (post: BlogPost) => {
    setPosts((prev) => {
      const idx = prev.findIndex((p) => p.id === post.id);
      return idx >= 0 ? prev.map((p) => (p.id === post.id ? post : p)) : [post, ...prev];
    });
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post permanently?")) return;
    const result = await dbDeletePost(id);
    if (result.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setToast({ msg: "Post deleted.", type: "info" });
    } else {
      setToast({ msg: `Delete failed: ${result.error}`, type: "error" });
    }
  };

  return (
    <>
      <InjectGlobalCSS />
      {toast && <Toast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      {user && editing !== null ? (
        <PostEditor post={editing} onSave={handleSave} onCancel={() => setEditing(null)} user={user} />
      ) : user ? (
        <Dashboard
          user={user}
          posts={posts}
          loading={loading}
          onNewPost={() => setEditing({})}
          onEditPost={(p) => setEditing(p)}
          onDeletePost={handleDelete}
          onLogout={handleLogout}
        />
      ) : (
        <div
          style={{
            minHeight: "100vh",
            background: "var(--bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            fontFamily: "var(--font-body)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "30%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: 600,
              height: 600,
              background: "radial-gradient(ellipse, rgba(108,99,255,0.12) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {showLogin && <LoginModal onLogin={handleLogin} onClose={() => setShowLogin(false)} />}

          <div
            className="be-fadein"
            style={{ textAlign: "center", maxWidth: 440, padding: "0 24px", position: "relative", zIndex: 1 }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                background: "var(--accent)",
                borderRadius: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 28px",
                boxShadow: "0 10px 40px rgba(108,99,255,0.35)",
              }}
            >
              <Ic name="quill-pen-fill" size={32} />
            </div>

            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 40,
                color: "#fff",
                marginBottom: 12,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              Blog Dashboard
            </h1>

            <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.65, marginBottom: 32 }}>
              Private writing area for authorized contributors.
              <br />
              Sign in to create and manage posts.
            </p>

            <button
              className="be-btn primary"
              onClick={() => setShowLogin(true)}
              style={{ padding: "12px 32px", fontSize: 15, borderRadius: 40, gap: 10 }}
            >
              <Ic name="login-box-line" size={18} /> Sign In to Write
            </button>
          </div>
        </div>
      )}
    </>
  );
}
