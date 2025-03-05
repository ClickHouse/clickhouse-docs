---
slug: /guides/developer/debugging-memory-issues
sidebar_label: メモリ問題のデバッグ
sidebar_position: 1
description: メモリ問題をデバッグするためのクエリ。
---


# メモリ問題のデバッグ

メモリ問題やメモリリークに遭遇した際、どのクエリやリソースが大量のメモリを消費しているかを把握することが役立ちます。以下は、どのクエリ、データベース、テーブルが最適化できるかを見つけるためのデバッグに役立つクエリです。

**ピークメモリ使用量別に現在実行中のプロセスをリスト**

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

**メモリ使用量のメトリックをリスト**

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

**現在のメモリ使用量別にテーブルをリスト**

```sql
SELECT
    database,
    name,
    formatReadableSize(total_bytes)
FROM system.tables
WHERE engine IN ('Memory','Set','Join');
```

**マージによって使用される合計メモリを出力**

```sql
SELECT formatReadableSize(sum(memory_usage)) FROM system.merges;
```

**現在実行中のプロセスによって使用される合計メモリを出力**

```sql
SELECT formatReadableSize(sum(memory_usage)) FROM system.processes;
```

**辞書によって使用される合計メモリを出力**

```sql
SELECT formatReadableSize(sum(bytes_allocated)) FROM system.dictionaries;
```

**主キーによって使用される合計メモリを出力**

```sql
SELECT
    sumIf(data_uncompressed_bytes, part_type = 'InMemory') as memory_parts,
    formatReadableSize(sum(primary_key_bytes_in_memory)) AS primary_key_bytes_in_memory,
    formatReadableSize(sum(primary_key_bytes_in_memory_allocated)) AS primary_key_bytes_in_memory_allocated
FROM system.parts;
```
