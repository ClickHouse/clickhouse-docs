---
slug: /guides/developer/debugging-memory-issues
sidebar_label: 'メモリ問題のデバッグ'
sidebar_position: 1
description: 'メモリ問題をデバッグするためのクエリ。'
keywords: ['メモリ問題']
title: 'メモリ問題のデバッグ'
---


# メモリ問題のデバッグ {#debugging-memory-issues}

メモリ問題やメモリリークが発生した場合、どのクエリやリソースが大量のメモリを消費しているのかを知ることが役立ちます。以下には、どのクエリ、データベース、テーブルが最適化可能かを見つけることでメモリ問題をデバッグするのに役立つクエリがあります：

## ピークメモリ使用量で現在実行中のプロセスをリストする {#list-currently-running-processes-by-peak-memory}

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

## メモリ使用量のメトリクスをリストする {#list-metrics-for-memory-usage}

```sql
SELECT
    metric, description, formatReadableSize(value) size
FROM
    system.asynchronous_metrics
WHERE
    metric like '%Cach%'
    or metric like '%Mem%'
order by
    value desc;
```

## 現在のメモリ使用量でテーブルをリストする {#list-tables-by-current-memory-usage}

```sql
SELECT
    database,
    name,
    formatReadableSize(total_bytes)
FROM system.tables
WHERE engine IN ('Memory','Set','Join');
```

## マージによって使用される合計メモリを出力する {#output-total-memory-used-by-merges}

```sql
SELECT formatReadableSize(sum(memory_usage)) FROM system.merges;
```

## 現在実行中のプロセスによって使用される合計メモリを出力する {#output-total-memory-used-by-currently-running-processes}

```sql
SELECT formatReadableSize(sum(memory_usage)) FROM system.processes;
```

## 辞書によって使用される合計メモリを出力する {#output-total-memory-used-by-dictionaries}

```sql
SELECT formatReadableSize(sum(bytes_allocated)) FROM system.dictionaries;
```

## 主キーによって使用される合計メモリを出力する {#output-total-memory-used-by-primary-keys}

```sql
SELECT
    sumIf(data_uncompressed_bytes, part_type = 'InMemory') as memory_parts,
    formatReadableSize(sum(primary_key_bytes_in_memory)) AS primary_key_bytes_in_memory,
    formatReadableSize(sum(primary_key_bytes_in_memory_allocated)) AS primary_key_bytes_in_memory_allocated
FROM system.parts;
```
