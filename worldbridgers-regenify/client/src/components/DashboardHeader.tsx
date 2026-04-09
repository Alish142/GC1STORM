import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  ChevronDown,
  Leaf,
  User,
  Settings,
  LogOut,
  HelpCircle,
  Wallet,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { dashboardNavigation, dashboardQuickLinks } from "@/lib/navigation";

export default function DashboardHeader() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const searchSuggestions = useMemo(
    () => [
      { href: "/dashboard/issuers", match: ["issuer", "issuers"] },
      { href: "/dashboard/offerings", match: ["offering", "offerings", "bond", "bonds"] },
      { href: "/dashboard/indices", match: ["index", "indices", "benchmark"] },
      { href: "/dashboard/graph", match: ["graph", "relationship", "theme", "themes"] },
      { href: "/dashboard/account?view=profile", match: ["account", "profile", "settings", "support", "portfolio"] },
    ],
    []
  );

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "DU";

  const submitSearch = () => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return;
    const target = searchSuggestions.find((item) => item.match.some((term) => query.includes(term)));
    navigate(target?.href ?? "/dashboard/issuers");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#dde2ea] bg-white/96 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-md">
      <div className="container">
        <div className="flex items-center justify-between gap-4 py-4">
          {/* Logo */}
          <Link href="/" className="mr-4 flex shrink-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-brand">
              <Leaf className="h-4 w-4 text-white" />
            </div>
            <div className="leading-none">
              <span className="font-bold text-sm text-foreground tracking-tight">Worldbridgers</span>
              <span className="block text-[10px] font-semibold tracking-[0.28em] uppercase text-primary">Regenify</span>
            </div>
          </Link>

          {/* Nav */}
          <nav className="hidden flex-1 items-center gap-1 lg:flex">
            {dashboardNavigation.map((item) => (
              <DropdownMenu
                key={item.label}
                open={activeMenu === item.label}
                onOpenChange={(open) => setActiveMenu(open ? item.label : null)}
              >
                <DropdownMenuTrigger asChild>
                  <button className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    activeMenu === item.label ? "bg-primary/8 text-primary" : "text-foreground/75 hover:bg-muted hover:text-foreground"
                  }`}>
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${activeMenu === item.label ? "rotate-180" : ""}`} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-72 rounded-2xl border-[#dde2ea] p-2">
                  <DropdownMenuLabel className="px-3 pt-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    {item.label}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {item.items.map((sub) => (
                    <DropdownMenuItem
                      key={sub.label}
                      className="rounded-xl px-3 py-2.5"
                      onClick={() => navigate(sub.href)}
                    >
                      {sub.icon ? <sub.icon className="w-4 h-4 text-primary" /> : null}
                      {sub.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}

            {/* Quick links */}
            <div className="ml-3 flex items-center gap-1 border-l border-[#e1e6ee] pl-3">
              {dashboardQuickLinks.map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden">
                  <Menu className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-60 rounded-2xl border-border p-2">
                {dashboardNavigation.flatMap((group) => group.items).map((item) => (
                  <DropdownMenuItem
                    key={item.label}
                    className="rounded-xl px-3 py-2.5"
                    onClick={() => navigate(item.href)}
                  >
                    {item.icon ? <item.icon className="w-4 h-4 text-primary" /> : null}
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex h-11 min-w-[300px] items-center rounded-2xl border border-[#dce2ea] bg-[#f7f9fc] pl-3 pr-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    submitSearch();
                  }
                }}
                placeholder="Search platform..."
                className="h-full border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
              />
              {searchValue ? (
                <button
                  onClick={() => setSearchValue("")}
                  className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-white hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>

            {/* Account menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-xl border border-[#e1e6ee] bg-[#fbfcfe] py-2 pl-2.5 pr-3.5 transition-colors hover:bg-muted">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                    {initials}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium leading-none text-foreground">{user?.name || "Demo User"}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{user?.email || "demo@regenify.com"}</div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-sm gap-2.5" onClick={() => navigate("/dashboard/account?view=profile")}>
                  <User className="w-3.5 h-3.5" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm gap-2.5" onClick={() => navigate("/dashboard/account?view=portfolio")}>
                  <Wallet className="w-3.5 h-3.5" /> My WBX Portfolio
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm gap-2.5" onClick={() => navigate("/dashboard/account?view=settings")}>
                  <Settings className="w-3.5 h-3.5" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm gap-2.5" onClick={() => navigate("/dashboard/account?view=support")}>
                  <HelpCircle className="w-3.5 h-3.5" /> Help & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-sm gap-2.5 text-destructive focus:text-destructive"
                  onClick={() => navigate("/logout")}
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
