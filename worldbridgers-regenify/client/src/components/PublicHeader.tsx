import { useState, useEffect, useMemo, useRef } from "react";
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
import { useAuth } from "@/_core/hooks/useAuth";
import { publicHighlights, publicNavigation } from "@/lib/navigation";
import { DISCOVER_TOPICS } from "@/lib/discoverTopics";
import { ChevronDown, Menu, X, Leaf, User, Wallet, Settings, HelpCircle, LogOut, Search } from "lucide-react";

function resolveAuthenticatedHref(href: string, isAuthenticated: boolean) {
  if (!isAuthenticated) {
    return href;
  }

  if (href.startsWith("/login?next=")) {
    const params = new URLSearchParams(href.split("?")[1] ?? "");
    return params.get("next") || "/dashboard";
  }

  if (href.startsWith("/login")) {
    return "/dashboard";
  }

  return href;
}

interface PublicHeaderProps {
  lightBackground?: boolean;
}

export default function PublicHeader({ lightBackground = false }: PublicHeaderProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "DU";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const publicSearchItems = useMemo(() => {
    const navItems = publicNavigation.flatMap((group) => {
      const direct = group.href
        ? [{
            label: group.label,
            href: group.href,
            description: `Go to ${group.label}.`,
          }]
        : [];

      const nested = group.items.map((item) => ({
        label: item.label,
        href: resolveAuthenticatedHref(item.href, isAuthenticated),
        description: item.description ?? `Open ${item.label}.`,
      }));

      return [...direct, ...nested];
    });

    const topicItems = DISCOVER_TOPICS.map((topic) => ({
      label: topic.title,
      href: `/discover/${topic.slug}`,
      description: topic.summary,
    }));

    const supportingPages = [
      { label: "Contact", href: "/contact", description: "Reach the Worldbridgers Regenify team." },
      { label: "Support", href: "/support", description: "Get platform help and guidance." },
      { label: "Privacy", href: "/privacy", description: "Review privacy and data-use information." },
    ];

    const unique = new Map<string, { label: string; href: string; description: string }>();
    [...navItems, ...topicItems, ...supportingPages].forEach((item) => {
      unique.set(`${item.label}-${item.href}`, item);
    });
    return Array.from(unique.values());
  }, [isAuthenticated]);

  const searchResults = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    const source = publicSearchItems;
    if (!query) {
      return source.slice(0, 6);
    }

    return source
      .filter((item) =>
        `${item.label} ${item.description}`.toLowerCase().includes(query)
      )
      .slice(0, 8);
  }, [publicSearchItems, searchValue]);

  const handleSearchSelect = (href: string) => {
    setSearchValue("");
    setSearchOpen(false);
    navigate(href);
  };

  const handleSearchSubmit = () => {
    const first = searchResults[0];
    if (first) {
      handleSearchSelect(first.href);
      return;
    }
    navigate("/discover");
  };

  const useLightStyle = lightBackground || scrolled;

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        useLightStyle
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between gap-4 py-5">
          {/* Logo */}
          <Link href="/" className="mr-2 flex shrink-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-brand">
              <Leaf className="h-4 w-4 text-white" />
            </div>
            <div className="leading-none">
              <span className={`font-bold text-[18px] tracking-tight ${useLightStyle ? "text-foreground" : "text-white"}`}>
                Worldbridgers
              </span>
              <span className={`block text-[11px] font-medium tracking-[0.28em] uppercase ${useLightStyle ? "text-primary" : "text-green-300"}`}>
                Regenify
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden min-w-0 flex-1 items-center justify-start gap-1 px-3 lg:flex">
            {publicNavigation.map((group) => (
              group.href ? (
              <button
                  key={group.label}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-5 py-3.5 text-[18px] font-semibold transition-colors ${
                    useLightStyle
                      ? "text-foreground/70 hover:text-foreground hover:bg-muted"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                  onClick={() => navigate(group.href!)}
                >
                  {group.label}
                </button>
              ) : (
                <DropdownMenu
                  key={group.label}
                  open={activeMenu === group.label}
                  onOpenChange={(open) => setActiveMenu(open ? group.label : null)}
                >
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-5 py-3.5 text-[18px] font-semibold transition-colors ${
                        useLightStyle
                          ? "text-foreground/70 hover:text-foreground hover:bg-muted"
                          : "text-white/80 hover:text-white hover:bg-white/10"
                      } ${activeMenu === group.label ? (useLightStyle ? "text-primary bg-primary/8" : "text-white bg-white/15") : ""}`}
                    >
                      {group.label}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-80 rounded-2xl border-border p-2">
                    <DropdownMenuLabel className="px-3 pt-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                      {group.label}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {group.items.map((item) => (
                      <DropdownMenuItem
                        key={item.label}
                        className="rounded-xl px-3 py-3"
                        onClick={() => navigate(resolveAuthenticatedHref(item.href, isAuthenticated))}
                      >
                        <div className="flex items-start gap-3">
                          {item.icon ? (
                            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                              <item.icon className="h-4 w-4" />
                            </div>
                          ) : null}
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-foreground">{item.label}</div>
                            {item.description ? (
                              <p className="text-xs leading-5 text-muted-foreground">{item.description}</p>
                            ) : null}
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex shrink-0 items-center gap-2">
            <div ref={searchRef} className="relative hidden lg:block">
              <div className={`flex items-center rounded-2xl border px-4 py-2.5 shadow-sm transition-colors ${
                useLightStyle
                  ? "border-border bg-white"
                  : "border-white/15 bg-white/10 backdrop-blur-sm"
              }`}>
                <Search className={`mr-3 h-4 w-4 ${useLightStyle ? "text-muted-foreground" : "text-white/70"}`} />
                <Input
                  value={searchValue}
                  onChange={(event) => {
                    setSearchValue(event.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleSearchSubmit();
                    }
                  }}
                  placeholder="Search pages, topics, markets..."
                  className={`h-auto w-[220px] border-0 bg-transparent p-0 text-[15px] shadow-none focus-visible:ring-0 xl:w-[300px] 2xl:w-[360px] ${
                    useLightStyle ? "text-foreground placeholder:text-muted-foreground" : "text-white placeholder:text-white/55"
                  }`}
                />
              </div>

              {searchOpen ? (
                <div className="absolute right-0 mt-3 w-[420px] overflow-hidden rounded-2xl border border-border bg-white shadow-2xl">
                  <div className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Search results
                  </div>
                  <div className="max-h-[360px] overflow-y-auto p-2">
                    {searchResults.length ? (
                      searchResults.map((item) => (
                        <button
                          key={`${item.label}-${item.href}`}
                          className="w-full rounded-xl px-3 py-3 text-left transition-colors hover:bg-muted"
                          onClick={() => handleSearchSelect(item.href)}
                        >
                          <div className="text-sm font-semibold text-foreground">{item.label}</div>
                          <div className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-4 text-sm text-muted-foreground">
                        No matching pages yet. Try a topic, market, or platform feature.
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`hidden lg:flex items-center gap-3 rounded-xl py-2.5 pl-3 pr-4 backdrop-blur-sm transition-colors ${
                    useLightStyle
                      ? "border border-border bg-white text-foreground hover:bg-muted"
                      : "border border-white/15 bg-white/10 text-white hover:bg-white/15"
                  }`}>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      useLightStyle ? "bg-primary/10 text-primary" : "bg-white/90 text-primary"
                    }`}>
                      {initials}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium leading-none">{user.name || "Demo User"}</div>
                      <div className={`mt-0.5 text-[11px] ${useLightStyle ? "text-muted-foreground" : "text-white/68"}`}>{user.email || "demo@regenify.com"}</div>
                    </div>
                    <ChevronDown className={`h-3 w-3 ${useLightStyle ? "text-muted-foreground" : "text-white/70"}`} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2.5 text-sm" onClick={() => { window.location.href = "/dashboard/account?view=profile"; }}>
                    <User className="h-3.5 w-3.5" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2.5 text-sm" onClick={() => { window.location.href = "/dashboard/account?view=portfolio"; }}>
                    <Wallet className="h-3.5 w-3.5" /> My WBX Portfolio
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2.5 text-sm" onClick={() => { window.location.href = "/dashboard/account?view=settings"; }}>
                    <Settings className="h-3.5 w-3.5" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2.5 text-sm" onClick={() => { window.location.href = "/dashboard/account?view=support"; }}>
                    <HelpCircle className="h-3.5 w-3.5" /> Help & Support
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2.5 text-sm text-destructive focus:text-destructive" onClick={() => { window.location.href = "/logout"; }}>
                    <LogOut className="h-3.5 w-3.5" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`hidden lg:flex text-sm font-medium ${
                    useLightStyle ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/10"
                  }`}
                  onClick={() => {
                    window.location.href = "/login";
                  }}
                >
                  Log In
                </Button>

                <Button
                  size="sm"
                  className="hidden lg:flex whitespace-nowrap text-sm font-semibold bg-primary px-4 hover:bg-primary/90 text-white shadow-brand"
                  onClick={() => {
                    window.location.href = "/login?mode=create-account";
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              className={`lg:hidden p-2 rounded-lg ${useLightStyle ? "text-foreground" : "text-white"}`}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-border shadow-lg max-h-[80vh] overflow-y-auto">
          <div className="container py-4 space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleSearchSubmit();
                    setMobileOpen(false);
                  }
                }}
                placeholder="Search pages, topics, markets..."
                className="h-12 rounded-2xl border-border pl-11"
              />
              {searchValue.trim() && searchResults.length ? (
                <div className="mt-2 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
                  {searchResults.slice(0, 4).map((item) => (
                    <button
                      key={`${item.label}-${item.href}-mobile`}
                      className="w-full border-b border-border px-4 py-3 text-left last:border-b-0"
                      onClick={() => {
                        setMobileOpen(false);
                        handleSearchSelect(item.href);
                      }}
                    >
                      <div className="text-sm font-semibold text-foreground">{item.label}</div>
                      <div className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</div>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {publicHighlights.map((item) => (
              <button
                key={item.label}
                className="flex w-full items-start gap-3 rounded-2xl border border-border bg-muted/30 px-4 py-3 text-left"
                onClick={() => {
                  setMobileOpen(false);
                  navigate(resolveAuthenticatedHref(item.href, isAuthenticated));
                }}
              >
                {item.icon ? (
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <item.icon className="h-4 w-4" />
                  </div>
                ) : null}
                <div>
                  <div className="text-sm font-medium text-foreground">{item.label}</div>
                  <div className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</div>
                </div>
              </button>
            ))}

            {publicNavigation.map((item) => (
              <div key={item.label}>
                {item.href ? (
                  <button
                    className="w-full px-3 py-2.5 text-left text-[15px] font-medium text-foreground hover:bg-muted rounded-lg"
                    onClick={() => {
                      setMobileOpen(false);
                      navigate(item.href!);
                    }}
                  >
                    {item.label}
                  </button>
                ) : (
                  <>
                    <button
                      className="w-full flex items-center justify-between px-3 py-2.5 text-[15px] font-medium text-foreground hover:bg-muted rounded-lg"
                      onClick={() => setActiveMenu(activeMenu === item.label ? null : item.label)}
                    >
                      <span>{item.label}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${activeMenu === item.label ? "rotate-180" : ""}`} />
                    </button>
                    {activeMenu === item.label && (
                      <div className="ml-4 mt-1 space-y-0.5">
                        {item.items.map((sub) => (
                          <button
                            key={sub.label}
                            className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                            onClick={() => {
                              setMobileOpen(false);
                              navigate(resolveAuthenticatedHref(sub.href, isAuthenticated));
                            }}
                          >
                            <div className="font-medium text-foreground">{sub.label}</div>
                            {sub.description ? (
                              <div className="mt-0.5 text-xs leading-5 text-muted-foreground">{sub.description}</div>
                            ) : null}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              <Button variant="outline" className="w-full" onClick={() => navigate("/discover")}>Discover</Button>
              <Button variant="outline" className="w-full" onClick={() => navigate("/login")}>Log In</Button>
              <Button className="w-full bg-primary text-white" onClick={() => {
                window.location.href = "/login?mode=create-account";
              }}>Sign Up</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
