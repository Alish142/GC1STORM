import { useEffect, useState } from "react";
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
  label: React.ReactNode;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  className?: string;
}

export interface RowContextMenuAction<T> {
  label: string;
  onSelect: (row: T) => void;
  disabled?: boolean;
  destructive?: boolean;
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
  mobileCardRender?: (row: T, index: number) => React.ReactNode;
  rowContextMenu?: (row: T, index: number) => RowContextMenuAction<T>[] | null;
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
  mobileCardRender,
  rowContextMenu,
}: DataTableProps<T>) {
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    row: T;
    index: number;
  } | null>(null);

  const SortIcon = ({ col }: { col: string }) => {
    if (sortBy !== col) return <ChevronsUpDown className="h-3 w-3 text-muted-foreground/50" />;
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3 text-primary" />
    ) : (
      <ChevronDown className="h-3 w-3 text-primary" />
    );
  };

  const getHeaderAlignmentClass = (className?: string) => {
    if (className?.includes("text-right")) return "justify-end";
    if (className?.includes("text-center")) return "justify-center";
    return "";
  };

  const getRowActions = (row: T, index: number) => rowContextMenu?.(row, index) ?? [];

  const openContextMenu = (event: React.MouseEvent, row: T, index: number) => {
    const actions = getRowActions(row, index);
    if (!actions.length) {
      return;
    }

    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      row,
      index,
    });
  };

  useEffect(() => {
    if (!contextMenu) {
      return;
    }

    const closeMenu = () => setContextMenu(null);
    window.addEventListener("scroll", closeMenu, true);
    window.addEventListener("resize", closeMenu);

    return () => {
      window.removeEventListener("scroll", closeMenu, true);
      window.removeEventListener("resize", closeMenu);
    };
  }, [contextMenu]);

  return (
    <div className="relative flex h-full flex-col gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 bg-background pl-9 text-sm"
        />
      </div>

      <div className="md:hidden">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {isLoading ? (
            <div className="py-16 text-center">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm">Loading data...</span>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="py-16 text-center">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Search className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">{emptyMessage}</span>
                <span className="text-xs">Try adjusting your search or filters.</span>
              </div>
            </div>
          ) : mobileCardRender ? (
            <div className="divide-y divide-border/60">
              {data.map((row, i) => (
                <div key={i} className="p-4" onContextMenu={(event) => openContextMenu(event, row, i)}>
                  {mobileCardRender(row, i)}
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="min-w-max w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {columns.map((col) => (
                      <th
                        key={String(col.key)}
                        className={`px-4 py-3 text-left text-xs font-semibold whitespace-nowrap text-muted-foreground ${col.className ?? ""} ${col.sortable ? "cursor-pointer select-none hover:text-foreground" : ""}`}
                        onClick={() => col.sortable && onSort?.(String(col.key))}
                      >
                        <div className={`flex items-center gap-1.5 ${getHeaderAlignmentClass(col.className)}`.trim()}>
                          {col.label}
                          {col.sortable && <SortIcon col={String(col.key)} />}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr
                      key={i}
                      className="group border-b border-border/50 transition-colors last:border-0 hover:bg-muted/30"
                      onContextMenu={(event) => openContextMenu(event, row, i)}
                    >
                      {columns.map((col) => (
                        <td key={String(col.key)} className={`px-4 py-3 text-sm text-foreground/80 ${col.className ?? ""}`}>
                          {col.render
                            ? col.render(row[col.key as string], row)
                            : String(row[col.key as string] ?? "—")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="hidden flex-1 overflow-auto rounded-xl border border-border bg-card scrollbar-thin md:block">
        <table className="min-w-max w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-4 py-3 text-left text-xs font-semibold whitespace-nowrap text-muted-foreground ${col.className ?? ""} ${col.sortable ? "cursor-pointer select-none hover:text-foreground" : ""}`}
                  onClick={() => col.sortable && onSort?.(String(col.key))}
                >
                  <div className={`flex items-center gap-1.5 ${getHeaderAlignmentClass(col.className)}`.trim()}>
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
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-sm">Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <Search className="h-5 w-5" />
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
                  className="group border-b border-border/50 transition-colors last:border-0 hover:bg-muted/30"
                  onContextMenu={(event) => openContextMenu(event, row, i)}
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

      {contextMenu ? (
        <>
          <button
            type="button"
            aria-label="Close row actions"
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-50 min-w-48 overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.18)]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <div className="px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Row actions
            </div>
            <div className="my-1 h-px bg-border" />
            {getRowActions(contextMenu.row, contextMenu.index).map((action) => (
              <button
                key={action.label}
                type="button"
                disabled={action.disabled}
                className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  action.destructive
                    ? "text-destructive hover:bg-destructive/10 disabled:text-destructive/40"
                    : "text-foreground hover:bg-muted disabled:text-muted-foreground/50"
                }`}
                onClick={() => {
                  setContextMenu(null);
                  action.onSelect(contextMenu.row);
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        </>
      ) : null}

      <div className="flex shrink-0 flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>{total > 0 ? `Showing ${start}–${end} of ${total} results` : "No results"}</span>
        <div className="flex items-center gap-1 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || isLoading}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
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
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
