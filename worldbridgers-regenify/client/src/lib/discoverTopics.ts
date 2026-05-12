export type DiscoverTopic = {
  slug: string;
  title: string;
  graphNodeId: string;
  image: string;
  summary: string;
  overview: string;
  highlights: string[];
};

export const DISCOVER_TOPICS: DiscoverTopic[] = [
  {
    slug: "green-bonds",
    title: "Green Bonds",
    graphNodeId: "issuer-eib",
    image: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=80",
    summary: "Explore bond structures designed to finance environmental outcomes and sustainable infrastructure.",
    overview: "Green Bonds pages introduce how climate-aligned debt instruments support transparent allocation toward regenerative and sustainability-focused projects.",
    highlights: [
      "Sustainable debt structures tied to environmental use-of-proceeds",
      "Public overview of how green-labelled instruments are presented on the platform",
      "Clear framing for visitors before deeper product exploration",
    ],
  },
  {
    slug: "transition-finance",
    title: "Transition Finance",
    graphNodeId: "investor-us-climate",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    summary: "Understand financing pathways that support high-impact sectors moving toward lower-carbon operations.",
    overview: "Transition Finance explains how the platform frames capital allocation around credible change pathways and measurable progress signals.",
    highlights: [
      "Capital structures supporting sector transition journeys",
      "Public explanation of how transition themes fit the platform",
      "Useful context for issuers and investors assessing readiness",
    ],
  },
  {
    slug: "climate-issuers",
    title: "Climate Issuers",
    graphNodeId: "investor-us-climate",
    image: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&w=1200&q=80",
    summary: "View the issuer landscape through a climate-focused lens spanning sectors, markets, and opportunity sets.",
    overview: "Climate Issuers gives visitors a public narrative around organisations active in climate-linked finance and market participation.",
    highlights: [
      "Climate-focused issuer discovery",
      "Cross-market context for issuer participation",
      "A cleaner public story before users enter protected data views",
    ],
  },
  {
    slug: "impact-capital",
    title: "Impact Capital",
    graphNodeId: "investor-impact-asia",
    image: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
    summary: "See how capital can be aligned with measurable environmental and social outcomes across regenerative themes.",
    overview: "Impact Capital introduces how the platform connects allocators with mission-led opportunities and ecosystem outcomes.",
    highlights: [
      "Mission-aligned allocation framing",
      "Public explanation of capital-to-impact pathways",
      "Accessible story for visitors exploring purpose-driven investing",
    ],
  },
  {
    slug: "sustainable-indices",
    title: "Sustainable Indices",
    graphNodeId: "theme-3",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    summary: "Learn how index views help users understand performance, benchmarks, and comparative market movement.",
    overview: "Sustainable Indices explains how benchmark intelligence supports the platform’s market context and live analytics story.",
    highlights: [
      "Index-based market visibility",
      "Sustainable benchmark framing for public visitors",
      "Foundation for deeper live-data workflows after login",
    ],
  },
  {
    slug: "biodiversity",
    title: "Biodiversity",
    graphNodeId: "opportunity-carbon",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
    summary: "Explore biodiversity-linked opportunities and narratives within regenerative finance ecosystems.",
    overview: "Biodiversity provides a public-facing lens on nature-positive themes and how they appear across offerings, issuers, and capital interest.",
    highlights: [
      "Nature-positive opportunity framing",
      "Public explanation of biodiversity relevance",
      "Clear thematic context without requiring sign-in",
    ],
  },
  {
    slug: "carbon-markets",
    title: "Carbon Markets",
    graphNodeId: "opportunity-carbon",
    image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80",
    summary: "Understand how carbon-linked opportunities, issuers, and instruments fit into the wider market picture.",
    overview: "Carbon Markets introduces visitors to the regenerative finance role of carbon-linked activity and related discovery pathways.",
    highlights: [
      "Carbon-market context for public visitors",
      "Connections between themes, issuers, and opportunity types",
      "A gateway into more advanced protected research later",
    ],
  },
  {
    slug: "document-intelligence",
    title: "Document Intelligence",
    graphNodeId: "issuer-ngc",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80",
    summary: "See how disclosure materials, filings, and supporting records add context and trust to market participation.",
    overview: "Document Intelligence explains how public and private document workflows strengthen transparency, review, and confidence.",
    highlights: [
      "Document-backed discovery and trust signals",
      "Public explanation of disclosure-centered workflows",
      "A bridge from storytelling to regulated detail",
    ],
  },
  {
    slug: "regen-finance",
    title: "Regen Finance",
    graphNodeId: "theme-1",
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=80",
    summary: "Learn how regenerative finance is framed through ecosystems, communities, and long-term restoration outcomes.",
    overview: "Regen Finance gives visitors a public explanation of the mission at the center of the Worldbridgers experience.",
    highlights: [
      "Mission-first regenerative framing",
      "Clear connection between finance and restorative outcomes",
      "Easy public explanation of platform purpose",
    ],
  },
  {
    slug: "apac-markets",
    title: "APAC Markets",
    graphNodeId: "market-apac",
    image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80",
    summary: "Explore how APAC regional activity contributes to the global opportunity set on the platform.",
    overview: "APAC Markets gives public visitors regional context around market movement, issuer participation, and thematic growth.",
    highlights: [
      "Regional discovery for APAC-focused users",
      "Cross-border context inside a global platform",
      "Stronger public understanding of regional reach",
    ],
  },
  {
    slug: "infrastructure",
    title: "Infrastructure",
    graphNodeId: "issuer-eib",
    image: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
    summary: "See how infrastructure themes connect with capital formation, sustainable development, and resilience outcomes.",
    overview: "Infrastructure introduces how real-world assets and long-term development projects appear within the platform narrative.",
    highlights: [
      "Infrastructure as a core regenerative finance theme",
      "Public framing for long-horizon development projects",
      "A practical bridge between policy, assets, and market activity",
    ],
  },
  {
    slug: "social-bonds",
    title: "Social Bonds",
    graphNodeId: "theme-2",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
    summary: "Understand how social-labelled instruments support communities, inclusion, and measurable social outcomes.",
    overview: "Social Bonds helps public visitors see how social finance themes are presented alongside environmental and market themes.",
    highlights: [
      "Community and inclusion-focused bond narratives",
      "A public explanation of social-labelled instruments",
      "Stronger thematic breadth beyond climate-only framing",
    ],
  },
  {
    slug: "water-security",
    title: "Water Security",
    graphNodeId: "theme-3",
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
    summary: "Explore how water resilience and resource security appear inside regenerative market narratives.",
    overview: "Water Security gives public context around one of the most important long-term ecological and infrastructure themes.",
    highlights: [
      "Water resilience as a core systemic theme",
      "A public-friendly explanation of related opportunities",
      "Clear tie-in to restoration and long-term security",
    ],
  },
  {
    slug: "energy-transition",
    title: "Energy Transition",
    graphNodeId: "issuer-acf",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80",
    summary: "Understand how the platform frames opportunities connected to decarbonisation, electrification, and energy-system change.",
    overview: "Energy Transition helps visitors grasp how transition-oriented activity is represented across issuers, projects, and market themes.",
    highlights: [
      "Decarbonisation and energy-system context",
      "Public narrative around transition-linked opportunities",
      "Useful framing for investors and partners before login",
    ],
  },
  {
    slug: "nature-data",
    title: "Nature Data",
    graphNodeId: "opportunity-carbon",
    image: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=1200&q=80",
    summary: "See how nature-linked intelligence supports better thematic discovery, storytelling, and opportunity context.",
    overview: "Nature Data introduces visitors to the role of environmental intelligence inside the platform’s public and protected experiences.",
    highlights: [
      "Nature-focused intelligence as a discovery layer",
      "Public explanation of ecological data relevance",
      "A softer entry point into deeper regenerative workflows",
    ],
  },
];

export const DISCOVER_TOPICS_BY_SLUG = Object.fromEntries(
  DISCOVER_TOPICS.map((topic) => [topic.slug, topic])
) as Record<string, DiscoverTopic>;
