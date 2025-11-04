---
'slug': '/guides/developer/debugging-memory-issues'
'sidebar_label': 'メモリの問題をデバッグする'
'sidebar_position': 1
'description': 'メモリの問題をデバッグするためのクエリ。'
'keywords':
- 'memory issues'
'title': 'メモリの問題をデバッグする'
'doc_type': 'guide'
---


# メモリ問題のデバッグ {#debugging-memory-issues}

メモリ問題やメモリリークに直面したときに、どのクエリやリソースが多くのメモリを消費しているかを知っていると役立ちます。以下に、どのクエリ、データベース、テーブルが最適化できるかを見つけるためのメモリ問題をデバッグするのに役立つクエリを示します。

## ピークメモリ使用量による現在実行中のプロセスのリスト {#list-currently-running-processes-by-peak-memory}

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

## メモリ使用量のメトリックのリスト {#list-metrics-for-memory-usage}

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

## 現在のメモリ使用量によるテーブルのリスト {#list-tables-by-current-memory-usage}

```sql
SELECT
    database,
    name,
    formatReadableSize(total_bytes)
FROM system.tables
WHERE engine IN ('Memory','Set','Join');
```

## マージによる総メモリ使用量の出力 {#output-total-memory-used-by-merges}

```sql
SELECT formatReadableSize(sum(memory_usage)) FROM system.merges;
```

## 現在実行中のプロセスによる総メモリ使用量の出力 {#output-total-memory-used-by-currently-running-processes}

```sql
SELECT formatReadableSize(sum(memory_usage)) FROM system.processes;
```

## 辞書による総メモリ使用量の出力 {#output-total-memory-used-by-dictionaries}

```sql
SELECT formatReadableSize(sum(bytes_allocated)) FROM system.dictionaries;
```

## 主キーおよびインデックスの粒度による総メモリ使用量の出力 {#output-total-memory-used-by-primary-keys}

```sql
SELECT
    sumIf(data_uncompressed_bytes, part_type = 'InMemory') AS memory_parts,
    formatReadableSize(sum(primary_key_bytes_in_memory)) AS primary_key_bytes_in_memory,
    formatReadableSize(sum(primary_key_bytes_in_memory_allocated)) AS primary_key_bytes_in_memory_allocated,
    formatReadableSize(sum(index_granularity_bytes_in_memory)) AS index_granularity_bytes_in_memory,
    formatReadableSize(sum(index_granularity_bytes_in_memory_allocated)) AS index_granularity_bytes_in_memory_allocated
FROM system.parts;
```
