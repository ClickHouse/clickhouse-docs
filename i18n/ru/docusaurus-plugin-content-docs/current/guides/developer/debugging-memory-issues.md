---
slug: /guides/developer/debugging-memory-issues
sidebar_label: 'Отладка проблем с памятью'
sidebar_position: 1
description: 'Запросы, которые помогут вам диагностировать проблемы с памятью.'
keywords: ['проблемы с памятью']
title: 'Отладка проблем с памятью'
doc_type: 'guide'
---

При возникновении проблем с памятью или утечки памяти важно понимать, какие запросы и ресурсы потребляют значительный объём памяти. Ниже приведены запросы, которые помогут вам диагностировать проблемы с памятью, выявив, какие запросы, базы данных и таблицы можно оптимизировать:

## Вывод списка текущих процессов по пиковому использованию памяти \{#list-currently-running-processes-by-peak-memory\}

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

## Список метрик использования памяти \{#list-metrics-for-memory-usage\}

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

## Список таблиц по текущему использованию памяти \{#list-tables-by-current-memory-usage\}

```sql
SELECT
    database,
    name,
    formatReadableSize(total_bytes)
FROM system.tables
WHERE engine IN ('Memory','Set','Join');
```

## Вывести общий объём памяти, используемой слияниями \{#output-total-memory-used-by-merges\}

```sql
SELECT formatReadableSize(sum(memory_usage)) FROM system.merges;
```

## Вывести общий объём памяти, используемой текущими процессами \{#output-total-memory-used-by-currently-running-processes\}

```sql
SELECT formatReadableSize(sum(memory_usage)) FROM system.processes;
```

## Вывод общего объёма памяти, используемой словарями \{#output-total-memory-used-by-dictionaries\}

```sql
SELECT formatReadableSize(sum(bytes_allocated)) FROM system.dictionaries;
```

## Вывести общий объём памяти, используемый первичными ключами и гранулами индекса \{#output-total-memory-used-by-primary-keys\}

```sql
SELECT
    sumIf(data_uncompressed_bytes, part_type = 'InMemory') AS memory_parts,
    formatReadableSize(sum(primary_key_bytes_in_memory)) AS primary_key_bytes_in_memory,
    formatReadableSize(sum(primary_key_bytes_in_memory_allocated)) AS primary_key_bytes_in_memory_allocated,
    formatReadableSize(sum(index_granularity_bytes_in_memory)) AS index_granularity_bytes_in_memory,
    formatReadableSize(sum(index_granularity_bytes_in_memory_allocated)) AS index_granularity_bytes_in_memory_allocated
FROM system.parts;
```