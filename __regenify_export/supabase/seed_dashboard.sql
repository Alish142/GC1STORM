begin;

with inserted_issuers as (
  insert into issuers (
    name,
    country,
    region,
    classification,
    wbx_label,
    eu_taxonomy,
    description,
    founded_year,
    assets_amount,
    assets_currency
  )
  values
    (
      'European Investment Bank',
      'Luxembourg',
      'Europe',
      'SSA',
      true,
      true,
      'Multilateral development bank of the EU',
      1958,
      600000000000.00,
      'EUR'
    ),
    (
      'Nordic Green Capital',
      'Sweden',
      'Europe',
      'Financial',
      true,
      true,
      'Nordic sustainable finance institution',
      2012,
      45000000000.00,
      'EUR'
    ),
    (
      'Pacific Regenerative Trust',
      'Australia',
      'Pacific',
      'Community',
      false,
      false,
      'Community-focused regenerative land trust',
      2018,
      2100000000.00,
      'AUD'
    ),
    (
      'Iberian Green Corp',
      'Spain',
      'Europe',
      'Corporate',
      true,
      true,
      'Iberian renewable energy corporate',
      2011,
      18000000000.00,
      'EUR'
    ),
    (
      'African Development Finance',
      'South Africa',
      'Africa',
      'SSA',
      false,
      false,
      'Development finance for Sub-Saharan Africa',
      1964,
      35000000000.00,
      'USD'
    )
  on conflict do nothing
  returning id, name
),
issuer_lookup as (
  select id, name from inserted_issuers
  union
  select id, name from issuers where name in (
    'European Investment Bank',
    'Nordic Green Capital',
    'Pacific Regenerative Trust',
    'Iberian Green Corp',
    'African Development Finance'
  )
),
inserted_offerings as (
  insert into offerings (
    issuer_id,
    type,
    segment,
    isin,
    name,
    issued_amount,
    currency,
    listing_date,
    wbx_classification,
    coupon,
    last_price,
    delisted
  )
  values
    (
      (select id from issuer_lookup where name = 'European Investment Bank'),
      'Bonds',
      'Green Bond',
      'XS2345678901',
      'EIB Climate Awareness Bond 2031',
      3000000000.00,
      'EUR',
      date '2021-03-15',
      'Climate',
      0.3750,
      98.4500,
      false
    ),
    (
      (select id from issuer_lookup where name = 'Nordic Green Capital'),
      'Bonds',
      'Social Bond',
      'SE0012345678',
      'Nordic Social Impact Bond',
      1500000000.00,
      'EUR',
      date '2022-06-20',
      'Social',
      0.8750,
      99.1200,
      false
    ),
    (
      (select id from issuer_lookup where name = 'Pacific Regenerative Trust'),
      'Funds',
      'ESG Fund',
      'AU0000123456',
      'Pacific Regenerative Leaders Fund',
      800000000.00,
      'AUD',
      date '2020-01-10',
      'Sustainable',
      null,
      142.3000,
      false
    ),
    (
      (select id from issuer_lookup where name = 'Iberian Green Corp'),
      'Equities',
      'Green Equity',
      'ES0123456789',
      'Iberian Renewables Equity',
      500000000.00,
      'EUR',
      date '2019-09-05',
      'Renewable',
      null,
      24.6700,
      false
    ),
    (
      (select id from issuer_lookup where name = 'African Development Finance'),
      'Bonds',
      'Delisted Bond',
      'ZA0012345678',
      'ADF Legacy Bond (Delisted)',
      300000000.00,
      'USD',
      date '2018-01-15',
      'Climate',
      5.0000,
      100.0000,
      true
    )
  on conflict (isin) do nothing
  returning id, name
),
offering_lookup as (
  select id, name from inserted_offerings
  union
  select id, name from offerings where isin in (
    'XS2345678901',
    'SE0012345678',
    'AU0000123456',
    'ES0123456789',
    'ZA0012345678'
  )
),
inserted_indices as (
  insert into indices (
    type,
    name,
    currency,
    last,
    change_percent,
    change,
    month_high,
    month_low,
    year_high,
    year_low
  )
  values
    (
      'WBX Indices',
      'WBX Global Regenify Index',
      'EUR',
      1842.3500,
      1.2400,
      22.5500,
      1860.0000,
      1790.2000,
      1920.5000,
      1620.0000
    ),
    (
      'Sustainable Indices',
      'MSCI World ESG Leaders',
      'USD',
      3215.8000,
      -0.3800,
      -12.3000,
      3280.0000,
      3180.0000,
      3450.0000,
      2980.0000
    ),
    (
      'Regenify Indices',
      'Regenify Biodiversity Index',
      'EUR',
      524.6000,
      2.1500,
      11.0500,
      535.0000,
      498.0000,
      560.0000,
      420.0000
    )
  on conflict do nothing
  returning id, name
),
index_lookup as (
  select id, name from inserted_indices
  union
  select id, name from indices where name in (
    'WBX Global Regenify Index',
    'MSCI World ESG Leaders',
    'Regenify Biodiversity Index'
  )
),
inserted_documents as (
  insert into documents (
    issuer_id,
    type,
    sub_type,
    name,
    document_date,
    file_size_bytes,
    file_url
  )
  values
    (
      (select id from issuer_lookup where name = 'European Investment Bank'),
      'Offerings Documents',
      'Prospectus Supplement',
      'EIB Climate Awareness Bond 2031 - Final Prospectus',
      date '2021-03-10',
      2516582,
      'https://example.com/documents/eib-climate-awareness-bond-2031-final-prospectus.pdf'
    ),
    (
      (select id from issuer_lookup where name = 'Nordic Green Capital'),
      'Offerings Documents',
      'Annual Reports',
      'Nordic Green Capital Annual Report 2024',
      date '2025-02-28',
      8493466,
      'https://example.com/documents/nordic-green-capital-annual-report-2024.pdf'
    ),
    (
      (select id from issuer_lookup where name = 'Pacific Regenerative Trust'),
      'Notices',
      'Information Notice',
      'Pacific Regenerative Trust - Carbon Credit Issuance Notice',
      date '2023-02-10',
      419430,
      'https://example.com/documents/pacific-regenerative-trust-carbon-credit-issuance-notice.pdf'
    )
  on conflict do nothing
  returning id, name
),
document_lookup as (
  select id, name from inserted_documents
  union
  select id, name from documents where name in (
    'EIB Climate Awareness Bond 2031 - Final Prospectus',
    'Nordic Green Capital Annual Report 2024',
    'Pacific Regenerative Trust - Carbon Credit Issuance Notice'
  )
)
insert into document_member_states (document_id, country_code)
values
  (
    (select id from document_lookup where name = 'EIB Climate Awareness Bond 2031 - Final Prospectus'),
    'DE'
  ),
  (
    (select id from document_lookup where name = 'EIB Climate Awareness Bond 2031 - Final Prospectus'),
    'FR'
  ),
  (
    (select id from document_lookup where name = 'EIB Climate Awareness Bond 2031 - Final Prospectus'),
    'LU'
  ),
  (
    (select id from document_lookup where name = 'EIB Climate Awareness Bond 2031 - Final Prospectus'),
    'NL'
  ),
  (
    (select id from document_lookup where name = 'Nordic Green Capital Annual Report 2024'),
    'SE'
  ),
  (
    (select id from document_lookup where name = 'Nordic Green Capital Annual Report 2024'),
    'NO'
  ),
  (
    (select id from document_lookup where name = 'Nordic Green Capital Annual Report 2024'),
    'DK'
  ),
  (
    (select id from document_lookup where name = 'Nordic Green Capital Annual Report 2024'),
    'FI'
  ),
  (
    (select id from document_lookup where name = 'Pacific Regenerative Trust - Carbon Credit Issuance Notice'),
    'AU'
  ),
  (
    (select id from document_lookup where name = 'Pacific Regenerative Trust - Carbon Credit Issuance Notice'),
    'NZ'
  )
on conflict do nothing;

commit;
