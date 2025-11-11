"use client";

import { useEffect, useState } from "react";

import {
  CONTENT_TYPES,
  COUNTRIES,
  LANGUAGES,
  ORGANISATION_TYPES,
  SORT_OPTIONS,
  SPORT_OPTIONS,
  TOPICS,
} from "@/lib/constants";
import { SortOption } from "@/types/articles";

export interface FiltersState {
  query?: string;
  sport?: string;
  organisation_type?: string;
  country?: string;
  content_type?: string;
  language?: string;
  topics?: string[];
}

interface FiltersBarProps {
  initialState: FiltersState;
  sort: SortOption;
  onApply: (state: FiltersState, sort: SortOption) => void;
  onReset: () => void;
}

export function FiltersBar({ initialState, sort, onApply, onReset }: FiltersBarProps) {
  const [state, setState] = useState<FiltersState>(initialState);
  const [sortValue, setSortValue] = useState<SortOption>(sort);

  useEffect(() => {
    setState(initialState);
  }, [initialState]);

  useEffect(() => {
    setSortValue(sort);
  }, [sort]);

  const updateField = <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => {
    setState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleTopic = (topic: string) => {
    setState((prev) => {
      const topics = new Set(prev.topics ?? []);
      if (topics.has(topic)) {
        topics.delete(topic);
      } else {
        topics.add(topic);
      }
      return { ...prev, topics: Array.from(topics) };
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onApply(state, sortValue);
  };

  const handleReset = () => {
    setState({});
    setSortValue("date_desc");
    onReset();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
          Recherche
          <input
            type="search"
            placeholder="Mot-clé, source, sport…"
            value={state.query ?? ""}
            onChange={(event) => updateField("query", event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-base text-slate-900 outline-none focus:border-midnight"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
          Sport
          <select
            value={state.sport ?? ""}
            onChange={(event) => updateField("sport", event.target.value || undefined)}
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
            value={state.organisation_type ?? ""}
            onChange={(event) =>
              updateField("organisation_type", event.target.value || undefined)
            }
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
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
          Pays
          <select
            value={state.country ?? ""}
            onChange={(event) => updateField("country", event.target.value || undefined)}
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
            value={state.content_type ?? ""}
            onChange={(event) =>
              updateField("content_type", event.target.value || undefined)
            }
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
            value={state.language ?? ""}
            onChange={(event) => updateField("language", event.target.value || undefined)}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-slate-900 outline-none focus:border-midnight"
          >
            <option value="">Toutes</option>
            {LANGUAGES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium text-slate-600">Topics</span>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((topic) => {
            const active = state.topics?.includes(topic);
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

      <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 md:flex-row md:items-center md:justify-between">
        <label className="flex items-center gap-3 text-sm font-medium text-slate-600">
          Tri
          <select
            value={sortValue}
            onChange={(event) => setSortValue(event.target.value as SortOption)}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-slate-900 outline-none focus:border-midnight"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Réinitialiser
          </button>
          <button
            type="submit"
            className="rounded-full bg-midnight px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
          >
            Appliquer les filtres
          </button>
        </div>
      </div>
    </form>
  );
}
