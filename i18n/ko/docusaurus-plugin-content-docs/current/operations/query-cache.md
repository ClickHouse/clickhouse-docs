---
'description': 'ClickHouse에서 쿼리 캐시 기능을 사용하고 구성하는 방법에 대한 안내'
'sidebar_label': '쿼리 캐시'
'sidebar_position': 65
'slug': '/operations/query-cache'
'title': '쿼리 캐시'
'doc_type': 'guide'
---


# 쿼리 캐시

쿼리 캐시는 `SELECT` 쿼리를 한 번만 계산하고 동일한 쿼리의 추가 실행을 캐시에서 직접 제공할 수 있도록 합니다. 쿼리의 유형에 따라 ClickHouse 서버의 대기 시간과 자원 소비를 드라마틱하게 줄일 수 있습니다.

## 배경, 설계 및 제한 사항 {#background-design-and-limitations}

쿼리 캐시는 일반적으로 거래 일관성 또는 비일관성으로 볼 수 있습니다.

- 거래 일관성 캐시에서는 `SELECT` 쿼리의 결과가 변경되거나 잠재적으로 변경될 경우, 데이터베이스가 캐시된 쿼리 결과를 무효화(버리기)합니다. ClickHouse에서 데이터를 변경하는 작업에는 테이블의 삽입/업데이트/삭제 또는 병합이 포함됩니다. 거래 일관성 캐시는 OLTP 데이터베이스에 특히 적합하며, 예를 들어
  [MySQL](https://dev.mysql.com/doc/refman/5.6/en/query-cache.html) (v8.0 이후 쿼리 캐시 제거)와
  [Oracle](https://docs.oracle.com/database/121/TGDBA/tune_result_cache.htm)와 같은 데이터베이스가 있습니다.
- 거래 비일관성 캐시에서는 쿼리 결과의 경미한 부정확성을 허용하며, 모든 캐시 항목에 유효 기간을 부여하여 이 기간이 지나면 만료된다는 전제가 있습니다(예: 1분). 이 기간 동안 기본 데이터가 변화하는 양도 적습니다. 이 접근 방식은 전반적으로 OLAP 데이터베이스에 더 적합합니다. 거래 비일관성 캐시가 충분한 예로는 여러 사용자가 동시에 접근하는 보고 도구의 시간별 판매 보고서를 고려할 수 있습니다. 판매 데이터는 일반적으로 매우 서서히 변화하므로 데이터베이스는 보고서를 한 번만 계산하면 됩니다(첫 번째 `SELECT` 쿼리로 표시됨). 추가 쿼리는 캐시에서 직접 제공될 수 있습니다. 이 예에서 합리적인 유효 기간은 30분이 될 수 있습니다.

전통적으로 거래 비일관성 캐시는 데이터베이스와 상호 작용하는 클라이언트 도구 또는 프록시 패키지(e.g. [chproxy](https://www.chproxy.org/configuration/caching/))에 의해 제공됩니다. 결과적으로 동일한 캐시 로직 및 구성이 반복됩니다. ClickHouse의 쿼리 캐시를 사용하면 캐시 로직이 서버 측으로 이동합니다. 이는 유지 관리 노력을 줄이고 중복을 피합니다.

## 구성 설정 및 사용 {#configuration-settings-and-usage}

:::note
ClickHouse Cloud에서는 쿼리 캐시 설정을 편집하려면 [쿼리 수준 설정](/operations/settings/query-level)을 사용해야 합니다. [구성 수준 설정](/operations/configuration-files)의 편집은 현재 지원되지 않습니다.
:::

:::note
[clickhouse-local](utilities/clickhouse-local.md)은 한 번에 하나의 쿼리만 실행합니다. 쿼리 결과 캐싱은 의미가 없으므로, clickhouse-local에서는 쿼리 결과 캐시가 비활성화됩니다.
:::

설정 [use_query_cache](/operations/settings/settings#use_query_cache)는 특정 쿼리 또는 현재 세션의 모든 쿼리가 쿼리 캐시를 사용해야 하는지 여부를 제어하는 데 사용됩니다. 예를 들어, 쿼리의 첫 번째 실행

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true;
```

은 쿼리 결과를 쿼리 캐시에 저장합니다. 동일한 쿼리의 후속 실행(매개 변수 `use_query_cache = true`로도)에서는 캐시에서 계산된 결과를 읽고 즉시 반환합니다.

:::note
설정 `use_query_cache` 및 모든 다른 쿼리 캐시 관련 설정은 독립 실행형 `SELECT` 문에만 영향을 미칩니다. 특히, `CREATE VIEW AS SELECT [...] SETTINGS use_query_cache = true`로 생성된 뷰에 대한 `SELECT`의 결과는 `SELECT` 문이 `SETTINGS use_query_cache = true`로 실행되지 않는 한 캐시되지 않습니다.
:::

캐시 사용 방식은 [enable_writes_to_query_cache](/operations/settings/settings#enable_writes_to_query_cache) 및 [enable_reads_from_query_cache](/operations/settings/settings#enable_reads_from_query_cache) 설정을 사용하여 더 자세히 구성할 수 있습니다(둘 다 기본값은 `true`입니다). 첫 번째 설정은 쿼리 결과가 캐시에 저장되는지 여부를 제어하고, 두 번째 설정은 데이터베이스가 쿼리 결과를 캐시에서 검색하려고 할지 결정합니다. 예를 들어, 다음 쿼리는 캐시를 수동적으로만 사용합니다. 즉, 캐시에서 읽으려 하지만 결과를 캐시에 저장하지 않습니다:

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, enable_writes_to_query_cache = false;
```

최대 제어를 위해 일반적으로 설정 `use_query_cache`, `enable_writes_to_query_cache` 및 `enable_reads_from_query_cache`를 특정 쿼리에만 제공하는 것이 좋습니다. 사용자 또는 프로파일 수준에서 캐싱을 활성화하는 것도 가능하지만(예: `SET use_query_cache = true`를 통해), 모든 `SELECT` 쿼리가 그 결과를 캐시된 결과로 반환할 수 있다는 점을 염두에 두어야 합니다.

쿼리 캐시는 문(statement) `SYSTEM DROP QUERY CACHE`를 사용하여 지울 수 있습니다. 쿼리 캐시의 내용은 시스템 테이블 [system.query_cache](system-tables/query_cache.md)에 표시됩니다. 데이터베이스 시작 이후 쿼리 캐시 적중 수와 실패 수는 시스템 테이블 [system.events](system-tables/events.md)에서 이벤트 "QueryCacheHits" 및 "QueryCacheMisses"로 표시됩니다. 두 카운터는 설정 `use_query_cache = true`로 실행되는 `SELECT` 쿼리에 대해서만 업데이트되며, 다른 쿼리는 "QueryCacheMisses"에 영향을 미치지 않습니다. 시스템 테이블 [system.query_log](system-tables/query_log.md)의 필드 `query_cache_usage`는 각 실행된 쿼리에 대해 쿼리 결과가 쿼리 캐시에 기록되었는지 읽혔는지를 보여줍니다. 시스템 테이블 [system.metrics](system-tables/metrics.md)의 메트릭 `QueryCacheEntries` 및 `QueryCacheBytes`는 쿼리 캐시가 현재 포함하고 있는 항목 수/바이트 수를 보여줍니다.

쿼리 캐시는 ClickHouse 서버 프로세스당 한 번 존재합니다. 그러나 캐시 결과는 기본적으로 사용자 간에 공유되지 않습니다. 이는 변경할 수 있지만(아래 참조) 보안상의 이유로 그렇게 하는 것은 권장되지 않습니다.

쿼리 결과는 쿼리의 [추상 구문 트리 (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree)에서 참조됩니다. 이는 캐싱이 대소문자에 무관하다는 것을 의미합니다. 예를 들어 `SELECT 1`과 `select 1`은 동일한 쿼리로 취급됩니다. 일치성을 더 자연스럽게 만들기 위해 쿼리 캐시와 관련된 모든 쿼리 수준 설정은 AST에서 제거됩니다.

쿼리가 예외 또는 사용자 취소로 인해 중단된 경우, 캐시에 항목이 기록되지 않습니다.

쿼리 캐시의 크기(바이트 단위), 최대 캐시 항목 수 및 개별 캐시 항목의 최대 크기(바이트 및 레코드 단위)는 다양한 [서버 구성 옵션](/operations/server-configuration-parameters/settings#query_cache)을 사용하여 구성할 수 있습니다.

```xml
<query_cache>
    <max_size_in_bytes>1073741824</max_size_in_bytes>
    <max_entries>1024</max_entries>
    <max_entry_size_in_bytes>1048576</max_entry_size_in_bytes>
    <max_entry_size_in_rows>30000000</max_entry_size_in_rows>
</query_cache>
```

개별 사용자의 캐시 사용 한도를 제한하는 것도 가능하며, [설정 프로파일](settings/settings-profiles.md) 및 [설정 제약](settings/constraints-on-settings.md)을 사용할 수 있습니다. 더 구체적으로, 사용자가 쿼리 캐시에서 할당할 수 있는 최대 메모리(바이트 단위)와 저장된 쿼리 결과의 최대 개수를 제한할 수 있습니다. 이를 위해 먼저 사용자 프로파일의 `users.xml`에 [query_cache_max_size_in_bytes](/operations/settings/settings#query_cache_max_size_in_bytes) 및 [query_cache_max_entries](/operations/settings/settings#query_cache_max_entries) 구성을 제공한 후, 두 설정을 읽기 전용으로 만들어야 합니다:

```xml
<profiles>
    <default>
        <!-- The maximum cache size in bytes for user/profile 'default' -->
        <query_cache_max_size_in_bytes>10000</query_cache_max_size_in_bytes>
        <!-- The maximum number of SELECT query results stored in the cache for user/profile 'default' -->
        <query_cache_max_entries>100</query_cache_max_entries>
        <!-- Make both settings read-only so the user cannot change them -->
        <constraints>
            <query_cache_max_size_in_bytes>
                <readonly/>
            </query_cache_max_size_in_bytes>
            <query_cache_max_entries>
                <readonly/>
            <query_cache_max_entries>
        </constraints>
    </default>
</profiles>
```

쿼리 결과가 캐시될 수 있도록 쿼리가 최소한 얼마나 실행되어야 하는지를 정의하는 설정 [query_cache_min_query_duration](/operations/settings/settings#query_cache_min_query_duration)을 사용할 수 있습니다. 예를 들어, 쿼리의 결과

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, query_cache_min_query_duration = 5000;
```

는 쿼리가 5초 이상 실행될 경우에만 캐시됩니다. 쿼리가 결과가 캐시되도록 실행되어야 하는 빈도를 지정하는 것도 가능하며, 이를 위해 설정 [query_cache_min_query_runs](/operations/settings/settings#query_cache_min_query_runs)를 사용합니다.

쿼리 캐시의 항목은 일정 시간 동안(생존 기간) 후에 유효성이 만료됩니다. 기본적으로 이 기간은 60초이지만, 다른 값을 세션, 프로파일 또는 쿼리 수준에서 설정 [query_cache_ttl](/operations/settings/settings#query_cache_ttl)을 사용하여 지정할 수 있습니다. 쿼리 캐시는 항목을 "지연" 방식으로 퇴출합니다. 즉, 항목이 유효성을 잃으면 캐시에서 즉시 제거되지 않습니다. 대신, 새로운 항목이 쿼리 캐시에 삽입될 때 데이터베이스는 새로운 항목을 위한 충분한 여유 공간이 있는지 확인합니다. 여유 공간이 부족하면 데이터베이스는 모든 오래된 항목을 제거하려고 시도합니다. 여전히 여유 공간이 부족하면 새 항목은 삽입되지 않습니다.

쿼리 캐시의 항목은 기본적으로 압축됩니다. 이는 쿼리 캐시에 대한 쓰기/읽기 속도가 느려지는 대가로 전체 메모리 소비를 줄여줍니다. 압축을 비활성화하려면 설정 [query_cache_compress_entries](/operations/settings/settings#query_cache_compress_entries)를 사용하십시오.

때때로 동일한 쿼리에 대해 여러 결과를 캐시하는 것이 유용합니다. 이는 쿼리 캐시 항목에 대한 레이블(또는 네임스페이스)로 작용하는 설정 [query_cache_tag](/operations/settings/settings#query_cache_tag)을 사용하여 달성할 수 있습니다. 쿼리 캐시는 동일한 쿼리의 다른 태그를 가진 결과를 다르게 간주합니다.

동일한 쿼리에 대해 세 개의 서로 다른 쿼리 캐시 항목을 생성하는 예:

```sql
SELECT 1 SETTINGS use_query_cache = true; -- query_cache_tag is implicitly '' (empty string)
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 1';
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 2';
```

쿼리 캐시에서 `tag` 태그가 있는 항목만 제거하려면 문(statement) `SYSTEM DROP QUERY CACHE TAG 'tag'`를 사용할 수 있습니다.

ClickHouse는 테이블 데이터를 [max_block_size](/operations/settings/settings#max_block_size) 행 단위로 블록으로 읽습니다. 필터링, 집계 등으로 인해 결과 블록은 일반적으로 'max_block_size'보다 훨씬 작지만, 훨씬 더 큰 경우도 있습니다. 설정 [query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results)(기본값 활성화)는 결과 블록이 쿼리 결과 캐시에 삽입되기 전에 'max_block_size' 크기의 블록으로 압축될지(작은 경우) 또는 분할될지(큰 경우)를 제어합니다. 이는 쿼리 캐시에 대한 쓰기 성능을 줄이지만 캐시 항목의 압축률을 향상시키고 나중에 쿼리 결과가 쿼리 캐시에서 제공될 때 보다 자연스러운 블록 크기를 제공합니다.

결과적으로 쿼리 캐시는 각 쿼리에 대해 여러 개의 (부분) 결과 블록을 저장합니다. 이러한 동작은 좋은 기본값이지만, 설정 [query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results)를 사용하여 억제할 수 있습니다.

또한 비결정 함수가 있는 쿼리 결과는 기본적으로 캐시되지 않습니다. 이러한 함수에는 다음이 포함됩니다.
- 딕셔너리에 접근하기 위한 함수: [`dictGet()`](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull) 등.
- XML 정의에서 `<deterministic>true</deterministic>` 태그가 없는 [사용자 정의 함수](../sql-reference/statements/create/function.md).
- 현재 날짜 또는 시간을 반환하는 함수: [`now()`](../sql-reference/functions/date-time-functions.md#now), 
  [`today()`](../sql-reference/functions/date-time-functions.md#today),
  [`yesterday()`](../sql-reference/functions/date-time-functions.md#yesterday) 등.
- 임의 값을 반환하는 함수: [`randomString()`](../sql-reference/functions/random-functions.md#randomString),
  [`fuzzBits()`](../sql-reference/functions/random-functions.md#fuzzBits) 등.
- 쿼리 처리에 사용된 내부 청크의 크기와 순서에 따라 결과가 달라지는 함수: 
  [`nowInBlock()`](../sql-reference/functions/date-time-functions.md#nowInBlock) 등,
  [`rowNumberInBlock()`](../sql-reference/functions/other-functions.md#rowNumberInBlock),
  [`runningDifference()`](../sql-reference/functions/other-functions.md#runningDifference),
  [`blockSize()`](../sql-reference/functions/other-functions.md#blockSize) 등.
- 환경에 따라 달라지는 함수: [`currentUser()`](../sql-reference/functions/other-functions.md#currentUser),
  [`queryID()`](/sql-reference/functions/other-functions#queryID),
  [`getMacro()`](../sql-reference/functions/other-functions.md#getMacro) 등.

비결정 함수가 있는 쿼리 결과를 강제로 캐시하려면 설정 [query_cache_nondeterministic_function_handling](/operations/settings/settings#query_cache_nondeterministic_function_handling)를 사용합니다.

시스템 테이블(예: [system.processes](system-tables/processes.md) 또는 [information_schema.tables](system-tables/information_schema.md))과 관련된 쿼리 결과는 기본적으로 캐시되지 않습니다. 시스템 테이블이 포함된 쿼리 결과를 강제로 캐시하려면 설정 [query_cache_system_table_handling](/operations/settings/settings#query_cache_system_table_handling)을 사용합니다.

마지막으로, 보안상의 이유로 쿼리 캐시 항목은 사용자 간에 공유되지 않습니다. 예를 들어, 사용자 A는 사용자 B가 적용받지 않는 행 정책을 우회하여 동일한 쿼리를 실행할 수 없어야 합니다. 그러나 필요할 경우, 다른 사용자(즉, 공유됨)에서 접근할 수 있도록 캐시 항목에 설정 
[query_cache_share_between_users](/operations/settings/settings#query_cache_share_between_users)를 제공하여 표시할 수 있습니다.

## 관련 내용 {#related-content}

- 블로그: [ClickHouse 쿼리 캐시 소개](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)
