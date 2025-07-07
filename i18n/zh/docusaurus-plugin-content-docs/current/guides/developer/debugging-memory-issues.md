---
'slug': '/guides/developer/debugging-memory-issues'
'sidebar_label': '调试内存问题'
'sidebar_position': 1
'description': '查询以帮助您调试内存问题。'
'keywords':
- 'memory issues'
'title': '调试内存问题'
---


# 调试内存问题 {#debugging-memory-issues}

当遇到内存问题或内存泄漏时，了解哪些查询和资源正在消耗大量内存是非常有帮助的。下面您可以找到一些查询，它们可以帮助您通过查找哪些查询、数据库和表可以优化来调试内存问题：

## 按峰值内存使用列出当前运行的进程 {#list-currently-running-processes-by-peak-memory}

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

## 列出内存使用的指标 {#list-metrics-for-memory-usage}

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

## 按当前内存使用列出表 {#list-tables-by-current-memory-usage}

```sql
SELECT
    database,
    name,
    formatReadableSize(total_bytes)
FROM system.tables
WHERE engine IN ('Memory','Set','Join');
```

## 输出合并所使用的总内存 {#output-total-memory-used-by-merges}

```sql
SELECT formatReadableSize(sum(memory_usage)) FROM system.merges;
```

## 输出当前运行进程所使用的总内存 {#output-total-memory-used-by-currently-running-processes}

```sql
SELECT formatReadableSize(sum(memory_usage)) FROM system.processes;
```

## 输出字典所使用的总内存 {#output-total-memory-used-by-dictionaries}

```sql
SELECT formatReadableSize(sum(bytes_allocated)) FROM system.dictionaries;
```

## 输出主键所使用的总内存 {#output-total-memory-used-by-primary-keys}

```sql
SELECT
    sumIf(data_uncompressed_bytes, part_type = 'InMemory') as memory_parts,
    formatReadableSize(sum(primary_key_bytes_in_memory)) AS primary_key_bytes_in_memory,
    formatReadableSize(sum(primary_key_bytes_in_memory_allocated)) AS primary_key_bytes_in_memory_allocated
FROM system.parts;
```
