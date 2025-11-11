"use client";

interface PaginationProps {
  page: number;
  total: number;
  perPage: number;
  onPageChange: (next: number) => void;
}

export function Pagination({ page, total, perPage, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const changePage = (next: number) => {
    const clamped = Math.min(Math.max(next, 1), totalPages);
    if (clamped !== page) {
      onPageChange(clamped);
    }
  };

  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
      <span className="text-slate-500">
        Page {page} / {totalPages} — {total} articles
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => changePage(page - 1)}
          disabled={page === 1}
          className="rounded-full border border-slate-300 px-4 py-1 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Précédent
        </button>
        <button
          type="button"
          onClick={() => changePage(page + 1)}
          disabled={page === totalPages}
          className="rounded-full border border-slate-300 px-4 py-1 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
