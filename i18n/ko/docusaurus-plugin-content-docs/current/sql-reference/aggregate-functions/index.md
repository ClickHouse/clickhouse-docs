---
'description': 'Aggregate Functions에 대한 문서'
'sidebar_label': '집계 함수'
'sidebar_position': 33
'slug': '/sql-reference/aggregate-functions/'
'title': '집계 함수'
'doc_type': 'reference'
---


# 집계 함수

집계 함수는 데이터베이스 전문가가 기대하는 [정상](http://www.sql-tutorial.com/sql-aggregate-functions-sql-tutorial) 방식으로 작동합니다.

ClickHouse는 또한 다음을 지원합니다:

- [매개변수 집계 함수](/sql-reference/aggregate-functions/parametric-functions), 이 함수는 컬럼 외에 다른 매개변수를 허용합니다.
- [조합자](/sql-reference/aggregate-functions/combinators), 이들은 집계 함수의 동작을 변경합니다.

## NULL 처리 {#null-processing}

집계 동안 모든 `NULL` 인수는 생략됩니다. 집계에 여러 인수가 있는 경우, 하나 이상의 인수가 NULL인 행은 무시합니다.

이 규칙에는 예외가 있습니다. `첫 번째 값`이나 `마지막 값`과 같은 함수 [`first_value`](../../sql-reference/aggregate-functions/reference/first_value.md), [`last_value`](../../sql-reference/aggregate-functions/reference/last_value.md) 및 그 별칭(`any` 및 `anyLast`)이 `RESPECT NULLS` 수정자와 함께 사용될 때입니다. 예를 들어, `FIRST_VALUE(b) RESPECT NULLS`와 같습니다.

**예시:**

다음과 같은 테이블을 고려해 보십시오:

```text
┌─x─┬────y─┐
│ 1 │    2 │
│ 2 │ ᴺᵁᴸᴸ │
│ 3 │    2 │
│ 3 │    3 │
│ 3 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

`y` 컬럼의 값을 모두 합산해야 한다고 가정해 보겠습니다:

```sql
SELECT sum(y) FROM t_null_big
```

```text
┌─sum(y)─┐
│      7 │
└────────┘
```

이제 `groupArray` 함수를 사용하여 `y` 컬럼에서 배열을 생성할 수 있습니다:

```sql
SELECT groupArray(y) FROM t_null_big
```

```text
┌─groupArray(y)─┐
│ [2,2,3]       │
└───────────────┘
```

`groupArray`는 결과 배열에 `NULL`을 포함하지 않습니다.

[COALESCE](../../sql-reference/functions/functions-for-nulls.md#coalesce)를 사용하여 NULL을 사용 사례에 맞는 값으로 변경할 수 있습니다. 예를 들어: `avg(COALESCE(column, 0))`는 NULL인 경우 0을 사용하거나 집계에서 컬럼 값을 사용합니다:

```sql
SELECT
    avg(y),
    avg(coalesce(y, 0))
FROM t_null_big
```

```text
┌─────────────avg(y)─┬─avg(coalesce(y, 0))─┐
│ 2.3333333333333335 │                 1.4 │
└────────────────────┴─────────────────────┘
```

또한 [Tuple](sql-reference/data-types/tuple.md)을 사용하여 NULL 생략 동작을 우회할 수 있습니다. 오직 `NULL` 값만 포함된 `Tuple`은 `NULL`이 아니므로 집계 함수는 그 `NULL` 값으로 인해 해당 행을 생략하지 않습니다.

```sql
SELECT
    groupArray(y),
    groupArray(tuple(y)).1
FROM t_null_big;

┌─groupArray(y)─┬─tupleElement(groupArray(tuple(y)), 1)─┐
│ [2,2,3]       │ [2,NULL,2,3,NULL]                     │
└───────────────┴───────────────────────────────────────┘
```

열이 집계 함수의 인수로 사용될 때는 집계가 생략된다는 점에 유의해야 합니다. 예를 들어, 인수 없이 (`count()`) 또는 상수 인수로 (`count(1)`) 호출된 [`count`](../../sql-reference/aggregate-functions/reference/count.md)는 블록의 모든 행을 계산합니다( GROUP BY 컬럼의 값과는 독립적이므로 그 컬럼은 인수가 아닙니다), 반면 `count(column)`은 컬럼이 NULL이 아닌 행의 수만 반환합니다.

```sql
SELECT
    v,
    count(1),
    count(v)
FROM
(
    SELECT if(number < 10, NULL, number % 3) AS v
    FROM numbers(15)
)
GROUP BY v

┌────v─┬─count()─┬─count(v)─┐
│ ᴺᵁᴸᴸ │      10 │        0 │
│    0 │       1 │        1 │
│    1 │       2 │        2 │
│    2 │       2 │        2 │
└──────┴─────────┴──────────┘
```

다음은 `RESPECT NULLS`와 함께한 first_value의 예이며, 여기서 NULL 입력이 존중되고 NULL 여부와 상관없이 읽은 첫 번째 값이 반환되는 것을 볼 수 있습니다:

```sql
SELECT
    col || '_' || ((col + 1) * 5 - 1) AS range,
    first_value(odd_or_null) AS first,
    first_value(odd_or_null) IGNORE NULLS as first_ignore_null,
    first_value(odd_or_null) RESPECT NULLS as first_respect_nulls
FROM
(
    SELECT
        intDiv(number, 5) AS col,
        if(number % 2 == 0, NULL, number) AS odd_or_null
    FROM numbers(15)
)
GROUP BY col
ORDER BY col

┌─range─┬─first─┬─first_ignore_null─┬─first_respect_nulls─┐
│ 0_4   │     1 │                 1 │                ᴺᵁᴸᴸ │
│ 1_9   │     5 │                 5 │                   5 │
│ 2_14  │    11 │                11 │                ᴺᵁᴸᴸ │
└───────┴───────┴───────────────────┴─────────────────────┘
```
