# Search scripts

We use these to evaluate search performance. `results.csv` contains a list of authoriative search results for 200 terms.

We use this to compute an average nDCG.

## Install

 - Requires python 3.11

```bash
pip install -r requirements.txt
```

## Running

```bash
python compute_ndcg.py --help

usage: compute_ndcg.py [-h] [-d] [input_csv]

Compute nDCG for Algolia search results.

positional arguments:
  input_csv       Path to the input CSV file (default: results.csv).

options:
  -h, --help      show this help message and exit
  -d, --detailed  Print detailed results for each search term.
```

## Results

| **Date**   | **Average nDCG** | **Results**                                                                                  | **Changes**                                      |
|------------|------------------|----------------------------------------------------------------------------------------------|--------------------------------------------------|
| 20/01/2024 | 0.4700           | [View Results](https://pastila.nl/?008231f5/bc107912f8a5074d70201e27b1a66c6c#cB/yJOsZPOWi9h8xAkuTUQ==) | Baseline                                         |
| 21/01/2024 | 0.5021           | [View Results](https://pastila.nl/?00bb2c2f/936a9a3af62a9bdda186af5f37f55782#m7Hg0i9F1YCesMW6ot25yA==) | Index `_` character and move language to English |
| 24/01/2024 | 0.7072           | [View Results](https://pastila.nl/?065e3e67/e4ad889d0c166226118e6160b4ee53ff#x1NPd2R7hU90CZvvrE4nhg==) | Process markdown, and tune settings.             |

## Issues

1. Some pages are not optimized for retrieval e.g. 
   a. https://clickhouse.com/docs/en/sql-reference/aggregate-functions/combinators#-if will never return for `countIf`, `sumif`, `multiif`
2. Some pages are hidden e.g. https://clickhouse.com/docs/en/install#from-docker-image - this needs to be separate page.
3. Some pages e.g. https://clickhouse.com/docs/en/sql-reference/statements/alter need headings e.g. `Alter table`
4. https://clickhouse.com/docs/en/optimize/sparse-primary-indexes needs to be optimized for primary key
5. `between` we need to likely manually promote.
6. `case when` - https://clickhouse.com/docs/en/sql-reference/functions/conditional-functions needs to be improved. Maybe keywords or a header
7. `has` - https://clickhouse.com/docs/en/sql-reference/functions/array-functions#hasarr-elem tricky
8. `clickhouse` - manual promotion
9. `codec` - we need better content
10. `shard` - need a better page
11. `populate` - we need to have a subheading on the mv page
12. `contains` - https://clickhouse.com/docs/en/sql-reference/functions/string-search-functions needs words
13. `client` - maybe promote manually
14. `config.xml` - manually promote
15. `replica` - need more terms on https://clickhouse.com/docs/en/architecture/horizontal-scaling but we need a better page