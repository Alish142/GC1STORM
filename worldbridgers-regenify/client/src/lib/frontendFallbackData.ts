export type Issuer = {
  id: string;
  name: string;
  country: string;
  region: string;
  classification: string;
  wbxLabel: boolean;
  euTaxonomy: boolean;
  assets: string;
};

export type Offering = {
  id: string;
  type: string;
  segment: string;
  issuer: string;
  isin: string;
  name: string;
  issuedAmount: number;
  currency: string;
  listingDate: string;
  wbxClassification: string;
  coupon: number | null;
  lastPrice: number;
  delisted: boolean;
};

export type MarketIndex = {
  id: string;
  type: string;
  name: string;
  last: number;
  changePercent: number;
  change: number;
  monthHigh: number;
  monthLow: number;
  yearHigh: number;
  yearLow: number;
  currency: string;
};

export type DocumentRecord = {
  id: string;
  type: string;
  subType: string;
  name: string;
  issuer: string;
  memberStates: string[];
  date: string;
  fileSize: string;
};

export type GraphNode = {
  id: string;
  label: string;
  type: "Issuer" | "Investor" | "Opportunity" | "Project" | "Market" | "Theme";
  region?: string;
  description?: string;
  value?: number;
  country?: string;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  label: string;
  weight?: number;
};

export const demoUser = {
  id: 9999,
  openId: "demo-regenify-user-9999",
  name: "Demo User",
  email: "demo@regenify.com",
  role: "user",
};

export const fallbackIssuers: Issuer[] = [
  { id: "i1", name: "European Investment Bank", country: "Luxembourg", region: "Europe", classification: "SSA", wbxLabel: true, euTaxonomy: true, assets: "EUR 600B" },
  { id: "i2", name: "Nordic Green Capital", country: "Sweden", region: "Europe", classification: "Financial", wbxLabel: true, euTaxonomy: true, assets: "EUR 45B" },
  { id: "i3", name: "Pacific Regenerative Trust", country: "Australia", region: "Pacific", classification: "Community", wbxLabel: false, euTaxonomy: false, assets: "AUD 2.1B" },
  { id: "i4", name: "Asia Climate Fund", country: "Singapore", region: "Asia", classification: "Financial", wbxLabel: false, euTaxonomy: false, assets: "SGD 8B" },
  { id: "i5", name: "Regenify Infrastructure Corp", country: "Canada", region: "North America", classification: "Corporate", wbxLabel: true, euTaxonomy: true, assets: "CAD 5B" },
  { id: "i6", name: "African Development Finance", country: "South Africa", region: "Africa", classification: "SSA", wbxLabel: false, euTaxonomy: false, assets: "USD 35B" },
  { id: "i7", name: "Iberian Green Corp", country: "Spain", region: "Europe", classification: "Corporate", wbxLabel: true, euTaxonomy: true, assets: "EUR 18B" },
  { id: "i8", name: "Amazon Basin Trust", country: "Brazil", region: "South America", classification: "Community", wbxLabel: false, euTaxonomy: false, assets: "BRL 8B" },
];

export const fallbackOfferings: Offering[] = [
  { id: "o1", type: "Bonds", segment: "Green Bond", issuer: "European Investment Bank", isin: "XS2345678901", name: "EIB Climate Awareness Bond 2031", issuedAmount: 3000000000, currency: "EUR", listingDate: "2021-03-15", wbxClassification: "Climate", coupon: 0.375, lastPrice: 98.45, delisted: false },
  { id: "o2", type: "Bonds", segment: "Social Bond", issuer: "Nordic Green Capital", isin: "SE0012345678", name: "Nordic Social Growth Bond 2029", issuedAmount: 1200000000, currency: "EUR", listingDate: "2022-05-11", wbxClassification: "Social", coupon: 0.92, lastPrice: 99.14, delisted: false },
  { id: "o3", type: "Funds", segment: "ESG Fund", issuer: "Asia Climate Fund", isin: "SG0012345678", name: "Asia Climate Transition Fund", issuedAmount: 800000000, currency: "USD", listingDate: "2020-01-10", wbxClassification: "Sustainable", coupon: null, lastPrice: 142.3, delisted: false },
  { id: "o4", type: "Equities", segment: "Green Equity", issuer: "Iberian Green Corp", isin: "ES0123456789", name: "Iberian Renewables Equity", issuedAmount: 500000000, currency: "EUR", listingDate: "2019-09-05", wbxClassification: "Renewable", coupon: null, lastPrice: 24.67, delisted: false },
  { id: "o5", type: "Certificates", segment: "Carbon Certificate", issuer: "Pacific Regenerative Trust", isin: "AU0000123456", name: "Pacific Carbon Credit Certificate", issuedAmount: 250000000, currency: "AUD", listingDate: "2023-02-14", wbxClassification: "Carbon", coupon: null, lastPrice: 18.9, delisted: false },
  { id: "o6", type: "Funds", segment: "Infrastructure Fund", issuer: "Regenify Infrastructure Corp", isin: "CA0098765432", name: "Regenify Infrastructure Fund II", issuedAmount: 3500000000, currency: "CAD", listingDate: "2022-04-01", wbxClassification: "Infrastructure", coupon: null, lastPrice: 215.4, delisted: false },
  { id: "o7", type: "Bonds", segment: "Blue Bond", issuer: "Amazon Basin Trust", isin: "BR0012345678", name: "Amazon Basin Biodiversity Bond 2032", issuedAmount: 420000000, currency: "USD", listingDate: "2023-07-07", wbxClassification: "Biodiversity", coupon: 2.1, lastPrice: 96.75, delisted: false },
  { id: "o8", type: "Bonds", segment: "Development Bond", issuer: "African Development Finance", isin: "ZA0012345678", name: "ADF Resilience Bond 2035", issuedAmount: 950000000, currency: "USD", listingDate: "2020-05-18", wbxClassification: "Development", coupon: 2.45, lastPrice: 97.05, delisted: false },
];

export const fallbackIndices: MarketIndex[] = [
  { id: "idx1", type: "WBX Indices", name: "WBX Europe Green Bond Index", last: 1124.5, changePercent: 1.24, change: 13.8, monthHigh: 1136, monthLow: 1089, yearHigh: 1184, yearLow: 980, currency: "EUR" },
  { id: "idx2", type: "Sustainable Indices", name: "MSCI World ESG Leaders", last: 3215.8, changePercent: -0.38, change: -12.3, monthHigh: 3280, monthLow: 3180, yearHigh: 3450, yearLow: 2980, currency: "USD" },
  { id: "idx3", type: "Regenify Indices", name: "Regenify Biodiversity Index", last: 524.6, changePercent: 2.15, change: 11.05, monthHigh: 535, monthLow: 498, yearHigh: 560, yearLow: 420, currency: "EUR" },
  { id: "idx4", type: "Average Bond Yield Indices", name: "WBX Green Bond Yield Avg", last: 2.845, changePercent: -0.12, change: -0.003, monthHigh: 2.92, monthLow: 2.78, yearHigh: 3.45, yearLow: 2.1, currency: "EUR" },
  { id: "idx5", type: "Social Indices", name: "WBX Social Impact Index", last: 987.45, changePercent: 0.67, change: 6.55, monthHigh: 1005, monthLow: 965, yearHigh: 1050, yearLow: 880, currency: "USD" },
  { id: "idx6", type: "Systems Indices", name: "WBX Systems Finance Index", last: 2340.1, changePercent: -1.05, change: -24.9, monthHigh: 2420, monthLow: 2290, yearHigh: 2600, yearLow: 2100, currency: "EUR" },
  { id: "idx7", type: "WBX Indices", name: "WBX Pacific Sustainability Index", last: 1456.2, changePercent: 0.88, change: 12.7, monthHigh: 1480, monthLow: 1410, yearHigh: 1520, yearLow: 1280, currency: "AUD" },
  { id: "idx8", type: "Regenify Indices", name: "Regenify Ocean Health Index", last: 445.2, changePercent: 0.95, change: 4.2, monthHigh: 460, monthLow: 425, yearHigh: 490, yearLow: 380, currency: "EUR" },
];

export const fallbackDocuments: DocumentRecord[] = [
  { id: "d1", type: "Offerings Documents", subType: "Prospectus Supplement", name: "EIB Climate Awareness Bond 2031 - Final Prospectus", issuer: "European Investment Bank", memberStates: ["DE", "FR", "LU", "NL"], date: "2021-03-10", fileSize: "2.4 MB" },
  { id: "d2", type: "Offerings Documents", subType: "Annual Reports", name: "Nordic Green Capital Annual Report 2024", issuer: "Nordic Green Capital", memberStates: ["SE", "NO", "DK", "FI"], date: "2025-02-28", fileSize: "8.1 MB" },
  { id: "d3", type: "Notices", subType: "Information Notice", name: "GreenBridge Capital - Interest Payment Notice Q1 2025", issuer: "GreenBridge Capital Partners", memberStates: ["DE", "AT"], date: "2025-01-15", fileSize: "0.3 MB" },
  { id: "d4", type: "Offerings Documents", subType: "Public Offer", name: "Iberian Green Corp Equity Offering Circular", issuer: "Iberian Green Corp", memberStates: ["ES", "PT"], date: "2019-08-25", fileSize: "4.7 MB" },
  { id: "d5", type: "Offerings Documents", subType: "Prospectus Supplement", name: "Pacific Carbon Certificate Base Terms", issuer: "Pacific Regenerative Trust", memberStates: ["AU", "NZ"], date: "2023-02-10", fileSize: "1.1 MB" },
  { id: "d6", type: "Notices", subType: "Publication", name: "WBX Exchange Regulatory Update - March 2025", issuer: "Worldbridgers Exchange", memberStates: ["EU"], date: "2025-03-01", fileSize: "0.5 MB" },
  { id: "d7", type: "Offerings Documents", subType: "Annual Reports", name: "Regenify Infrastructure Corp Annual Report 2024", issuer: "Regenify Infrastructure Corp", memberStates: ["CA"], date: "2025-03-15", fileSize: "12.3 MB" },
  { id: "d8", type: "Notices", subType: "Publication", name: "Regenify Platform - EU Taxonomy Alignment Report 2024", issuer: "Worldbridgers Exchange", memberStates: ["EU"], date: "2024-12-15", fileSize: "2.0 MB" },
];

export const fallbackGraphData: { nodes: GraphNode[]; edges: GraphEdge[] } = {
  nodes: [
    { id: "theme-1", label: "Entrepreneurship", type: "Theme", region: "Global", description: "Venture lifecycle and entrepreneurship ecosystems." },
    { id: "theme-2", label: "Social Justice", type: "Theme", region: "Global", description: "Inclusion and equity." },
    { id: "theme-3", label: "Sustainable Development", type: "Theme", region: "Global", description: "SDG pathways and systems change." },
    { id: "theme-4", label: "Future of Work", type: "Theme", region: "Global", description: "Labour transitions and reskilling." },
    { id: "issuer-eib", label: "European Investment Bank", type: "Issuer", region: "Europe", country: "Luxembourg", description: "Public development finance institution." },
    { id: "issuer-ngc", label: "Nordic Green Capital", type: "Issuer", region: "Europe", country: "Sweden", description: "Green finance issuer." },
    { id: "issuer-acf", label: "Asia Climate Fund", type: "Issuer", region: "Asia", country: "Singapore", description: "Climate-focused issuer." },
    { id: "investor-nordic", label: "Pension Fund Nordic", type: "Investor", region: "Europe", country: "Denmark", description: "Long-horizon institutional investor." },
    { id: "investor-impact-asia", label: "Impact Capital Asia", type: "Investor", region: "Asia", country: "Japan", description: "Impact-first investment manager." },
    { id: "investor-us-climate", label: "US Climate Fund", type: "Investor", region: "North America", country: "United States", description: "Climate transition investor." },
    { id: "market-apac", label: "APAC Market", type: "Market", region: "Asia", description: "Regional market network." },
    { id: "opportunity-carbon", label: "Carbon Opportunity", type: "Opportunity", region: "Global", description: "Carbon and biodiversity-linked opportunity." },
  ],
  edges: [
    { id: "e1", source: "theme-1", target: "theme-4", label: "INFLUENCES", weight: 3 },
    { id: "e2", source: "theme-3", target: "issuer-eib", label: "RELATED_ISSUER", weight: 2 },
    { id: "e3", source: "theme-3", target: "issuer-acf", label: "RELATED_ISSUER", weight: 2 },
    { id: "e4", source: "theme-4", target: "issuer-ngc", label: "RELATED_ISSUER", weight: 2 },
    { id: "e5", source: "theme-2", target: "investor-nordic", label: "RELATED_INVESTOR", weight: 2 },
    { id: "e6", source: "investor-impact-asia", target: "issuer-acf", label: "INVESTS_IN", weight: 3 },
    { id: "e7", source: "investor-us-climate", target: "issuer-eib", label: "INVESTS_IN", weight: 3 },
    { id: "e8", source: "market-apac", target: "issuer-acf", label: "LISTS", weight: 2 },
    { id: "e9", source: "opportunity-carbon", target: "issuer-ngc", label: "FUNDED_BY", weight: 2 },
  ],
};
