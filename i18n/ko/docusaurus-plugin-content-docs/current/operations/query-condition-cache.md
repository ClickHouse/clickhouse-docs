---
'description': 'ClickHouse에서 쿼리 조건 캐시 기능을 사용하고 구성하는 방법에 대한 안내'
'sidebar_label': '쿼리 조건 캐시'
'sidebar_position': 64
'slug': '/operations/query-condition-cache'
'title': '쿼리 조건 캐시'
'doc_type': 'guide'
---


# 쿼리 조건 캐시

:::note
쿼리 조건 캐시는 [enable_analyzer](https://clickhouse.com/docs/operations/settings/settings#enable_analyzer)가 true로 설정된 경우에만 작동하며, 이는 기본값입니다.
:::

많은 실제 작업 부하는 동일하거나 거의 동일한 데이터에 대한 반복 쿼리를 포함합니다(예: 기존 데이터와 새로운 데이터).  
ClickHouse는 이러한 쿼리 패턴을 최적화하기 위한 다양한 최적화 기술을 제공합니다.  
한 가지 방법은 인덱스 구조(예: 기본 키 인덱스, 스킵 인덱스, 프로젝션)를 사용하여 물리적 데이터 레이아웃을 조정하거나 사전 계산(물리화된 뷰)을 사용하는 것입니다.  
또 다른 방법은 ClickHouse의 [쿼리 캐시](query-cache.md)를 사용하여 반복적으로 쿼리 평가를 피하는 것입니다.  
첫 번째 접근 방식의 단점은 데이터베이스 관리자가 수동으로 개입하고 모니터링해야 한다는 것입니다.  
두 번째 접근 방식은 쿼리 캐시가 트랜잭션적으로 일관성이 없기 때문에 경우에 따라 구식 결과를 반환할 수 있습니다. 이는 사용 사례에 따라 허용될 수도 있고 허용되지 않을 수도 있습니다.

쿼리 조건 캐시는 두 문제에 대한 우아한 솔루션을 제공합니다.  
이는 동일한 데이터에 대한 필터 조건(예: `WHERE col = 'xyz'`)을 평가하는 것이 항상 동일한 결과를 반환한다는 아이디어를 기반으로 합니다.  
더 구체적으로, 쿼리 조건 캐시는 평가된 각 필터와 각 그레뉼(기본값으로 8192개의 행의 블록)에 대해 해당 그레뉼 내에서 필터 조건을 만족하는 행이 없을 경우를 기억합니다.  
정보는 단일 비트로 기록되며: 0 비트는 일치하는 행이 없음을 나타내고 1 비트는 최소한 하나의 일치하는 행이 존재함을 의미합니다.  
전자의 경우, ClickHouse는 필터 평가 중에 해당 그레뉼을 건너뛸 수 있으며, 후자의 경우 해당 그레뉼을 로드하고 평가해야 합니다.

쿼리 조건 캐시는 세 가지 전제가 충족되는 경우에 효과적입니다:
- 첫째, 작업 부하는 동일한 필터 조건을 반복적으로 평가해야 합니다. 이는 쿼리가 여러 번 반복될 때 자연스럽게 발생하지만, 두 쿼리가 동일한 필터를 공유할 경우에도 발생할 수 있습니다. 예를 들어 `SELECT product FROM products WHERE quality > 3`와 `SELECT vendor, count() FROM products WHERE quality > 3`.
- 둘째, 데이터의 대다수는 불변(즉, 쿼리 간에 변경되지 않음)해야 합니다. ClickHouse에서는 파트가 불변이며 INSERT로만 생성되므로 일반적으로 이러한 경우가 많습니다.
- 셋째, 필터는 선택적이어야 합니다. 즉, 필터 조건을 만족하는 행은 상대적으로 적어야 합니다. 필터 조건을 만족하는 행이 적어질수록 bit 0(일치하는 행 없음)으로 기록된 그레뉼이 더 많아지고, 이후 필터 평가에서 "프루닝"할 수 있는 데이터가 더 많아집니다.

## 메모리 소비 {#memory-consumption}

쿼리 조건 캐시는 필터 조건 및 그레뉼당 단일 비트만 저장하므로 메모리를 거의 소모하지 않습니다.  
쿼리 조건 캐시의 최대 크기는 서버 설정 [`query_condition_cache_size`](server-configuration-parameters/settings.md#query_condition_cache_size)를 사용하여 구성할 수 있으며(기본값: 100 MB),  
100 MB의 캐시 크기는 100 * 1024 * 1024 * 8 = 838,860,800개의 항목에 해당합니다.  
각 항목은 마크를 나타내므로(기본값으로 8192개의 행), 캐시는 단일 컬럼의 최대 6,871,947,673,600(6.8 조) 개의 행을 포함할 수 있습니다.  
실제로는 하나 이상의 컬럼에서 필터가 평가되므로 이 숫자는 필터링된 컬럼의 수로 나누어야 합니다.

## 구성 설정 및 사용 {#configuration-settings-and-usage}

설정 [use_query_condition_cache](settings/settings#use_query_condition_cache)는 특정 쿼리 또는 현재 세션의 모든 쿼리가 쿼리 조건 캐시를 활용해야 하는지를 제어합니다.  

예를 들어, 쿼리의 첫 번째 실행

```sql
SELECT col1, col2
FROM table
WHERE col1 = 'x'
SETTINGS use_query_condition_cache = true;
```

는 술어를 만족하지 않는 테이블의 범위를 저장합니다.  
매개변수 `use_query_condition_cache = true`로 동일한 쿼리를 이후에 실행하면 쿼리 조건 캐시를 사용하여 더 적은 데이터를 스캔합니다.

## 관리 {#administration}

쿼리 조건 캐시는 ClickHouse의 재시작 간에 유지되지 않습니다.  

쿼리 조건 캐시를 지우려면 [`SYSTEM DROP QUERY CONDITION CACHE`](../sql-reference/statements/system.md#drop-query-condition-cache)를 실행하십시오.  

캐시의 내용은 시스템 테이블 [system.query_condition_cache](system-tables/query_condition_cache.md)에서 표시됩니다.  
현재 쿼리 조건 캐시의 크기를 MB 단위로 계산하려면 `SELECT formatReadableSize(sum(entry_size)) FROM system.query_condition_cache`를 실행하십시오.  
개별 필터 조건을 조사하고 싶다면 `system.query_condition_cache`의 필드 `condition`을 확인할 수 있습니다.  
해당 필드는 설정 [query_condition_cache_store_conditions_as_plaintext](settings/settings#query_condition_cache_store_conditions_as_plaintext)가 활성화된 상태에서 쿼리가 실행될 때만 채워집니다.

데이터베이스 시작 이후 쿼리 조건 캐시 적중 수와 실패 수는 시스템 테이블 [system.events](system-tables/events.md)에서 "QueryConditionCacheHits" 및 "QueryConditionCacheMisses" 이벤트로 표시됩니다.  
두 카운터는 설정 `use_query_condition_cache = true`로 실행된 `SELECT` 쿼리에 대해서만 업데이트되며, 다른 쿼리는 "QueryCacheMisses"에 영향을 미치지 않습니다.

## 관련 콘텐츠 {#related-content}

- 블로그: [쿼리 조건 캐시 소개](https://clickhouse.com/blog/introducing-the-clickhouse-query-condition-cache)
- [Predicate Caching: Query-Driven Secondary Indexing for Cloud Data Warehouses (Schmidt et. al., 2024)](https://doi.org/10.1145/3626246.3653395)
