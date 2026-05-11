---
description: 'ClickHouse 쿼리 분석기에 대해 설명하는 페이지'
keywords: ['analyzer']
sidebar_label: 'Analyzer'
slug: /operations/analyzer
title: 'Analyzer'
doc_type: 'reference'
---

# Analyzer \{#analyzer\}

ClickHouse `24.3` 버전에서는 새로운 쿼리 Analyzer가 기본값으로 활성화되었습니다.
동작 방식에 대한 자세한 내용은 [여기](/guides/developer/understanding-query-execution-with-the-analyzer#analyzer)에서 확인할 수 있습니다.

## 알려진 비호환 사항 \{#known-incompatibilities\}

다수의 버그를 수정하고 새로운 최적화를 도입했지만, 동시에 ClickHouse 동작 방식에 이전과 호환되지 않는 일부 변경 사항도 도입되었습니다. 다음 변경 사항을 참고하여 Analyzer에 맞게 쿼리를 어떻게 다시 작성해야 하는지 확인하십시오.

### 잘못된 쿼리는 더 이상 최적화되지 않음 \{#invalid-queries-are-no-longer-optimized\}

기존 쿼리 계획 인프라는 쿼리 검증 단계 전에 AST 수준 최적화를 적용했습니다.
이 최적화로 인해 초기 쿼리가 재작성되어 유효하고 실행 가능한 형태가 될 수 있었습니다.

Analyzer에서는 쿼리 검증이 최적화 단계보다 먼저 수행됩니다.
이는 이전에는 실행이 가능했던 잘못된 쿼리가 이제는 지원되지 않음을 의미합니다.
이러한 경우 쿼리를 직접 수정해야 합니다.

#### 예시 1 \{#example-1\}

다음 쿼리는 집계가 수행된 이후에는 `toString(number)`만 사용할 수 있는 상황에서 projection 목록에 컬럼 `number`를 사용합니다.
이전 analyzer에서는 `GROUP BY toString(number)`를 `GROUP BY number`로 최적화하여 쿼리가 유효해졌습니다.

```sql
SELECT number
FROM numbers(1)
GROUP BY toString(number)
```


#### 예시 2 \{#example-2\}

이 쿼리에서도 동일한 문제가 발생합니다. 컬럼 `number`가 다른 키와 함께 집계된 후에 사용됩니다.
이전 쿼리 분석기는 `HAVING` 절에 있던 `number > 5` 필터를 `WHERE` 절로 이동하여 이 쿼리를 수정했습니다.

```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
GROUP BY n
HAVING number > 5
```

쿼리를 수정하려면 표준 SQL 구문을 따르도록 집계되지 않은 컬럼에 적용되는 모든 조건을 `WHERE` 절로 옮겨야 합니다:

```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
WHERE number > 5
GROUP BY n
```


### `CREATE VIEW` with an invalid query \{#create-view-with-invalid-query\}

analyzer는 항상 타입 검사를 수행합니다.
이전에는 잘못된 `SELECT` 쿼리로 `VIEW`를 생성할 수 있었습니다.
이렇게 생성된 `VIEW`는 첫 번째 `SELECT` 또는 `INSERT` 실행 시(`MATERIALIZED VIEW`의 경우) 실패했습니다.

이제는 이러한 방식으로 `VIEW`를 생성할 수 없습니다.

#### 예제 \{#example-view\}

```sql
CREATE TABLE source (data String)
ENGINE=MergeTree
ORDER BY tuple();

CREATE VIEW some_view
AS SELECT JSONExtract(data, 'test', 'DateTime64(3)')
FROM source;
```


### 알려진 `JOIN` 절 비호환성 \{#known-incompatibilities-of-the-join-clause\}

#### 프로젝션의 컬럼을 사용하는 `JOIN` \{#join-using-column-from-projection\}

기본적으로 `SELECT` 리스트의 별칭(alias)은 `JOIN USING` 키로 사용할 수 없습니다.

새로운 설정인 `analyzer_compatibility_join_using_top_level_identifier`를 활성화하면, `JOIN USING`의 동작이 변경되어 왼쪽 테이블의 컬럼을 직접 사용하는 대신, `SELECT` 쿼리의 프로젝션 목록에 있는 표현식을 기준으로 식별자를 우선적으로 해석합니다.

예를 들면 다음과 같습니다:

```sql
SELECT a + 1 AS b, t2.s
FROM VALUES('a UInt64, b UInt64', (1, 1)) AS t1
JOIN VALUES('b UInt64, s String', (1, 'one'), (2, 'two')) t2
USING (b);
```

`analyzer_compatibility_join_using_top_level_identifier`가 `true`로 설정된 경우, 조인 조건은 이전 버전의 동작과 일치하도록 `t1.a + 1 = t2.b`로 해석됩니다.
결과는 `2, 'two'`가 됩니다.
설정이 `false`인 경우, 조인 조건은 기본적으로 `t1.b = t2.b`가 되며, 쿼리는 `2, 'one'`을 반환합니다.
`t1`에 `b`가 존재하지 않으면, 쿼리는 오류를 발생시키며 실패합니다.


#### `JOIN USING` 및 `ALIAS`/`MATERIALIZED` 컬럼과 관련된 동작 변경 사항 \{#changes-in-behavior-with-join-using-and-aliasmaterialized-columns\}

analyzer에서 `ALIAS` 또는 `MATERIALIZED` 컬럼이 포함된 `JOIN USING` 쿼리에서 `*`를 사용할 경우, 기본적으로 해당 컬럼들이 결과 집합에 포함됩니다.

예를 들어:

```sql
CREATE TABLE t1 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t1 VALUES (1), (2);

CREATE TABLE t2 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t2 VALUES (2), (3);

SELECT * FROM t1
FULL JOIN t2 USING (payload);
```

analyzer에서는 이 쿼리를 실행하면 결과에 두 테이블의 `id`와 함께 `payload` 컬럼이 포함됩니다.
반면, 이전 analyzer에서는 특정 설정(`asterisk_include_alias_columns` 또는 `asterisk_include_materialized_columns`)이 활성화된 경우에만 이러한 `ALIAS` 컬럼이 포함되었고,
컬럼의 순서가 다르게 나타날 수도 있었습니다.

일관되고 예상 가능한 결과를 확보하기 위해, 특히 이전 쿼리를 analyzer로 마이그레이션하는 경우에는 `*`를 사용하는 대신 `SELECT` 절에서 컬럼을 명시적으로 지정하는 것이 바람직합니다.


#### `USING` 절에서 컬럼 타입 수정자 처리 \{#handling-of-type-modifiers-for-columns-in-using-clause\}

새로운 버전의 analyzer에서는 `USING` 절에 지정된 컬럼들에 대해 공통 상위 타입을 결정하는 규칙을 표준화하여,
특히 `LowCardinality` 및 `Nullable`과 같은 타입 수정자를 처리할 때 더 예측 가능한 결과를 제공하도록 했습니다.

* `LowCardinality(T)`와 `T`: 타입이 `LowCardinality(T)`인 컬럼이 타입이 `T`인 컬럼과 조인되는 경우, 결과 공통 상위 타입은 `T`가 되며, 이때 `LowCardinality` 수정자는 사실상 제거됩니다.
* `Nullable(T)`와 `T`: 타입이 `Nullable(T)`인 컬럼이 타입이 `T`인 컬럼과 조인되는 경우, 결과 공통 상위 타입은 `Nullable(T)`가 되어 널 허용 속성이 유지됩니다.

예를 들어:

```sql
SELECT id, toTypeName(id)
FROM VALUES('id LowCardinality(String)', ('a')) AS t1
FULL OUTER JOIN VALUES('id String', ('b')) AS t2
USING (id);
```

이 쿼리에서 `id`의 공통 상위 타입은 `String`으로 판별되며, 이 과정에서 `t1`의 `LowCardinality` 수정자는 제외됩니다.


### Projection 컬럼 이름 변경 \{#projection-column-names-changes\}

Projection 이름을 계산할 때 별칭이 치환되지 않습니다.

```sql
SELECT
    1 + 1 AS x,
    x + 1
SETTINGS enable_analyzer = 0
FORMAT PrettyCompact

   ┌─x─┬─plus(plus(1, 1), 1)─┐
1. │ 2 │                   3 │
   └───┴─────────────────────┘

SELECT
    1 + 1 AS x,
    x + 1
SETTINGS enable_analyzer = 1
FORMAT PrettyCompact

   ┌─x─┬─plus(x, 1)─┐
1. │ 2 │          3 │
   └───┴────────────┘
```


### 호환되지 않는 함수 인수 타입 \{#incompatible-function-arguments-types\}

Analyzer에서는 타입 추론이 초기 쿼리 분석 단계에서 수행됩니다.
이 변경으로 인해 타입 검사가 단락 평가 이전에 수행되므로 `if` 함수의 인수는 항상 공통 상위 타입(supertype)을 가져야 합니다.

예를 들어, 다음 쿼리는 `There is no supertype for types Array(UInt8), String because some of them are Array and some of them are not`라는 오류와 함께 실패합니다:

```sql
SELECT toTypeName(if(0, [2, 3, 4], 'String'))
```


### 이기종 클러스터 \{#heterogeneous-clusters\}

Analyzer는 클러스터 내 서버 간 통신 프로토콜을 크게 변경합니다. 따라서 `enable_analyzer` SETTING 값이 서로 다른 서버 간에는 분산 쿼리를 실행할 수 없습니다.

### 뮤테이션은 이전 analyzer에 의해 해석됩니다 \{#mutations-are-interpreted-by-previous-analyzer\}

뮤테이션은 여전히 이전 analyzer를 사용합니다.
이는 일부 새로운 ClickHouse SQL 기능을 뮤테이션에서는 사용할 수 없음을 의미합니다. 예를 들어 `QUALIFY` 절을 사용할 수 없습니다.
현재 상태는 [여기](https://github.com/ClickHouse/ClickHouse/issues/61563)에서 확인할 수 있습니다.

### 지원되지 않는 기능 \{#unsupported-features\}

현재 analyzer에서 지원하지 않는 기능 목록은 다음과 같습니다.

- Annoy 인덱스.
- Hypothesis 인덱스. 진행 상황은 [여기](https://github.com/ClickHouse/ClickHouse/pull/48381)를 참고하십시오.
- Window view(윈도우 뷰)는 지원되지 않습니다. 앞으로도 지원 계획이 없습니다.

## Cloud Migration \{#cloud-migration\}

현재 비활성화된 모든 인스턴스에서 새 쿼리 분석기를 활성화하여 새로운 기능 및 성능 최적화를 지원합니다. 이 변경 사항으로 더 엄격한 SQL 범위 지정(scoping) 규칙이 적용되며, 이에 따라 사용자는 규칙을 준수하지 않는 쿼리를 수동으로 업데이트해야 합니다.

### 마이그레이션 워크플로우 \{#migration-workflow\}

1. `normalized_query_hash`를 사용하여 `system.query_log`를 필터링해 쿼리를 식별합니다:

```sql
SELECT query 
FROM clusterAllReplicas(default, system.query_log)
WHERE normalized_query_hash='{hash}' 
LIMIT 1 
SETTINGS skip_unavailable_shards=1
```

2. 다음 설정을 추가하여 analyzer를 활성화한 상태에서 쿼리를 실행합니다.

```sql
SETTINGS
    enable_analyzer=1,
    analyzer_compatibility_join_using_top_level_identifier=1
```

3. 쿼리를 리팩터링하고 결과를 검증하여 analyzer가 비활성화되었을 때 생성된 출력과 일치하는지 확인합니다.

내부 테스트에서 가장 자주 발생한 비호환성 문제를 참조하십시오.


### Unknown expression identifier \{#unknown-expression-identifier\}

오류: `Unknown expression identifier ... in scope ... (UNKNOWN_IDENTIFIER)`. 예외 코드: 47

원인: 필터에서 계산된 별칭을 참조하거나, 모호한 서브쿼리 프로젝션, 「동적」 CTE 스코프와 같이 비표준적이고 허용적인 레거시 동작에 의존하는 쿼리가 이제 유효하지 않은 쿼리로 올바르게 판별되어 즉시 거부됩니다.   

해결 방법: 다음과 같이 SQL 패턴을 업데이트합니다:

- 필터 로직: 결과를 기준으로 필터링하는 경우 로직을 WHERE에서 HAVING으로 이동하거나, 원본 데이터를 기준으로 필터링하는 경우 WHERE에 해당 표현식을 그대로 한 번 더 작성합니다.
- 서브쿼리 스코프: 외부 쿼리에서 필요한 모든 컬럼을 명시적으로 선택합니다.
- JOIN 키: 키가 별칭인 경우 `USING` 대신 전체 표현식을 포함한 `ON`을 사용합니다.
- 외부 쿼리에서는 내부 테이블이 아니라 서브쿼리/CTE 자체의 별칭을 참조합니다.

### GROUP BY에서 집계되지 않은 컬럼 \{#non-aggregated-columns-in-group-by\}

오류: `Column ... is not under aggregate function and not in GROUP BY keys (NOT_AN_AGGREGATE)`. 예외 코드: 215

원인: 이전 분석기(analyzer)는 GROUP BY 절에 없는 컬럼을 SELECT하는 것도 허용했으며(이 경우 대개 임의의 값이 선택되었습니다), 현재 분석기는 표준 SQL을 따릅니다. 선택하는 모든 컬럼은 집계 함수의 대상이거나 그룹화 키여야 합니다.

해결 방법: 해당 컬럼을 `any()`, `argMax()`로 감싸거나 GROUP BY에 추가합니다.

```sql
/* ORIGINAL QUERY */
-- device_id is ambiguous
SELECT user_id, device_id FROM table GROUP BY user_id

/* FIXED QUERY */
SELECT user_id, any(device_id) FROM table GROUP BY user_id
-- OR
SELECT user_id, device_id FROM table GROUP BY user_id, device_id
```


### 중복된 CTE 이름 \{#duplicate-cte-names\}

오류: `CTE with name ... already exists (MULTIPLE_EXPRESSIONS_FOR_ALIAS)`. 예외 코드: 179

원인: 이전 analyzer에서는 동일한 이름을 가진 여러 공통 테이블 표현식(WITH ...)을 정의할 수 있었으며, 나중에 정의된 것이 이전 것을 가리는(shadowing) 동작을 허용했습니다. 현재 analyzer에서는 이러한 모호성을 허용하지 않습니다.

해결 방법: 중복된 CTE의 이름을 서로 다른 고유한 이름으로 변경하십시오.

```sql
/* ORIGINAL QUERY */
WITH 
  data AS (SELECT 1 AS id), 
  data AS (SELECT 2 AS id) -- Redefined
SELECT * FROM data;

/* FIXED QUERY */
WITH 
  raw_data AS (SELECT 1 AS id), 
  processed_data AS (SELECT 2 AS id)
SELECT * FROM processed_data;
```


### 모호한 컬럼 식별자 \{#ambiguous-column-identifiers\}

오류: `JOIN [JOIN TYPE] ambiguous identifier ... (AMBIGUOUS_IDENTIFIER)` 예외 코드: 207

원인: 쿼리에서 `JOIN`에 참여하는 여러 테이블에 동일한 이름의 컬럼이 존재하지만, 참조 시 어느 테이블의 컬럼인지 지정하지 않았습니다. 이전 분석기는 내부 로직에 따라 컬럼을 추측하는 경우가 있었지만, 새 분석기는 명시적인 이름 지정을 요구합니다.

해결 방법: 컬럼을 `table_alias.column_name` 형식으로 완전 수식(fully qualify)하십시오.

```sql
/* ORIGINAL QUERY */
SELECT table1.ID AS ID FROM table1, table2 WHERE ID...

/* FIXED QUERY */
SELECT table1.ID AS ID_RENAMED FROM table1, table2 WHERE ID_RENAMED...
```


### FINAL의 잘못된 사용 \{#invalid-usage-of-final\}

오류: `Table expression modifiers FINAL are not supported for subquery...` 또는 `Storage ... doesn't support FINAL` (`UNSUPPORTED_METHOD`). 예외 코드: 1, 181

원인: FINAL은 테이블 스토리지 엔진(특히 [Shared]ReplacingMergeTree)을 위한 수정자입니다. Analyzer는 다음과 같은 경우 FINAL 사용을 거부합니다.

* 서브쿼리 또는 파생 테이블(예: FROM (SELECT ...) FINAL)
* FINAL을 지원하지 않는 테이블 엔진(예: SharedMergeTree)

해결 방법: FINAL은 서브쿼리 내부의 소스 테이블에만 적용해야 하며, 해당 엔진이 FINAL을 지원하지 않는 경우에는 FINAL을 제거해야 합니다.

```sql
/* ORIGINAL QUERY */
SELECT * FROM (SELECT * FROM my_table) AS subquery FINAL ...

/* FIXED QUERY */
SELECT * FROM (SELECT * FROM my_table FINAL) AS subquery ...
```


### `countDistinct()` 함수의 대소문자 구분 \{#countdistinct-case-insensitivity\}

오류: `Function with name countdistinct does not exist (UNKNOWN_FUNCTION)`. 예외 코드: 46

원인: 함수 이름은 analyzer에서 대소문자를 구분하며 엄격하게 매핑됩니다. `countdistinct`(모두 소문자)는 더 이상 자동으로 인식되지 않습니다. 

해결 방법: 표준 표기인 `countDistinct`(camelCase) 또는 ClickHouse 고유의 `uniq` 함수를 사용하십시오.