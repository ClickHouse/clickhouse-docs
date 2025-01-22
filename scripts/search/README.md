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

| **Date**    | **Average nDCG** | **Results**                                                                                  | **Changes**                                   |
|-------------|------------------|----------------------------------------------------------------------------------------------|----------------------------------------------|
| 20/01/2024  | 0.4700           | [View Results](https://pastila.nl/?008231f5/bc107912f8a5074d70201e27b1a66c6c#cB/yJOsZPOWi9h8xAkuTUQ==) | Baseline                                     |
| 21/01/2024  | 0.4783           | [View Results](https://pastila.nl/?00bb2c2f/936a9a3af62a9bdda186af5f37f55782#m7Hg0i9F1YCesMW6ot25yA==) | Index `_` character and move language to English |