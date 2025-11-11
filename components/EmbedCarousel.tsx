"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { formatReadableDate } from "@/lib/dates";
import { Article } from "@/types/articles";

interface EmbedCarouselProps {
  articles: Article[];
}

export function EmbedCarousel({ articles }: EmbedCarouselProps) {
  if (!articles.length) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-8 text-center text-sm text-slate-500">
        Aucun article.
      </p>
    );
  }

  return (
    <div className="scrollbar-hide flex gap-4 overflow-x-auto py-2">
      {articles.map((article, index) => (
        <motion.article
          key={article.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
          className="min-w-[280px] max-w-[320px] flex-1 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-400">
            <span>{article.sport}</span>
            <span>{formatReadableDate(article.published_at)}</span>
          </div>
          <h3 className="mt-3 line-clamp-3 text-base font-semibold text-slate-900">
            {article.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm text-slate-600">{article.summary}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {article.topics.slice(0, 3).map((topic) => (
              <span
                key={`${article.id}-${topic}`}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
              >
                {topic}
              </span>
            ))}
          </div>
          <Link
            href={article.source_url}
            target="_blank"
            className="mt-4 inline-flex items-center text-sm font-semibold text-midnight"
          >
            Lire sur {article.source_name} →
          </Link>
        </motion.article>
      ))}
    </div>
  );
}
