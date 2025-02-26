---
slug: /guides/developer/debugging-memory-issues
sidebar_label: メモリの問題のデバッグ
sidebar_position: 1
description: メモリの問題をデバッグするためのクエリ。
---

# メモリの問題のデバッグ

メモリの問題やメモリリークが発生した場合、どのクエリやリソースが大量のメモリを消費しているかを知ることは役立ちます。以下は、デバッグを助け、最適化可能なクエリ、データベース、およびテーブルを特定するのに役立つクエリです。

**ピークメモリ使用量による現在実行中のプロセスのリスト**

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

**メモリ使用量に関するメトリックのリスト**

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

**現在のメモリ使用量によるテーブルのリスト**

```sql
SELECT
    database,
    name,
    formatReadableSize(total_bytes)
FROM system.tables
WHERE engine IN ('Memory','Set','Join');
```

**マージに使用された総メモリの出力**

```sql
SELECT formatReadableSize(sum(memory_usage)) FROM system.merges;
```

**現在実行中のプロセスによって使用されている総メモリの出力**

```sql
SELECT formatReadableSize(sum(memory_usage)) FROM system.processes;
```

**辞書によって使用されている総メモリの出力**

```sql
SELECT formatReadableSize(sum(bytes_allocated)) FROM system.dictionaries;
```

**主キーによって使用されている総メモリの出力**

```sql
SELECT
    sumIf(data_uncompressed_bytes, part_type = 'InMemory') as memory_parts,
    formatReadableSize(sum(primary_key_bytes_in_memory)) AS primary_key_bytes_in_memory,
    formatReadableSize(sum(primary_key_bytes_in_memory_allocated)) AS primary_key_bytes_in_memory_allocated
FROM system.parts;
```
