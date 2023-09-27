---
slug: /en/guides/developer/debugging-memory-issues
sidebar_label: Debugging Memory Issues
sidebar_position: 1
description: Queries to help you debug memory issues.
---

# Debugging memory issues

When encountering memory issues, it is helpful to know what queries and resources are consuming a significant amount of memory. Below are queries that can help find which queries, databases, and tables can be optimized:

**List queries by peak memory usage**

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

**List metrics based on total memory usage**

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

**List databases by current memory usage**

```sql
SELECT
    database,
    name,
    formatReadableSize(total_bytes)
FROM system.tables
WHERE engine IN ('Memory','Set','Join');
```

**List merges by current memory usage**

```sql
SELECT formatReadableSize(sum(memory_usage)) FROM system.merges;
```

**List processes by current memory usage**

```sql
SELECT formatReadableSize(sum(memory_usage)) FROM system.processes;
```

**Output total memory used by dictionaries**

```sql
SELECT formatReadableSize(sum(bytes_allocated)) FROM system.dictionaries;
```

**Output total memory used by primary keys**

```sql
SELECT
    sumIf(data_uncompressed_bytes, part_type = 'InMemory') as memory_parts,
    formatReadableSize(sum(primary_key_bytes_in_memory)) AS primary_key_bytes_in_memory,
    formatReadableSize(sum(primary_key_bytes_in_memory_allocated)) AS primary_key_bytes_in_memory_allocated
FROM system.parts;
```

