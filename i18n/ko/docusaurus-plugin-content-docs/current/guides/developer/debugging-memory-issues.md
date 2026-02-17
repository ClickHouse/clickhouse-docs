---
slug: /guides/developer/debugging-memory-issues
sidebar_label: '메모리 문제 디버깅'
sidebar_position: 1
description: '메모리 문제를 디버깅하는 데 도움이 되는 쿼리'
keywords: ['메모리 문제']
title: '메모리 문제 디버깅'
doc_type: 'guide'
---



# 메모리 문제 디버깅 \{#debugging-memory-issues\}

메모리 문제나 메모리 누수가 발생했을 때에는 어떤 쿼리와 리소스가 많은 메모리를 사용하고 있는지 파악하는 것이 중요합니다. 아래 쿼리들은 어떤 쿼리, 데이터베이스, 테이블을 최적화할 수 있는지 찾아 메모리 문제를 디버깅하는 데 도움이 됩니다:



## 최대 메모리 사용량 기준으로 현재 실행 중인 프로세스 나열 \{#list-currently-running-processes-by-peak-memory\}

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


## 메모리 사용량 관련 메트릭 목록 \{#list-metrics-for-memory-usage\}

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


## 현재 메모리 사용량 기준 테이블 목록 \{#list-tables-by-current-memory-usage\}

```sql
SELECT
    database,
    name,
    formatReadableSize(total_bytes)
FROM system.tables
WHERE engine IN ('Memory','Set','Join');
```


## 머지 작업에서 사용된 전체 메모리 출력 \{#output-total-memory-used-by-merges\}

```sql
SELECT formatReadableSize(sum(memory_usage)) FROM system.merges;
```


## 현재 실행 중인 프로세스의 전체 메모리 사용량 출력 \{#output-total-memory-used-by-currently-running-processes\}

```sql
SELECT formatReadableSize(sum(memory_usage)) FROM system.processes;
```


## 사전이 사용한 총 메모리 출력 \{#output-total-memory-used-by-dictionaries\}

```sql
SELECT formatReadableSize(sum(bytes_allocated)) FROM system.dictionaries;
```


## 프라이머리 키와 인덱스 그래뉼러리티 사용 총 메모리 출력 \{#output-total-memory-used-by-primary-keys\}

```sql
SELECT
    sumIf(data_uncompressed_bytes, part_type = 'InMemory') AS memory_parts,
    formatReadableSize(sum(primary_key_bytes_in_memory)) AS primary_key_bytes_in_memory,
    formatReadableSize(sum(primary_key_bytes_in_memory_allocated)) AS primary_key_bytes_in_memory_allocated,
    formatReadableSize(sum(index_granularity_bytes_in_memory)) AS index_granularity_bytes_in_memory,
    formatReadableSize(sum(index_granularity_bytes_in_memory_allocated)) AS index_granularity_bytes_in_memory_allocated
FROM system.parts;
```
