---
description: '집계 함수 문서'
sidebar_label: '집계 함수'
sidebar_position: 33
slug: /sql-reference/aggregate-functions/
title: '집계 함수'
doc_type: 'reference'
---

# 집계 함수 \{#aggregate-functions\}

집계 함수는 데이터베이스 전문가가 기대하는 [일반적인](http://www.sql-tutorial.com/sql-aggregate-functions-sql-tutorial) 방식으로 동작합니다.

ClickHouse는 다음과 같은 기능도 지원합니다.

* 컬럼 외에 다른 매개변수도 전달할 수 있는 [매개변수 집계 함수(Parametric aggregate functions)](/sql-reference/aggregate-functions/parametric-functions)
* 집계 함수의 동작을 변경하는 [조합자(Combinators)](/sql-reference/aggregate-functions/combinators)

## NULL 처리 \{#null-processing\}

집계 시 모든 `NULL` 인수는 건너뜁니다. 집계에 여러 인수가 있는 경우, 그중 하나 이상이 NULL인 행은 모두 무시합니다.

이 규칙에는 예외가 있습니다. 바로 [`first_value`](../../sql-reference/aggregate-functions/reference/first_value.md), [`last_value`](../../sql-reference/aggregate-functions/reference/last_value.md) 함수와 각각의 별칭(`any`, `anyLast`)에 `RESPECT NULLS` 수정자가 뒤따르는 경우입니다. 예를 들어, `FIRST_VALUE(b) RESPECT NULLS`와 같습니다.

**예시:**

다음 테이블을 살펴보십시오:

```text
┌─x─┬────y─┐
│ 1 │    2 │
│ 2 │ ᴺᵁᴸᴸ │
│ 3 │    2 │
│ 3 │    3 │
│ 3 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

예를 들어 `y` 컬럼의 값을 모두 합산해야 한다고 가정해 보겠습니다.

```sql
SELECT sum(y) FROM t_null_big
```

```text
┌─sum(y)─┐
│      7 │
└────────┘
```

이제 `groupArray` 함수를 사용하여 `y` 컬럼에서 배열을 생성할 수 있습니다.

```sql
SELECT groupArray(y) FROM t_null_big
```

```text
┌─groupArray(y)─┐
│ [2,2,3]       │
└───────────────┘
```

`groupArray`는 결과 배열에 `NULL`을 포함하지 않습니다.

사용 사례에 맞게 `NULL`을 의미 있는 값으로 변경하려면 [COALESCE](../../sql-reference/functions/functions-for-nulls.md#coalesce)를 사용할 수 있습니다. 예를 들어, `avg(COALESCE(column, 0))`는 집계 시 컬럼 값을 사용하고, 값이 `NULL`인 경우 0을 사용합니다:

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

또한 [Tuple](sql-reference/data-types/tuple.md)을 사용하여 NULL을 건너뛰는 동작을 회피할 수 있습니다. `NULL` 값만 포함하는 `Tuple`은 `NULL`이 아니므로, 집계 함수는 해당 `NULL` 값 때문에 그 행을 건너뛰지 않습니다.

```sql
SELECT
    groupArray(y),
    groupArray(tuple(y)).1
FROM t_null_big;

┌─groupArray(y)─┬─tupleElement(groupArray(tuple(y)), 1)─┐
│ [2,2,3]       │ [2,NULL,2,3,NULL]                     │
└───────────────┴───────────────────────────────────────┘
```

컬럼이 집계 함수의 인수로 사용될 때는 집계가 생략된다는 점에 유의하십시오. 예를 들어 매개변수 없이 사용하는 [`count`](../../sql-reference/aggregate-functions/reference/count.md) (`count()`)나 상수 매개변수와 함께 사용하는 경우(`count(1)`)에는 블록의 모든 행을 셉니다(GROUP BY 컬럼이 인수가 아니므로 GROUP BY 컬럼 값과는 무관함). 반면 `count(column)`은 해당 column이 NULL이 아닌 행의 개수만 반환합니다.

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

다음은 `RESPECT NULLS`와 함께 first&#95;value를 사용하는 예시입니다. 이 예시에서는 NULL 입력을 그대로 처리하며, 처음 읽은 값이 NULL인지 여부와 관계없이 해당 값을 반환함을 확인할 수 있습니다.

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
