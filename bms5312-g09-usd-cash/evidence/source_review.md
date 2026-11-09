# Source and reuse review

Checked 2026-10-27. Only numerical government data and short factual metadata are included; no agency logos, copied third-party photographs or paid datasets.

## Treasury
Dataset identifier 015-DO-021, Office of Debt Management, Daily Treasury Bill Rates. The official Data.gov entry lists CC0 1.0 and public access. This dataset-specific license is the basis for the numerical XML snapshots, AI-assisted processing, educational redistribution and later numerical-data hosting. It is not an assumption that all TreasuryDirect website content is unrestricted.
https://catalog.data.gov/dataset/interest-rate-statistics-daily-treasury-bill-rates
https://creativecommons.org/publicdomain/zero/1.0/

Bank discount quotes are percentage units based on face value and 360 days. Coupon equivalents use purchase-price yield conventions and are retained only as context. TreasuryDirect's pricing page supplies the bill discount-price formula; its logo and website content are not republished.
https://www.treasurydirect.gov/marketable-securities/understanding-pricing/

## BLS
BLS's copyright statement identifies its published data as public domain, excluding previously copyrighted images. We use numerical CPI values, cite BLS, and do not include those images. The statement supplies the permission basis for AI processing and instructor handover of the included numerical JSON.
https://www.bls.gov/bls/linksite.htm

Series CUUR0000SA0 is the CPI-U U.S. city average all-items NSA index, 1982–84=100. Official web historical table cross-check: September 2026 336.940, September 2025 324.800, December 2024 315.605. The official release dated 2026-10-14 reports September 2026 annual inflation rounded to 3.7%; independent ratio calculation gives about 3.74%. The October 2025 value is unavailable due to the lapse in appropriations and is preserved as missing.
https://www.bls.gov/regions/mid-atlantic/data/consumerpriceindexhistorical_us_table.htm
https://www.bls.gov/news.release/cpi.htm

## Actual retrieval limitations
Terminal requests to BLS HTML returned 403; BLS JSON downloaded successfully, and the official HTML pages were separately read through the web research tool. Treasury XML downloaded successfully from the resource-center/data-chart-center URL used by `refresh.py`.
