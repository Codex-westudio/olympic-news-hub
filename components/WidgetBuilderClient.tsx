"use client";

import { useEffect, useMemo, useState } from "react";

import { EmbedCarousel } from "@/components/EmbedCarousel";
import {
  CONTENT_TYPES,
  COUNTRIES,
  LANGUAGES,
  ORGANISATION_TYPES,
  SORT_OPTIONS,
  SPORT_OPTIONS,
  TOPICS,
} from "@/lib/constants";
import { MAX_LIMIT } from "@/lib/filtering";
import type { Article, SortOption } from "@/types/articles";

interface WidgetBuilderClientProps {
  siteUrl: string;
}

interface BuilderForm {
  title: string;
  description: string;
  query: string;
  sport: string;
  organisation_type: string;
  country: string;
  content_type: string;
  language: string;
  topics: string[];
  sort: SortOption;
  limit: number;
}

const defaultForm: BuilderForm = {
  title: "Widget Olympic News Hub",
  description: "Flux officiel filtré.",
  query: "",
  sport: "",
  organisation_type: "",
  country: "",
  content_type: "",
  language: "",
  topics: [],
  sort: "date_desc",
  limit: 8,
};

export function WidgetBuilderClient({ siteUrl }: WidgetBuilderClientProps) {
  const [form, setForm] = useState<BuilderForm>(defaultForm);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const params = useMemo(() => {
    const search = new URLSearchParams();
    if (form.query) search.set("query", form.query);
    if (form.sport) search.set("sport", form.sport);
    if (form.organisation_type) search.set("organisation_type", form.organisation_type);
    if (form.country) search.set("country", form.country);
    if (form.content_type) search.set("content_type", form.content_type);
    if (form.language) search.set("language", form.language);
    if (form.topics.length) {
      form.topics.forEach((topic) => search.append("topics", topic));
    }
    search.set("limit", String(Math.min(Math.max(form.limit, 1), MAX_LIMIT)));
    search.set("sort", form.sort);
    return search;
  }, [form]);

  const embedParams = useMemo(() => {
    const search = new URLSearchParams(params.toString());
    search.set("title", form.title || "Widget Olympic News Hub");
    if (form.description) search.set("description", form.description);
    return search;
  }, [params, form.title, form.description]);

  const embedUrl = `${siteUrl.replace(/\/$/, "")}/embed/custom?${embedParams.toString()}`;
  const iframeSnippet = `<iframe src="${embedUrl}" width="100%" height="420" style="border:0;overflow:hidden;" loading="lazy"></iframe>`;

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/articles?${params.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Impossible de charger l’aperçu");
        }
        const payload = await response.json();
        setArticles(payload.items ?? []);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError((err as Error).message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [params]);

  const updateField = <K extends keyof BuilderForm>(key: K, value: BuilderForm[K]) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleTopic = (topic: string) => {
    setForm((prev) => {
      const next = new Set(prev.topics);
      if (next.has(topic)) {
        next.delete(topic);
      } else {
        next.add(topic);
      }
      return { ...prev, topics: Array.from(next) };
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(iframeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
            Titre du widget
            <input
              type="text"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-base text-slate-900 outline-none focus:border-midnight"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
            Description (optionnelle)
            <input
              type="text"
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-base text-slate-900 outline-none focus:border-midnight"
            />
          </label>
        </div>
        <div className="grid gap-4 pt-4 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Recherche texte
            <input
              type="search"
              value={form.query}
              onChange={(event) => updateField("query", event.target.value)}
              placeholder="Mot-clé, source, sport…"
              className="rounded-2xl border border-slate-200 px-4 py-2 text-base text-slate-900 outline-none focus:border-midnight"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Sport
            <select
              value={form.sport}
              onChange={(event) => updateField("sport", event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-slate-900 outline-none focus:border-midnight"
            >
              <option value="">Tous</option>
              {SPORT_OPTIONS.map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Organisation
            <select
              value={form.organisation_type}
              onChange={(event) => updateField("organisation_type", event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-slate-900 outline-none focus:border-midnight"
            >
              <option value="">Toutes</option>
              {ORGANISATION_TYPES.map((org) => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Pays
            <select
              value={form.country}
              onChange={(event) => updateField("country", event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-slate-900 outline-none focus:border-midnight"
            >
              <option value="">Tous</option>
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Type de contenu
            <select
              value={form.content_type}
              onChange={(event) => updateField("content_type", event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-slate-900 outline-none focus:border-midnight"
            >
              <option value="">Tous</option>
              {CONTENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Langue
            <select
              value={form.language}
              onChange={(event) => updateField("language", event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-slate-900 outline-none focus:border-midnight"
            >
              <option value="">Toutes</option>
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="space-y-2 border-t border-slate-100 pt-4">
          <span className="text-sm font-medium text-slate-600">Topics</span>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((topic) => {
              const active = form.topics.includes(topic);
              return (
                <button
                  type="button"
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  className={`rounded-full px-4 py-1 text-sm transition ${
                    active
                      ? "bg-midnight text-white"
                      : "border border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                >
                  {topic}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Tri
            <select
              value={form.sort}
              onChange={(event) => updateField("sort", event.target.value as SortOption)}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-slate-900 outline-none focus:border-midnight"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Nombre d’articles
            <input
              type="number"
              min={1}
              max={MAX_LIMIT}
              value={form.limit}
              onChange={(event) =>
                updateField("limit", Math.min(Math.max(Number(event.target.value) || 1, 1), MAX_LIMIT))
              }
              className="rounded-2xl border border-slate-200 px-4 py-2 text-base text-slate-900 outline-none focus:border-midnight"
            />
          </label>
          <button
            type="button"
            onClick={() => setForm(defaultForm)}
            className="self-end rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Prévisualisation</p>
            <h2 className="text-xl font-semibold text-slate-900">Aperçu temps réel</h2>
          </div>
          {isLoading && (
            <span className="text-sm text-slate-500">Actualisation en cours…</span>
          )}
        </div>
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <EmbedCarousel articles={articles} />
      </div>

      <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Code HTML</p>
            <h2 className="text-xl font-semibold text-slate-900">Iframe à intégrer</h2>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {copied ? "Copié !" : "Copier"}
          </button>
        </div>
        <pre className="overflow-x-auto rounded-2xl bg-slate-900 p-4 text-sm text-slate-100">
          {iframeSnippet}
        </pre>
        <p className="text-xs text-slate-500">
          Ajoute l’attribut `allow="clipboard-write"` si ton CMS le requiert. L’iframe pointe vers{" "}
          <span className="font-mono text-slate-700">{embedUrl}</span>.
        </p>
      </div>
    </div>
  );
}
