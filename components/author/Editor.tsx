"use client";

import React, { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Crepe } from "@milkdown/crepe";
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
import { Button } from "../ui/button";
import { Edit, Eye } from "lucide-react";
import remarkGfm from "remark-gfm";

function getDraftLink(title: string) {
  const link = title.trim().toLocaleLowerCase().replaceAll(" ", "-");
  return "/ " + (link || "your-post-link-here");
}

function setInput(func: Function, key: keyof Draft) {
  return (e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) =>
    func(e.target.value.replace(/ {2,}/g, " "), key);
}

const EMPTY_DRAFT: Draft = {
  title: "",
  excerpt: "",
  content:
    "# Building a tiny Markdown authoring studio\n\nThis is a **realistic authoring workspace** rather than a demo textarea.\n\n## What this prototype can do\n\n- Edit Markdown with a rich visual editor\n- Preview the rendered article\n- Save drafts to \`localStorage\`\n- Track words and characters\n- Keep post metadata beside the editor\n\n> The important part is that Markdown remains the canonical content.\n\n| Feature | State |\n| --- | --- |\n| Rich editor | Working |\n| Live preview | Working |\n| Local draft | Working |\n| Backend | Not connected |\n\n\`\`\`js\nconst format = (markdown) => markdown.trim()\n\nconsole.log(format('# hello'))\n\`\`\`\n",
  published: false,
  tags: [],
  updatedAt: new Date().toISOString(),
};

export function Studio() {
  const editorHost = React.useRef<HTMLDivElement>(null);
  const crepeRef = React.useRef<Crepe | null>(null);

  const [draft, setDraft] = React.useState<Draft>(EMPTY_DRAFT);
  const [saveState, setSaveState] = React.useState<DraftSaveState>("loading");
  const [showPreview, setShowPreview] = React.useState<boolean>(false);

  useEffect(() => {
    // STORAGE
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setDraft(JSON.parse(raw) as Draft);
      } catch (error) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
      setSaveState(raw ? "saved" : "saved");
    }
  }, []);

  useEffect(() => {
    // === EDITOR
    if (!editorHost.current || crepeRef.current) return;

    const editor = new Crepe({
      root: editorHost.current,
      defaultValue: draft.content,
    });

    crepeRef.current = editor;

    editor.on((listener) => {
      listener.markdownUpdated((_ctx, nextContent) => {
        input(nextContent, "content");
      });
    });

    editor.create().catch((r) => {
      console.log(r);
    });

    return () => {
      crepeRef.current = null;
      editor.destroy().catch(() => undefined);
    };
  }, [showPreview]);

  function input(value: string, key: keyof Draft) {
    setDraft((curr) => ({ ...curr, [key]: value }));
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>

        <section id="content-area" className="px-8">
          <div className="editor-column">
            <div className="post-header font-montserrat space-y-3 w-full flex flex-col">
              <input
                type="text"
                value={draft.title}
                className="text-4xl mb-4 outline-none font-semibold placeholder:text-neutral-300"
                placeholder="Post title"
                onChange={setInput(input, "title")}
              />
              <div className="text-xs" aria-label="Slug">
                {getDraftLink(draft.title)}
              </div>
              <input
                type="text"
                value={draft.excerpt}
                className="outline-none flex text-sm font-medium text-neutral-600"
                placeholder="Write a short excerpt for the post..."
                onChange={setInput(input, "excerpt")}
              />
            </div>
          </div>

          <div id="workbench">
            {showPreview ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {draft.content}
              </ReactMarkdown>
            ) : (
              <div ref={editorHost} className="editor-host" />
            )}
          </div>
        </section>

        <section id="controls">
          <div className="w-full p-2 bg-neutral-100 fixed bottom-0 border-t border-sidebar">
            <Button
              variant="ghost"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? <Eye /> : <Edit />}
            </Button>
          </div>
        </section>
      </SidebarInset>
    </SidebarProvider>
  );
}
