## Index scripts

### Install

- Requires python 3.11

```bash
pip install -r requirements.txt
```

### Running

```bash
# Index English (default)
python index_pages.py --base_directory /opt/clickhouse-docs --algolia_app_id 7AL1W7YVZK --algolia_api_key <write_key>

# Index Japanese
python index_pages.py --base_directory /opt/clickhouse-docs --algolia_app_id 7AL1W7YVZK --algolia_api_key <write_key> --locale jp

# Index Chinese
python index_pages.py --base_directory /opt/clickhouse-docs --algolia_app_id 7AL1W7YVZK --algolia_api_key <write_key> --locale zh

# Index Russian
python index_pages.py --base_directory /opt/clickhouse-docs --algolia_app_id 7AL1W7YVZK --algolia_api_key <write_key> --locale ru

# Using the shell script
./run_indexer.sh --locale jp
```

```bash
usage: index_pages.py [-h] [-d BASE_DIRECTORY] [-x] --algolia_app_id ALGOLIA_APP_ID --algolia_api_key ALGOLIA_API_KEY [--algolia_index_name ALGOLIA_INDEX_NAME] [--locale {en,jp,zh,ru}]

Index search pages.

options:
  -h, --help            show this help message and exit
  -d BASE_DIRECTORY, --base_directory BASE_DIRECTORY
                        Path to root directory of docs repo
  -x, --dry_run         Dry run, do not send results to Algolia.
  --algolia_app_id ALGOLIA_APP_ID
                        Algolia Application ID
  --algolia_api_key ALGOLIA_API_KEY
                        Algolia Admin API Key
  --algolia_index_name ALGOLIA_INDEX_NAME
                        Algolia Index Name
  --locale {en,jp,zh,ru}
                        Locale to index (default: en)
```

Before pushing any changes to the production app, please test on the dev app
and make a backup of the english search index "clickhouse".
You can do so from the search tab -> manage index -> duplicate.
Give the duplicate index a name like "clickhouse-backup-DD-MM-YYYY"

## Search scripts

We use these to evaluate search performance. `results.csv` contains a list of authoritative search results for 200 terms.

We use this to compute an average nDCG.

### Install

- Requires python 3.11

```bash
pip install -r requirements.txt
```

### Running

You need to comment out either Dev or Prod depending on what you want to test.
The API key is the public search key, don't worry.
Find the actual key you need in the Algolia app under settings -> API keys

```python
# dev details
# ALGOLIA_APP_ID = "7AL1W7YVZK"
# ALGOLIA_API_KEY = "43bd50d4617a97c9b60042a2e8a348f9"

# Prod details
ALGOLIA_APP_ID = "5H9UG7CX5W"
ALGOLIA_API_KEY = "4a7bf25cf3edbef29d78d5e1eecfdca5"
```

```bash
python compute_ndcg.py -d
```

```bash
usage: compute_ndcg.py [-h] [-d] [-v] [input_csv]

Compute nDCG for Algolia search results.

positional arguments:
  input_csv       Path to the input CSV file (default: results.csv).

options:
  -h, --help      show this help message and exit
  -d, --detailed  Print detailed results for each search term.
  -v, --validate  Validate links.
```

### Results

| **Date**   | **Average nDCG** | **Results**                                                                                             | **Changes**                                                                                 |
|------------|------------------|---------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| 20/01/2025 | 0.4700           | [View Results](https://pastila.nl/?008231f5/bc107912f8a5074d70201e27b1a66c6c#cB/yJOsZPOWi9h8xAkuTUQ==)  | Baseline                                                                                    |
| 21/01/2025 | 0.5021           | [View Results](https://pastila.nl/?00bb2c2f/936a9a3af62a9bdda186af5f37f55782#m7Hg0i9F1YCesMW6ot25yA==)  | Index `_` character and move language to English                                            |
| 24/01/2025 | 0.7072           | [View Results](https://pastila.nl/?065e3e67/e4ad889d0c166226118e6160b4ee53ff#x1NPd2R7hU90CZvvrE4nhg==)  | Process markdown, and tune settings.                                                        |
| 24/01/2025 | 0.7412           | [View Results](https://pastila.nl/?0020013d/e69b33aaae82e49bc71c5ee2cea9ad46#pqq3VtRd4eP4JM5/izcBcA==)  | Include manual promotions for ambigious terms.                                              |
| 28/08/2025 | 0.5729           | [View Results](https://pastila.nl/?00ab66a7/9eb511690e3b2f53ac7ae95e3f42113c#tK6gf8G9W7mbAQd3aD5f4Q==)  | This was unfortunately not run or recorded for search improvements which were made recently |

Note: exact scores may vary due to constant content changes.

### Issues

1. Some pages are not optimized for retrieval e.g. 
   a. https://clickhouse.com/docs/sql-reference/aggregate-functions/combinators#-if will never return for `countIf`, `sumif`, `multiif`
1. Some pages are hidden e.g. https://clickhouse.com/docs/install#from-docker-image - this needs to be separate page.
1. Some pages e.g. https://clickhouse.com/docs/sql-reference/statements/alter need headings e.g. `Alter table`
1. https://clickhouse.com/docs/optimize/sparse-primary-indexes needs to be optimized for primary key
1. case `when` - https://clickhouse.com/docs/sql-reference/functions/conditional-functions needs to be improved. Maybe keywords or a header
1. `has` - https://clickhouse.com/docs/sql-reference/functions/array-functions#hasarr-elem tricky
1. `codec` - we need better content
1. `shard` - need a better page
1. `populate` - we need to have a subheading on the mv page
1. `contains` - https://clickhouse.com/docs/sql-reference/functions/string-search-functions needs words
1. `replica` - need more terms on https://clickhouse.com/docs/architecture/horizontal-scaling but we need a better page

### Improvements

1. Better chunking - using a markdown chunker which respects code and table boundaries
2. Skip pages
3. Segment on case on h3s, h2s on numerics e.g. toInt8 -> to Int 8
