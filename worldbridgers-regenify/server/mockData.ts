// ── Mock Data for Worldbridgers Regenify ─────────────────────────────────────

export interface Issuer {
  id: string;
  name: string;
  country: string;
  region: string;
  classification: string;
  wbxLabel: boolean;
  euTaxonomy: boolean;
  description: string;
  founded: number;
  assets: string;
}

export interface Offering {
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
}

export interface Index {
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
}

export interface Document {
  id: string;
  type: string;
  subType: string;
  name: string;
  memberStates: string[];
  date: string;
  fileSize: string;
  issuer: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: "Issuer" | "Investor" | "Opportunity" | "Project" | "Market" | "Theme";
  region?: string;
  description?: string;
  value?: number;
  country?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  weight?: number;
}

// ── ISSUERS ──────────────────────────────────────────────────────────────────
export const mockIssuers: Issuer[] = [
  { id: "i1", name: "European Investment Bank", country: "Luxembourg", region: "Europe", classification: "SSA", wbxLabel: true, euTaxonomy: true, description: "Multilateral development bank of the EU", founded: 1958, assets: "€600B" },
  { id: "i2", name: "Nordic Green Capital", country: "Sweden", region: "Europe", classification: "Financial", wbxLabel: true, euTaxonomy: true, description: "Nordic sustainable finance institution", founded: 2012, assets: "€45B" },
  { id: "i3", name: "Pacific Regenerative Trust", country: "Australia", region: "Pacific", classification: "Community", wbxLabel: false, euTaxonomy: false, description: "Community-focused regenerative land trust", founded: 2018, assets: "A$2.1B" },
  { id: "i4", name: "GreenBridge Capital Partners", country: "Germany", region: "Europe", classification: "Financial", wbxLabel: true, euTaxonomy: true, description: "Impact-focused private equity", founded: 2010, assets: "€12B" },
  { id: "i5", name: "Civic Earth Foundation", country: "United Kingdom", region: "Europe", classification: "Civic Society", wbxLabel: true, euTaxonomy: false, description: "Civic society ESG advocacy and investment", founded: 2005, assets: "£800M" },
  { id: "i6", name: "Asia Climate Fund", country: "Singapore", region: "Asia", classification: "Financial", wbxLabel: false, euTaxonomy: false, description: "Pan-Asian climate transition fund", founded: 2016, assets: "SGD 8B" },
  { id: "i7", name: "Regenify Infrastructure Corp", country: "Canada", region: "North America", classification: "Corporate", wbxLabel: true, euTaxonomy: true, description: "Regenerative infrastructure developer", founded: 2014, assets: "CAD 5B" },
  { id: "i8", name: "African Development Finance", country: "South Africa", region: "Africa", classification: "SSA", wbxLabel: false, euTaxonomy: false, description: "Development finance for Sub-Saharan Africa", founded: 1964, assets: "USD 35B" },
  { id: "i9", name: "Andean Green Ventures", country: "Colombia", region: "South America", classification: "Corporate", wbxLabel: false, euTaxonomy: false, description: "Andean biodiversity investment vehicle", founded: 2020, assets: "USD 450M" },
  { id: "i10", name: "Middle East Sustainability Fund", country: "UAE", region: "Middle East", classification: "Financial", wbxLabel: true, euTaxonomy: false, description: "GCC region sustainability-linked finance", founded: 2019, assets: "USD 7B" },
  { id: "i11", name: "Benelux Social Bond Issuer", country: "Netherlands", region: "Europe", classification: "SSA", wbxLabel: true, euTaxonomy: true, description: "Social bond issuance for Benelux region", founded: 2008, assets: "€22B" },
  { id: "i12", name: "Tokyo Impact Finance", country: "Japan", region: "Asia", classification: "Financial", wbxLabel: false, euTaxonomy: false, description: "Japan ESG transition finance", founded: 2017, assets: "JPY 2.5T" },
  { id: "i13", name: "Oceania Community Bonds", country: "New Zealand", region: "Pacific", classification: "Community", wbxLabel: true, euTaxonomy: false, description: "Community bond issuance for Pacific region", founded: 2015, assets: "NZD 1.2B" },
  { id: "i14", name: "Iberian Green Corp", country: "Spain", region: "Europe", classification: "Corporate", wbxLabel: true, euTaxonomy: true, description: "Iberian renewable energy corporate", founded: 2011, assets: "€18B" },
  { id: "i15", name: "US Regenerative Ag Fund", country: "United States", region: "North America", classification: "Financial", wbxLabel: false, euTaxonomy: false, description: "Regenerative agriculture investment fund", founded: 2021, assets: "USD 3B" },
  { id: "i16", name: "East Africa Climate Bonds", country: "Kenya", region: "Africa", classification: "SSA", wbxLabel: false, euTaxonomy: false, description: "Climate bond issuance for East Africa", founded: 2018, assets: "USD 1.8B" },
  { id: "i17", name: "Baltic Sea Green Finance", country: "Finland", region: "Europe", classification: "Financial", wbxLabel: true, euTaxonomy: true, description: "Baltic region green finance institution", founded: 2013, assets: "€9B" },
  { id: "i18", name: "ASEAN Sustainability Corp", country: "Thailand", region: "Asia", classification: "Corporate", wbxLabel: false, euTaxonomy: false, description: "ASEAN sustainable development corporation", founded: 2016, assets: "USD 4.5B" },
  { id: "i19", name: "Alpine Regenerative Fund", country: "Switzerland", region: "Europe", classification: "Financial", wbxLabel: true, euTaxonomy: true, description: "Alpine ecosystem regeneration fund", founded: 2009, assets: "CHF 15B" },
  { id: "i20", name: "Amazon Basin Trust", country: "Brazil", region: "South America", classification: "Community", wbxLabel: false, euTaxonomy: false, description: "Amazon biodiversity and carbon trust", founded: 2017, assets: "BRL 8B" },
];

// ── OFFERINGS ────────────────────────────────────────────────────────────────
export const mockOfferings: Offering[] = [
  { id: "o1", type: "Bonds", segment: "Green Bond", issuer: "European Investment Bank", isin: "XS2345678901", name: "EIB Climate Awareness Bond 2031", issuedAmount: 3000000000, currency: "EUR", listingDate: "2021-03-15", wbxClassification: "Climate", coupon: 0.375, lastPrice: 98.45, delisted: false },
  { id: "o2", type: "Bonds", segment: "Social Bond", issuer: "Benelux Social Bond Issuer", isin: "XS2456789012", name: "BSB Social Impact Bond 2028", issuedAmount: 1500000000, currency: "EUR", listingDate: "2022-06-20", wbxClassification: "Social", coupon: 0.875, lastPrice: 99.12, delisted: false },
  { id: "o3", type: "Funds", segment: "ESG Fund", issuer: "Nordic Green Capital", isin: "SE0012345678", name: "Nordic Sustainable Leaders Fund", issuedAmount: 800000000, currency: "EUR", listingDate: "2020-01-10", wbxClassification: "Sustainable", coupon: null, lastPrice: 142.30, delisted: false },
  { id: "o4", type: "Equities", segment: "Green Equity", issuer: "Iberian Green Corp", isin: "ES0123456789", name: "Iberian Renewables Equity", issuedAmount: 500000000, currency: "EUR", listingDate: "2019-09-05", wbxClassification: "Renewable", coupon: null, lastPrice: 24.67, delisted: false },
  { id: "o5", type: "Bonds", segment: "Covered Bond", issuer: "GreenBridge Capital Partners", isin: "DE0098765432", name: "GreenBridge Covered Bond 2030", issuedAmount: 2000000000, currency: "EUR", listingDate: "2020-11-30", wbxClassification: "Climate", coupon: 0.5, lastPrice: 100.23, delisted: false },
  { id: "o6", type: "Certificates", segment: "Carbon Certificate", issuer: "Pacific Regenerative Trust", isin: "AU0000123456", name: "Pacific Carbon Credit Certificate", issuedAmount: 250000000, currency: "AUD", listingDate: "2023-02-14", wbxClassification: "Carbon", coupon: null, lastPrice: 18.90, delisted: false },
  { id: "o7", type: "Bonds", segment: "Sustainability Bond", issuer: "Asia Climate Fund", isin: "SG0012345678", name: "ACF Sustainability Bond 2029", issuedAmount: 1200000000, currency: "USD", listingDate: "2021-07-22", wbxClassification: "Sustainable", coupon: 1.25, lastPrice: 97.88, delisted: false },
  { id: "o8", type: "Funds", segment: "Infrastructure Fund", issuer: "Regenify Infrastructure Corp", isin: "CA0098765432", name: "Regenify Infrastructure Fund II", issuedAmount: 3500000000, currency: "CAD", listingDate: "2022-04-01", wbxClassification: "Infrastructure", coupon: null, lastPrice: 215.40, delisted: false },
  { id: "o9", type: "Warrants", segment: "Green Warrant", issuer: "Nordic Green Capital", isin: "SE0087654321", name: "Nordic Green Warrant 2025", issuedAmount: 100000000, currency: "EUR", listingDate: "2023-08-15", wbxClassification: "Sustainable", coupon: null, lastPrice: 4.22, delisted: false },
  { id: "o10", type: "Bonds", segment: "Blue Bond", issuer: "Oceania Community Bonds", isin: "NZ0012345678", name: "Oceania Ocean Health Bond 2032", issuedAmount: 400000000, currency: "NZD", listingDate: "2022-09-30", wbxClassification: "Ocean", coupon: 2.1, lastPrice: 96.75, delisted: false },
  { id: "o11", type: "Equities", segment: "Impact Equity", issuer: "US Regenerative Ag Fund", isin: "US0123456789", name: "RegenAg Impact Equity", issuedAmount: 750000000, currency: "USD", listingDate: "2023-01-20", wbxClassification: "Agriculture", coupon: null, lastPrice: 31.45, delisted: false },
  { id: "o12", type: "Bonds", segment: "Transition Bond", issuer: "Tokyo Impact Finance", isin: "JP0012345678", name: "TIF Transition Bond 2027", issuedAmount: 500000000000, currency: "JPY", listingDate: "2021-12-01", wbxClassification: "Transition", coupon: 0.15, lastPrice: 99.55, delisted: false },
  { id: "o13", type: "Certificates", segment: "ESG Certificate", issuer: "Alpine Regenerative Fund", isin: "CH0012345678", name: "Alpine ESG Linked Certificate", issuedAmount: 300000000, currency: "CHF", listingDate: "2022-03-10", wbxClassification: "Sustainable", coupon: null, lastPrice: 107.80, delisted: false },
  { id: "o14", type: "Bonds", segment: "Development Bond", issuer: "African Development Finance", isin: "ZA0012345678", name: "ADF Development Bond 2035", issuedAmount: 2000000000, currency: "USD", listingDate: "2020-05-25", wbxClassification: "Development", coupon: 3.5, lastPrice: 94.20, delisted: false },
  { id: "o15", type: "Funds", segment: "Biodiversity Fund", issuer: "Amazon Basin Trust", isin: "BR0012345678", name: "Amazon Biodiversity Fund", issuedAmount: 1000000000, currency: "BRL", listingDate: "2023-06-15", wbxClassification: "Biodiversity", coupon: null, lastPrice: 88.60, delisted: false },
  { id: "o16", type: "Bonds", segment: "Green Bond", issuer: "Baltic Sea Green Finance", isin: "FI0012345678", name: "Baltic Green Bond 2030", issuedAmount: 750000000, currency: "EUR", listingDate: "2021-10-05", wbxClassification: "Climate", coupon: 0.625, lastPrice: 99.10, delisted: false },
  { id: "o17", type: "Equities", segment: "Sustainability Equity", issuer: "ASEAN Sustainability Corp", isin: "TH0012345678", name: "ASEAN Sustainability Equity", issuedAmount: 600000000, currency: "USD", listingDate: "2022-11-20", wbxClassification: "Sustainable", coupon: null, lastPrice: 15.30, delisted: false },
  { id: "o18", type: "Bonds", segment: "Social Bond", issuer: "Civic Earth Foundation", isin: "GB0012345678", name: "Civic Earth Social Bond 2026", issuedAmount: 500000000, currency: "GBP", listingDate: "2021-04-12", wbxClassification: "Social", coupon: 1.0, lastPrice: 98.75, delisted: false },
  { id: "o19", type: "Certificates", segment: "Climate Certificate", issuer: "Middle East Sustainability Fund", isin: "AE0012345678", name: "MESF Climate Linked Certificate", issuedAmount: 400000000, currency: "USD", listingDate: "2023-03-25", wbxClassification: "Climate", coupon: null, lastPrice: 102.45, delisted: false },
  { id: "o20", type: "Bonds", segment: "Green Bond", issuer: "Andean Green Ventures", isin: "CO0012345678", name: "Andean Biodiversity Bond 2029", issuedAmount: 200000000, currency: "USD", listingDate: "2022-07-08", wbxClassification: "Biodiversity", coupon: 4.25, lastPrice: 91.30, delisted: false },
  { id: "o21", type: "Bonds", segment: "Delisted Bond", issuer: "East Africa Climate Bonds", isin: "KE0012345678", name: "EACB Climate Bond 2023 (Delisted)", issuedAmount: 300000000, currency: "USD", listingDate: "2018-01-15", wbxClassification: "Climate", coupon: 5.0, lastPrice: 100.00, delisted: true },
];

// ── INDICES ──────────────────────────────────────────────────────────────────
export const mockIndices: Index[] = [
  { id: "idx1", type: "WBX Indices", name: "WBX Global Regenify Index", last: 1842.35, changePercent: 1.24, change: 22.55, monthHigh: 1860.00, monthLow: 1790.20, yearHigh: 1920.50, yearLow: 1620.00, currency: "EUR" },
  { id: "idx2", type: "Sustainable Indices", name: "MSCI World ESG Leaders", last: 3215.80, changePercent: -0.38, change: -12.30, monthHigh: 3280.00, monthLow: 3180.00, yearHigh: 3450.00, yearLow: 2980.00, currency: "USD" },
  { id: "idx3", type: "Regenify Indices", name: "Regenify Biodiversity Index", last: 524.60, changePercent: 2.15, change: 11.05, monthHigh: 535.00, monthLow: 498.00, yearHigh: 560.00, yearLow: 420.00, currency: "EUR" },
  { id: "idx4", type: "Average Bond Yield Indices", name: "WBX Green Bond Yield Avg", last: 2.845, changePercent: -0.12, change: -0.003, monthHigh: 2.92, monthLow: 2.78, yearHigh: 3.45, yearLow: 2.10, currency: "EUR" },
  { id: "idx5", type: "Social Indices", name: "WBX Social Impact Index", last: 987.45, changePercent: 0.67, change: 6.55, monthHigh: 1005.00, monthLow: 965.00, yearHigh: 1050.00, yearLow: 880.00, currency: "USD" },
  { id: "idx6", type: "Systems Indices", name: "WBX Systems Finance Index", last: 2340.10, changePercent: -1.05, change: -24.90, monthHigh: 2420.00, monthLow: 2290.00, yearHigh: 2600.00, yearLow: 2100.00, currency: "EUR" },
  { id: "idx7", type: "WBX Indices", name: "WBX Pacific Sustainability Index", last: 1456.20, changePercent: 0.88, change: 12.70, monthHigh: 1480.00, monthLow: 1410.00, yearHigh: 1520.00, yearLow: 1280.00, currency: "AUD" },
  { id: "idx8", type: "Sustainable Indices", name: "Bloomberg SASB ESG Index", last: 4521.30, changePercent: -0.22, change: -10.05, monthHigh: 4600.00, monthLow: 4450.00, yearHigh: 4800.00, yearLow: 4100.00, currency: "USD" },
  { id: "idx9", type: "Regenify Indices", name: "Regenify Carbon Transition Index", last: 312.80, changePercent: 3.42, change: 10.35, monthHigh: 320.00, monthLow: 285.00, yearHigh: 345.00, yearLow: 240.00, currency: "EUR" },
  { id: "idx10", type: "Average Bond Yield Indices", name: "WBX Social Bond Yield Avg", last: 3.125, changePercent: 0.08, change: 0.0025, monthHigh: 3.20, monthLow: 3.05, yearHigh: 3.85, yearLow: 2.50, currency: "EUR" },
  { id: "idx11", type: "Systems Indices", name: "WBX Regenerative Economy Index", last: 1678.90, changePercent: 1.56, change: 25.80, monthHigh: 1700.00, monthLow: 1620.00, yearHigh: 1750.00, yearLow: 1400.00, currency: "EUR" },
  { id: "idx12", type: "Social Indices", name: "WBX Community Finance Index", last: 756.40, changePercent: -0.45, change: -3.40, monthHigh: 780.00, monthLow: 740.00, yearHigh: 820.00, yearLow: 680.00, currency: "USD" },
  { id: "idx13", type: "WBX Indices", name: "WBX Americas Green Index", last: 2890.55, changePercent: 0.33, change: 9.50, monthHigh: 2940.00, monthLow: 2820.00, yearHigh: 3100.00, yearLow: 2600.00, currency: "USD" },
  { id: "idx14", type: "Sustainable Indices", name: "S&P Global Clean Energy Index", last: 1234.70, changePercent: -2.10, change: -26.50, monthHigh: 1320.00, monthLow: 1200.00, yearHigh: 1450.00, yearLow: 1100.00, currency: "USD" },
  { id: "idx15", type: "Regenify Indices", name: "Regenify Ocean Health Index", last: 445.20, changePercent: 0.95, change: 4.20, monthHigh: 460.00, monthLow: 425.00, yearHigh: 490.00, yearLow: 380.00, currency: "EUR" },
];

// ── DOCUMENTS ────────────────────────────────────────────────────────────────
export const mockDocuments: Document[] = [
  { id: "d1", type: "Offerings Documents", subType: "Prospectus Supplement", name: "EIB Climate Awareness Bond 2031 — Final Prospectus", memberStates: ["DE", "FR", "LU", "NL"], date: "2021-03-10", fileSize: "2.4 MB", issuer: "European Investment Bank" },
  { id: "d2", type: "Offerings Documents", subType: "Annual Reports", name: "Nordic Green Capital Annual Report 2024", memberStates: ["SE", "NO", "DK", "FI"], date: "2025-02-28", fileSize: "8.1 MB", issuer: "Nordic Green Capital" },
  { id: "d3", type: "Notices", subType: "Information Notice", name: "GreenBridge Capital — Interest Payment Notice Q1 2025", memberStates: ["DE", "AT"], date: "2025-01-15", fileSize: "0.3 MB", issuer: "GreenBridge Capital Partners" },
  { id: "d4", type: "Offerings Documents", subType: "Public Offer", name: "Iberian Green Corp Equity Offering Circular", memberStates: ["ES", "PT"], date: "2019-08-25", fileSize: "4.7 MB", issuer: "Iberian Green Corp" },
  { id: "d5", type: "Offerings Documents", subType: "Prospectus Supplement", name: "BSB Social Impact Bond — Supplement No. 3", memberStates: ["NL", "BE", "LU"], date: "2023-09-12", fileSize: "1.8 MB", issuer: "Benelux Social Bond Issuer" },
  { id: "d6", type: "Notices", subType: "Publication", name: "WBX Exchange Regulatory Update — March 2025", memberStates: ["EU"], date: "2025-03-01", fileSize: "0.5 MB", issuer: "Worldbridgers Exchange" },
  { id: "d7", type: "Offerings Documents", subType: "Annual Reports", name: "Regenify Infrastructure Corp Annual Report 2024", memberStates: ["CA"], date: "2025-03-15", fileSize: "12.3 MB", issuer: "Regenify Infrastructure Corp" },
  { id: "d8", type: "Offerings Documents", subType: "Prospectus Supplement", name: "ACF Sustainability Bond — Base Prospectus", memberStates: ["SG", "HK", "JP"], date: "2021-07-15", fileSize: "3.6 MB", issuer: "Asia Climate Fund" },
  { id: "d9", type: "Notices", subType: "Information Notice", name: "Pacific Regenerative Trust — Carbon Credit Issuance Notice", memberStates: ["AU", "NZ"], date: "2023-02-10", fileSize: "0.4 MB", issuer: "Pacific Regenerative Trust" },
  { id: "d10", type: "Offerings Documents", subType: "Annual Reports", name: "Alpine Regenerative Fund Annual Report 2024", memberStates: ["CH", "AT", "DE"], date: "2025-02-10", fileSize: "9.8 MB", issuer: "Alpine Regenerative Fund" },
  { id: "d11", type: "Offerings Documents", subType: "Public Offer", name: "Amazon Biodiversity Fund — Investor Memorandum", memberStates: ["BR"], date: "2023-06-01", fileSize: "5.2 MB", issuer: "Amazon Basin Trust" },
  { id: "d12", type: "Notices", subType: "Publication", name: "WBX ESG Classification Framework v2.1", memberStates: ["EU", "US", "AU"], date: "2024-11-20", fileSize: "1.1 MB", issuer: "Worldbridgers Exchange" },
  { id: "d13", type: "Offerings Documents", subType: "Prospectus Supplement", name: "ADF Development Bond 2035 — Supplement", memberStates: ["ZA", "KE", "NG"], date: "2020-05-20", fileSize: "2.9 MB", issuer: "African Development Finance" },
  { id: "d14", type: "Offerings Documents", subType: "Annual Reports", name: "Civic Earth Foundation Impact Report 2024", memberStates: ["GB"], date: "2025-01-30", fileSize: "6.7 MB", issuer: "Civic Earth Foundation" },
  { id: "d15", type: "Notices", subType: "Information Notice", name: "Baltic Sea Green Finance — Coupon Payment Notice", memberStates: ["FI", "SE", "EE", "LV", "LT"], date: "2025-02-15", fileSize: "0.2 MB", issuer: "Baltic Sea Green Finance" },
  { id: "d16", type: "Offerings Documents", subType: "Prospectus Supplement", name: "Oceania Ocean Health Bond — Final Terms", memberStates: ["NZ", "AU"], date: "2022-09-25", fileSize: "1.6 MB", issuer: "Oceania Community Bonds" },
  { id: "d17", type: "Offerings Documents", subType: "Annual Reports", name: "Middle East Sustainability Fund Annual Report 2024", memberStates: ["AE", "SA", "QA"], date: "2025-03-10", fileSize: "7.4 MB", issuer: "Middle East Sustainability Fund" },
  { id: "d18", type: "Notices", subType: "Publication", name: "Regenify Platform — EU Taxonomy Alignment Report 2024", memberStates: ["EU"], date: "2024-12-15", fileSize: "2.0 MB", issuer: "Worldbridgers Exchange" },
];

// ── GRAPH DATA ────────────────────────────────────────────────────────────────
export const mockGraphData = {
  nodes: [
    { id: "theme-1", label: "Entrepreneurship", type: "Theme" as const, region: "Global", description: "Venture lifecycle and entrepreneurship ecosystems." },
    { id: "theme-2", label: "Social Justice", type: "Theme" as const, region: "Global", description: "Diversity, equity, inclusion, and rights." },
    { id: "theme-3", label: "Sustainable Development", type: "Theme" as const, region: "Global", description: "SDG pathways and sustainable systems." },
    { id: "theme-4", label: "Global Governance", type: "Theme" as const, region: "Global", description: "Institutions, rules, and cross-border cooperation." },
    { id: "theme-5", label: "Civic Participation", type: "Theme" as const, region: "Global", description: "Citizen engagement and participatory governance." },
    { id: "theme-6", label: "Social Protection", type: "Theme" as const, region: "Global", description: "Welfare, social safety nets, and resilience." },
    { id: "theme-7", label: "Youth Perspectives", type: "Theme" as const, region: "Global", description: "Youth-led priorities and intergenerational equity." },
    { id: "theme-8", label: "Future of Work", type: "Theme" as const, region: "Global", description: "Labour transitions, reskilling, and technology." },
    { id: "issuer-eib", label: "European Investment Bank", type: "Issuer" as const, region: "Europe", country: "Luxembourg", description: "Public development finance institution." },
    { id: "issuer-ngc", label: "Nordic Green Capital", type: "Issuer" as const, region: "Europe", country: "Sweden", description: "Sustainable finance issuer focused on green instruments." },
    { id: "issuer-acf", label: "Asia Climate Fund", type: "Issuer" as const, region: "Asia", country: "Singapore", description: "Climate-focused issuer active across APAC markets." },
    { id: "investor-nordic", label: "Pension Fund Nordic", type: "Investor" as const, region: "Europe", country: "Denmark", description: "Long-horizon institutional investor." },
    { id: "investor-impact-asia", label: "Impact Capital Asia", type: "Investor" as const, region: "Asia", country: "Japan", description: "Impact-first investment manager." },
    { id: "investor-us-climate", label: "US Climate Fund", type: "Investor" as const, region: "North America", country: "United States", description: "Climate transition investor." },
  ] as GraphNode[],

  edges: [
    { id: "te1", source: "theme-1", target: "theme-8", label: "INFLUENCES", weight: 3 },
    { id: "te2", source: "theme-1", target: "theme-3", label: "SUPPORTS", weight: 2 },
    { id: "te3", source: "theme-2", target: "theme-6", label: "SHAPES", weight: 3 },
    { id: "te4", source: "theme-2", target: "theme-5", label: "DRIVES", weight: 2 },
    { id: "te5", source: "theme-3", target: "theme-4", label: "COORDINATES_WITH", weight: 3 },
    { id: "te6", source: "theme-3", target: "theme-8", label: "TRANSITIONS", weight: 2 },
    { id: "te7", source: "theme-4", target: "theme-5", label: "ENABLES", weight: 2 },
    { id: "te8", source: "theme-7", target: "theme-8", label: "REIMAGINES", weight: 3 },
    { id: "te9", source: "theme-7", target: "theme-5", label: "AMPLIFIES", weight: 2 },
    { id: "te10", source: "theme-6", target: "theme-8", label: "PROTECTS_DURING", weight: 2 },
    { id: "map1", source: "theme-1", target: "issuer-ngc", label: "RELATED_ISSUER", weight: 2 },
    { id: "map2", source: "theme-3", target: "issuer-eib", label: "RELATED_ISSUER", weight: 2 },
    { id: "map3", source: "theme-3", target: "issuer-acf", label: "RELATED_ISSUER", weight: 2 },
    { id: "map4", source: "theme-8", target: "issuer-ngc", label: "RELATED_ISSUER", weight: 2 },
    { id: "map5", source: "theme-1", target: "investor-impact-asia", label: "RELATED_INVESTOR", weight: 2 },
    { id: "map6", source: "theme-8", target: "investor-us-climate", label: "RELATED_INVESTOR", weight: 2 },
    { id: "map7", source: "theme-2", target: "investor-nordic", label: "RELATED_INVESTOR", weight: 2 },
    { id: "map8", source: "theme-3", target: "investor-us-climate", label: "RELATED_INVESTOR", weight: 2 },
    { id: "rel1", source: "investor-impact-asia", target: "issuer-acf", label: "INVESTS_IN", weight: 3 },
    { id: "rel2", source: "investor-us-climate", target: "issuer-eib", label: "INVESTS_IN", weight: 3 },
    { id: "rel3", source: "investor-nordic", target: "issuer-ngc", label: "INVESTS_IN", weight: 3 },
  ] as GraphEdge[],
};
