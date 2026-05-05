---
description: 'ClickHouse에서 쿼리 캐시 기능 사용 및 구성 방법 안내'
sidebar_label: '쿼리 캐시'
sidebar_position: 65
slug: /operations/query-cache
title: '쿼리 캐시'
doc_type: 'guide'
---

# 쿼리 캐시 \{#query-cache\}

쿼리 캐시는 `SELECT` 쿼리를 한 번만 실행해 결과를 계산하고, 이후 동일한 쿼리 실행에 대해서는 캐시에 저장된 결과를 직접 반환합니다.
쿼리의 유형에 따라 ClickHouse 서버의 지연 시간과 리소스 사용량을 크게 줄일 수 있습니다.

## 배경, 설계 및 제한 사항 \{#background-design-and-limitations\}

쿼리 캐시는 일반적으로 트랜잭션 관점에서 일관적인 캐시와 비일관적인 캐시로 구분할 수 있습니다.

- 트랜잭션 일관성이 있는 캐시에서는 `SELECT` 쿼리의 결과가 변경되었거나 변경될 가능성이 있는 경우, 데이터베이스가 캐시에 저장된 쿼리 결과를 무효화(폐기)합니다. ClickHouse에서 데이터를 변경하는 작업에는 테이블에 대한 insert/update/delete 연산이나 collapsing merge가 포함됩니다. 트랜잭션 일관성 캐싱은 [MySQL](https://dev.mysql.com/doc/refman/5.6/en/query-cache.html) (v8.0 이후 쿼리 캐시 제거)과 [Oracle](https://docs.oracle.com/database/121/TGDBA/tune_result_cache.htm) 같은 OLTP 데이터베이스에 특히 적합합니다.
- 트랜잭션 일관성이 없는 캐시에서는, 모든 캐시 엔트리에 유효 기간(예: 1분)을 부여해 그 이후에는 만료되며, 이 기간 동안 기저 데이터가 거의 변경되지 않는다는 가정을 바탕으로 쿼리 결과에 약간의 부정확성이 존재하는 것을 허용합니다. 이 방식은 전반적으로 OLAP 데이터베이스에 더 적합합니다. 트랜잭션 일관성이 엄밀하게 필요하지 않은 예로는, 여러 사용자가 동시에 접근하는 리포팅 도구의 시간 단위 매출 보고서를 들 수 있습니다. 매출 데이터는 일반적으로 충분히 느리게 변경되므로, 데이터베이스는 보고서(첫 번째 `SELECT` 쿼리로 계산된 결과)를 한 번만 계산하면 됩니다. 이후의 쿼리는 쿼리 캐시에서 직접 제공할 수 있습니다. 이 예에서 합리적인 유효 기간은 30분 정도가 될 수 있습니다.

트랜잭션 일관성이 없는 캐싱은 전통적으로 데이터베이스와 상호 작용하는 클라이언트 도구나 프록시 패키지(예: [chproxy](https://www.chproxy.org/configuration/caching/))에서 제공되었습니다. 그 결과, 동일한 캐싱 로직과 구성이 여러 곳에서 중복되는 경우가 많습니다. ClickHouse의 쿼리 캐시를 사용하면 캐싱 로직이 서버 측으로 이동합니다. 이를 통해 유지 관리 작업이 줄어들고 중복을 피할 수 있습니다.

## 구성 설정 및 사용 방법 \{#configuration-settings-and-usage\}

:::note
ClickHouse Cloud에서는 쿼리 캐시 설정을 변경하려면 [쿼리 수준 설정](/operations/settings/query-level)을 사용해야 합니다. 현재는 [구성 수준 설정](/operations/configuration-files)을 편집하는 기능이 지원되지 않습니다.
:::

:::note
[clickhouse-local](utilities/clickhouse-local.md)은 한 번에 하나의 쿼리만 실행합니다. 쿼리 결과를 캐시하는 것은 의미가 없으므로 clickhouse-local에서는 쿼리
결과 캐시가 비활성화되어 있습니다.
:::

[use&#95;query&#95;cache](/operations/settings/settings#use_query_cache) 설정은 특정 쿼리 또는 현재 세션의 모든 쿼리가
쿼리 캐시를 사용할지 여부를 제어하는 데 사용할 수 있습니다. 예를 들어, 쿼리를 처음 실행할 때

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true;
```

쿼리 결과를 쿼리 캐시에 저장합니다. 이후 동일한 쿼리를 다시 실행할 때(파라미터 `use_query_cache = true`가 설정된 경우에도 마찬가지로)
이미 계산된 결과를 캐시에서 읽어 즉시 반환합니다.

:::note
`use_query_cache` 및 그 밖의 모든 쿼리 캐시 관련 설정은 단독으로 실행되는 `SELECT` SQL 문에 대해서만 효과가 있습니다. 특히
`CREATE VIEW AS SELECT [...] SETTINGS use_query_cache = true`로 생성된 뷰에 대한 `SELECT` 결과는, 해당 `SELECT`
SQL 문이 `SETTINGS use_query_cache = true`와 함께 실행되지 않으면 캐시되지 않습니다.
:::

캐시 사용 방식은 설정값 [enable&#95;writes&#95;to&#95;query&#95;cache](/operations/settings/settings#enable_writes_to_query_cache)와
[enable&#95;reads&#95;from&#95;query&#95;cache](/operations/settings/settings#enable_reads_from_query_cache) (둘 다 기본값은 `true`)을 사용해 좀 더 세밀하게 설정할 수 있습니다.
앞의 설정은 쿼리 결과를 캐시에 저장할지 여부를 제어하고, 뒤의 설정은 데이터베이스가 캐시에서 쿼리 결과를 가져오려고 시도할지 여부를 결정합니다.
예를 들어, 다음 쿼리는 캐시를 수동적으로만 사용하며, 즉 캐시에서 읽기를 시도하지만 그 결과를 캐시에 저장하지는 않습니다:

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, enable_writes_to_query_cache = false;
```

최대한 세밀하게 제어하기 위해, 일반적으로 `use_query_cache`, `enable_writes_to_query_cache`,
`enable_reads_from_query_cache` 설정은 특정 쿼리에서만 지정하도록 하는 것이 권장됩니다. `SET use_query_cache = true` 와 같이
USER 또는 프로필 수준에서 캐싱을 활성화하는 것도 가능하지만, 이 경우 모든 `SELECT` 쿼리가 캐시된 결과를 반환할 수 있다는 점을
반드시 유의해야 합니다.

쿼리 캐시는 `SYSTEM CLEAR QUERY CACHE` 문으로 비울 수 있습니다. 쿼리 캐시의 내용은 시스템 테이블
[system.query&#95;cache](system-tables/query_cache.md)에 표시됩니다. 데이터베이스 시작 이후의 쿼리 캐시 히트와 미스 횟수는
시스템 테이블 [system.events](system-tables/events.md)에서 &quot;QueryCacheHits&quot; 및 &quot;QueryCacheMisses&quot; 이벤트로
표시됩니다. 두 카운터는 `use_query_cache = true` 설정으로 실행되는 `SELECT` 쿼리에 대해서만 갱신되며, 다른 쿼리는
&quot;QueryCacheMisses&quot; 에 영향을 주지 않습니다. 시스템 테이블
[system.query&#95;log](system-tables/query_log.md)의 `query_cache_usage` 필드는 각 실행된 쿼리에 대해 쿼리 결과가 쿼리 캐시에
기록되었는지, 또는 쿼리 캐시에서 읽혔는지를 보여줍니다. 시스템 테이블
[system.metrics](system-tables/metrics.md)의 메트릭 `QueryCacheEntries` 및 `QueryCacheBytes` 는 현재 쿼리 캐시에 포함된
엔트리 수와 바이트 수를 보여줍니다.

쿼리 캐시는 ClickHouse 서버 프로세스마다 하나만 존재합니다. 그러나 기본적으로 캐시 결과는 사용자 간에 공유되지 않습니다. 이는
(아래를 참조하여) 변경할 수 있지만, 보안상의 이유로 권장되지는 않습니다.

쿼리 결과는 해당 쿼리의 [Abstract Syntax Tree (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree)를 사용하여
쿼리 캐시에서 참조됩니다. 이는 캐싱이 대소문자에 영향을 받지 않음을 의미하며, 예를 들어 `SELECT 1` 과 `select 1` 은 동일한
쿼리로 취급됩니다. 매칭을 보다 자연스럽게 만들기 위해, 쿼리 캐시 및
[출력 포맷팅(output formatting)](settings/settings-formats.md)) 과 관련된 모든 쿼리 수준 설정은 AST에서 제거됩니다.

예외 발생 또는 사용자 취소로 인해 쿼리가 중단된 경우, 쿼리 캐시에 어떤 엔트리도 기록되지 않습니다.

쿼리 캐시의 전체 크기(바이트 단위), 캐시 엔트리의 최대 개수, 개별 캐시 엔트리의 최대 크기(바이트 및 레코드 단위)는
[서버 설정 옵션](/operations/server-configuration-parameters/settings#query_cache)을 사용하여 구성할 수 있습니다.


```xml
<query_cache>
    <max_size_in_bytes>1073741824</max_size_in_bytes>
    <max_entries>1024</max_entries>
    <max_entry_size_in_bytes>1048576</max_entry_size_in_bytes>
    <max_entry_size_in_rows>30000000</max_entry_size_in_rows>
</query_cache>
```

[settings profiles](settings/settings-profiles.md)와 [settings
constraints](settings/constraints-on-settings.md)를 사용하여 개별 사용자에 대한 쿼리 캐시 사용량을 제한할 수도 있습니다. 보다 구체적으로, 사용자가 쿼리 캐시에서 사용할 수 있는 메모리의 최대 크기(바이트 단위)와 저장할 수 있는 쿼리 결과의 최대 개수를 제한할 수 있습니다. 이를 위해 먼저 `users.xml`의 사용자 프로필에
[query&#95;cache&#95;max&#95;size&#95;in&#95;bytes](/operations/settings/settings#query_cache_max_size_in_bytes) 및
[query&#95;cache&#95;max&#95;entries](/operations/settings/settings#query_cache_max_entries) 설정을 지정한 다음, 두 설정을 모두 읽기 전용(readonly)으로 설정합니다:

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

쿼리 결과를 캐시하려면 해당 쿼리가 최소 얼마 동안 실행되어야 하는지를 정의하기 위해
[query&#95;cache&#95;min&#95;query&#95;duration](/operations/settings/settings#query_cache_min_query_duration) 설정을 사용할 수 있습니다. 예를 들어, 쿼리 결과가

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, query_cache_min_query_duration = 5000;
```

해당 쿼리가 5초 이상 실행된 경우에만 캐시됩니다. 또한 쿼리 결과가 캐시되기 전에 쿼리가 얼마나 자주 실행되어야 하는지 지정할 수도 있습니다. 이를 위해 설정 [query&#95;cache&#95;min&#95;query&#95;runs](/operations/settings/settings#query_cache_min_query_runs)를 사용합니다.

쿼리 캐시의 항목은 일정 시간이 지나면 오래된 상태가 됩니다(time-to-live). 기본적으로 이 기간은 60초이지만, 설정 [query&#95;cache&#95;ttl](/operations/settings/settings#query_cache_ttl)을 사용하여 세션, 프로필 또는 쿼리 수준에서 다른 값을 지정할 수 있습니다. 쿼리 캐시는 항목을 「지연(lazy)」 방식으로 제거(evict)합니다. 즉, 항목이 오래된 상태가 되더라도 즉시 캐시에서 제거되지는 않습니다. 대신 쿼리 캐시에 새 항목을 삽입해야 할 때 데이터베이스는 캐시에 새 항목을 위한 충분한 여유 공간이 있는지 확인합니다. 여유 공간이 충분하지 않으면 데이터베이스는 모든 오래된 항목을 제거하려고 시도합니다. 그래도 캐시의 여유 공간이 충분하지 않으면 새 항목은 삽입되지 않습니다.

쿼리가 HTTP를 통해 실행되는 경우, ClickHouse는 캐시된 항목의 나이(초 단위)와 만료 타임스탬프를 나타내도록 `Age` 및 `Expires` 헤더를 설정합니다.

쿼리 캐시의 항목은 기본적으로 압축됩니다. 이는 전체 메모리 사용량을 줄이는 대신 쿼리 캐시에 대한 쓰기 및 쿼리 캐시에서의 읽기가 느려지는 효과가 있습니다. 압축을 비활성화하려면 설정 [query&#95;cache&#95;compress&#95;entries](/operations/settings/settings#query_cache_compress_entries)를 사용합니다.

동일한 쿼리에 대해 여러 결과를 캐시에 유지해야 할 때도 있습니다. 이는 쿼리 캐시 항목에 대한 레이블(또는 네임스페이스) 역할을 하는 설정
[query&#95;cache&#95;tag](/operations/settings/settings#query_cache_tag)를 사용하여 구현할 수 있습니다. 쿼리 캐시는 동일한 쿼리라도 태그가 다르면 서로 다른 결과로 간주합니다.

동일한 쿼리에 대해 세 개의 서로 다른 쿼리 캐시 항목을 생성하는 예:

```sql
SELECT 1 SETTINGS use_query_cache = true; -- query_cache_tag is implicitly '' (empty string)
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 1';
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 2';
```

쿼리 캐시에서 태그 `tag`가 지정된 항목만 제거하려면 `SYSTEM CLEAR QUERY CACHE TAG 'tag'` 구문을 사용하십시오.


ClickHouse는 테이블 데이터를 [max_block_size](/operations/settings/settings#max_block_size) 행 단위의 블록으로 읽습니다. 필터링, 집계 등으로 인해
결과 블록은 일반적으로 'max_block_size'보다 훨씬 작지만, 훨씬 더 커지는 경우도 있습니다. [query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results)
(기본적으로 활성화됨) 설정은 쿼리 결과 캐시에 삽입되기 전에 결과 블록이 매우 작은 경우 압축(squash)할지, 크기가 큰 경우
'max_block_size' 크기의 블록들로 분할(split)할지를 제어합니다. 이렇게 하면 쿼리 캐시에 대한 쓰기 성능은 저하되지만, 캐시 엔트리의 압축률이 향상되고
나중에 쿼리 캐시에서 쿼리 결과를 제공할 때 더 자연스러운 블록 단위를 제공합니다.

그 결과, 쿼리 캐시는 각 쿼리에 대해 여러 개의 (부분) 결과 블록을 저장합니다. 이러한 동작은 기본값으로 적절하지만,
[query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results) 설정을 사용하여 비활성화할 수 있습니다.

또한, 비결정적 함수가 포함된 쿼리의 결과는 기본적으로 캐시되지 않습니다. 이러한 함수에는 다음이 포함됩니다.

- 사전(dictionary)에 접근하기 위한 함수: [`dictGet()`](/sql-reference/functions/ext-dict-functions) 등
- XML 정의에 `<deterministic>true</deterministic>` 태그가 없는 [user-defined functions](../sql-reference/statements/create/function.md),
- 현재 날짜나 시간을 반환하는 함수: [`now()`](../sql-reference/functions/date-time-functions.md#now),
  [`today()`](../sql-reference/functions/date-time-functions.md#today),
  [`yesterday()`](../sql-reference/functions/date-time-functions.md#yesterday) 등,
- 랜덤 값을 반환하는 함수: [`randomString()`](../sql-reference/functions/random-functions.md#randomString),
  [`fuzzBits()`](../sql-reference/functions/random-functions.md#fuzzBits) 등,
- 쿼리 처리에 사용되는 내부 청크의 크기와 순서에 따라 결과가 달라지는 함수:
  [`nowInBlock()`](../sql-reference/functions/date-time-functions.md#nowInBlock) 등,
  [`rowNumberInBlock()`](../sql-reference/functions/other-functions.md#rowNumberInBlock),
  [`runningDifference()`](../sql-reference/functions/other-functions.md#runningDifference),
  [`blockSize()`](../sql-reference/functions/other-functions.md#blockSize) 등,
- 환경에 따라 달라지는 함수: [`currentUser()`](../sql-reference/functions/other-functions.md#currentUser),
  [`queryID()`](/sql-reference/functions/other-functions#queryID),
  [`getMacro()`](../sql-reference/functions/other-functions.md#getMacro) 등

비결정적 함수가 포함된 쿼리의 결과라도 강제로 캐시하도록 하려면
[query_cache_nondeterministic_function_handling](/operations/settings/settings#query_cache_nondeterministic_function_handling) 설정을 사용합니다.

시스템 테이블이 관련된 쿼리의 결과(예: [system.processes](system-tables/processes.md) 또는
[information_schema.tables](system-tables/information_schema.md))는 기본적으로 캐시되지 않습니다. 시스템 테이블이 포함된 쿼리 결과를
강제로 캐시하려면 [query_cache_system_table_handling](/operations/settings/settings#query_cache_system_table_handling) 설정을 사용합니다.

마지막으로, 보안상의 이유로 쿼리 캐시의 엔트리는 사용자 간에 공유되지 않습니다. 예를 들어, 사용자 A는 동일한 쿼리를
해당 테이블에 ROW POLICY가 존재하지 않는 다른 사용자 B와 동일하게 실행함으로써 ROW POLICY를 우회할 수 없어야 합니다. 그러나 필요하다면
[query_cache_share_between_users](/operations/settings/settings#query_cache_share_between_users) 설정을 사용하여 캐시 엔트리를 다른 사용자도
접근 가능(즉, 공유)하도록 표시할 수 있습니다.

## 관련 콘텐츠 \{#related-content\}

- 블로그: [ClickHouse 쿼리 캐시 소개](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)