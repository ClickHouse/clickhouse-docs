---
title: How to query Parquet files
sidebar_label: Querying Parquet files
slug: /en/chdb/guides/querying-parquet
description: Learn how to query Parquet files with chDB.
keywords: [chdb, parquet]
---

A lot of the world's data lives in Amazon S3 buckets.
In this guide, we'll learn how to query that data using chDB.

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

And now we're going to install iPython:

```bash
pip install ipython
```

We're going to use `ipython` to run the commands in the rest of the guide, which you can launch by running:

```bash
ipython
```

You can also use the code in a Python script or in your favorite notebook.

## Listing files in an S3 bucket

```python
import chdb
```

```python
import chdb
```

```text
num_columns	UInt64
num_rows	UInt64
num_row_groups	UInt64
format_version	String
metadata_size	UInt64
total_uncompressed_size	UInt64
total_compressed_size	UInt64
columns	Array(Tuple(name String, path String, max_definition_level UInt64, max_repetition_level UInt64, physical_type String, logical_type String, compression String, total_uncompressed_size UInt64, total_compressed_size UInt64, space_saved String, encodings Array(String)))
row_groups	Array(Tuple(num_columns UInt64, num_rows UInt64, total_uncompressed_size UInt64, total_compressed_size UInt64, columns Array(Tuple(name String, path String, total_compressed_size UInt64, total_uncompressed_size UInt64, have_statistics Bool, statistics Tuple(num_values Nullable(UInt64), null_count Nullable(UInt64), distinct_count Nullable(UInt64), min Nullable(String), max Nullable(String))))))
```