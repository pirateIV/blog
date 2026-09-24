// Small "#tag" pills for the public blog — list cards and the post header.
// Non-interactive on purpose: the site has no tag index pages to link to.
export default function TagChips({ tags }: { tags?: string[] }) {
  if (!tags?.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full border border-background-dark/20 px-2 py-0.5 font-semibold text-[10px] uppercase tracking-wide"
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}
