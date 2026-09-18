export const STORAGE_KEY = 'milkdown-author-studio-draft-v1'

export type Draft = {
  title: string
  slug: string
  excerpt: string
  tags: string[]
  content: string
  updatedAt: string
  published: boolean
}

export const DEFAULT_DRAFT: Draft = {
  title: 'Building a tiny Markdown authoring studio',
  slug: 'building-a-tiny-markdown-authoring-studio',
  excerpt: 'A local-first experiment with Milkdown, Next.js, and Markdown.',
  tags: ['next.js', 'markdown', 'milkdown'],
  published: false,
  updatedAt: new Date(0).toISOString(),
  content: `# Building a tiny Markdown authoring studio\n\nThis is a **realistic authoring workspace** rather than a demo textarea.\n\n## What this prototype can do\n\n- Edit Markdown with a rich visual editor\n- Preview the rendered article\n- Save drafts to \`localStorage\`\n- Track words and characters\n- Keep post metadata beside the editor\n\n> The important part is that Markdown remains the canonical content.\n\n| Feature | State |\n| --- | --- |\n| Rich editor | Working |\n| Live preview | Working |\n| Local draft | Working |\n| Backend | Not connected |\n\n\`\`\`js\nconst format = (markdown) => markdown.trim()\n\nconsole.log(format('# hello'))\n\`\`\`\n`,
}
