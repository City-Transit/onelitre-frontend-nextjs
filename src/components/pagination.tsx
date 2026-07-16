import Link from 'next/link';

export function Pagination({
  basePath,
  page,
  totalPages,
  total,
}: {
  basePath: string;
  page: number;
  totalPages: number;
  total: number;
}) {
  if (total === 0) return null;

  return (
    <div className="mt-4 flex items-center justify-between font-mono text-xs text-[#5B6B63]">
      <span>
        Page {page} of {totalPages} ({total} total)
      </span>
      <div className="flex gap-2">
        <Link
          href={`${basePath}?page=${Math.max(1, page - 1)}`}
          aria-disabled={page <= 1}
          className={`rounded-full border border-[rgba(18,33,29,0.2)] px-3 py-1.5 font-semibold ${
            page <= 1 ? 'pointer-events-none opacity-40' : 'hover:border-ink'
          }`}
        >
          Previous
        </Link>
        <Link
          href={`${basePath}?page=${Math.min(totalPages, page + 1)}`}
          aria-disabled={page >= totalPages}
          className={`rounded-full border border-[rgba(18,33,29,0.2)] px-3 py-1.5 font-semibold ${
            page >= totalPages ? 'pointer-events-none opacity-40' : 'hover:border-ink'
          }`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
