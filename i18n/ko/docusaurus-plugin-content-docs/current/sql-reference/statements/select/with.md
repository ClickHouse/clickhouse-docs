---
'description': 'WITH 절에 대한 문서'
'sidebar_label': 'WITH'
'slug': '/sql-reference/statements/select/with'
'title': 'WITH 절'
'doc_type': 'reference'
---


# WITH 절

ClickHouse는 공통 테이블 표현식 ([CTE](https://en.wikipedia.org/wiki/Hierarchical_and_recursive_queries_in_SQL)), 공통 스칼라 표현식 및 재귀 쿼리를 지원합니다.

## 공통 테이블 표현식 {#common-table-expressions}

공통 테이블 표현식은 이름이 지정된 하위 쿼리를 나타냅니다.
테이블 표현식이 허용되는 `SELECT` 쿼리의 어느 곳에서든 이름으로 참조할 수 있습니다.
이름이 지정된 하위 쿼리는 현재 쿼리의 범위 또는 자식 하위 쿼리의 범위 내에서 이름으로 참조할 수 있습니다.

`SELECT` 쿼리에서 공통 테이블 표현식에 대한 모든 참조는 항상 정의에서의 하위 쿼리로 대체됩니다.
현재 CTE를 식별자 해석 프로세스에서 숨김으로써 재귀가 방지됩니다.

CTE는 호출되는 모든 장소에서 동일한 결과를 보장하지 않는다는 점에 유의하십시오. 쿼리는 각 사용 사례에 대해 다시 실행됩니다.

### 구문 {#common-table-expressions-syntax}

```sql
WITH <identifier> AS <subquery expression>
```

### 예제 {#common-table-expressions-example}

하위 쿼리가 다시 실행되는 경우의 예:
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
CTE가 정확하게 결과를 전달하고 코드의 일부가 아니었다면 항상 `1000000`을 보았을 것입니다.

하지만 `cte_numbers`를 두 번 참조하기 때문에 매번 랜덤 숫자가 생성되고, 따라서 `280501, 392454, 261636, 196227` 등 서로 다른 무작위 결과를 보게 됩니다...

## 공통 스칼라 표현식 {#common-scalar-expressions}

ClickHouse는 `WITH` 절에서 임의의 스칼라 표현식에 별칭을 선언할 수 있습니다.
공통 스칼라 표현식은 쿼리의 어느 곳에서나 참조할 수 있습니다.

:::note
공통 스칼라 표현식이 상수 리터럴 외의 것에 참조하는 경우, 표현식에서는 [free variables](https://en.wikipedia.org/wiki/Free_variables_and_bound_variables)가 존재할 수 있습니다.
ClickHouse는 가능한 가장 가까운 범위에서 식별자를 해결하므로 이름 충돌이 발생할 경우 free variables가 예기치 않은 개체를 참조하거나 상관 서브쿼리로 이어질 수 있습니다.
보다 예측 가능한 표현식 식별자 해석의 동작을 위해 사용된 모든 식별자를 바인딩하여 공통 스칼라 표현식을 [람다 함수](/sql-reference/functions/overview#arrow-operator-and-lambda)로 정의하는 것이 권장됩니다(이는 [analyzer](/operations/analyzer)가 활성화된 경우에만 가능함).
:::

### 구문 {#common-scalar-expressions-syntax}

```sql
WITH <expression> AS <identifier>
```

### 예제 {#common-scalar-expressions-examples}

**예제 1:** 상수 표현식을 "변수"로 사용

```sql
WITH '2019-08-01 15:23:00' AS ts_upper_bound
SELECT *
FROM hits
WHERE
    EventDate = toDate(ts_upper_bound) AND
    EventTime <= ts_upper_bound;
```

**예제 2:** 식별자를 바인드하는 고차 함수 사용

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

**예제 3:** 자유 변수를 가진 고차 함수 사용

다음 예제 쿼리는 바인딩되지 않은 식별자가 가장 가까운 범위 내의 개체로 해결되는 것을 보여줍니다.
여기서 `extension`은 `gen_name` 람다 함수 본문에서 바인딩되지 않았습니다.
`extension`은 정의 및 사용의 `generated_names` 범위에서 공통 스칼라 표현식으로 `'.txt'`라고 정의되어 있지만, `generated_names` 하위 쿼리에서 사용 가능하기 때문에 `extension_list` 테이블의 컬럼으로 해결됩니다.

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

**예제 4:** SELECT 절의 컬럼 목록에서 sum(bytes) 표현식 결과 추출

```sql
WITH sum(bytes) AS s
SELECT
    formatReadableSize(s),
    table
FROM system.parts
GROUP BY table
ORDER BY s;
```

**예제 5:** 스칼라 하위 쿼리의 결과 사용

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

**예제 6:** 하위 쿼리에서 표현식 재사용

```sql
WITH test1 AS (SELECT i + 1, j + 1 FROM test1)
SELECT * FROM test1;
```

## 재귀 쿼리 {#recursive-queries}

선택 사항인 `RECURSIVE` 수정자는 WITH 쿼리가 자신의 출력을 참조할 수 있도록 합니다. 예시:

**예제:** 1부터 100까지의 정수 합산

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
재귀 CTE는 버전 **`24.3`**에서 도입된 [새 쿼리 분석기](/operations/analyzer)에 의존합니다. 버전 **`24.3+`**를 사용 중이며 **`(UNKNOWN_TABLE)`** 또는 **`(UNSUPPORTED_METHOD)`** 예외가 발생하면, 이는 새 분석기가 인스턴스, 역할 또는 프로필에서 비활성화되었음을 나타냅니다. 분석기를 활성화하려면 **`allow_experimental_analyzer`** 설정을 활성화하거나 **`compatibility`** 설정을 보다 최신 버전으로 업데이트하십시오.
버전 `24.8`부터 새 분석기는 프로덕션으로 완전히 승격되었으며, `allow_experimental_analyzer` 설정은 `enable_analyzer`로 이름이 변경되었습니다.
:::

재귀 `WITH` 쿼리의 일반적인 형태는 항상 비재귀 항, 그 다음에 `UNION ALL`, 그 다음에 재귀 항이 있으며, 오직 재귀 항만이 쿼리 자신의 출력을 참조할 수 있습니다. 재귀 CTE 쿼리는 다음과 같이 실행됩니다:

1. 비재귀 항을 평가합니다. 비재귀 항 쿼리의 결과를 임시 작업 테이블에 배치합니다.
2. 작업 테이블이 비어 있지 않은 한, 다음 단계들을 반복합니다:
    1. 재귀 항을 평가하고 현재 작업 테이블의 내용을 재귀 자기 참조로 대체합니다. 재귀 항 쿼리의 결과를 임시 중간 테이블에 배치합니다.
    2. 작업 테이블의 내용을 중간 테이블의 내용으로 대체한 후, 중간 테이블을 비웁니다.

재귀 쿼리는 일반적으로 계층적 또는 트리 구조의 데이터와 작업하는 데 사용됩니다. 예를 들어, 트리 탐색을 수행하는 쿼리를 작성할 수 있습니다:

**예제:** 트리 탐색

먼저 트리 테이블을 만듭니다:

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

이 트리를 다음 쿼리로 탐색할 수 있습니다:

**예제:** 트리 탐색
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

### 탐색 순서 {#search-order}

깊이 우선 순서를 생성하기 위해, 우리는 각 결과 행에 대해 이미 방문한 행의 배열을 계산합니다:

**예제:** 트리 탐색 깊이 우선 순서
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

너비 우선 순서를 생성하기 위한 일반적인 접근 방식은 탐색의 깊이를 추적하는 컬럼을 추가하는 것입니다:

**예제:** 트리 탐색 너비 우선 순서
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

### 사이클 탐지 {#cycle-detection}

먼저 그래프 테이블을 만듭니다:

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

그런 쿼리로 그래프를 탐색할 수 있습니다:

**예제:** 사이클 탐지 없는 그래프 탐색
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

그러나 그래프에 사이클을 추가하면, 이전 쿼리는 `Maximum recursive CTE evaluation depth` 오류와 함께 실패합니다:

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

사이클을 처리하는 표준 방법은 이미 방문한 노드의 배열을 계산하는 것입니다:

**예제:** 사이클 탐지 있는 그래프 탐색
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

### 무한 쿼리 {#infinite-queries}

또한 외부 쿼리에서 `LIMIT`이 사용되는 경우 무한 재귀 CTE 쿼리를 사용할 수 있습니다:

**예제:** 무한 재귀 CTE 쿼리
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
