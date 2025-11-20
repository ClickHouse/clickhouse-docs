---
'description': 'ClickHouse 쿼리 분석기를 상세히 설명하는 페이지'
'keywords':
- 'analyzer'
'sidebar_label': 'Analyzer'
'slug': '/operations/analyzer'
'title': 'Analyzer'
'doc_type': 'reference'
---


# Analyzer

ClickHouse 버전 `24.3`에서는 새로운 쿼리 분석기가 기본적으로 활성화되었습니다.
작동 방식에 대한 더 자세한 내용을 [여기에서](https://example.com/guides/developer/understanding-query-execution-with-the-analyzer#analyzer) 읽어보세요.

## 알려진 비호환성 {#known-incompatibilities}

많은 버그를 수정하고 새로운 최적화를 도입했음에도 불구하고, ClickHouse 동작에 몇 가지 단절적인 변화를 가져옵니다. 새로운 분석기를 위해 쿼리를 어떻게 다시 작성해야 하는지 확인하려면 다음 변경 사항을 읽어보세요.

### 유효하지 않은 쿼리는 더 이상 최적화되지 않음 {#invalid-queries-are-no-longer-optimized}

이전 쿼리 계획 인프라는 쿼리 검증 단계 전에 AST 수준의 최적화를 적용했습니다. 최적화는 초기 쿼리를 유효하고 실행 가능한 것으로 재작성할 수 있었습니다.

새로운 분석기에서는 쿼리 검증이 최적화 단계 전에 수행됩니다. 이는 이전에 실행 가능한 유효하지 않은 쿼리가 이제는 지원되지 않음을 의미합니다. 이러한 경우, 쿼리는 수동으로 수정해야 합니다.

#### 예제 1 {#example-1}

다음 쿼리는 집계 후에 `toString(number)`만 사용 가능할 때 프로젝션 목록에서 컬럼 `number`를 사용합니다. 이전 분석기에서는 `GROUP BY toString(number)`가 `GROUP BY number,`로 최적화되어 쿼리가 유효하게 되었습니다.

```sql
SELECT number
FROM numbers(1)
GROUP BY toString(number)
```

#### 예제 2 {#example-2}

이 쿼리에서도 동일한 문제가 발생합니다. `number` 컬럼은 다른 키와 함께 집계 후에 사용됩니다. 이전 쿼리 분석기는 `HAVING` 절에서 `WHERE` 절로 `number > 5` 필터를 이동시켜 이 쿼리를 수정했습니다.

```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
GROUP BY n
HAVING number > 5
```

쿼리를 수정하려면 비집계 컬럼에 적용되는 모든 조건을 표준 SQL 구문에 맞게 `WHERE` 섹션으로 이동해야 합니다:

```sql
SELECT
    number % 2 AS n,
    sum(number)
FROM numbers(10)
WHERE number > 5
GROUP BY n
```

### 유효하지 않은 쿼리로 `CREATE VIEW` {#create-view-with-invalid-query}

새로운 분석기는 항상 타입 검사를 수행합니다. 이전에는 유효하지 않은 `SELECT` 쿼리로 `VIEW`를 생성할 수 있었습니다. 그런 다음 첫 번째 `SELECT` 또는 `INSERT`(물리화된 뷰의 경우)에서 실패하게 됩니다.

이러한 방식으로 `VIEW`를 생성할 수는 더 이상 없습니다.

#### 예제 {#example-view}

```sql
CREATE TABLE source (data String)
ENGINE=MergeTree
ORDER BY tuple();

CREATE VIEW some_view
AS SELECT JSONExtract(data, 'test', 'DateTime64(3)')
FROM source;
```

### `JOIN` 절의 알려진 비호환성 {#known-incompatibilities-of-the-join-clause}

#### 프로젝션의 컬럼을 사용하는 `JOIN` {#join-using-column-from-projection}

기본적으로 `SELECT` 목록의 별칭은 `JOIN USING` 키로 사용할 수 없습니다.

새 설정인 `analyzer_compatibility_join_using_top_level_identifier`를 활성화하면 `JOIN USING`의 동작이 변경되어 `SELECT` 쿼리의 프로젝션 목록에서 식을 기반으로 식별자를 해결하는 것을 선호합니다.

예를 들어:

```sql
SELECT a + 1 AS b, t2.s
FROM VALUES('a UInt64, b UInt64', (1, 1)) AS t1
JOIN VALUES('b UInt64, s String', (1, 'one'), (2, 'two')) t2
USING (b);
```

`analyzer_compatibility_join_using_top_level_identifier`가 `true`로 설정되면 조인 조건은 `t1.a + 1 = t2.b`로 해석되어 이전 버전의 동작과 일치합니다. 결과는 `2, 'two'`가 됩니다. 설정이 `false`인 경우 조인 조건은 기본적으로 `t1.b = t2.b`로 설정되며 쿼리는 `2, 'one'`을 반환합니다. 만약 `b`가 `t1`에 존재하지 않으면 쿼리는 오류로 실패합니다.

#### `JOIN USING` 및 `ALIAS`/`MATERIALIZED` 컬럼의 동작 변화 {#changes-in-behavior-with-join-using-and-aliasmaterialized-columns}

새로운 분석기에서는 `ALIAS` 또는 `MATERIALIZED` 컬럼을 포함하는 `JOIN USING` 쿼리에서 기본적으로 이러한 컬럼도 결과 집합에 포함됩니다.

예를 들어:

```sql
CREATE TABLE t1 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t1 VALUES (1), (2);

CREATE TABLE t2 (id UInt64, payload ALIAS sipHash64(id)) ENGINE = MergeTree ORDER BY id;
INSERT INTO t2 VALUES (2), (3);

SELECT * FROM t1
FULL JOIN t2 USING (payload);
```

새로운 분석기에서는 이 쿼리의 결과가 두 테이블 모두에서 `id`와 함께 `payload` 컬럼이 포함됩니다. 반면에 이전 분석기는 특정 설정(`asterisk_include_alias_columns` 또는 `asterisk_include_materialized_columns`)이 활성화된 경우에만 이러한 `ALIAS` 컬럼을 포함했으며, 컬럼이 다른 순서로 나타날 수도 있습니다.

일관되고 예상되는 결과를 보장하기 위해, 특히 이전 쿼리를 새로운 분석기로 마이그레이션할 때는 `*` 대신 `SELECT` 절에 컬럼을 명시하는 것이 좋습니다.

#### `USING` 절의 컬럼에 대한 타입 수정자 처리 {#handling-of-type-modifiers-for-columns-in-using-clause}

새로운 분석기 버전에서는 `USING` 절에 지정된 컬럼에 대한 공통 슈퍼타입을 결정하는 규칙이 표준화되어 보다 예측 가능한 결과를 생성합니다. 특히 `LowCardinality` 및 `Nullable`과 같은 타입 수정자를 처리할 때 그렇습니다.

- `LowCardinality(T)` 및 `T`: `LowCardinality(T)` 타입의 컬럼이 `T` 타입의 컬럼과 조인될 때, 결과로 나오는 공통 슈퍼타입은 `T`가 되며, `LowCardinality` 수정자는 무시됩니다.
- `Nullable(T)` 및 `T`: `Nullable(T)` 타입의 컬럼이 `T` 타입의 컬럼과 조인될 때, 결과로 나오는 공통 슈퍼타입은 `Nullable(T)`가 되며, nullable 속성이 보존됩니다.

예를 들어:

```sql
SELECT id, toTypeName(id)
FROM VALUES('id LowCardinality(String)', ('a')) AS t1
FULL OUTER JOIN VALUES('id String', ('b')) AS t2
USING (id);
```

이 쿼리에서 `id`의 공통 슈퍼타입은 `String`으로 결정되어 `t1`의 `LowCardinality` 수정자가 무시됩니다.

### 프로젝션 컬럼 이름 변경 {#projection-column-names-changes}

프로젝션 이름 계산 중에는 별칭이 대체되지 않습니다.

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

### 비호환 함수 인수 타입 {#incompatible-function-arguments-types}

새로운 분석기에서는 초기 쿼리 분석 중에 타입 추론이 발생합니다. 이 변경은 타입 검사가 단축 평가 전에 수행되도록 하므로, `if` 함수의 인수는 항상 공통 슈퍼타입을 가져야 합니다.

예를 들어, 다음 쿼리는 `Array(UInt8)`와 `String` 간에 공통 슈퍼타입이 없기 때문에 실패합니다:

```sql
SELECT toTypeName(if(0, [2, 3, 4], 'String'))
```

### 이질적인 클러스터 {#heterogeneous-clusters}

새로운 분석기는 클러스터 내 서버 간의 통신 프로토콜을 크게 변경합니다. 따라서 서로 다른 `enable_analyzer` 설정 값을 가진 서버에서는 분산 쿼리를 실행할 수 없습니다.

### 변이는 이전 분석기가 해석함 {#mutations-are-interpreted-by-previous-analyzer}

변이는 여전히 이전 분석기를 사용합니다. 이는 새로운 ClickHouse SQL 기능을 변이에서 사용할 수 없음을 의미합니다. 예를 들어 `QUALIFY` 절입니다. 상태는 [여기에서](https://github.com/ClickHouse/ClickHouse/issues/61563) 확인할 수 있습니다.

### 지원되지 않는 기능 {#unsupported-features}

새로운 분석기가 현재 지원하지 않는 기능 목록은 다음과 같습니다:

- Annoy 인덱스.
- Hypothesis 인덱스. 진행 중 [여기](https://github.com/ClickHouse/ClickHouse/pull/48381).
- 윈도우 뷰는 지원되지 않습니다. 향후 지원 계획은 없습니다.
