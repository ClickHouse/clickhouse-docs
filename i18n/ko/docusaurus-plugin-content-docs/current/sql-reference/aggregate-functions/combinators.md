---
description: '집계 함수 조합자에 대한 문서'
sidebar_label: '조합자'
sidebar_position: 37
slug: /sql-reference/aggregate-functions/combinators
title: '집계 함수 조합자'
doc_type: 'reference'
---



# 집계 함수 조합자 \{#aggregate-function-combinators\}

집계 함수 이름에는 접미사를 붙여 사용할 수 있습니다. 이렇게 하면 집계 함수의 동작 방식이 달라집니다.



## -If \{#-if\}

접미사 -If는 모든 집계 함수 이름에 추가할 수 있습니다. 이 경우 집계 함수는 추가 인수로 조건(`UInt8` 타입)을 하나 더 받습니다. 집계 함수는 해당 조건을 만족하는 행만 처리합니다. 조건이 한 번도 만족되지 않으면 기본값(보통 0 또는 빈 문자열)을 반환합니다.

예시: `sumIf(column, cond)`, `countIf(cond)`, `avgIf(x, cond)`, `quantilesTimingIf(level1, level2)(x, cond)`, `argMinIf(arg, val, cond)` 등.

조건부 집계 함수를 사용하면 서브쿼리와 `JOIN`을 사용하지 않고도 여러 조건에 대한 집계값을 한 번에 계산할 수 있습니다. 예를 들어, 조건부 집계 함수는 세그먼트 비교 기능을 구현하는 데 사용할 수 있습니다.



## -Array \{#-array\}

-Array 접미사는 모든 집계 함수에 추가할 수 있습니다. 이 경우 집계 함수는 'T' 타입 인수 대신 'Array(T)' 타입(배열) 인수를 받습니다. 집계 함수가 여러 인수를 받는 경우, 이 인수들은 길이가 같은 배열이어야 합니다. 배열을 처리할 때 집계 함수는 모든 배열 요소에 대해 원래 집계 함수와 동일한 방식으로 동작합니다.

예시 1: `sumArray(arr)` - 모든 'arr' 배열의 모든 요소를 합산합니다. 이 예에서는 더 간단하게 `sum(arraySum(arr))`로 작성할 수도 있습니다.

예시 2: `uniqArray(arr)` – 모든 'arr' 배열에서 고유 요소의 개수를 셉니다. `uniq(arrayJoin(arr))`와 같이 더 쉬운 방식으로도 할 수 있지만, 쿼리에 'arrayJoin'을 항상 추가할 수 있는 것은 아닙니다.

-If와 -Array는 함께 사용할 수 있습니다. 단, 'Array'가 먼저 오고 그다음에 'If'가 와야 합니다. 예: `uniqArrayIf(arr, cond)`, `quantilesTimingArrayIf(level1, level2)(arr, cond)`. 이러한 순서로 인해 'cond' 인수는 배열이 되지 않습니다.



## -Map \{#-map\}

`-Map` 접미사는 어떤 집계 함수에나 추가할 수 있습니다. 이렇게 하면 `Map` 타입을 인자로 받고, 지정된 집계 함수를 사용하여 맵 각 키의 값을 각각 집계하는 집계 함수가 생성됩니다. 결과도 `Map` 타입입니다.

**예시**

```sql
CREATE TABLE map_map(
    date Date,
    timeslot DateTime,
    status Map(String, UInt64)
) ENGINE = Log;

INSERT INTO map_map VALUES
    ('2000-01-01', '2000-01-01 00:00:00', (['a', 'b', 'c'], [10, 10, 10])),
    ('2000-01-01', '2000-01-01 00:00:00', (['c', 'd', 'e'], [10, 10, 10])),
    ('2000-01-01', '2000-01-01 00:01:00', (['d', 'e', 'f'], [10, 10, 10])),
    ('2000-01-01', '2000-01-01 00:01:00', (['f', 'g', 'g'], [10, 10, 10]));

SELECT
    timeslot,
    sumMap(status),
    avgMap(status),
    minMap(status)
FROM map_map
GROUP BY timeslot;

┌────────────timeslot─┬─sumMap(status)───────────────────────┬─avgMap(status)───────────────────────┬─minMap(status)───────────────────────┐
│ 2000-01-01 00:00:00 │ {'a':10,'b':10,'c':20,'d':10,'e':10} │ {'a':10,'b':10,'c':10,'d':10,'e':10} │ {'a':10,'b':10,'c':10,'d':10,'e':10} │
│ 2000-01-01 00:01:00 │ {'d':10,'e':10,'f':20,'g':20}        │ {'d':10,'e':10,'f':10,'g':10}        │ {'d':10,'e':10,'f':10,'g':10}        │
└─────────────────────┴──────────────────────────────────────┴──────────────────────────────────────┴──────────────────────────────────────┘
```


## -SimpleState \{#-simplestate\}

이 조합자를 적용하면 집계 함수는 동일한 값을 반환하지만 데이터 타입이 달라집니다. 이는 테이블에 저장하여 [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) 테이블과 함께 사용할 수 있는 [SimpleAggregateFunction(...)](../../sql-reference/data-types/simpleaggregatefunction.md)입니다.

**구문**

```sql
<aggFunction>SimpleState(x)
```

**인수**

* `x` — 집계 함수의 매개변수입니다.

**반환값**

`SimpleAggregateFunction(...)` 타입을 사용하는 집계 함수의 값입니다.

**예시**

쿼리:

```sql
WITH anySimpleState(number) AS c SELECT toTypeName(c), c FROM numbers(1);
```

결과:

```text
┌─toTypeName(c)────────────────────────┬─c─┐
│ SimpleAggregateFunction(any, UInt64) │ 0 │
└──────────────────────────────────────┴───┘
```


## -State \{#-state\}

이 조합자를 적용하면 집계 함수는 결과 값(예: [uniq](/sql-reference/aggregate-functions/reference/uniq) 함수의 고유 값 개수)이 아니라 집계의 중간 상태를 반환합니다. `uniq`의 경우에는 고유 값 개수를 계산하기 위한 해시 테이블이 중간 상태입니다. 이는 이후 추가 처리에 사용하거나 나중에 집계를 완료하기 위해 테이블에 저장할 수 있는 `AggregateFunction(...)`입니다.

:::note
동일한 데이터에 대해서도 -MapState는 불변(항상 동일)하지 않다는 점에 유의하십시오. 이는 집계 중간 상태에서 데이터의 순서가 변경될 수 있기 때문이며, 이러한 변경은 이 데이터의 수집에는 영향을 미치지 않습니다.
:::

이러한 상태를 처리하려면 다음을 사용합니다.

- [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) 테이블 엔진.
- [finalizeAggregation](/sql-reference/functions/other-functions#finalizeAggregation) 함수.
- [runningAccumulate](../../sql-reference/functions/other-functions.md#runningAccumulate) 함수.
- [-Merge](#-merge) 조합자.
- [-MergeState](#-mergestate) 조합자.



## -Merge \{#-merge\}

이 조합자를 적용하면 집계 함수는 중간 집계 상태를 인수로 받아 상태들을 결합하여 집계를 완료하고, 그 결과값을 반환합니다.



## -MergeState \{#-mergestate\}

-Merge 조합자와 동일한 방식으로 중간 집계 상태를 병합합니다. 하지만 최종 결과값을 반환하는 대신, -State 조합자와 마찬가지로 중간 집계 상태를 반환합니다.



## -ForEach \{#-foreach\}

테이블에 대한 집계 함수를 배열에 대한 집계 함수로 변환하여, 서로 대응되는 배열 요소들을 집계하고 결과 배열을 반환합니다. 예를 들어 배열 `[1, 2]`, `[3, 4, 5]`, `[6, 7]`에 `sumForEach`를 적용하면, 서로 대응되는 배열 요소들을 더한 결과로 `[10, 13, 5]`가 반환됩니다.



## -Distinct \{#-distinct\}

각 인수 조합 중 서로 다른 조합만 한 번만 집계됩니다. 반복되는 값은 무시됩니다.
예: `sum(DISTINCT x)`(또는 `sumDistinct(x)`), `groupArray(DISTINCT x)`(또는 `groupArrayDistinct(x)`), `corrStable(DISTINCT x, y)`(또는 `corrStableDistinct(x, y)`) 등.



## -OrDefault \{#-ordefault\}

집계 함수의 동작을 변경합니다.

집계 함수에 입력값이 없는 경우, 이 조합자를 사용하면 함수의 반환 데이터 타입에 대한 기본값을 반환합니다. 비어 있는 입력 데이터를 받을 수 있는 집계 함수에 적용됩니다.

`-OrDefault`는 다른 조합자와 함께 사용할 수 있습니다.

**구문**

```sql
<aggFunction>OrDefault(x)
```

**인수**

* `x` — 집계 함수의 매개변수입니다.

**반환 값**

집계할 대상이 없는 경우 집계 함수 반환 타입의 기본값을 반환합니다.

타입은 사용한 집계 함수에 따라 달라집니다.

**예시**

쿼리:

```sql
SELECT avg(number), avgOrDefault(number) FROM numbers(0)
```

결과:

```text
┌─avg(number)─┬─avgOrDefault(number)─┐
│         nan │                    0 │
└─────────────┴──────────────────────┘
```

또한 `-OrDefault`는 다른 조합자(combinator)와 함께 사용할 수 있습니다. 집계 함수가 빈 입력을 허용하지 않을 때 유용합니다.

쿼리:

```sql
SELECT avgOrDefaultIf(x, x > 10)
FROM
(
    SELECT toDecimal32(1.23, 2) AS x
)
```

결과:

```text
┌─avgOrDefaultIf(x, greater(x, 10))─┐
│                              0.00 │
└───────────────────────────────────┘
```


## -OrNull \{#-ornull\}

집계 함수의 동작 방식을 변경합니다.

이 조합자는 집계 함수의 결과를 [널 허용](../../sql-reference/data-types/nullable.md) 데이터 타입(data type)으로 변환합니다. 집계 함수가 계산할 값이 없으면 [NULL](/operations/settings/formats#input_format_null_as_default)을 반환합니다.

`-OrNull`은 다른 조합자와 함께 사용할 수 있습니다.

**구문**

```sql
<aggFunction>OrNull(x)
```

**인수**

* `x` — 집계 함수 인자.

**반환값**

* 집계 함수 결과를 `Nullable` 데이터 타입으로 변환한 값입니다.
* 집계할 값이 없으면 `NULL`을 반환합니다.

타입: `Nullable(aggregate function return type)`.

**예시**

집계 함수 이름 끝에 `-orNull`을 추가합니다.

쿼리:

```sql
SELECT sumOrNull(number), toTypeName(sumOrNull(number)) FROM numbers(10) WHERE number > 10
```

결과:

```text
┌─sumOrNull(number)─┬─toTypeName(sumOrNull(number))─┐
│              ᴺᵁᴸᴸ │ Nullable(UInt64)              │
└───────────────────┴───────────────────────────────┘
```

또한 `-OrNull`은 다른 조합자와 함께 사용할 수 있습니다. 집계 함수가 빈 입력값을 허용하지 않을 때 유용합니다.

쿼리:

```sql
SELECT avgOrNullIf(x, x > 10)
FROM
(
    SELECT toDecimal32(1.23, 2) AS x
)
```

결과:

```text
┌─avgOrNullIf(x, greater(x, 10))─┐
│                           ᴺᵁᴸᴸ │
└────────────────────────────────┘
```


## -Resample \{#-resample\}

데이터를 여러 그룹으로 분할한 뒤, 각 그룹의 데이터를 개별적으로 집계합니다. 그룹은 특정 컬럼의 값을 구간으로 나누어 생성합니다.

```sql
<aggFunction>Resample(start, end, step)(<aggFunction_params>, resampling_key)
```

**인자**

* `start` — `resampling_key` 값에 대해 필요한 전체 구간의 시작 값입니다.
* `stop` — `resampling_key` 값에 대해 필요한 전체 구간의 끝 값입니다. 전체 구간에는 `stop` 값이 포함되지 않습니다(`[start, stop)`).
* `step` — 전체 구간을 하위 구간으로 나누기 위한 간격입니다. `aggFunction`은 각 하위 구간에 대해 독립적으로 실행됩니다.
* `resampling_key` — 해당 값을 기준으로 데이터를 구간으로 나누는 데 사용되는 컬럼입니다.
* `aggFunction_params` — `aggFunction`의 파라미터입니다.

**반환 값**

* 각 하위 구간에 대한 `aggFunction` 결과의 배열입니다.

**예시**

다음과 같은 데이터가 있는 `people` 테이블을 가정합니다:

```text
┌─name───┬─age─┬─wage─┐
│ John   │  16 │   10 │
│ Alice  │  30 │   15 │
│ Mary   │  35 │    8 │
│ Evelyn │  48 │ 11.5 │
│ David  │  62 │  9.9 │
│ Brian  │  60 │   16 │
└────────┴─────┴──────┘
```

나이가 `[30,60)` 및 `[60,75)` 구간에 속하는 사람들의 이름을 가져온다고 가정합니다. 나이를 정수로 표현하므로 실제로는 `[30, 59]` 및 `[60,74]` 구간의 나이를 얻게 됩니다.

이름을 배열로 집계하기 위해 [groupArray](/sql-reference/aggregate-functions/reference/grouparray) 집계 함수를 사용합니다. 이 함수는 인수 하나를 받습니다. 여기서는 `name` 컬럼입니다. `groupArrayResample` 함수는 나이별로 이름을 집계하기 위해 `age` 컬럼을 사용해야 합니다. 필요한 구간을 정의하기 위해 `groupArrayResample` 함수에 `30, 75, 30` 인수를 전달합니다.

```sql
SELECT groupArrayResample(30, 75, 30)(name, age) FROM people
```

```text
┌─groupArrayResample(30, 75, 30)(name, age)─────┐
│ [['Alice','Mary','Evelyn'],['David','Brian']] │
└───────────────────────────────────────────────┘
```

결과를 살펴보겠습니다.

`John`은 나이가 너무 어려 샘플에서 제외됩니다. 다른 사람들은 지정된 나이 구간에 따라 분포합니다.

이제 지정된 나이 구간별로 총 인원 수와 평균 급여를 계산해 보겠습니다.

```sql
SELECT
    countResample(30, 75, 30)(name, age) AS amount,
    avgResample(30, 75, 30)(wage, age) AS avg_wage
FROM people
```

```text
┌─amount─┬─avg_wage──────────────────┐
│ [3,2]  │ [11.5,12.949999809265137] │
└────────┴───────────────────────────┘
```


## -ArgMin \{#-argmin\}

접미사 -ArgMin은 모든 집계 함수 이름에 추가할 수 있습니다. 이 경우 집계 함수는 서로 비교 가능한 추가 인자를 하나 더 받습니다. 집계 함수는 지정된 추가 표현식의 값이 최소인 행만 처리합니다.

예: `sumArgMin(column, expr)`, `countArgMin(expr)`, `avgArgMin(x, expr)` 등.



## -ArgMax \{#-argmax\}

접미사 -ArgMin과 유사하지만, 지정된 추가 표현식의 값이 최댓값인 행만 처리합니다.



## 관련 콘텐츠 \{#related-content\}

- 블로그: [ClickHouse에서 집계 함수 결합자 사용하기](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
