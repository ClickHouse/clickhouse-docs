---
slug: /guides/developer/debugging-memory-issues
sidebar_label: 'メモリ関連の問題のデバッグ'
sidebar_position: 1
description: 'メモリ関連の問題をデバッグするためのクエリ集。'
keywords: ['memory issues']
title: 'メモリ関連の問題のデバッグ'
doc_type: 'guide'
---



# メモリ問題のデバッグ {#debugging-memory-issues}

メモリ問題やメモリリークが発生した場合、どのクエリやリソースが大量のメモリを消費しているかを把握することが重要です。以下に、最適化が必要なクエリ、データベース、テーブルを特定し、メモリ問題のデバッグに役立つクエリを示します:


## ピークメモリ使用量で現在実行中のプロセスを一覧表示 {#list-currently-running-processes-by-peak-memory}

```sql
SELECT
    initial_query_id,
    query,
    elapsed,
    formatReadableSize(memory_usage),
    formatReadableSize(peak_memory_usage),
FROM system.processes
ORDER BY peak_memory_usage DESC
LIMIT 100;
```


## メモリ使用量のメトリクスを一覧表示 {#list-metrics-for-memory-usage}

```sql
SELECT
    metric, description, formatReadableSize(value) size
FROM
    system.asynchronous_metrics
WHERE
    metric LIKE '%Cach%'
    OR metric LIKE '%Mem%'
ORDER BY
    value DESC;
```


## 現在のメモリ使用量によるテーブルの一覧表示 {#list-tables-by-current-memory-usage}

```sql
SELECT
    database,
    name,
    formatReadableSize(total_bytes)
FROM system.tables
WHERE engine IN ('Memory','Set','Join');
```


## マージで使用されている総メモリ量を出力 {#output-total-memory-used-by-merges}

```sql
SELECT formatReadableSize(sum(memory_usage)) FROM system.merges;
```


## 現在実行中のプロセスが使用している総メモリ量を出力する {#output-total-memory-used-by-currently-running-processes}

```sql
SELECT formatReadableSize(sum(memory_usage)) FROM system.processes;
```


## ディクショナリが使用する総メモリ量を出力 {#output-total-memory-used-by-dictionaries}

```sql
SELECT formatReadableSize(sum(bytes_allocated)) FROM system.dictionaries;
```


## プライマリキーとインデックス粒度が使用する総メモリ量を出力する {#output-total-memory-used-by-primary-keys}

```sql
SELECT
    sumIf(data_uncompressed_bytes, part_type = 'InMemory') AS memory_parts,
    formatReadableSize(sum(primary_key_bytes_in_memory)) AS primary_key_bytes_in_memory,
    formatReadableSize(sum(primary_key_bytes_in_memory_allocated)) AS primary_key_bytes_in_memory_allocated,
    formatReadableSize(sum(index_granularity_bytes_in_memory)) AS index_granularity_bytes_in_memory,
    formatReadableSize(sum(index_granularity_bytes_in_memory_allocated)) AS index_granularity_bytes_in_memory_allocated
FROM system.parts;
```
