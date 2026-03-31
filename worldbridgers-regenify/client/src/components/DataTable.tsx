import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  search: string;
  onSearchChange: (v: string) => void;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  onSort?: (key: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  searchPlaceholder?: string;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  total,
  page,
  pageSize,
  onPageChange,
  search,
  onSearchChange,
  sortBy,
  sortDir,
  onSort,
  isLoading,
  emptyMessage = "No results found.",
  searchPlaceholder = "Search...",
}: DataTableProps<T>) {
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const SortIcon = ({ col }: { col: string }) => {
    if (sortBy !== col) return <ChevronsUpDown className="w-3 h-3 text-muted-foreground/50" />;
    return sortDir === "asc"
      ? <ChevronUp className="w-3 h-3 text-primary" />
      : <ChevronDown className="w-3 h-3 text-primary" />;
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9 text-sm bg-background"
        />
      </div>

      {/* Table wrapper */}
      <div className="flex-1 overflow-auto rounded-xl border border-border bg-card scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-4 py-3 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap ${col.className ?? ""} ${col.sortable ? "cursor-pointer hover:text-foreground select-none" : ""}`}
                  onClick={() => col.sortable && onSort?.(String(col.key))}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && <SortIcon col={String(col.key)} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="text-sm">Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-1">
                      <Search className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">{emptyMessage}</span>
                    <span className="text-xs">Try adjusting your search or filters.</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors group"
                >
                  {columns.map((col) => (
                    <td key={String(col.key)} className={`px-4 py-3 text-sm text-foreground/80 ${col.className ?? ""}`}>
                      {col.render
                        ? col.render(row[col.key as string], row)
                        : String(row[col.key as string] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-muted-foreground shrink-0">
        <span>
          {total > 0 ? `Showing ${start}–${end} of ${total} results` : "No results"}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || isLoading}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum = i + 1;
            if (totalPages > 5) {
              if (page <= 3) pageNum = i + 1;
              else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = page - 2 + i;
            }
            return (
              <Button
                key={pageNum}
                variant={page === pageNum ? "default" : "outline"}
                size="sm"
                className={`h-7 w-7 p-0 text-xs ${page === pageNum ? "bg-primary text-white" : ""}`}
                onClick={() => onPageChange(pageNum)}
                disabled={isLoading}
              >
                {pageNum}
              </Button>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || isLoading}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
