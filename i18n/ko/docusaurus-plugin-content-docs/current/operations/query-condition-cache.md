---
description: 'ClickHouse에서 쿼리 조건 캐시 기능을 사용하고 구성하는 방법에 대한 가이드'
sidebar_label: '쿼리 조건 캐시'
sidebar_position: 64
slug: /operations/query-condition-cache
title: '쿼리 조건 캐시'
doc_type: 'guide'
---

# Query condition cache \{#query-condition-cache\}

:::note
query condition cache는 [enable_analyzer](https://clickhouse.com/docs/operations/settings/settings#enable_analyzer)가 true로 설정되어 있을 때만 동작하며, 이 값이 기본값입니다.
:::

많은 실제 워크로드에서는 동일하거나 거의 동일한 데이터(예: 기존 데이터에 새로운 데이터가 추가된 것)에 대해 반복적으로 쿼리를 수행합니다.
ClickHouse는 이러한 쿼리 패턴을 최적화하기 위한 다양한 최적화 기법을 제공합니다.
한 가지 방법은 인덱스 구조(예: 기본 키 인덱스, 스키핑 인덱스, 프로젝션)를 사용하거나 사전 계산(materialized view)을 통해 물리적 데이터 레이아웃을 조정하는 것입니다.
또 다른 방법은 ClickHouse의 [query cache](query-cache.md)를 사용하여 반복적인 쿼리 평가 자체를 피하는 것입니다.
첫 번째 접근 방식의 단점은 데이터베이스 관리자가 수동으로 개입하고 모니터링해야 한다는 점입니다.
두 번째 접근 방식은 query cache가 트랜잭션 수준에서 일관성을 보장하지 않기 때문에 오래된 결과를 반환할 수 있으며, 이는 사용 사례에 따라 허용될 수도 있고 허용되지 않을 수도 있습니다.

query condition cache는 이 두 가지 문제에 대한 우아한 해결책을 제공합니다.
이는 동일한 데이터에 대해 필터 조건(예: `WHERE col = 'xyz'`)을 평가하면 항상 동일한 결과가 나온다는 아이디어에 기반합니다.
보다 구체적으로, query condition cache는 각 평가된 필터와 각 그래뉼(기본적으로 8192개의 행으로 이루어진 블록)에 대해, 해당 그래뉼에서 필터 조건을 만족하는 행이 전혀 없는지를 기억합니다.
이 정보는 단일 비트로 기록되며, 비트 0은 필터와 일치하는 행이 없음을, 비트 1은 최소 하나 이상의 일치하는 행이 있음을 나타냅니다.
전자의 경우 ClickHouse는 필터 평가 중에 해당 그래뉼을 건너뛸 수 있고, 후자의 경우에는 그래뉼을 로드하여 평가해야 합니다.

query condition cache는 다음의 세 가지 전제 조건이 충족될 때 효과적입니다:

- 첫째, 워크로드에서 동일한 필터 조건을 반복적으로 평가해야 합니다. 이는 하나의 쿼리가 여러 번 반복 실행되는 경우 자연스럽게 발생하지만, `SELECT product FROM products WHERE quality > 3`와 `SELECT vendor, count() FROM products WHERE quality > 3`와 같이 두 쿼리가 동일한 필터를 공유하는 경우에도 발생할 수 있습니다.
- 둘째, 데이터의 대부분이 불변(immutable)이어서 쿼리 사이에 변경되지 않아야 합니다. 이는 ClickHouse에서는 일반적으로 사실인데, 파트가 불변이며 INSERT에 의해서만 생성되기 때문입니다.
- 셋째, 필터의 선택도가 높아야(selective) 하며, 즉 필터 조건을 만족하는 행이 상대적으로 적어야 합니다. 필터 조건과 일치하는 행이 적을수록 더 많은 그래뉼이 비트 0(일치하는 행 없음)으로 기록되며, 그만큼 이후 필터 평가에서 "가지치기(pruning)"할 수 있는 데이터가 많아집니다.

## 메모리 사용량 \{#memory-consumption\}

쿼리 조건 캐시는 필터 조건과 그래뉼(granule)마다 단일 비트만 저장하므로, 메모리 사용량이 매우 적습니다.
쿼리 조건 캐시의 최대 크기는 서버 설정 [`query_condition_cache_size`](server-configuration-parameters/settings.md#query_condition_cache_size) (기본값: 100 MB)을 사용하여 설정할 수 있습니다.
캐시 크기가 100 MB이면 100 * 1024 * 1024 * 8 = 838,860,800개의 엔트리에 해당합니다.
각 엔트리는 하나의 마크(기본적으로 8192개의 행)를 나타내므로, 캐시는 단일 컬럼에서 최대 6,871,947,673,600개(6.8조)의 행을 포함할 수 있습니다.
실제 사용 시에는 필터가 둘 이상의 컬럼에 대해 평가되므로, 이 수는 필터링되는 컬럼 수로 나누어야 합니다.

## 구성 설정 및 사용 방법 \{#configuration-settings-and-usage\}

[use&#95;query&#95;condition&#95;cache](settings/settings#use_query_condition_cache) 설정은 특정 쿼리나 현재 세션의 모든 쿼리에 대해 쿼리 조건 캐시를 사용할지 여부를 제어합니다.

예를 들어, 쿼리를 처음 실행할 때

```sql
SELECT col1, col2
FROM table
WHERE col1 = 'x'
SETTINGS use_query_condition_cache = true;
```

프리디케이트를 만족하지 않는 테이블의 데이터 범위를 저장합니다.
이후 동일한 쿼리를 `use_query_condition_cache = true` 매개변수와 함께 실행하면, 쿼리 조건 캐시를 활용하여 더 적은 양의 데이터만 스캔합니다.


## Administration \{#administration\}

쿼리 조건 캐시는 ClickHouse를 재시작해도 유지되지 않습니다.

쿼리 조건 캐시를 비우려면 [`SYSTEM CLEAR QUERY CONDITION CACHE`](../sql-reference/statements/system.md#drop-query-condition-cache)를 실행합니다.

캐시의 내용은 시스템 테이블 [system.query_condition_cache](system-tables/query_condition_cache.md)에 표시됩니다.
현재 쿼리 조건 캐시의 크기를 MB 단위로 계산하려면 `SELECT formatReadableSize(sum(entry_size)) FROM system.query_condition_cache`를 실행합니다.
개별 필터 조건을 분석하려면 `system.query_condition_cache`의 `condition` 필드를 확인하면 됩니다. 이 필드는 디버그 빌드에서만 사용할 수 있습니다.

데이터베이스가 시작된 이후 쿼리 조건 캐시의 히트(hit) 및 미스(miss) 횟수는 시스템 테이블 [system.events](system-tables/events.md)에서 "QueryConditionCacheHits" 및 "QueryConditionCacheMisses" 이벤트로 표시됩니다.
두 카운터는 `use_query_condition_cache = true` 설정으로 실행되는 `SELECT` 쿼리에 대해서만 업데이트되며, 다른 쿼리는 "QueryCacheMisses"에 영향을 주지 않습니다.

## 관련 자료 \{#related-content\}

- 블로그 게시물: [Introducing the Query Condition Cache](https://clickhouse.com/blog/introducing-the-clickhouse-query-condition-cache)
- [Predicate Caching: Query-Driven Secondary Indexing for Cloud Data Warehouses (Schmidt et. al., 2024)](https://doi.org/10.1145/3626246.3653395)