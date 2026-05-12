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
  href?: string;
  items: NavigationLink[];
};

export const publicNavigation: NavigationGroup[] = [
  {
    label: "About Us",
    icon: User,
    href: "/about",
    items: [
      {
        label: "Vision",
        href: "/about",
        description: "Learn the long-term regenerative vision behind the Worldbridgers Regenify platform.",
        icon: Globe2,
      },
      {
        label: "Team Members",
        href: "/about",
        description: "Meet the people guiding platform strategy, onboarding, and partnership support.",
        icon: User,
      },
      {
        label: "Themes",
        href: "/about",
        description: "Explore the core regenerative and ESG themes connected across the platform.",
        icon: Network,
      },
    ],
  },
  {
    label: "Platform",
    icon: LayoutDashboard,
    items: [
      {
        label: "Graph Relationship Engine",
        href: "/capabilities/graph-relationship-engine",
        description: "Explore how issuers, themes, and markets connect through public graph intelligence.",
        icon: LayoutDashboard,
      },
      {
        label: "EU Taxonomy Compliance",
        href: "/capabilities/eu-taxonomy-compliance",
        description: "Understand the public compliance and trust framework behind sustainable offerings.",
        icon: ShieldCheck,
      },
      {
        label: "Real-time Market Data",
        href: "/capabilities/real-time-market-data",
        description: "See how live benchmark and market context supports the public platform story.",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "Offerings",
    icon: Layers,
    items: [
      {
        label: "Green Bonds",
        href: "/discover/green-bonds",
        description: "Explore public information on green-labelled instruments and climate-aligned financing.",
        icon: Layers,
      },
      {
        label: "Transition Finance",
        href: "/discover/transition-finance",
        description: "Understand how transition pathways are presented to public visitors.",
        icon: Building2,
      },
      {
        label: "Impact Capital",
        href: "/discover/impact-capital",
        description: "See how capital is aligned with measurable regenerative and social outcomes.",
        icon: FileText,
      },
    ],
  },
  {
    label: "Markets",
    icon: Globe2,
    items: [
      {
        label: "APAC Markets",
        href: "/discover/apac-markets",
        description: "Explore regional opportunity context and market activity across APAC.",
        icon: Globe2,
      },
      {
        label: "Sustainable Indices",
        href: "/discover/sustainable-indices",
        description: "Understand benchmark context and public-facing market analytics themes.",
        icon: BarChart3,
      },
      {
        label: "Carbon Markets",
        href: "/discover/carbon-markets",
        description: "Learn how carbon-linked opportunities fit into the wider public market picture.",
        icon: ShieldCheck,
      },
    ],
  },
  {
    label: "Discover",
    icon: Network,
    href: "/discover",
    items: [],
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
