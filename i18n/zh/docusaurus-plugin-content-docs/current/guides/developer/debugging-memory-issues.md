---
slug: /guides/developer/debugging-memory-issues
sidebar_label: '调试内存问题'
sidebar_position: 1
description: '用于帮助你调试内存问题的查询语句。'
keywords: ['内存问题']
title: '调试内存问题'
doc_type: 'guide'
---

# 调试内存问题 \{#debugging-memory-issues\}

在遇到内存问题或内存泄漏时，了解哪些查询和资源正在消耗大量内存会非常有帮助。下面提供了一些查询，可用于通过找出哪些查询、数据库和表可以优化来排查内存问题：

## 按峰值内存使用排序列出当前正在运行的进程 \{#list-currently-running-processes-by-peak-memory\}

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

## 列出内存使用指标 \{#list-metrics-for-memory-usage\}

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

## 按当前内存使用情况列出表 \{#list-tables-by-current-memory-usage\}

```sql
SELECT
    database,
    name,
    formatReadableSize(total_bytes)
FROM system.tables
WHERE engine IN ('Memory','Set','Join');
```

## 输出合并操作的总内存使用量 \{#output-total-memory-used-by-merges\}

```sql
SELECT formatReadableSize(sum(memory_usage)) FROM system.merges;
```

## 输出当前正在运行的进程所使用的内存总量 \{#output-total-memory-used-by-currently-running-processes\}

```sql
SELECT formatReadableSize(sum(memory_usage)) FROM system.processes;
```

## 输出字典占用的内存总量 \{#output-total-memory-used-by-dictionaries\}

```sql
SELECT formatReadableSize(sum(bytes_allocated)) FROM system.dictionaries;
```

## 输出主键和索引粒度所使用的内存总量 \{#output-total-memory-used-by-primary-keys\}

```sql
SELECT
    sumIf(data_uncompressed_bytes, part_type = 'InMemory') AS memory_parts,
    formatReadableSize(sum(primary_key_bytes_in_memory)) AS primary_key_bytes_in_memory,
    formatReadableSize(sum(primary_key_bytes_in_memory_allocated)) AS primary_key_bytes_in_memory_allocated,
    formatReadableSize(sum(index_granularity_bytes_in_memory)) AS index_granularity_bytes_in_memory,
    formatReadableSize(sum(index_granularity_bytes_in_memory_allocated)) AS index_granularity_bytes_in_memory_allocated
FROM system.parts;
```
