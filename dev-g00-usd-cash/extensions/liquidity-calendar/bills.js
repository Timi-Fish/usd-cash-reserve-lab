window.BILL_LADDER_DATA = {
  "schema": "usd-cash-reserve-lab/bill-ladder/v1",
  "quote_date": "2026-11-06",
  "access_date": "2026-11-08",
  "freshness_days": 7,
  "bills": [
    {
      "tenor_weeks": 4,
      "cusip": "912797WE3",
      "maturity_date": "2026-12-08",
      "days": 32,
      "discount_pct": 3.88,
      "coupon_equivalent_pct": 3.95
    },
    {
      "tenor_weeks": 6,
      "cusip": "912797VH7",
      "maturity_date": "2026-12-17",
      "days": 41,
      "discount_pct": 3.9,
      "coupon_equivalent_pct": 3.97
    },
    {
      "tenor_weeks": 8,
      "cusip": "912797WN3",
      "maturity_date": "2027-01-05",
      "days": 60,
      "discount_pct": 3.98,
      "coupon_equivalent_pct": 4.06
    },
    {
      "tenor_weeks": 13,
      "cusip": "912797VV6",
      "maturity_date": "2027-02-04",
      "days": 90,
      "discount_pct": 4.01,
      "coupon_equivalent_pct": 4.11
    },
    {
      "tenor_weeks": 17,
      "cusip": "912797XG7",
      "maturity_date": "2027-03-09",
      "days": 123,
      "discount_pct": 4.08,
      "coupon_equivalent_pct": 4.19
    },
    {
      "tenor_weeks": 26,
      "cusip": "912797WX1",
      "maturity_date": "2027-05-06",
      "days": 181,
      "discount_pct": 4.12,
      "coupon_equivalent_pct": 4.26
    },
    {
      "tenor_weeks": 52,
      "cusip": "912797WT0",
      "maturity_date": "2027-10-28",
      "days": 356,
      "discount_pct": 4.13,
      "coupon_equivalent_pct": 4.32
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
