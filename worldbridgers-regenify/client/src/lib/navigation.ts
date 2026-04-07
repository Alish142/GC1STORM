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
    label: "Platform",
    icon: LayoutDashboard,
    items: [
      {
        label: "Platform Overview",
        href: "/login?next=/dashboard",
        description: "Enter the main intelligence workspace.",
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
    label: "Data Rooms",
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
    label: "Access",
    icon: ShieldCheck,
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
        description: "Send an access request for onboarding.",
        icon: ShieldCheck,
      },
      {
        label: "Contact Support",
        href: "/login?mode=request-access",
        description: "Reach the team for setup or onboarding help.",
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
