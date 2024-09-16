---
title: How to query Apache Arrow with chDB
sidebar_label: Querying Apache Arrow
slug: /en/chdb/guides/apache-arrow
description: In this guide, we'll learn how to query Apache Arrow tables with chDB
keywords: [chdb, apache-arrow]
---

[Apache Arrow](https://arrow.apache.org/) is a standardized column-oriented memory format that's gained popularity in the data community.
In this guide, we will learn how to query Apache Arrow using the `Python` table function.

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

And now we're going to install pyarrow, pandas, and ipython:

```bash
pip install pyarrow pandas ipython
```

We're going to use `ipython` to run the commands in the rest of the guide, which you can launch by running:

```bash
ipython
```

You can also use the code in a Python script or in your favorite notebook.

## Creating an Apache Arrow table from a file

Let's first download one of the Parquet files for the [Ookla dataset](https://github.com/teamookla/ookla-open-data), using the [AWS CLI tool](https://aws.amazon.com/cli/):

```bash
aws s3 cp \
  --no-sign \
  s3://ookla-open-data/parquet/performance/type=mobile/year=2023/quarter=2/2023-04-01_performance_mobile_tiles.parquet .
```

:::note
If you want to download more files, use `aws s3 ls` to get a list of all the files and then update the above command.
:::



Next, we'll import the Parquet module from the pyarrow package:

```python
import pyarrow.parquet as pq
```

And then we can read the Parquet file into an Apache Arrow table:

```python
arrow_table = pq.read_table("./2023-04-01_performance_mobile_tiles.parquet")
```

The schema is shown below:

```python
arrow_table.schema
```

```text
quadkey: string
tile: string
tile_x: double
tile_y: double
avg_d_kbps: int64
avg_u_kbps: int64
avg_lat_ms: int64
avg_lat_down_ms: int32
avg_lat_up_ms: int32
tests: int64
devices: int64
```

And we can get the row and column count by calling the `shape` attribute:

```python
arrow_table.shape
```

```text
(3864546, 11)
```

## Querying Apache Arrow

Now let's query the Arrow table from chDB.
First, let's import chDB:

```python
import chdb
```

And then we can describe the table:

```python
chdb.query("""
DESCRIBE Python(arrow_table)
SETTINGS describe_compact_output=1
""", "DataFrame")
```

```text
               name     type
0           quadkey   String
1              tile   String
2            tile_x  Float64
3            tile_y  Float64
4        avg_d_kbps    Int64
5        avg_u_kbps    Int64
6        avg_lat_ms    Int64
7   avg_lat_down_ms    Int32
8     avg_lat_up_ms    Int32
9             tests    Int64
10          devices    Int64
```

We can also count the number of rows:

```python
chdb.query("SELECT count() FROM Python(arrow_table)", "DataFrame")
```

```text
   count()
0  3864546
```

Now, let's do something a bit more interesting. 
The following query excludes the `quadkey` and `tile.*` columns and then computes the average and max values for all remaining column:


```python
chdb.query("""
WITH numericColumns AS (
  SELECT * EXCEPT ('tile.*') EXCEPT(quadkey)
  FROM Python(arrow_table)
)
SELECT * APPLY(max), * APPLY(avg) APPLY(x -> round(x, 2))
FROM numericColumns
""", "Vertical")
```

```text
Row 1:
──────
max(avg_d_kbps):                4155282
max(avg_u_kbps):                1036628
max(avg_lat_ms):                2911
max(avg_lat_down_ms):           2146959360
max(avg_lat_up_ms):             2146959360
max(tests):                     111266
max(devices):                   1226
round(avg(avg_d_kbps), 2):      84393.52
round(avg(avg_u_kbps), 2):      15540.4
round(avg(avg_lat_ms), 2):      41.25
round(avg(avg_lat_down_ms), 2): 554355225.76
round(avg(avg_lat_up_ms), 2):   552843178.3
round(avg(tests), 2):           6.31
round(avg(devices), 2):         2.88
```