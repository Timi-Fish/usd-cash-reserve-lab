window.BILL_LADDER_DATA = {
  "schema": "usd-cash-reserve-lab/bill-ladder/v1",
  "quote_date": "2026-10-26",
  "access_date": "2026-10-27",
  "freshness_days": 7,
  "bills": [
    {
      "tenor_weeks": 4,
      "cusip": "912797VY0",
      "maturity_date": "2026-11-24",
      "days": 29,
      "discount_pct": 3.94,
      "coupon_equivalent_pct": 4.01
    },
    {
      "tenor_weeks": 6,
      "cusip": "912797VA2",
      "maturity_date": "2026-12-03",
      "days": 38,
      "discount_pct": 3.94,
      "coupon_equivalent_pct": 4.01
    },
    {
      "tenor_weeks": 8,
      "cusip": "912797WG8",
      "maturity_date": "2026-12-22",
      "days": 57,
      "discount_pct": 4.02,
      "coupon_equivalent_pct": 4.1
    },
    {
      "tenor_weeks": 13,
      "cusip": "912797VU8",
      "maturity_date": "2027-01-28",
      "days": 94,
      "discount_pct": 4.05,
      "coupon_equivalent_pct": 4.15
    },
    {
      "tenor_weeks": 17,
      "cusip": "912797XA0",
      "maturity_date": "2027-02-23",
      "days": 120,
      "discount_pct": 4.13,
      "coupon_equivalent_pct": 4.25
    },
    {
      "tenor_weeks": 26,
      "cusip": "912797WW3",
      "maturity_date": "2027-04-29",
      "days": 185,
      "discount_pct": 4.21,
      "coupon_equivalent_pct": 4.36
    },
    {
      "tenor_weeks": 52,
      "cusip": "912797WJ2",
      "maturity_date": "2027-09-30",
      "days": 339,
      "discount_pct": 4.26,
      "coupon_equivalent_pct": 4.45
    }
  ],
  "source": {
    "provider": "U.S. Treasury Office of Debt Management",
    "dataset": "Daily Treasury Bill Rates (015-DO-021)",
    "url": "https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_bill_rates&field_tdr_date_value=2026",
    "fields": "ROUND_B1_CLOSE_<N>WK_2 bank discount (percent); ROUND_B1_YIELD_<N>WK_2; MATURITY_DATE_<N>WK; CUSIP_<N>WK",
    "terms_url": "https://catalog.data.gov/dataset/interest-rate-statistics-daily-treasury-bill-rates",
    "permission_basis": "CC0 in Data.gov dataset metadata; attribution retained"
  },
  "disclaimer": "Educational project. Not investment advice."
};
