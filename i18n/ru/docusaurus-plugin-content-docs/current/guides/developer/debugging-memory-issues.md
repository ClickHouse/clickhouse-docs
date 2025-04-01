---
slug: /guides/developer/debugging-memory-issues
sidebar_label: 'Отладка проблем с памятью'
sidebar_position: 1
description: 'Запросы, которые помогут вам отладить проблемы с памятью.'
keywords: ['проблемы с памятью']
title: 'Отладка проблем с памятью'
---


# Отладка проблем с памятью {#debugging-memory-issues}

При возникновении проблем с памятью или утечке памяти полезно знать, какие запросы и ресурсы потребляют значительное количество памяти. Ниже вы можете найти запросы, которые могут помочь вам отладить проблемы с памятью, определив, какие запросы, базы данных и таблицы могут быть оптимизированы:

## Список текущих выполняемых процессов по максимальному использованию памяти {#list-currently-running-processes-by-peak-memory}

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

## Список метрик использования памяти {#list-metrics-for-memory-usage}

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

## Список таблиц по текущему использованию памяти {#list-tables-by-current-memory-usage}

```sql
SELECT
    database,
    name,
    formatReadableSize(total_bytes)
FROM system.tables
WHERE engine IN ('Memory','Set','Join');
```

## Вывод общего объема памяти, используемой мержами {#output-total-memory-used-by-merges}

```sql
SELECT formatReadableSize(sum(memory_usage)) FROM system.merges;
```

## Вывод общего объема памяти, используемой текущими выполняемыми процессами {#output-total-memory-used-by-currently-running-processes}

```sql
SELECT formatReadableSize(sum(memory_usage)) FROM system.processes;
```

## Вывод общего объема памяти, используемой словарями {#output-total-memory-used-by-dictionaries}

```sql
SELECT formatReadableSize(sum(bytes_allocated)) FROM system.dictionaries;
```

## Вывод общего объема памяти, используемой первичными ключами {#output-total-memory-used-by-primary-keys}

```sql
SELECT
    sumIf(data_uncompressed_bytes, part_type = 'InMemory') as memory_parts,
    formatReadableSize(sum(primary_key_bytes_in_memory)) AS primary_key_bytes_in_memory,
    formatReadableSize(sum(primary_key_bytes_in_memory_allocated)) AS primary_key_bytes_in_memory_allocated
FROM system.parts;
```
