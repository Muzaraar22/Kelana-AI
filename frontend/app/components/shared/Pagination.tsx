import Button from "./Button";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-center gap-4">
      <Button variant="ghost" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
        ← Sebelumnya
      </Button>
      <span className="text-sm text-zinc-500 dark:text-zinc-400">
        Halaman {page} dari {totalPages}
      </span>
      <Button variant="ghost" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
        Selanjutnya →
      </Button>
    </div>
  );
}
