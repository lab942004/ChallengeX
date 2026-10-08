import { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { PageMeta } from '../../types/api';
import { cn } from '../../utils';

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  empty?: ReactNode;
  onRowClick?: (row: T) => void;
}

/** Consistent responsive data table used across all admin pages. */
export function DataTable<T>({ columns, rows, rowKey, empty, onRowClick }: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="panel flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
        <Inbox className="h-8 w-8 text-sand-dim/50" />
        <p className="text-sm text-sand-dim">{empty ?? 'No records found.'}</p>
      </div>
    );
  }

  return (
    <div className="panel overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse">
        <thead className="border-b border-white/5 bg-ink-800/60">
          <tr>
            {columns.map((col) => (
              <th key={col.header} className={cn('th', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'transition-colors hover:bg-white/[0.02]',
                onRowClick && 'cursor-pointer',
              )}
            >
              {columns.map((col) => (
                <td key={col.header} className={cn('td', col.className)}>
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface PaginationProps {
  meta: PageMeta | null;
  onPageChange: (page: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  if (!meta || meta.totalPages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-between gap-3 text-xs text-sand-dim">
      <span>
        Page {meta.page} of {meta.totalPages} · {meta.total} total
      </span>
      <div className="flex gap-2">
        <button
          className="btn-ghost !px-3 !py-1.5"
          disabled={!meta.hasPrev}
          onClick={() => onPageChange(meta.page - 1)}
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Prev
        </button>
        <button
          className="btn-ghost !px-3 !py-1.5"
          disabled={!meta.hasNext}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
