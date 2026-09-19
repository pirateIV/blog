"use client";

import React, { useEffect, useRef, useState } from "react";
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

import { Draft } from "@/types";
import remarkGfm from "remark-gfm";
import { useAppDispatch } from "@/lib/hooks";
import { setTitle, setExcerpt, setContent } from "@/lib/features/slices/draft";
import { EditorMenuBar } from "./EditorMenuBar";
import { useDraftStorage } from "@/lib/hooks/useDraftStorage";

function getDraftLink(title: string) {
  const link = title.trim().toLocaleLowerCase().replaceAll(" ", "-");
  return "/" + (link || "your-post-link-here");
}

export function Studio() {
  const dispatch = useAppDispatch();
  const editorHost = useRef<HTMLDivElement>(null);
  const crepeRef = useRef<Crepe | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // Consume our isolated storage and custom state management engine
  const { draft, saveState, isHydrated, hasUnsavedChanges, onSaveNow } = useDraftStorage();

  // Initialize the text editor instance safely once data is hydrated
  useEffect(() => {
    if (!isHydrated || !editorHost.current || crepeRef.current) return;

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
      if (crepeRef.current) {
        crepeRef.current.destroy().catch(() => undefined);
        crepeRef.current = null;
      }
    };
  }, [isHydrated, dispatch]);

  function getDraftContent(currentDraft: Draft) {
    return `# ${currentDraft.title}\n\n${currentDraft.excerpt}\n\n---\n\n${currentDraft.content}`;
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

        <section id="content-area" className="flex flex-1 min-h-0 flex-col overflow-y-auto">
          <div className="editor-column shrink-0">
            <div className="post-header px-8 font-montserrat space-y-3 w-full flex flex-col">
              <input
                type="text"
                value={draft.title}
                className="text-4xl mb-4 outline-none font-semibold placeholder:text-neutral-300"
                placeholder="Post title"
                onChange={(e) => dispatch(setTitle(e.target.value.replace(/ {2,}/g, " ")))}
              />
              <div className="text-xs" aria-label="Slug">
                {getDraftLink(draft.title)}
              </div>
              <input
                type="text"
                value={draft.excerpt}
                className="outline-none flex text-sm font-medium text-neutral-600"
                placeholder="Write a short excerpt for the post..."
                onChange={(e) => dispatch(setExcerpt(e.target.value.replace(/ {2,}/g, " ")))}
              />
            </div>
          </div>

          <div id="workbench" className="flex-1 min-h-0 px-8">
            <div className={`markdown-body prose prose-neutral dark:prose-invert max-w-none w-full p-5 ${showPreview ? "" : "hidden"}`}>
              {showPreview && (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ node, ...props }) => <p className="font-montserrat" {...props} />
                  }}
                >
                  {getDraftContent(draft)}
                </ReactMarkdown>
              )}
            </div>

            <div ref={editorHost} className={`editor-host h-full ${showPreview ? "hidden" : ""}`} />
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
