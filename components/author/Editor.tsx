"use client";

import { Crepe } from "@milkdown/crepe";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import "github-markdown-css/github-markdown-light.css";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";
import { Plus, Trash2 } from "lucide-react";
import remarkGfm from "remark-gfm";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  addDraft,
  createBlankDraft,
  type DraftItem,
  deleteDraft,
  setActiveDraftId,
  setContent,
  setExcerpt,
  setSearchValue,
  setTitle,
} from "@/lib/features/slices/draft";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useDraftStorage } from "@/lib/hooks/useDraftStorage";
import { formatRelativeTime, slugify } from "@/lib/utils";
import Divider from "../layout/divider";
import { Input } from "../ui/input";
import { EditorMenuBar } from "./EditorMenuBar";
import { PublishPanel } from "./PublishPanel";

// The public URL this draft will live at — mirrors what /api/publish writes
// into frontmatter.slug.
function getDraftLink(currentDraft: DraftItem) {
  const slug = currentDraft.slug.trim()
    ? slugify(currentDraft.slug)
    : slugify(currentDraft.title);
  return `/blog/${slug || "your-post-link-here"}`;
}

// Preview document: title and excerpt sit above a rule, then the body.
// A brand-new draft has none of them, so return an empty string instead of
// rendering a lone heading and rule — the caller shows a hint instead.
function getDraftContent(currentDraft: DraftItem) {
  const title = currentDraft.title.trim();
  const excerpt = currentDraft.excerpt.trim();
  const body = currentDraft.content.trim();

  if (!title && !excerpt && !body) return "";

  const header = title ? `# ${title}\n` : "";
  const intro = excerpt ? `${excerpt}\n\n` : "";
  const separator = body ? "---\n\n" : "";

  return `${header}${intro}${separator}${currentDraft.content}`;
}

export function Studio() {
  const dispatch = useAppDispatch();
  const editorHost = useRef<HTMLDivElement>(null);
  const crepeRef = useRef<Crepe | null>(null);
  // Which draft the live Crepe instance was built from, so an instance can
  // never keep writing into a draft that is no longer open.
  const crepeDraftIdRef = useRef<string | null>(null);
  const activeDraftIdRef = useRef<string>("");
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // Consume our isolated storage and custom state management engine
  const { draft, saveState, isHydrated, hasUnsavedChanges, onSaveNow } =
    useDraftStorage();

  // Sidebar draft list: filtered by the search box, capped at 20 entries
  // so the list stays fast and scannable even with a large drafts store.
  const drafts = useAppSelector((state) => state.draftState.drafts);
  const activeDraftId = useAppSelector(
    (state) => state.draftState.activeDraftId,
  );
  const searchValue = useAppSelector((state) => state.draftState.searchValue);

  // Mirror into refs: the editor effect reads these to build the instance
  // for whichever draft is now active, without re-running on every keystroke.
  const draftsRef = useRef(drafts);
  draftsRef.current = drafts;
  activeDraftIdRef.current = activeDraftId;

  const visibleDrafts = drafts
    .filter((d) => d.title.toLowerCase().includes(searchValue.toLowerCase()))
    .slice(0, 20);

  const destroyEditor = useCallback(() => {
    const instance = crepeRef.current;
    crepeRef.current = null;
    crepeDraftIdRef.current = null;
    if (instance) instance.destroy().catch(() => undefined);
  }, []);

  // One Crepe instance per draft. It is (re)built whenever the open draft
  // changes, and only ever while the edit pane is visible — Milkdown created
  // inside the hidden preview pane measures itself against a display:none
  // container and comes back misaligned.
  useEffect(() => {
    if (!isHydrated || !editorHost.current) return;

    // Already showing the right draft — keep the instance (and its undo
    // history) as is.
    if (
      !showPreview &&
      crepeRef.current &&
      crepeDraftIdRef.current === activeDraftId
    ) {
      return;
    }

    // A draft was opened while the preview pane was up: drop the stale
    // instance now, and the next switch back to edit mode rebuilds it.
    if (showPreview) {
      if (crepeDraftIdRef.current !== activeDraftId) destroyEditor();
      return;
    }

    destroyEditor();

    const target = draftsRef.current.find((item) => item.id === activeDraftId);
    const editor = new Crepe({
      root: editorHost.current,
      defaultValue: target?.content ?? "",
    });

    crepeRef.current = editor;
    crepeDraftIdRef.current = activeDraftId;

    editor.on((listener) => {
      listener.markdownUpdated((_ctx, nextContent) => {
        // Only accept updates from the live instance, and only while it is
        // the draft both this instance and the store agree is open.
        if (
          crepeRef.current !== editor ||
          crepeDraftIdRef.current !== activeDraftIdRef.current
        ) {
          return;
        }
        dispatch(setContent(nextContent));
      });
    });

    editor.create().catch((error) => {
      console.error("Failed to initialize editor", error);
      if (crepeRef.current === editor) destroyEditor();
    });
  }, [isHydrated, showPreview, activeDraftId, dispatch, destroyEditor]);

  // Tear the editor down when the studio unmounts.
  useEffect(() => destroyEditor, [destroyEditor]);

  function handleNewDraft() {
    dispatch(addDraft(createBlankDraft()));
    // A new draft is meant to be written in, so leave preview mode.
    setShowPreview(false);
  }

  function handleDeleteDraft(item: DraftItem) {
    const label = item.title.trim() || "Untitled";
    if (!window.confirm(`Delete “${label}”? This cannot be undone.`)) return;
    dispatch(deleteDraft({ id: item.id }));
  }

  const previewMarkdown = getDraftContent(draft);

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex h-full w-70 flex-col gap-2 border-neutral-300 border-r bg-neutral-200 p-2 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center gap-1.5">
          <Input
            className="bg-white"
            placeholder="Search"
            value={searchValue}
            onChange={(e) => dispatch(setSearchValue(e.target.value))}
          />
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 bg-white dark:bg-input/30"
            onClick={handleNewDraft}
            title="New draft"
          >
            <Plus />
          </Button>
        </div>

        {/* Draft List — capped at 20 visible entries */}
        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          {visibleDrafts.map((d) => (
            <div
              key={d.id}
              className={`group flex items-center gap-1 rounded transition-colors ${
                d.id === activeDraftId
                  ? "bg-white dark:bg-neutral-800"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-900"
              }`}
            >
              <button
                type="button"
                onClick={() => dispatch(setActiveDraftId(d.id))}
                className="min-w-0 flex-1 px-2 py-1.5 text-left"
              >
                <span className="flex items-center gap-1.5">
                  <span className="truncate font-medium text-sm">
                    {d.title || "Untitled"}
                  </span>
                  {d.published && (
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
                      title="Published"
                    />
                  )}
                </span>
                <span
                  className="block text-[11px] text-neutral-500"
                  // Relative timestamps tick between server and client render.
                  suppressHydrationWarning
                >
                  Edited {formatRelativeTime(d.updatedAt)}
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleDeleteDraft(d)}
                title="Delete draft"
                className="mr-1 rounded p-1 text-neutral-400 opacity-0 transition hover:bg-neutral-200 hover:text-red-500 focus-visible:opacity-100 group-hover:opacity-100 dark:hover:bg-neutral-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {visibleDrafts.length === 0 && (
            <p className="px-2 py-1.5 text-neutral-500 text-xs">
              No drafts found.
            </p>
          )}

          {drafts.length > 20 && (
            <p className="px-2 py-1.5 text-neutral-500 text-xs">
              Showing 20 of {drafts.length} — refine your search to see more.
            </p>
          )}
        </div>
      </div>
      <SidebarInset className="flex h-svh flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>

        <section
          id="content-area"
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          {/* Editor column + preview scroll together; the publishing rail
              stays fixed beside them. */}
          <div className="flex min-h-0 flex-1">
            <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
              <div className="editor-column shrink-0 border-neutral-300 border-y bg-sidebar dark:border-neutral-800">
                <div className="post-header flex w-full flex-col space-y-3 px-8 font-montserrat">
                  <input
                    type="text"
                    value={draft.title}
                    className="mb-4 font-semibold text-xl outline-none"
                    placeholder="Post title"
                    onChange={(e) =>
                      dispatch(setTitle(e.target.value.replace(/ {2,}/g, " ")))
                    }
                  />
                  <div className="block text-neutral-500 text-xs">
                    {getDraftLink(draft)}
                  </div>
                  <input
                    type="text"
                    value={draft.excerpt}
                    className="flex font-medium text-neutral-600 text-sm outline-none"
                    placeholder="Write a short excerpt for the post..."
                    onChange={(e) =>
                      dispatch(
                        setExcerpt(e.target.value.replace(/ {2,}/g, " ")),
                      )
                    }
                  />
                </div>
              </div>

              <div id="workbench" className="min-h-0 flex-1 px-8">
                <div
                  className={`prose prose-neutral dark:prose-invert w-full max-w-none p-5 ${showPreview ? "" : "hidden"}`}
                >
                  {showPreview &&
                    (previewMarkdown ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ node, ...props }) => (
                            <p className="font-montserrat text-sm" {...props} />
                          ),
                          li: ({ node, ...props }) => (
                            <li
                              className="font-montserrat text-sm"
                              {...props}
                            />
                          ),
                          hr: ({ node, ...props }) => <Divider {...props} />,
                        }}
                      >
                        {previewMarkdown}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-neutral-500 text-sm">
                        Nothing to preview yet — start writing in the editor.
                      </p>
                    ))}
                </div>

                <div
                  ref={editorHost}
                  className={`editor-host h-full ${showPreview ? "hidden" : ""}`}
                />
              </div>
            </div>

            <PublishPanel />
          </div>
        </section>

        <EditorMenuBar
          showPreview={showPreview}
          onTogglePreview={() => setShowPreview((prev) => !prev)}
          saveState={saveState}
          hasUnsavedChanges={hasUnsavedChanges}
          onSave={onSaveNow}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
