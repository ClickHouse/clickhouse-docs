---
title: How to query a remote ClickHouse server
sidebar_label: Querying remote ClickHouse
slug: /en/chdb/guides/query-remote-clickhouse
description: In this guide, we'll learn how to query a remote ClickHouse server from chDB.
keywords: [chdb, clickhouse]
---

In this guide, we're going to learn how to query a remote ClickHouse server from chDB.

## Setup

Let's first create a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate
```

And now we'll install chDB.
Make sure you have version 2.0.2 or higher:

```bash
pip install "chdb>=2.0.2"
```

And now we're going to install pandas, and ipython:

```bash
pip install pandas ipython
```

We're going to use `ipython` to run the commands in the rest of the guide, which you can launch by running:

```bash
ipython
```

You can also use the code in a Python script or in your favorite notebook.

## An intro to ClickPy

The remote ClickHouse server that we're going to query is [ClickPy](https://clickpy.clickhouse.com).
ClickPy keeps track of all the downloads of PyPI packages and lets you explore the stats of packages via a UI.
The underlying database is available to query using the `play` user.

You can learn more about ClickPy in [its GitHub repository](https://github.com/ClickHouse/clickpy).

## Querying the ClickPy ClickHouse service

Let's import chDB:

```python
import chdb
```

We're going to query ClickPy using the `remoteSecure` function.
This function takes in a host name, table name, and username at a minimum.

We can write the following query to return the number of downloads per day of the [`openai` package](https://clickpy.clickhouse.com/dashboard/openai) as a Pandas DataFrame:
 
```python
query = """
SELECT
    toStartOfDay(date)::Date32 AS x,
    sum(count) AS y
FROM remoteSecure(
  'clickpy-clickhouse.clickhouse.com', 
  'pypi.pypi_downloads_per_day', 
  'play'
)
WHERE project = 'openai'
GROUP BY x
ORDER BY x ASC
"""

openai_df = chdb.query(query, "DataFrame")
openai_df.sort_values(by=["x"], ascending=False).head(n=10)
```

```text
               x        y
2392  2024-10-02  1793502
2391  2024-10-01  1924901
2390  2024-09-30  1749045
2389  2024-09-29  1177131
2388  2024-09-28  1157323
2387  2024-09-27  1688094
2386  2024-09-26  1862712
2385  2024-09-25  2032923
2384  2024-09-24  1901965
2383  2024-09-23  1777554
```

Now let's do the same to return the downloads for [`scikit-learn`](https://clickpy.clickhouse.com/dashboard/scikit-learn):


```python
query = """
SELECT
    toStartOfDay(date)::Date32 AS x,
    sum(count) AS y
FROM remoteSecure(
  'clickpy-clickhouse.clickhouse.com', 
  'pypi.pypi_downloads_per_day', 
  'play'
)
WHERE project = 'scikit-learn'
GROUP BY x
ORDER BY x ASC
"""

sklearn_df = chdb.query(query, "DataFrame")
sklearn_df.sort_values(by=["x"], ascending=False).head(n=10)
```

```text
               x        y
2392  2024-10-02  1793502
2391  2024-10-01  1924901
2390  2024-09-30  1749045
2389  2024-09-29  1177131
2388  2024-09-28  1157323
2387  2024-09-27  1688094
2386  2024-09-26  1862712
2385  2024-09-25  2032923
2384  2024-09-24  1901965
2383  2024-09-23  1777554
```

## Merging Pandas DataFrames

We now have two DataFrames, which we can merge together based on date (which is the `x` column) like this:

```python
df = openai_df.merge(
  sklearn_df, 
  on="x", 
  suffixes=("_openai", "_sklearn")
)
df.head(n=5)
```

```text
            x  y_openai  y_sklearn
0  2018-02-26        83      33971
1  2018-02-27        31      25211
2  2018-02-28         8      26023
3  2018-03-01         8      20912
4  2018-03-02         5      23842
```

We can then compute the ratio of Open AI downloads to `scikit-learn` downloads like this:

```python
df['ratio'] = df['y_openai'] / df['y_sklearn']
df.head(n=5)
```

```text
            x  y_openai  y_sklearn     ratio
0  2018-02-26        83      33971  0.002443
1  2018-02-27        31      25211  0.001230
2  2018-02-28         8      26023  0.000307
3  2018-03-01         8      20912  0.000383
4  2018-03-02         5      23842  0.000210
```

## Querying Pandas DataFrames

Next, let's say we want to find the dates with the best and worst ratios. 
We can go back to chDB and compute those values:

```python
chdb.query("""
SELECT max(ratio) AS bestRatio,
       argMax(x, ratio) AS bestDate,
       min(ratio) AS worstRatio,
       argMin(x, ratio) AS worstDate
FROM Python(df)
""", "DataFrame")
```

```text
   bestRatio    bestDate  worstRatio   worstDate
0   0.693855  2024-09-19    0.000003  2020-02-09
```

If you want to learn more about querying Pandas DataFrames, see the [Pandas DataFrames developer guide](querying-pandas.md).