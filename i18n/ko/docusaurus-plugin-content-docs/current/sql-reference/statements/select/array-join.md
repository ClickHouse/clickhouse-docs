---
'description': 'ARRAY JOIN 절에 대한 문서'
'sidebar_label': 'ARRAY JOIN'
'slug': '/sql-reference/statements/select/array-join'
'title': 'ARRAY JOIN 절'
'doc_type': 'reference'
---



# ARRAY JOIN 절

배열 컬럼을 포함하는 테이블에 대해 일반적인 작업은 각 개별 배열 요소가 있는 행을 가진 새 테이블을 생성하는 것입니다. 초기 컬럼의 다른 컬럼 값은 중복됩니다. 이것이 `ARRAY JOIN` 절이 수행하는 기본 사례입니다.

그 이름은 배열 또는 중첩 데이터 구조와 함께 `JOIN`을 실행하는 것으로 볼 수 있다는 사실에서 유래되었습니다. 의도는 [arrayJoin](/sql-reference/functions/array-join) 함수와 비슷하지만, 절의 기능은 더 넓습니다.

구문:

```sql
SELECT <expr_list>
FROM <left_subquery>
[LEFT] ARRAY JOIN <array>
[WHERE|PREWHERE <expr>]
...
```

지원되는 `ARRAY JOIN` 유형은 아래에 나와 있습니다:

- `ARRAY JOIN` - 기본 경우, 빈 배열은 `JOIN` 결과에 포함되지 않습니다.
- `LEFT ARRAY JOIN` - `JOIN` 결과는 빈 배열이 있는 행을 포함합니다. 빈 배열의 값은 배열 요소 유형의 기본 값(보통 0, 빈 문자열 또는 NULL)으로 설정됩니다.

## 기본 ARRAY JOIN 예제 {#basic-array-join-examples}

### ARRAY JOIN 및 LEFT ARRAY JOIN {#array-join-left-array-join-examples}

아래 예제는 `ARRAY JOIN` 및 `LEFT ARRAY JOIN` 절의 사용법을 보여줍니다. [Array](../../../sql-reference/data-types/array.md) 타입 컬럼을 가진 테이블을 생성하고 값들을 삽입해 보겠습니다:

```sql
CREATE TABLE arrays_test
(
    s String,
    arr Array(UInt8)
) ENGINE = Memory;

INSERT INTO arrays_test
VALUES ('Hello', [1,2]), ('World', [3,4,5]), ('Goodbye', []);
```

```response
┌─s───────────┬─arr─────┐
│ Hello       │ [1,2]   │
│ World       │ [3,4,5] │
│ Goodbye     │ []      │
└─────────────┴─────────┘
```

아래 예제는 `ARRAY JOIN` 절을 사용합니다:

```sql
SELECT s, arr
FROM arrays_test
ARRAY JOIN arr;
```

```response
┌─s─────┬─arr─┐
│ Hello │   1 │
│ Hello │   2 │
│ World │   3 │
│ World │   4 │
│ World │   5 │
└───────┴─────┘
```

다음 예제는 `LEFT ARRAY JOIN` 절을 사용합니다:

```sql
SELECT s, arr
FROM arrays_test
LEFT ARRAY JOIN arr;
```

```response
┌─s───────────┬─arr─┐
│ Hello       │   1 │
│ Hello       │   2 │
│ World       │   3 │
│ World       │   4 │
│ World       │   5 │
│ Goodbye     │   0 │
└─────────────┴─────┘
```

### ARRAY JOIN 및 arrayEnumerate 함수 {#array-join-arrayEnumerate}

이 함수는 일반적으로 `ARRAY JOIN`과 함께 사용됩니다. `ARRAY JOIN`을 적용한 후 각 배열에 대해 단 한 번 무언가를 계산할 수 있도록 합니다. 예제:

```sql
SELECT
    count() AS Reaches,
    countIf(num = 1) AS Hits
FROM test.hits
ARRAY JOIN
    GoalsReached,
    arrayEnumerate(GoalsReached) AS num
WHERE CounterID = 160656
LIMIT 10
```

```text
┌─Reaches─┬──Hits─┐
│   95606 │ 31406 │
└─────────┴───────┘
```

이 예제에서 Reaches는 변환의 수(즉, `ARRAY JOIN`을 적용한 후 받은 문자열)이고, Hits는 페이지뷰 수(즉, `ARRAY JOIN` 이전의 문자열)입니다. 이 특정 경우, 더 쉬운 방법으로 동일한 결과를 얻을 수 있습니다:

```sql
SELECT
    sum(length(GoalsReached)) AS Reaches,
    count() AS Hits
FROM test.hits
WHERE (CounterID = 160656) AND notEmpty(GoalsReached)
```

```text
┌─Reaches─┬──Hits─┐
│   95606 │ 31406 │
└─────────┴───────┘
```

### ARRAY JOIN 및 arrayEnumerateUniq {#array_join_arrayEnumerateUniq}

이 함수는 `ARRAY JOIN`과 배열 요소를 집계할 때 유용합니다.

이 예제에서 각 목표 ID는 변환 수(목표에 도달한 각 요소, 즉 변환으로 언급되는 것을 의미) 및 세션 수를 계산합니다. `ARRAY JOIN` 없이, 우리는 세션 수를 sum(Sign)으로 계산했을 것입니다. 그러나 이 특별한 경우, 행이 중첩된 Goals 구조에 의해 곱해졌기 때문에, 이 후 각 세션을 한 번만 계산하기 위해 `arrayEnumerateUniq(Goals.ID)` 함수의 값에 조건을 적용합니다.

```sql
SELECT
    Goals.ID AS GoalID,
    sum(Sign) AS Reaches,
    sumIf(Sign, num = 1) AS Visits
FROM test.visits
ARRAY JOIN
    Goals,
    arrayEnumerateUniq(Goals.ID) AS num
WHERE CounterID = 160656
GROUP BY GoalID
ORDER BY Reaches DESC
LIMIT 10
```

```text
┌──GoalID─┬─Reaches─┬─Visits─┐
│   53225 │    3214 │   1097 │
│ 2825062 │    3188 │   1097 │
│   56600 │    2803 │    488 │
│ 1989037 │    2401 │    365 │
│ 2830064 │    2396 │    910 │
│ 1113562 │    2372 │    373 │
│ 3270895 │    2262 │    812 │
│ 1084657 │    2262 │    345 │
│   56599 │    2260 │    799 │
│ 3271094 │    2256 │    812 │
└─────────┴─────────┴────────┘
```

## 별칭 사용하기 {#using-aliases}

`ARRAY JOIN` 절에서 배열에 대한 별칭을 지정할 수 있습니다. 이 경우, 배열 항목은 이 별칭으로 접근할 수 있지만 배열 자체는 원래 이름으로 접근합니다. 예제:

```sql
SELECT s, arr, a
FROM arrays_test
ARRAY JOIN arr AS a;
```

```response
┌─s─────┬─arr─────┬─a─┐
│ Hello │ [1,2]   │ 1 │
│ Hello │ [1,2]   │ 2 │
│ World │ [3,4,5] │ 3 │
│ World │ [3,4,5] │ 4 │
│ World │ [3,4,5] │ 5 │
└───────┴─────────┴───┘
```

별칭을 사용하면 외부 배열과 함께 `ARRAY JOIN`을 수행할 수 있습니다. 예를 들어:

```sql
SELECT s, arr_external
FROM arrays_test
ARRAY JOIN [1, 2, 3] AS arr_external;
```

```response
┌─s───────────┬─arr_external─┐
│ Hello       │            1 │
│ Hello       │            2 │
│ Hello       │            3 │
│ World       │            1 │
│ World       │            2 │
│ World       │            3 │
│ Goodbye     │            1 │
│ Goodbye     │            2 │
│ Goodbye     │            3 │
└─────────────┴──────────────┘
```

여러 배열은 `ARRAY JOIN` 절에서 쉼표로 구분될 수 있습니다. 이 경우 `JOIN`은 동시에 수행됩니다(직접 합계, 즉 카르테시안 곱이 아님). 모든 배열은 기본적으로 동일한 크기를 가져야 합니다. 예제:

```sql
SELECT s, arr, a, num, mapped
FROM arrays_test
ARRAY JOIN arr AS a, arrayEnumerate(arr) AS num, arrayMap(x -> x + 1, arr) AS mapped;
```

```response
┌─s─────┬─arr─────┬─a─┬─num─┬─mapped─┐
│ Hello │ [1,2]   │ 1 │   1 │      2 │
│ Hello │ [1,2]   │ 2 │   2 │      3 │
│ World │ [3,4,5] │ 3 │   1 │      4 │
│ World │ [3,4,5] │ 4 │   2 │      5 │
│ World │ [3,4,5] │ 5 │   3 │      6 │
└───────┴─────────┴───┴─────┴────────┘
```

아래 예제는 [arrayEnumerate](/sql-reference/functions/array-functions#arrayEnumerate) 함수를 사용합니다:

```sql
SELECT s, arr, a, num, arrayEnumerate(arr)
FROM arrays_test
ARRAY JOIN arr AS a, arrayEnumerate(arr) AS num;
```

```response
┌─s─────┬─arr─────┬─a─┬─num─┬─arrayEnumerate(arr)─┐
│ Hello │ [1,2]   │ 1 │   1 │ [1,2]               │
│ Hello │ [1,2]   │ 2 │   2 │ [1,2]               │
│ World │ [3,4,5] │ 3 │   1 │ [1,2,3]             │
│ World │ [3,4,5] │ 4 │   2 │ [1,2,3]             │
│ World │ [3,4,5] │ 5 │   3 │ [1,2,3]             │
└───────┴─────────┴───┴─────┴─────────────────────┘
```

크기가 다른 여러 배열은 `SETTINGS enable_unaligned_array_join = 1`을 사용하여 조인할 수 있습니다. 예제:

```sql
SELECT s, arr, a, b
FROM arrays_test ARRAY JOIN arr AS a, [['a','b'],['c']] AS b
SETTINGS enable_unaligned_array_join = 1;
```

```response
┌─s───────┬─arr─────┬─a─┬─b─────────┐
│ Hello   │ [1,2]   │ 1 │ ['a','b'] │
│ Hello   │ [1,2]   │ 2 │ ['c']     │
│ World   │ [3,4,5] │ 3 │ ['a','b'] │
│ World   │ [3,4,5] │ 4 │ ['c']     │
│ World   │ [3,4,5] │ 5 │ []        │
│ Goodbye │ []      │ 0 │ ['a','b'] │
│ Goodbye │ []      │ 0 │ ['c']     │
└─────────┴─────────┴───┴───────────┘
```

## 중첩 데이터 구조와 함께 ARRAY JOIN {#array-join-with-nested-data-structure}

`ARRAY JOIN`은 [중첩 데이터 구조](../../../sql-reference/data-types/nested-data-structures/index.md)와 함께 작동합니다:

```sql
CREATE TABLE nested_test
(
    s String,
    nest Nested(
    x UInt8,
    y UInt32)
) ENGINE = Memory;

INSERT INTO nested_test
VALUES ('Hello', [1,2], [10,20]), ('World', [3,4,5], [30,40,50]), ('Goodbye', [], []);
```

```response
┌─s───────┬─nest.x──┬─nest.y─────┐
│ Hello   │ [1,2]   │ [10,20]    │
│ World   │ [3,4,5] │ [30,40,50] │
│ Goodbye │ []      │ []         │
└─────────┴─────────┴────────────┘
```

```sql
SELECT s, `nest.x`, `nest.y`
FROM nested_test
ARRAY JOIN nest;
```

```response
┌─s─────┬─nest.x─┬─nest.y─┐
│ Hello │      1 │     10 │
│ Hello │      2 │     20 │
│ World │      3 │     30 │
│ World │      4 │     40 │
│ World │      5 │     50 │
└───────┴────────┴────────┘
```

`ARRAY JOIN`에서 중첩 데이터 구조의 이름을 지정할 때, 의미는 그것이 포함하는 모든 배열 요소와 함께 하는 `ARRAY JOIN`과 같습니다. 아래에 예제가 나와 있습니다:

```sql
SELECT s, `nest.x`, `nest.y`
FROM nested_test
ARRAY JOIN `nest.x`, `nest.y`;
```

```response
┌─s─────┬─nest.x─┬─nest.y─┐
│ Hello │      1 │     10 │
│ Hello │      2 │     20 │
│ World │      3 │     30 │
│ World │      4 │     40 │
│ World │      5 │     50 │
└───────┴────────┴────────┘
```

이 변형도 의미가 있습니다:

```sql
SELECT s, `nest.x`, `nest.y`
FROM nested_test
ARRAY JOIN `nest.x`;
```

```response
┌─s─────┬─nest.x─┬─nest.y─────┐
│ Hello │      1 │ [10,20]    │
│ Hello │      2 │ [10,20]    │
│ World │      3 │ [30,40,50] │
│ World │      4 │ [30,40,50] │
│ World │      5 │ [30,40,50] │
└───────┴────────┴────────────┘
```

중첩 데이터 구조에 대한 별칭을 사용하여 `JOIN` 결과 또는 원본 배열을 선택할 수 있습니다. 예제:

```sql
SELECT s, `n.x`, `n.y`, `nest.x`, `nest.y`
FROM nested_test
ARRAY JOIN nest AS n;
```

```response
┌─s─────┬─n.x─┬─n.y─┬─nest.x──┬─nest.y─────┐
│ Hello │   1 │  10 │ [1,2]   │ [10,20]    │
│ Hello │   2 │  20 │ [1,2]   │ [10,20]    │
│ World │   3 │  30 │ [3,4,5] │ [30,40,50] │
│ World │   4 │  40 │ [3,4,5] │ [30,40,50] │
│ World │   5 │  50 │ [3,4,5] │ [30,40,50] │
└───────┴─────┴─────┴─────────┴────────────┘
```

[arrayEnumerate](/sql-reference/functions/array-functions#arrayEnumerate) 함수를 사용하는 예제:

```sql
SELECT s, `n.x`, `n.y`, `nest.x`, `nest.y`, num
FROM nested_test
ARRAY JOIN nest AS n, arrayEnumerate(`nest.x`) AS num;
```

```response
┌─s─────┬─n.x─┬─n.y─┬─nest.x──┬─nest.y─────┬─num─┐
│ Hello │   1 │  10 │ [1,2]   │ [10,20]    │   1 │
│ Hello │   2 │  20 │ [1,2]   │ [10,20]    │   2 │
│ World │   3 │  30 │ [3,4,5] │ [30,40,50] │   1 │
│ World │   4 │  40 │ [3,4,5] │ [30,40,50] │   2 │
│ World │   5 │  50 │ [3,4,5] │ [30,40,50] │   3 │
└───────┴─────┴─────┴─────────┴────────────┴─────┘
```

## 구현 세부정보 {#implementation-details}

쿼리 실행 순서는 `ARRAY JOIN`을 실행할 때 최적화됩니다. 비록 `ARRAY JOIN`은 쿼리에서 [WHERE](../../../sql-reference/statements/select/where.md)/[PREWHERE](../../../sql-reference/statements/select/prewhere.md) 절보다 항상 먼저 지정해야 하지만, 기술적으로는 결과가 필터링에 사용되지 않는 한 어떤 순서로도 수행될 수 있습니다. 처리 순서는 쿼리 최적화 프로그램에 의해 제어됩니다.

### 단락식 함수 평가와의 호환성 없음 {#incompatibility-with-short-circuit-function-evaluation}

[단락식 함수 평가](/operations/settings/settings#short_circuit_function_evaluation)는 `if`, `multiIf`, `and`, `or`와 같은 특정 함수에서 복잡한 표현식의 실행을 최적화하는 기능입니다. 이는 이러한 함수의 실행 중에 발생할 수 있는 예외, 예를 들어 0으로 나누기를 방지합니다.

`arrayJoin`은 항상 실행되며 단락식 함수 평가에 대해 지원되지 않습니다. 그 이유는 쿼리 분석 및 실행 중에 모든 다른 함수와 별도로 처리되는 고유한 함수이기 때문에 단락식 함수 실행과 함께 작동하지 않는 추가 로직이 필요합니다. 이유는 결과의 행 수가 arrayJoin 결과에 의존하기 때문이며, `arrayJoin`의 지연 실행을 구현하는 것은 너무 복잡하고 비쌉니다.

## 관련 콘텐츠 {#related-content}

- 블로그: [ClickHouse에서 시계열 데이터 작업하기](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
