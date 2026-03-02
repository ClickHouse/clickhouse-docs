---
description: 'WITH 절 문서'
sidebar_label: 'WITH'
slug: /sql-reference/statements/select/with
title: 'WITH 절'
doc_type: 'reference'
---

# WITH 절 \{#with-clause\}

ClickHouse에서는 공통 테이블 표현식([CTE](https://en.wikipedia.org/wiki/Hierarchical_and_recursive_queries_in_SQL)), 공통 스칼라 표현식, 그리고 재귀 쿼리를 지원합니다.

## 공통 테이블 표현식(Common Table Expressions) \{#common-table-expressions\}

공통 테이블 표현식(Common Table Expressions)은 이름이 있는 서브쿼리를 나타냅니다.
`SELECT` 쿼리에서 테이블 표현식을 사용할 수 있는 모든 위치에서 이를 이름으로 참조할 수 있습니다.
이름이 있는 서브쿼리는 현재 쿼리의 범위뿐 아니라 하위 서브쿼리의 범위에서도 이름으로 참조할 수 있습니다.

`SELECT` 쿼리에서 공통 테이블 표현식에 대한 각 참조는 언제나 해당 정의에 있는 서브쿼리로 대체됩니다.
현재 공통 테이블 표현식(CTE)을 식별자 해석 과정에서 숨김으로써 재귀가 방지됩니다.

쿼리가 각 사용 위치마다 다시 실행되므로, CTE는 호출되는 모든 위치에서 동일한 결과를 보장하지 않는다는 점에 유의하십시오.

### 구문 \{#common-table-expressions-syntax\}

```sql
WITH <identifier> AS <subquery expression>
```


### 예시 \{#common-table-expressions-example\}

서브쿼리가 다시 실행되는 경우의 예는 다음과 같습니다:

```sql
WITH cte_numbers AS
(
    SELECT
        num
    FROM generateRandom('num UInt64', NULL)
    LIMIT 1000000
)
SELECT
    count()
FROM cte_numbers
WHERE num IN (SELECT num FROM cte_numbers)
```

CTE가 단순한 코드 조각이 아니라 결과 자체를 그대로 전달한다면, 항상 `1000000`이라는 값만 보게 됩니다.

그러나 `cte_numbers`를 두 번 참조하고 있으므로 매번 난수가 새로 생성되고, 그에 따라 `280501, 392454, 261636, 196227`처럼 서로 다른 임의의 결과가 표시됩니다.


## 공통 스칼라 표현식 \{#common-scalar-expressions\}

ClickHouse에서는 `WITH` 절에서 임의의 스칼라 표현식에 별칭을 선언할 수 있습니다.
공통 스칼라 표현식은 쿼리의 어느 위치에서나 참조할 수 있습니다.

:::note
공통 스칼라 표현식이 상수 리터럴이 아닌 다른 항목을 참조하는 경우, 해당 표현식으로 인해 [자유 변수](https://en.wikipedia.org/wiki/Free_variables_and_bound_variables)가 발생할 수 있습니다.
ClickHouse는 가능한 한 가장 가까운 스코프에서 식별자를 해석하므로, 이름 충돌이 발생하면 자유 변수가 예기치 않은 개체를 참조하거나 상관 서브쿼리(correlated subquery)로 이어질 수 있습니다.
표현식 식별자의 해석이 보다 예측 가능하게 동작하도록, 사용되는 모든 식별자를 바인딩하는 [람다 함수](/sql-reference/functions/overview#arrow-operator-and-lambda)로 공통 스칼라 표현식(CSE)을 정의할 것을 권장합니다(이는 [analyzer](/operations/analyzer)가 활성화된 경우에만 가능합니다).
:::

### 구문 \{#common-scalar-expressions-syntax\}

```sql
WITH <expression> AS <identifier>
```


### 예제 \{#common-scalar-expressions-examples\}

**예제 1:** 상수 표현식을 「변수」처럼 사용하기

```sql
WITH '2019-08-01 15:23:00' AS ts_upper_bound
SELECT *
FROM hits
WHERE
    EventDate = toDate(ts_upper_bound) AND
    EventTime <= ts_upper_bound;
```

**예시 2:** 고차 함수(higher-order function)를 사용하여 식별자의 범위를 한정하기

```sql
WITH
    '.txt' as extension,
    (id, extension) -> concat(lower(id), extension) AS gen_name
SELECT gen_name('test', '.sql') as file_name;
```

```response
   ┌─file_name─┐
1. │ test.sql  │
   └───────────┘
```

**예시 3:** 자유 변수를 사용하는 고차 함수

다음 예시 쿼리는 바인딩되지 않은 식별자가 가장 가까운 스코프의 엔티티로 해석된다는 것을 보여줍니다.
여기서 `gen_name` 람다 함수 본문 안에서는 `extension`이 바인딩되어 있지 않습니다.
`generated_names` 정의 및 사용의 스코프에서는 `extension`이 공통 스칼라 식 `'.txt'`로 정의되어 있지만, `generated_names` 서브쿼리 안에서 사용 가능하므로 테이블 `extension_list`의 컬럼으로 해석됩니다.

```sql
CREATE TABLE extension_list
(
    extension String
)
ORDER BY extension
AS SELECT '.sql';

WITH
    '.txt' as extension,
    generated_names as (
        WITH
            (id) -> concat(lower(id), extension) AS gen_name
        SELECT gen_name('test') as file_name FROM extension_list
    )
SELECT file_name FROM generated_names;
```

```response
   ┌─file_name─┐
1. │ test.sql  │
   └───────────┘
```

**예제 4:** SELECT 절의 컬럼 목록에서 sum(bytes) 표현식 결과 제거하기

```sql
WITH sum(bytes) AS s
SELECT
    formatReadableSize(s),
    table
FROM system.parts
GROUP BY table
ORDER BY s;
```

**예제 5:** 스칼라 서브쿼리 결과 활용하기

```sql
/* this example would return TOP 10 of most huge tables */
WITH
    (
        SELECT sum(bytes)
        FROM system.parts
        WHERE active
    ) AS total_disk_usage
SELECT
    (sum(bytes) / total_disk_usage) * 100 AS table_disk_usage,
    table
FROM system.parts
GROUP BY table
ORDER BY table_disk_usage DESC
LIMIT 10;
```

**예제 6:** 서브쿼리에서 식을 재사용하기

```sql
WITH test1 AS (SELECT i + 1, j + 1 FROM test1)
SELECT * FROM test1;
```


## 재귀 쿼리 \{#recursive-queries\}

옵션인 `RECURSIVE` 수정자를 사용하면 WITH 쿼리가 자신의 결과를 참조할 수 있습니다. 예:

**예:** 1부터 100까지의 정수 합 구하기

```sql
WITH RECURSIVE test_table AS (
    SELECT 1 AS number
UNION ALL
    SELECT number + 1 FROM test_table WHERE number < 100
)
SELECT sum(number) FROM test_table;
```

```text
┌─sum(number)─┐
│        5050 │
└─────────────┘
```

:::note
재귀 CTE는 버전 **`24.3`**에서 도입된 [query analyzer](/operations/analyzer)에 의존합니다. 버전 **`24.3+`**를 사용 중이고 **`(UNKNOWN_TABLE)`** 또는 **`(UNSUPPORTED_METHOD)`** 예외가 발생한다면, 해당 인스턴스, 역할, 또는 프로필에서 analyzer가 비활성화되어 있음을 의미합니다. analyzer를 활성화하려면 **`allow_experimental_analyzer`** 설정을 활성화하거나 **`compatibility`** 설정을 더 최신 버전으로 업데이트하십시오.
버전 `24.8`부터 analyzer는 완전히 프로덕션 환경용으로 승격되었으며, `allow_experimental_analyzer` 설정 이름은 `enable_analyzer`로 변경되었습니다.
:::

재귀 `WITH` 쿼리의 일반적인 형식은 비재귀 항이 먼저 오고, 그 다음에 `UNION ALL`, 그리고 그 다음에 재귀 항이 오며, 쿼리 자체의 출력에 대한 참조는 재귀 항에만 포함될 수 있습니다. 재귀 CTE 쿼리는 다음과 같이 실행됩니다.

1. 비재귀 항을 실행합니다. 비재귀 항 쿼리 결과를 임시 작업 테이블에 저장합니다.
2. 작업 테이블이 비어 있지 않은 동안 다음 단계를 반복합니다.
   1. 작업 테이블의 현재 내용을 재귀 자기 참조에 대입하여 재귀 항을 실행합니다. 재귀 항 쿼리 결과를 임시 중간 테이블에 저장합니다.
   2. 작업 테이블의 내용을 중간 테이블의 내용으로 교체한 다음, 중간 테이블을 비웁니다.

재귀 쿼리는 일반적으로 계층적 또는 트리 구조 데이터 작업에 사용됩니다. 예를 들어, 트리 탐색을 수행하는 쿼리를 작성할 수 있습니다.

**예시:** 트리 탐색

먼저 트리 테이블을 생성합니다:

```sql
DROP TABLE IF EXISTS tree;
CREATE TABLE tree
(
    id UInt64,
    parent_id Nullable(UInt64),
    data String
) ENGINE = MergeTree ORDER BY id;

INSERT INTO tree VALUES (0, NULL, 'ROOT'), (1, 0, 'Child_1'), (2, 0, 'Child_2'), (3, 1, 'Child_1_1');
```

해당 트리를 다음과 같은 쿼리로 순회할 수 있습니다:

**예시:** 트리 순회

```sql
WITH RECURSIVE search_tree AS (
    SELECT id, parent_id, data
    FROM tree t
    WHERE t.id = 0
UNION ALL
    SELECT t.id, t.parent_id, t.data
    FROM tree t, search_tree st
    WHERE t.parent_id = st.id
)
SELECT * FROM search_tree;
```

```text
┌─id─┬─parent_id─┬─data──────┐
│  0 │      ᴺᵁᴸᴸ │ ROOT      │
│  1 │         0 │ Child_1   │
│  2 │         0 │ Child_2   │
│  3 │         1 │ Child_1_1 │
└────┴───────────┴───────────┘
```


### 검색 순서 \{#search-order\}

깊이 우선 순서를 구성하기 위해 각 결과 행에 대해, 이미 방문한 행들의 배열을 계산합니다.

**예시:** 트리 순회의 깊이 우선 순서

```sql
WITH RECURSIVE search_tree AS (
    SELECT id, parent_id, data, [t.id] AS path
    FROM tree t
    WHERE t.id = 0
UNION ALL
    SELECT t.id, t.parent_id, t.data, arrayConcat(path, [t.id])
    FROM tree t, search_tree st
    WHERE t.parent_id = st.id
)
SELECT * FROM search_tree ORDER BY path;
```

```text
┌─id─┬─parent_id─┬─data──────┬─path────┐
│  0 │      ᴺᵁᴸᴸ │ ROOT      │ [0]     │
│  1 │         0 │ Child_1   │ [0,1]   │
│  3 │         1 │ Child_1_1 │ [0,1,3] │
│  2 │         0 │ Child_2   │ [0,2]   │
└────┴───────────┴───────────┴─────────┘
```

너비 우선 탐색 순서를 만들기 위한 표준적인 방법은 탐색 깊이를 추적하는 컬럼을 추가하는 것입니다:

**예:** 트리의 너비 우선 탐색 순서

```sql
WITH RECURSIVE search_tree AS (
    SELECT id, parent_id, data, [t.id] AS path, toUInt64(0) AS depth
    FROM tree t
    WHERE t.id = 0
UNION ALL
    SELECT t.id, t.parent_id, t.data, arrayConcat(path, [t.id]), depth + 1
    FROM tree t, search_tree st
    WHERE t.parent_id = st.id
)
SELECT * FROM search_tree ORDER BY depth;
```

```text
┌─id─┬─link─┬─data──────┬─path────┬─depth─┐
│  0 │ ᴺᵁᴸᴸ │ ROOT      │ [0]     │     0 │
│  1 │    0 │ Child_1   │ [0,1]   │     1 │
│  2 │    0 │ Child_2   │ [0,2]   │     1 │
│  3 │    1 │ Child_1_1 │ [0,1,3] │     2 │
└────┴──────┴───────────┴─────────┴───────┘
```


### 사이클 탐지 \{#cycle-detection\}

먼저 그래프 테이블을 생성합니다.

```sql
DROP TABLE IF EXISTS graph;
CREATE TABLE graph
(
    from UInt64,
    to UInt64,
    label String
) ENGINE = MergeTree ORDER BY (from, to);

INSERT INTO graph VALUES (1, 2, '1 -> 2'), (1, 3, '1 -> 3'), (2, 3, '2 -> 3'), (1, 4, '1 -> 4'), (4, 5, '4 -> 5');
```

다음 쿼리를 사용해 해당 그래프를 순회할 수 있습니다:

**예시:** 순환 탐지 없이 그래프 순회

```sql
WITH RECURSIVE search_graph AS (
    SELECT from, to, label FROM graph g
    UNION ALL
    SELECT g.from, g.to, g.label
    FROM graph g, search_graph sg
    WHERE g.from = sg.to
)
SELECT DISTINCT * FROM search_graph ORDER BY from;
```

```text
┌─from─┬─to─┬─label──┐
│    1 │  4 │ 1 -> 4 │
│    1 │  2 │ 1 -> 2 │
│    1 │  3 │ 1 -> 3 │
│    2 │  3 │ 2 -> 3 │
│    4 │  5 │ 4 -> 5 │
└──────┴────┴────────┘
```

그러나 해당 그래프에 사이클을 추가하면, 이전 쿼리는 `Maximum recursive CTE evaluation depth` 오류와 함께 실패합니다:

```sql
INSERT INTO graph VALUES (5, 1, '5 -> 1');

WITH RECURSIVE search_graph AS (
    SELECT from, to, label FROM graph g
UNION ALL
    SELECT g.from, g.to, g.label
    FROM graph g, search_graph sg
    WHERE g.from = sg.to
)
SELECT DISTINCT * FROM search_graph ORDER BY from;
```

```text
Code: 306. DB::Exception: Received from localhost:9000. DB::Exception: Maximum recursive CTE evaluation depth (1000) exceeded, during evaluation of search_graph AS (SELECT from, to, label FROM graph AS g UNION ALL SELECT g.from, g.to, g.label FROM graph AS g, search_graph AS sg WHERE g.from = sg.to). Consider raising max_recursive_cte_evaluation_depth setting.: While executing RecursiveCTESource. (TOO_DEEP_RECURSION)
```

사이클을 처리하는 표준적인 방법은 이미 방문한 노드들을 담은 배열을 계산하는 것입니다.

**예시:** 사이클 감지를 포함한 그래프 순회

```sql
WITH RECURSIVE search_graph AS (
    SELECT from, to, label, false AS is_cycle, [tuple(g.from, g.to)] AS path FROM graph g
UNION ALL
    SELECT g.from, g.to, g.label, has(path, tuple(g.from, g.to)), arrayConcat(sg.path, [tuple(g.from, g.to)])
    FROM graph g, search_graph sg
    WHERE g.from = sg.to AND NOT is_cycle
)
SELECT * FROM search_graph WHERE is_cycle ORDER BY from;
```

```text
┌─from─┬─to─┬─label──┬─is_cycle─┬─path──────────────────────┐
│    1 │  4 │ 1 -> 4 │ true     │ [(1,4),(4,5),(5,1),(1,4)] │
│    4 │  5 │ 4 -> 5 │ true     │ [(4,5),(5,1),(1,4),(4,5)] │
│    5 │  1 │ 5 -> 1 │ true     │ [(5,1),(1,4),(4,5),(5,1)] │
└──────┴────┴────────┴──────────┴───────────────────────────┘
```


### 무한 쿼리 \{#infinite-queries\}

외부 쿼리에서 `LIMIT`을 사용하는 경우, 무한 재귀 CTE 쿼리를 사용할 수도 있습니다.

**예시:** 무한 재귀 CTE 쿼리

```sql
WITH RECURSIVE test_table AS (
    SELECT 1 AS number
UNION ALL
    SELECT number + 1 FROM test_table
)
SELECT sum(number) FROM (SELECT number FROM test_table LIMIT 100);
```

```text
┌─sum(number)─┐
│        5050 │
└─────────────┘
```
