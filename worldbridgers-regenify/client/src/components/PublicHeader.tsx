import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, Menu, X, Leaf } from "lucide-react";
import { getLoginUrl } from "@/const";

const NAV_ITEMS = [
  {
    label: "Systems Overview",
    items: ["Platform Architecture", "ESG Framework", "Data Infrastructure", "API Access"],
  },
  {
    label: "List Your Offering",
    items: ["Bonds & Securities", "Funds & ETFs", "Equity Offerings", "Structured Products"],
  },
  {
    label: "Systems Finance",
    items: ["Regenerative Finance", "Impact Metrics", "Carbon Credits", "Sustainable Bonds"],
  },
  {
    label: "Our Offerings",
    items: ["Browse All", "Featured Issuers", "New Listings", "ESG Certified"],
  },
  {
    label: "Markets",
    items: ["Live Markets", "Market Indices", "Regional Markets", "Sector Analysis"],
  },
  {
    label: "Live Data",
    items: ["Real-time Feeds", "Historical Data", "Analytics", "Reports"],
  },
  {
    label: "WBX Exchange",
    items: ["Trading Platform", "Order Book", "Settlement", "Custody"],
  },
  {
    label: "Specialists",
    items: ["Meet the Team", "Advisory Board", "Research Desk", "Contact"],
  },
];

export default function PublicHeader() {
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-brand">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <div className="leading-none">
              <span className={`font-bold text-sm tracking-tight ${scrolled ? "text-foreground" : "text-white"}`}>
                Worldbridgers
              </span>
              <span className={`block text-[10px] font-medium tracking-widest uppercase ${scrolled ? "text-primary" : "text-green-300"}`}>
                Regenify
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-0.5">
            {NAV_ITEMS.map((item, i) => (
              <div key={i} className="relative">
                <button
                  className={`flex items-center gap-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    scrolled
                      ? "text-foreground/70 hover:text-foreground hover:bg-muted"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  } ${activeMenu === i ? (scrolled ? "text-primary bg-primary/8" : "text-white bg-white/15") : ""}`}
                  onMouseEnter={() => setActiveMenu(i)}
                  onClick={() => setActiveMenu(activeMenu === i ? null : i)}
                >
                  {item.label}
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${activeMenu === i ? "rotate-180" : ""}`}
                  />
                </button>

                {activeMenu === i && (
                  <div
                    className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-card-hover border border-border py-1.5 z-50 animate-fade-in"
                    onMouseLeave={() => setActiveMenu(null)}
                  >
                    {item.items.map((sub, j) => (
                      <button
                        key={j}
                        className="w-full text-left px-4 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
                        onClick={() => { setActiveMenu(null); navigate("/login"); }}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative hidden md:flex items-center">
              {searchOpen ? (
                <input
                  autoFocus
                  placeholder="Search platform..."
                  className="w-48 h-8 pl-3 pr-8 text-sm rounded-lg border border-border bg-white/90 focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                  onBlur={() => setSearchOpen(false)}
                />
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className={`p-2 rounded-lg transition-colors ${
                    scrolled ? "text-foreground/60 hover:text-foreground hover:bg-muted" : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className={`hidden md:flex text-xs font-medium ${
                scrolled ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/10"
              }`}
              onClick={() => navigate("/login")}
            >
              Log In
            </Button>

            <Button
              size="sm"
              className="hidden md:flex text-xs font-semibold bg-primary hover:bg-primary/90 text-white shadow-brand"
              onClick={() => navigate("/login")}
            >
              Request Access
            </Button>

            {/* Mobile menu toggle */}
            <button
              className={`xl:hidden p-2 rounded-lg ${scrolled ? "text-foreground" : "text-white"}`}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="xl:hidden bg-white border-t border-border shadow-lg max-h-[80vh] overflow-y-auto">
          <div className="container py-4 space-y-1">
            {NAV_ITEMS.map((item, i) => (
              <div key={i}>
                <button
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-lg"
                  onClick={() => setActiveMenu(activeMenu === i ? null : i)}
                >
                  {item.label}
                  <ChevronDown className={`w-4 h-4 transition-transform ${activeMenu === i ? "rotate-180" : ""}`} />
                </button>
                {activeMenu === i && (
                  <div className="ml-4 mt-1 space-y-0.5">
                    {item.items.map((sub, j) => (
                      <button
                        key={j}
                        className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                        onClick={() => { setMobileOpen(false); navigate("/login"); }}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              <Button variant="outline" className="w-full" onClick={() => navigate("/login")}>Log In</Button>
              <Button className="w-full bg-primary text-white" onClick={() => navigate("/login")}>Request Access</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
