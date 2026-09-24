"use client";

import { Crepe } from "@milkdown/crepe";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";
import "./author-studio.css";
import { DEFAULT_DRAFT, type Draft, LEGACY_STORAGE_KEY } from "../../lib/draft";

type SaveState = "loading" | "saved" | "saving";
type View = "edit" | "preview" | "split";

function Icon({
  name,
}: {
  name:
    | "pen"
    | "file"
    | "folder"
    | "settings"
    | "chart"
    | "eye"
    | "save"
    | "publish"
    | "copy"
    | "dots"
    | "plus"
    | "chevron";
}) {
  const paths: Record<string, React.ReactNode> = {
    pen: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
      </>
    ),
    file: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8M8 17h6" />
      </>
    ),
    folder: (
      <>
        <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      </>
    ),
    settings: (
      <>
        <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
        <path d="m19.4 15 .1.1 1.4 1.1-1.8 3.1-1.7-.7a7.6 7.6 0 0 1-1.8 1l-.3 1.8h-3.6l-.3-1.8a7.6 7.6 0 0 1-1.8-1l-1.7.7-1.8-3.1 1.4-1.1.1-.1a7.7 7.7 0 0 1 0-2l-.1-.1-1.4-1.1 1.8-3.1 1.7.7a7.6 7.6 0 0 1 1.8-1l.3-1.8h3.6l.3 1.8a7.6 7.6 0 0 1 1.8 1l1.7-.7 1.8 3.1-1.4 1.1-.1.1a7.7 7.7 0 0 1 0 2Z" />
      </>
    ),
    chart: (
      <>
        <path d="M5 20V10M12 20V4M19 20v-7" />
        <path d="M3 20h18" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    save: (
      <>
        <path d="M5 3h12l3 3v15H4V3Z" />
        <path d="M8 3v6h8V3M8 21v-6h8v6" />
      </>
    ),
    publish: (
      <>
        <path d="M12 16V3" />
        <path d="m7 8 5-5 5 5" />
        <path d="M5 13v6h14v-6" />
      </>
    ),
    copy: (
      <>
        <rect x="9" y="9" width="11" height="11" rx="2" />
        <path d="M15 9V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h5" />
      </>
    ),
    dots: (
      <>
        <circle cx="5" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function formatRelativeTime(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 5000) return "just now";
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hr ago`;
}

export default function AuthorStudio() {
  const editorHost = useRef<HTMLDivElement>(null);
  const crepeRef = useRef<Crepe | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [draft, setDraft] = useState<Draft>(DEFAULT_DRAFT);
  const [saveState, setSaveState] = useState<SaveState>("loading");
  const [view, setView] = useState<View>("split");
  const [tagInput, setTagInput] = useState("");
  const [activeNav, setActiveNav] = useState("Editor");
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const clean = draft.content.replace(/[#>*_`~[\]()|]/g, " ");
    const words = clean.trim() ? clean.trim().split(/\s+/).length : 0;
    const chars = draft.content.length;
    const reading = Math.max(1, Math.ceil(words / 220));
    return { words, chars, reading };
  }, [draft.content]);

  useEffect(() => {
    const raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) {
      try {
        setDraft(JSON.parse(raw) as Draft);
      } catch {
        window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      }
    }
    setSaveState(raw ? "saved" : "saving");
  }, []);

  useEffect(() => {
    if (!editorHost.current || crepeRef.current) return;

    const editor = new Crepe({
      root: editorHost.current,
      defaultValue: draft.content,
    });

    crepeRef.current = editor;
    editor.on((listener) => {
      listener.markdownUpdated((_ctx, nextMarkdown) => {
        setDraft((current) => ({
          ...current,
          content: nextMarkdown,
          updatedAt: new Date().toISOString(),
        }));
        setSaveState("saving");

        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
          setDraft((current) => {
            const next = { ...current, updatedAt: new Date().toISOString() };
            window.localStorage.setItem(
              LEGACY_STORAGE_KEY,
              JSON.stringify(next),
            );
            return next;
          });
          setSaveState("saved");
        }, 600);
      });
    });

    editor.create().catch((error) => {
      console.error(error);
      setSaveState("saving");
    });

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      crepeRef.current = null;
      editor.destroy().catch(() => undefined);
    };
    // The editor is intentionally created once with the initial draft.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateDraft<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({
      ...current,
      [key]: value,
      updatedAt: new Date().toISOString(),
    }));
    setSaveState("saving");

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setDraft((current) => {
        const next = { ...current, updatedAt: new Date().toISOString() };
        window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
      setSaveState("saved");
    }, 600);
  }

  function addTag() {
    const tag = tagInput.trim().replace(/^#/, "");
    if (!tag || draft.tags.includes(tag)) return;
    updateDraft("tags", [...draft.tags, tag]);
    setTagInput("");
  }

  function removeTag(tag: string) {
    updateDraft(
      "tags",
      draft.tags.filter((item) => item !== tag),
    );
  }

  async function copyMarkdown() {
    await navigator.clipboard.writeText(draft.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  function publish() {
    updateDraft("published", true);
    window.localStorage.setItem(
      LEGACY_STORAGE_KEY,
      JSON.stringify({
        ...draft,
        published: true,
        updatedAt: new Date().toISOString(),
      }),
    );
    setSaveState("saved");
  }

  function resetDraft() {
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    window.location.reload();
  }

  const showEditor = view !== "preview";
  const showPreview = view !== "edit";

  return (
    <div className="studio-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">A</div>
          <div>
            <strong>Author Studio</strong>
            <span>local workspace</span>
          </div>
        </div>

        <div className="workspace-label">Workspace</div>
        <nav>
          {[
            ["Editor", "pen"],
            ["Posts", "file"],
            ["Media", "folder"],
            ["Insights", "chart"],
            ["Settings", "settings"],
          ].map(([label, icon]) => (
            <button
              key={label}
              className={`nav-item ${activeNav === label ? "active" : ""}`}
              onClick={() => setActiveNav(label)}
            >
              <Icon name={icon as never} />
              <span>{label}</span>
              {label === "Posts" && <span className="nav-count">1</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-spacer" />
        <div className="storage-card">
          <div className="storage-top">
            <span>Local draft</span>
            <span>Prototype</span>
          </div>
          <div className="storage-bar">
            <span />
          </div>
          <p>Your article is currently saved in this browser.</p>
        </div>
        <button className="profile">
          <span className="avatar">BA</span>
          <span className="profile-copy">
            <strong>Author</strong>
            <small>Owner</small>
          </span>
          <Icon name="dots" />
        </button>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <div className="breadcrumb">
              <span>Posts</span>
              <Icon name="chevron" />
              <span>Untitled workspace</span>
            </div>
            <div className="save-line">
              <span className={`save-dot ${saveState}`} />
              {saveState === "saved"
                ? `Saved ${formatRelativeTime(draft.updatedAt)}`
                : saveState === "loading"
                  ? "Loading draft…"
                  : "Saving changes…"}
            </div>
          </div>
          <div className="top-actions">
            <button
              className="icon-button"
              title="Copy Markdown"
              onClick={copyMarkdown}
            >
              <Icon name="copy" />
              {copied ? "Copied" : "Copy MD"}
            </button>
            <button
              className="secondary-button"
              onClick={() => setView("preview")}
            >
              <Icon name="eye" />
              Preview
            </button>
            <button className="primary-button" onClick={publish}>
              <Icon name="publish" />
              {draft.published ? "Published" : "Publish"}
            </button>
            <button
              className="ghost-square"
              onClick={resetDraft}
              title="Reset local draft"
            >
              <Icon name="dots" />
            </button>
          </div>
        </header>

        <section className="content-area">
          <div className="editor-column">
            <div className="post-header">
              <input
                className="title-input"
                value={draft.title}
                onChange={(e) => updateDraft("title", e.target.value)}
                placeholder="Post title"
              />
              <div className="meta-row">
                <span>/</span>
                <input
                  value={draft.slug}
                  onChange={(e) => updateDraft("slug", e.target.value)}
                  aria-label="Slug"
                />
              </div>
              <textarea
                className="excerpt-input"
                value={draft.excerpt}
                onChange={(e) => updateDraft("excerpt", e.target.value)}
                placeholder="Write a short excerpt for the post…"
                rows={2}
              />
            </div>

            <div className="mode-bar">
              <div className="mode-tabs">
                {(
                  [
                    ["edit", "Edit"],
                    ["split", "Split"],
                    ["preview", "Preview"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    className={view === key ? "selected" : ""}
                    onClick={() => setView(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <span className="format-pill">Markdown</span>
            </div>

            <div className={`workbench ${view}`}>
              {showEditor && (
                <section className="canvas-card editor-card">
                  <div className="panel-heading">
                    <span>Writing canvas</span>
                    <span className="tiny-label">Milkdown / Crepe</span>
                  </div>
                  <div ref={editorHost} className="editor-host" />
                </section>
              )}

              {showPreview && (
                <section className="canvas-card preview-card">
                  <div className="panel-heading">
                    <span>Article preview</span>
                    <span className="tiny-label">Rendered Markdown</span>
                  </div>
                  <article className="article-preview">
                    <p className="preview-kicker">
                      {draft.tags
                        .slice(0, 1)
                        .map((tag) => `#${tag}`)
                        .join(" ") || "Article"}
                    </p>
                    <h1>{draft.title || "Untitled post"}</h1>
                    <p className="preview-excerpt">{draft.excerpt}</p>
                    <div className="preview-divider" />
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {draft.content}
                    </ReactMarkdown>
                  </article>
                </section>
              )}
            </div>
          </div>

          <aside className="right-rail">
            <div className="rail-card publish-card">
              <div className="card-title-row">
                <strong>Publishing</strong>
                <span
                  className={`status-badge ${draft.published ? "live" : "draft"}`}
                >
                  {draft.published ? "Published" : "Draft"}
                </span>
              </div>
              <label className="field-label">Visibility</label>
              <select defaultValue="public">
                <option>Public</option>
                <option>Private</option>
              </select>
              <label className="field-label">Author</label>
              <div className="author-row">
                <span className="avatar small">BA</span>
                <span>
                  <strong>Author</strong>
                  <small>Owner</small>
                </span>
              </div>
              <button className="wide-button" onClick={publish}>
                {draft.published ? "Update published post" : "Publish post"}
              </button>
            </div>

            <div className="rail-card">
              <div className="card-title-row">
                <strong>Tags</strong>
                <span>{draft.tags.length}</span>
              </div>
              <div className="tag-list">
                {draft.tags.map((tag) => (
                  <button
                    key={tag}
                    className="tag"
                    onClick={() => removeTag(tag)}
                  >
                    #{tag}
                    <span>×</span>
                  </button>
                ))}
              </div>
              <div className="tag-input-wrap">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTag()}
                  placeholder="Add a tag…"
                />
                <button onClick={addTag}>
                  <Icon name="plus" />
                </button>
              </div>
            </div>

            <div className="rail-card">
              <div className="card-title-row">
                <strong>Writing stats</strong>
                <Icon name="chart" />
              </div>
              <div className="stats-grid">
                <div>
                  <strong>{stats.words}</strong>
                  <span>Words</span>
                </div>
                <div>
                  <strong>{stats.chars}</strong>
                  <span>Characters</span>
                </div>
                <div>
                  <strong>{stats.reading}</strong>
                  <span>Min read</span>
                </div>
              </div>
            </div>

            <div className="rail-card checklist">
              <div className="card-title-row">
                <strong>Publish checklist</strong>
              </div>
              <label>
                <input
                  type="checkbox"
                  checked={draft.title.trim().length > 0}
                  readOnly
                />{" "}
                <span>Title added</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={draft.excerpt.trim().length > 0}
                  readOnly
                />{" "}
                <span>Excerpt added</span>
              </label>
              <label>
                <input type="checkbox" checked={stats.words >= 50} readOnly />{" "}
                <span>Article body has substance</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={draft.tags.length > 0}
                  readOnly
                />{" "}
                <span>At least one tag</span>
              </label>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
