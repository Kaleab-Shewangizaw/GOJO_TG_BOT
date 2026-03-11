interface Post {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  date: string;
}

const POSTS: Post[] = [
 
];

const categoryColors: Record<string, string> = {
  Guides: "bg-blue-50 text-blue-700",
  Tips: "bg-emerald-50 text-emerald-700",
  Tutorial: "bg-violet-50 text-violet-700",
  Security: "bg-rose-50 text-rose-700",
};

export function BlogScreen() {
  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Blog</h1>
        <p className="mt-1 text-sm text-slate-500">
          Hosting tips, guides, and news from GojoHost.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {POSTS.map((post) => (
          <article
            key={post.id}
            className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                  categoryColors[post.category] ?? "bg-slate-100 text-slate-600"
                }`}
              >
                {post.category}
              </span>
              <span className="text-[11px] text-slate-400">{post.date}</span>
            </div>
            <h2 className="text-sm font-semibold text-slate-900 leading-snug">
              {post.title}
            </h2>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              {post.excerpt}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
