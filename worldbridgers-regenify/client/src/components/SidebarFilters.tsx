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
    <aside className="flex w-64 shrink-0 flex-col gap-0 overflow-hidden rounded-[24px] border border-[#2b3a49] bg-[#22313e] text-white shadow-[0_18px_48px_rgba(15,23,42,0.18)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <SlidersHorizontal className="h-4 w-4 text-emerald-300" />
          Filters
          {totalActive > 0 && (
            <span className="ml-1 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
              {totalActive}
            </span>
          )}
        </div>
        {totalActive > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 text-xs text-white/60 transition-colors hover:text-white"
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
            <div key={group.id} className="border-b border-white/8 last:border-0">
              <button
                className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-white/5"
                onClick={() => toggle(group.id)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold tracking-[0.06em] text-white">{group.label}</span>
                  {activeCount > 0 && (
                    <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-bold leading-none text-emerald-200">
                      {activeCount}
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-white/60 transition-transform ${isCollapsed ? "" : "rotate-180"}`}
                />
              </button>

              {!isCollapsed && (
                <div className="space-y-2 px-4 pb-4">
                  {group.options.map((opt) => {
                    const isChecked = (selected[group.id] ?? []).includes(opt.value);
                    return (
                      <div key={opt.value} className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`${group.id}-${opt.value}`}
                            checked={isChecked}
                            onCheckedChange={(v) => handleCheck(group.id, opt.value, !!v)}
                            className="w-3.5 h-3.5"
                          />
                          <Label
                            htmlFor={`${group.id}-${opt.value}`}
                            className="cursor-pointer text-xs leading-none text-white/82"
                          >
                            {opt.label}
                          </Label>
                        </div>
                        {opt.count !== undefined && (
                          <span className="text-[10px] text-white/45">{opt.count}</span>
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
