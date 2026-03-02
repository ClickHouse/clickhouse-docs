---
description: 'ARRAY JOIN 절 문서'
sidebar_label: 'ARRAY JOIN'
slug: /sql-reference/statements/select/array-join
title: 'ARRAY JOIN 절'
doc_type: 'reference'
---



# ARRAY JOIN 절 \{#array-join-clause\}

배열 컬럼을 포함하는 테이블에서는, 원래 컬럼의 각 개별 배열 원소마다 하나의 행을 갖는 새 테이블을 만들고 다른 컬럼의 값들은 그대로 복제하는 작업이 흔히 필요합니다. 이것이 `ARRAY JOIN` 절이 수행하는 기본적인 동작입니다.

이 이름은 이를 배열이나 중첩 데이터 구조와 `JOIN`을 수행하는 것으로 볼 수 있다는 데서 비롯되었습니다. 의도는 [arrayJoin](/sql-reference/functions/array-join) 함수와 유사하지만, 절의 기능은 더 광범위합니다.

구문:

```sql
SELECT <expr_list>
FROM <left_subquery>
[LEFT] ARRAY JOIN <array>
[WHERE|PREWHERE <expr>]
...
```

`ARRAY JOIN`에서 지원되는 타입은 다음과 같습니다:

* `ARRAY JOIN` - 기본적으로 빈 배열은 `JOIN` 결과에 포함되지 않습니다.
* `LEFT ARRAY JOIN` - `JOIN` 결과에 빈 배열을 가진 행이 포함됩니다. 빈 배열의 값은 배열 요소 타입의 기본값(일반적으로 0, 빈 문자열 또는 NULL)으로 설정됩니다.


## 기본 ARRAY JOIN 예제 \{#basic-array-join-examples\}

### ARRAY JOIN과 LEFT ARRAY JOIN \{#array-join-left-array-join-examples\}

아래 예제는 `ARRAY JOIN` 절과 `LEFT ARRAY JOIN` 절의 사용법을 보여줍니다. [Array](../../../sql-reference/data-types/array.md) 타입 컬럼이 있는 테이블을 생성하고 값을 삽입해 보겠습니다:

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

다음 예제에서는 `ARRAY JOIN` 절을 사용합니다:

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

다음 예제에서는 `LEFT ARRAY JOIN` 절을 사용합니다:

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

### ARRAY JOIN과 arrayEnumerate 함수 \{#array-join-arrayEnumerate\}

이 함수는 일반적으로 `ARRAY JOIN`과 함께 사용합니다. `ARRAY JOIN`을 적용한 뒤 각 배열에 대해 한 번만 값을 계산하거나 개수를 셀 수 있도록 해줍니다. 예시는 다음과 같습니다:

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

이 예에서 Reaches는 전환 수( `ARRAY JOIN` 을 적용한 후에 얻는 문자열 수)이고, Hits는 페이지 조회 수( `ARRAY JOIN` 이전의 문자열 수)입니다. 이 경우에는 동일한 결과를 더 쉽게 얻을 수 있습니다.

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

### ARRAY JOIN과 arrayEnumerateUniq \{#array_join_arrayEnumerateUniq\}

이 함수는 `ARRAY JOIN`을 사용하여 배열 요소를 집계할 때 유용합니다.

이 예시에서 각 goal ID마다 전환(conversion) 수(Goals 중첩 데이터 구조의 각 요소는 달성된 goal이며, 이를 전환이라고 합니다)와 세션 수를 계산합니다. `ARRAY JOIN`을 사용하지 않는다면 세션 수는 sum(Sign)으로 계산했을 것입니다. 그러나 이 경우에는 중첩된 Goals 구조로 인해 행이 그 구조의 크기만큼 중복되므로, 이후 각 세션을 한 번씩만 계산하기 위해 `arrayEnumerateUniq(Goals.ID)` 함수 값에 조건을 추가합니다.

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


## 별칭 사용하기 \{#using-aliases\}

`ARRAY JOIN` 절에서 배열에 별칭을 지정할 수 있습니다. 이 경우 배열 요소에는 이 별칭으로 접근할 수 있지만, 배열 자체에는 원래 이름으로만 접근할 수 있습니다. 예시는 다음과 같습니다.

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

별칭(alias)을 사용하면 외부 배열에 `ARRAY JOIN`을 수행할 수 있습니다. 예를 들면 다음과 같습니다:

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

여러 배열을 `ARRAY JOIN` 절에서 쉼표로 구분하여 지정할 수 있습니다. 이 경우 `JOIN`은 이 배열들에 대해 동시에 수행됩니다(카테시안 곱이 아닌 직접합). 기본적으로 모든 배열의 크기는 동일해야 합니다. 예:

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

다음 예제에서는 [arrayEnumerate](/sql-reference/functions/array-functions#arrayEnumerate) 함수를 사용합니다:

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

서로 크기가 다른 여러 배열은 `SETTINGS enable_unaligned_array_join = 1` 설정을 사용하여 조인할 수 있습니다. 예:

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


## 중첩 데이터 구조에서의 ARRAY JOIN \{#array-join-with-nested-data-structure\}

`ARRAY JOIN`은 [중첩 데이터 구조](../../../sql-reference/data-types/nested-data-structures/index.md)에서도 작동합니다:

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

`ARRAY JOIN`에서 중첩 데이터 구조의 이름을 지정하면, 해당 구조를 구성하는 모든 배열 요소에 대해 `ARRAY JOIN`을 수행하는 것과 동일한 의미가 됩니다. 예시는 아래를 참고하십시오.

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

이 변형도 적절합니다:

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

중첩된 데이터 구조에서 별칭을 사용하여 `JOIN` 결과 또는 원본 배열 중 하나를 선택할 수 있습니다. 예:

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

[arrayEnumerate](/sql-reference/functions/array-functions#arrayEnumerate) 함수를 사용하는 예:

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


## 구현 세부 정보 \{#implementation-details\}

`ARRAY JOIN`을 실행할 때 쿼리 실행 순서는 최적화됩니다. 쿼리에서 `ARRAY JOIN`은 항상 [WHERE](../../../sql-reference/statements/select/where.md)/[PREWHERE](../../../sql-reference/statements/select/prewhere.md) 절 앞에 지정해야 하지만, `ARRAY JOIN` 결과가 필터링에 사용되지 않는 한 실제로는 어떤 순서로든 실행될 수 있습니다. 처리 순서는 쿼리 옵티마이저에 의해 제어됩니다.

### 단락 평가(short-circuit function evaluation)와의 비호환성 \{#incompatibility-with-short-circuit-function-evaluation\}

[Short-circuit function evaluation](/operations/settings/settings#short_circuit_function_evaluation)은 `if`, `multiIf`, `and`, `or`와 같은 특정 함수에서 복잡한 표현식의 실행을 최적화하는 기능입니다. 이 기능은 이러한 함수들을 실행하는 동안 0으로 나누기와 같은 잠재적인 예외가 발생하는 것을 방지합니다.

`arrayJoin`은 항상 실행되며 short-circuit function evaluation을 지원하지 않습니다. 이는 쿼리 분석 및 실행 과정에서 다른 모든 함수와는 별도로 처리되는 고유한 함수이고, short-circuit function evaluation과 호환되지 않는 추가적인 로직이 필요하기 때문입니다. 결과의 행 수가 `arrayJoin` 결과에 따라 달라지며, `arrayJoin`의 지연 실행(lazy execution)을 구현하는 것은 너무 복잡하고 비용이 많이 듭니다.



## 관련 콘텐츠 \{#related-content\}

- 블로그: [ClickHouse에서 시계열 데이터 및 함수 활용하기](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
