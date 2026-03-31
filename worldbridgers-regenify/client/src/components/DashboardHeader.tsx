import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
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
  Bell,
  ChevronDown,
  Leaf,
  LayoutDashboard,
  Building2,
  Layers,
  BarChart3,
  FileText,
  Network,
  User,
  Settings,
  LogOut,
  HelpCircle,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

const NAV_ITEMS = [
  {
    label: "Platform",
    icon: LayoutDashboard,
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Issuers", href: "/dashboard/issuers", icon: Building2 },
      { label: "Offerings", href: "/dashboard/offerings", icon: Layers },
      { label: "Indices", href: "/dashboard/indices", icon: BarChart3 },
      { label: "Documents", href: "/dashboard/documents", icon: FileText },
      { label: "Graph View", href: "/dashboard/graph", icon: Network },
    ],
  },
  {
    label: "Markets",
    icon: BarChart3,
    items: [
      { label: "Live Markets", href: "/dashboard", icon: BarChart3 },
      { label: "Market Indices", href: "/dashboard/indices", icon: BarChart3 },
      { label: "Sector Analysis", href: "/dashboard", icon: BarChart3 },
    ],
  },
  {
    label: "WBX Exchange",
    icon: Wallet,
    items: [
      { label: "My WBX Portfolio", href: "/dashboard", icon: Wallet },
      { label: "Trading Platform", href: "/dashboard", icon: Wallet },
      { label: "Settlement", href: "/dashboard", icon: Wallet },
    ],
  },
];

export default function DashboardHeader() {
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "DU";

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0 mr-4">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-brand">
              <Leaf className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="leading-none">
              <span className="font-bold text-xs text-foreground tracking-tight">Worldbridgers</span>
              <span className="block text-[9px] font-semibold tracking-widest uppercase text-primary">Regenify</span>
            </div>
          </Link>

          {/* Nav */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1">
            {NAV_ITEMS.map((item, i) => (
              <div
                key={i}
                className="relative"
                onMouseEnter={() => setActiveMenu(i)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeMenu === i ? "text-primary bg-primary/8" : "text-foreground/70 hover:text-foreground hover:bg-muted"
                }`}>
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                  <ChevronDown className={`w-3 h-3 transition-transform ${activeMenu === i ? "rotate-180" : ""}`} />
                </button>

                {activeMenu === i && (
                  <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-card-hover border border-border py-1.5 z-50 animate-fade-in">
                    {item.items.map((sub, j) => (
                      <Link
                        key={j}
                        href={sub.href}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
                        onClick={() => setActiveMenu(null)}
                      >
                        <sub.icon className="w-3.5 h-3.5 text-muted-foreground" />
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Quick links */}
            <div className="flex items-center gap-0.5 ml-2 pl-2 border-l border-border">
              {[
                { label: "Issuers", href: "/dashboard/issuers" },
                { label: "Offerings", href: "/dashboard/offerings" },
                { label: "Indices", href: "/dashboard/indices" },
                { label: "Graph", href: "/dashboard/graph" },
              ].map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  className="px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            {/* Search */}
            {searchOpen ? (
              <Input
                autoFocus
                placeholder="Search platform..."
                className="w-48 h-8 text-xs"
                onBlur={() => setSearchOpen(false)}
              />
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            )}

            {/* Notifications */}
            <button className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
            </button>

            {/* Account menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-muted transition-colors">
                  <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-bold">
                    {initials}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-xs font-medium text-foreground leading-none">{user?.name || "Demo User"}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{user?.email || "demo@regenify.com"}</div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-sm gap-2.5">
                  <User className="w-3.5 h-3.5" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm gap-2.5">
                  <Wallet className="w-3.5 h-3.5" /> My WBX Portfolio
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm gap-2.5">
                  <Settings className="w-3.5 h-3.5" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm gap-2.5">
                  <HelpCircle className="w-3.5 h-3.5" /> Help & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-sm gap-2.5 text-destructive focus:text-destructive"
                  onClick={async () => {
                    await logout();
                    navigate("/");
                  }}
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
