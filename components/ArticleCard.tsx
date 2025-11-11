import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

import { formatReadableDate } from "@/lib/dates";
import { getLocalImageForSport } from "@/lib/localImages";
import { Article } from "@/types/articles";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const localImage = getLocalImageForSport(article.sport);
  const imageSrc = article.image_url?.startsWith("/") ? article.image_url : localImage;

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[16/9] w-full">
        <Image
          src={imageSrc}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
        <div className="absolute left-4 top-4 flex gap-2 text-xs font-semibold uppercase tracking-wide">
          <span className="rounded-full bg-white/90 px-3 py-1 text-slate-800">
            {article.sport}
          </span>
          <span className="rounded-full bg-midnight/80 px-3 py-1 text-white">
            {article.content_type}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <header className="space-y-2">
          <div className="text-sm text-slate-500">
            {article.source_name} · {article.language} · {article.country}
          </div>
          <h3 className="text-xl font-semibold text-slate-900">{article.title}</h3>
        </header>

        <p className="flex-1 text-sm text-slate-600">{article.summary}</p>

        <div className="flex flex-wrap gap-2">
          {article.topics.map((topic) => (
            <span
              key={`${article.id}-${topic}`}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
            >
              {topic}
            </span>
          ))}
        </div>

        <footer className="flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-gold" fill="#C69300" />
            <span>{(article.official_weight * 100).toFixed(0)}%</span>
          </div>
          <span>{formatReadableDate(article.published_at)}</span>
          <Link
            href={article.source_url}
            className="text-sm font-medium text-midnight underline decoration-dashed underline-offset-4"
            target="_blank"
          >
            Source
          </Link>
        </footer>
      </div>
    </article>
  );
}
