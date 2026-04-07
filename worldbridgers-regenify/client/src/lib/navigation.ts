import {
  BarChart3,
  Building2,
  FileText,
  Globe2,
  HelpCircle,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  Network,
  Settings,
  ShieldCheck,
  User,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavigationLink = {
  label: string;
  href: string;
  description?: string;
  icon?: LucideIcon;
};

export type NavigationGroup = {
  label: string;
  icon: LucideIcon;
  items: NavigationLink[];
};

export const publicNavigation: NavigationGroup[] = [
  {
    label: "Systems Overview",
    icon: LayoutDashboard,
    items: [
      {
        label: "Platform Overview",
        href: "/login?next=/dashboard",
        description: "Understand the Worldbridgers Regenify platform and its main market workflows.",
        icon: LayoutDashboard,
      },
      {
        label: "Relationship Graph",
        href: "/login?next=/dashboard/graph",
        description: "Explore connected issuers, themes, and markets.",
        icon: Network,
      },
      {
        label: "Market Indices",
        href: "/login?next=/dashboard/indices",
        description: "Review live sustainable index performance.",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "List Your Offering",
    icon: Layers,
    items: [
      {
        label: "Active Offerings",
        href: "/login?next=/dashboard/offerings",
        description: "Access active offerings and structured products.",
        icon: Layers,
      },
      {
        label: "Issuer Profiles",
        href: "/login?next=/dashboard/issuers",
        description: "Browse verified issuer profiles and labelled instruments.",
        icon: Building2,
      },
      {
        label: "Supporting Documents",
        href: "/login?next=/dashboard/documents",
        description: "Open filing packs, notices, supplements, and disclosures.",
        icon: FileText,
      },
    ],
  },
  {
    label: "Systems Finance",
    icon: ShieldCheck,
    items: [
      {
        label: "Sustainable Indices",
        href: "/login?next=/dashboard/indices",
        description: "Review live sustainable index performance and benchmark movement.",
        icon: BarChart3,
      },
      {
        label: "Market Signals",
        href: "/login?next=/dashboard",
        description: "See live platform signals, readiness indicators, and regional activity.",
        icon: Globe2,
      },
      {
        label: "Compliance Signals",
        href: "/login?next=/dashboard/documents",
        description: "Keep taxonomy, SFDR, and document-backed trust cues visible.",
        icon: ShieldCheck,
      },
    ],
  },
  {
    label: "Our Offerings",
    icon: FileText,
    items: [
      {
        label: "Issuers",
        href: "/login?next=/dashboard/issuers",
        description: "Browse verified issuer profiles and labels.",
        icon: Building2,
      },
      {
        label: "Offerings",
        href: "/login?next=/dashboard/offerings",
        description: "Access active offerings and structured products.",
        icon: Layers,
      },
      {
        label: "Documents",
        href: "/login?next=/dashboard/documents",
        description: "Open filings, notices, and supplements.",
        icon: FileText,
      },
    ],
  },
  {
    label: "Markets",
    icon: Globe2,
    items: [
      {
        label: "Europe",
        href: "/login?next=/dashboard/indices",
        description: "Explore European market data, issuers, and benchmark activity.",
        icon: Globe2,
      },
      {
        label: "APAC",
        href: "/login?next=/dashboard/offerings",
        description: "Follow APAC offering velocity, thematic issuers, and growth segments.",
        icon: Globe2,
      },
      {
        label: "Americas",
        href: "/login?next=/dashboard/graph",
        description: "See market relationships, investors, and opportunity clusters across the Americas.",
        icon: Globe2,
      },
    ],
  },
  {
    label: "Live Data",
    icon: BarChart3,
    items: [
      {
        label: "Indices Dashboard",
        href: "/login?next=/dashboard/indices",
        description: "Review benchmark movement and live sustainable index data.",
        icon: BarChart3,
      },
      {
        label: "Documents Feed",
        href: "/login?next=/dashboard/documents",
        description: "Track newly available filings and structured disclosure documents.",
        icon: FileText,
      },
      {
        label: "Graph Intelligence",
        href: "/login?next=/dashboard/graph",
        description: "Move into the relationship map with connected entities and themes.",
        icon: Network,
      },
    ],
  },
  {
    label: "WBX Exchange",
    icon: Wallet,
    items: [
      {
        label: "Exchange Dashboard",
        href: "/login?next=/dashboard",
        description: "Enter the Worldbridgers exchange workspace and high-level overview.",
        icon: Wallet,
      },
      {
        label: "My WBX Portfolio",
        href: "/login?next=/dashboard/account?view=portfolio",
        description: "Open saved holdings, watched entities, and tracked market items.",
        icon: Wallet,
      },
      {
        label: "Relationship Explorer",
        href: "/login?next=/dashboard/graph",
        description: "Navigate the exchange through intelligent network relationships.",
        icon: Network,
      },
    ],
  },
  {
    label: "Specialists",
    icon: LifeBuoy,
    items: [
      {
        label: "Log In",
        href: "/login",
        description: "Sign in with your existing account.",
        icon: User,
      },
      {
        label: "Request Access",
        href: "/login?mode=request-access",
        description: "Send an access request for onboarding and workspace access.",
        icon: ShieldCheck,
      },
      {
        label: "Contact Support",
        href: "/login?mode=request-access",
        description: "Reach the team for setup, onboarding, or specialist guidance.",
        icon: LifeBuoy,
      },
    ],
  },
];

export const dashboardNavigation: NavigationGroup[] = [
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
    label: "Workspace",
    icon: Wallet,
    items: [
      {
        label: "My Profile",
        href: "/dashboard/account?view=profile",
        icon: User,
      },
      {
        label: "Portfolio",
        href: "/dashboard/account?view=portfolio",
        icon: Wallet,
      },
      {
        label: "Settings",
        href: "/dashboard/account?view=settings",
        icon: Settings,
      },
      {
        label: "Support",
        href: "/dashboard/account?view=support",
        icon: HelpCircle,
      },
    ],
  },
];

export const dashboardQuickLinks: NavigationLink[] = [
  { label: "Issuers", href: "/dashboard/issuers" },
  { label: "Offerings", href: "/dashboard/offerings" },
  { label: "Indices", href: "/dashboard/indices" },
  { label: "Graph", href: "/dashboard/graph" },
  { label: "Account", href: "/dashboard/account?view=profile" },
];

export const publicHighlights: NavigationLink[] = [
  {
    label: "Global Coverage",
    href: "/login?next=/dashboard/issuers",
    description: "Europe, APAC, the Americas, Africa, and the Middle East.",
    icon: Globe2,
  },
  {
    label: "Compliance",
    href: "/login?next=/dashboard/documents",
    description: "EU Taxonomy, SFDR, and document-backed workflows.",
    icon: ShieldCheck,
  },
  {
    label: "Analytics",
    href: "/login?next=/dashboard/indices",
    description: "Live markets, benchmark trends, and performance views.",
    icon: BarChart3,
  },
];
