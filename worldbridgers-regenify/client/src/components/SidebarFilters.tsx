import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";

export interface FilterGroup {
  id: string;
  label: string;
  options: { value: string; label: string; count?: number }[];
}

interface SidebarFiltersProps {
  groups: FilterGroup[];
  selected: Record<string, string[]>;
  onChange: (groupId: string, values: string[]) => void;
  onClearAll: () => void;
  totalActive: number;
}

export default function SidebarFilters({
  groups,
  selected,
  onChange,
  onClearAll,
  totalActive,
}: SidebarFiltersProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (id: string) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleCheck = (groupId: string, value: string, checked: boolean) => {
    const current = selected[groupId] ?? [];
    onChange(groupId, checked ? [...current, value] : current.filter((v) => v !== value));
  };

  return (
    <aside className="w-60 shrink-0 flex flex-col gap-0 bg-card rounded-xl border border-border overflow-hidden shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          Filters
          {totalActive > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold leading-none">
              {totalActive}
            </span>
          )}
        </div>
        {totalActive > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Filter groups */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {groups.map((group) => {
          const isCollapsed = collapsed[group.id];
          const activeCount = (selected[group.id] ?? []).length;

          return (
            <div key={group.id} className="border-b border-border/50 last:border-0">
              <button
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/30 transition-colors"
                onClick={() => toggle(group.id)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">{group.label}</span>
                  {activeCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold leading-none">
                      {activeCount}
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isCollapsed ? "" : "rotate-180"}`}
                />
              </button>

              {!isCollapsed && (
                <div className="px-4 pb-3 space-y-2">
                  {group.options.map((opt) => {
                    const isChecked = (selected[group.id] ?? []).includes(opt.value);
                    return (
                      <div key={opt.value} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`${group.id}-${opt.value}`}
                            checked={isChecked}
                            onCheckedChange={(v) => handleCheck(group.id, opt.value, !!v)}
                            className="w-3.5 h-3.5"
                          />
                          <Label
                            htmlFor={`${group.id}-${opt.value}`}
                            className="text-xs text-foreground/80 cursor-pointer leading-none"
                          >
                            {opt.label}
                          </Label>
                        </div>
                        {opt.count !== undefined && (
                          <span className="text-[10px] text-muted-foreground">{opt.count}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
