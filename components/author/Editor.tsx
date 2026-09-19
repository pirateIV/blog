"use client";

import React, { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Crepe } from "@milkdown/crepe";
import "github-markdown-css/github-markdown-light.css";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";

import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { Draft, DraftSaveState } from "@/types";
import { STORAGE_KEY } from "@/lib/draft";
import remarkGfm from "remark-gfm";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { getDrafts } from "@/lib/features/selectors";
import {
  setTitle,
  setExcerpt,
  setContent,
  loadDraft,
} from "@/lib/features/slices/draft";
import { EditorMenuBar } from "./EditorMenuBar";

function getDraftLink(title: string) {
  const link = title.trim().toLocaleLowerCase().replaceAll(" ", "-");
  return "/" + (link || "your-post-link-here");
}

const EMPTY_DRAFT: Draft = {
  title: "My First Markdown Post",
  excerpt:
    "A quick tour of Markdown for bloggers — write once, format anywhere.",
  content:
    " You type simple symbols, and they turn into headings, lists, links, and more.\n\n## Why bloggers love it\n\n- It's readable even before it's rendered\n- It works in almost every blogging platform\n- You focus on *words*, not buttons\n- Your content stays portable forever\n\n---\n\n## The basics you'll use every day\n\n### Headings\n\nStart a line with `#` for a heading. More `#` means a smaller heading.\n\n```\n# Heading 1\n## Heading 2\n### Heading 3\n```\n\n### Emphasis\n\nWrap text in asterisks or underscores.\n\n```\n*italic*   **bold**   ***bold italic***\n```\n\n### Lists\n\nUse `-` for bullets and numbers for ordered lists.\n\n```\n- Coffee\n- Tea\n- Water\n\n1. Wake up\n2. Write\n3. Publish\n```\n\n### Links and images\n\n```\n[Visit my blog](https://example.com)\n![A sunset](/images/sunset.jpg)\n```\n\n### Quotes\n\nUse `>` to highlight a thought.\n\n> The best writing is rewriting.\n\n### Code\n\nWrap inline code in backticks, or use triple backticks for blocks.\n\n```js\nconst greet = (name) => `Hello, ${name}!`\nconsole.log(greet('blogger'))\n```\n\n### Tables\n\n| Symbol | Meaning |\n| --- | --- |\n| `#` | Heading |\n| `*` | Emphasis |\n| `>` | Quote |\n| `-` | List |\n\n---\n\n## Try it yourself\n\nDelete this text and start writing. Try adding a heading, a list, and a link. Preview it to see the result.\n\nHappy writing! ✍️\n",
  published: false,
  tags: ["markdown", "writing", "beginners"],
  updatedAt: new Date().toISOString(),
};

export function Studio() {
  const draft = useAppSelector(getDrafts);
  const dispatch = useAppDispatch();

  const editorHost = React.useRef<HTMLDivElement>(null);
  const crepeRef = React.useRef<Crepe | null>(null);

  const [saveState, setSaveState] = React.useState<DraftSaveState>("loading");
  const [showPreview, setShowPreview] = React.useState<boolean>(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (raw) {
      try {
        dispatch(loadDraft(JSON.parse(raw) as Draft));
      } catch (error) {
        window.localStorage.removeItem(STORAGE_KEY);
        dispatch(loadDraft(EMPTY_DRAFT));
      }
    } else {
      dispatch(loadDraft(EMPTY_DRAFT));
    }

    setSaveState("saved");
  }, [dispatch]);

  // TODO: this mirrors what was there before — reads from localStorage on
  // mount, but nothing writes back. Worth deciding here: save on every
  // dispatch, debounce it, or save on an explicit action — then dispatch
  // setSaveState("saving" | "saved" | "error") around it.
  // useEffect(() => {
  //   window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  // }, [draft]);

  useEffect(() => {
    // === EDITOR
    // Wait for the draft to actually load from storage before seeding the
    // editor, and only ever create it once — it stays mounted (hidden via
    // CSS, not unmounted) when the user switches to preview, so undo
    // history and cursor position survive the toggle. Crucially, this is
    // seeded with draft.content ALONE, never the composed title+excerpt+
    // content — feeding the composed string back in was what caused the
    // title/excerpt to duplicate into the body on every toggle.
    if (saveState === "loading" || !editorHost.current || crepeRef.current) {
      return;
    }

    const editor = new Crepe({
      root: editorHost.current,
      defaultValue: draft.content,
    });

    crepeRef.current = editor;

    editor.on((listener) => {
      listener.markdownUpdated((_ctx, nextContent) => {
        dispatch(setContent(nextContent));
      });
    });

    editor.create().catch((error) => {
      console.error("Failed to initialize editor", error);
    });

    return () => {
      crepeRef.current = null;
      editor.destroy().catch(() => undefined);
    };
  }, [saveState]);

  function getDraftContent(draft: Draft) {
    const title = draft.title;
    const excerpt = draft.excerpt;

    return `# ${title}\n
    ${excerpt}\n---\n
    ${draft.content}`;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex h-svh flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>

        <section
          id="content-area"
          className="flex flex-1 min-h-0 flex-col overflow-y-auto"
        >
          <div className="editor-column shrink-0">
            <div className="post-header px-8 font-montserrat space-y-3 w-full flex flex-col">
              <input
                type="text"
                value={draft.title}
                className="text-4xl mb-4 outline-none font-semibold placeholder:text-neutral-300"
                placeholder="Post title"
                onChange={(e) =>
                  dispatch(setTitle(e.target.value.replace(/ {2,}/g, " ")))
                }
              />
              <div className="text-xs" aria-label="Slug">
                {getDraftLink(draft.title)}
              </div>
              <input
                type="text"
                value={draft.excerpt}
                className="outline-none flex text-sm font-medium text-neutral-600"
                placeholder="Write a short excerpt for the post..."
                onChange={(e) =>
                  dispatch(setExcerpt(e.target.value.replace(/ {2,}/g, " ")))
                }
              />
            </div>
          </div>

          <div id="workbench" className="flex-1 min-h-0 px-8">
            <div
              className={`markdown-body prose prose-neutral dark:prose-invert max-w-none w-full p-5 ${
                showPreview ? "" : "hidden"
              }`}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ node, ...props }) => (
                    <p className="font-montserrat" {...props} />
                  ),
                }}
              >
                {getDraftContent(draft)}
              </ReactMarkdown>
            </div>

            <div
              ref={editorHost}
              className={`editor-host h-full ${showPreview ? "hidden" : ""}`}
            />
          </div>
        </section>

        <EditorMenuBar
          showPreview={showPreview}
          onTogglePreview={() => setShowPreview((prev) => !prev)}
          saveState={saveState}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
