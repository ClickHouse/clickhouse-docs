---
'description': 'Aggregate Function Combinators에 대한 Documentation'
'sidebar_label': 'Combinators'
'sidebar_position': 37
'slug': '/sql-reference/aggregate-functions/combinators'
'title': 'Aggregate Function Combinators'
'doc_type': 'reference'
---


# 집계 함수 조합기

집계 함수의 이름에는 접미사를 추가할 수 있습니다. 이는 집계 함수의 동작 방식을 변경합니다.

## -If {#-if}

-If 접미사는 모든 집계 함수 이름에 추가할 수 있습니다. 이 경우, 집계 함수는 추가 인수 – 조건(Uint8 유형)을 수용합니다. 집계 함수는 조건을 트리거하는 행만 처리합니다. 조건이 한 번도 트리거되지 않으면 기본값(대부분 0 또는 빈 문자열)을 반환합니다.

예제: `sumIf(column, cond)`, `countIf(cond)`, `avgIf(x, cond)`, `quantilesTimingIf(level1, level2)(x, cond)`, `argMinIf(arg, val, cond)` 등.

조건부 집계 함수를 사용하면 서브쿼리와 `JOIN`을 사용하지 않고 여러 조건에 대한 집계를 동시에 계산할 수 있습니다. 예를 들어, 조건부 집계 함수는 세그먼트 비교 기능을 구현하는 데 사용할 수 있습니다.

## -Array {#-array}

-Array 접미사는 모든 집계 함수에 추가할 수 있습니다. 이 경우, 집계 함수는 'T' 유형 대신 'Array(T)' 유형(배열)의 인수를 사용합니다. 집계 함수가 여러 인수를 수용하는 경우, 이는 길이가 동일한 배열이어야 합니다. 배열을 처리할 때, 집계 함수는 모든 배열 요소에 걸쳐 원래의 집계 함수처럼 작동합니다.

예제 1: `sumArray(arr)` – 모든 'arr' 배열의 요소를 총합합니다. 이 예제는 보다 간단하게 작성할 수도 있습니다: `sum(arraySum(arr))`.

예제 2: `uniqArray(arr)` – 모든 'arr' 배열에서 고유한 요소의 수를 계산합니다. 이는 더 쉽게 수행할 수 있습니다: `uniq(arrayJoin(arr))`, 그러나 'arrayJoin'을 쿼리에 추가하는 것이 항상 가능한 것은 아닙니다.

-If와 -Array는 함께 사용할 수 있습니다. 그러나 'Array'가 먼저 오고, 그 다음 'If'가 와야 합니다. 예제: `uniqArrayIf(arr, cond)`, `quantilesTimingArrayIf(level1, level2)(arr, cond)`. 이 순서 때문에, 'cond' 인수는 배열이 아닙니다.

## -Map {#-map}

-Map 접미사는 모든 집계 함수에 추가할 수 있습니다. 이는 Map 유형을 인수로 받고, 각 키의 값을 지정된 집계 함수를 사용하여 별도로 집계하는 집계 함수를 생성합니다. 결과는 Map 유형으로 반환됩니다.

**예제**

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

## -SimpleState {#-simplestate}

이 조합기를 적용하면, 집계 함수는 동일한 값을 반환하지만 다른 유형으로 반환합니다. 이는 [SimpleAggregateFunction(...)](../../sql-reference/data-types/simpleaggregatefunction.md)으로, [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) 테이블에서 작업하기 위해 테이블에 저장할 수 있습니다.

**문법**

```sql
<aggFunction>SimpleState(x)
```

**인수**

- `x` — 집계 함수 매개변수.

**반환 값**

`SimpleAggregateFunction(...)` 유형의 집계 함수 값을 반환합니다.

**예제**

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

## -State {#-state}

이 조합기를 적용하면, 집계 함수는 결과 값을 반환하지 않고, 집계의 중간 상태를 반환합니다 (예: [uniq](/sql-reference/aggregate-functions/reference/uniq) 함수의 경우 고유한 값의 수를 계산하기 위한 해시 테이블). 이는 추가 처리를 위해 사용하거나 나중에 집계 완료를 위해 테이블에 저장할 수 있는 `AggregateFunction(...)`입니다.

:::note
-MapState는 중간 상태의 데이터 순서가 변경될 수 있기 때문에 동일한 데이터에 대해 불변이 아닙니다. 그러나 이는 이 데이터의 수집에는 영향을 미치지 않습니다.
:::

이러한 상태와 작업하려면 다음을 사용하세요:

- [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) 테이블 엔진.
- [finalizeAggregation](/sql-reference/functions/other-functions#finalizeAggregation) 함수.
- [runningAccumulate](../../sql-reference/functions/other-functions.md#runningAccumulate) 함수.
- [-Merge](#-merge) 조합기.
- [-MergeState](#-mergestate) 조합기.

## -Merge {#-merge}

이 조합기를 적용하면, 집계 함수는 중간 집계 상태를 인수로 받아 상태를 결합하여 집계를 끝내고 결과 값을 반환합니다.

## -MergeState {#-mergestate}

- Merge 조합기와 동일한 방식으로 중간 집계 상태를 병합합니다. 그러나 결과 값을 반환하지 않고, -State 조합기와 유사한 중간 집계 상태를 반환합니다.

## -ForEach {#-foreach}

테이블의 집계 함수를 배열의 집계 함수로 변환하며, 해당 배열 항목을 집계하고 결과 배열을 반환합니다. 예를 들어, `sumForEach`는 배열 `[1, 2]`, `[3, 4, 5]` 및 `[6, 7]`를 위한 각 항목을 더한 후 결과 `[10, 13, 5]`를 반환합니다.

## -Distinct {#-distinct}

모든 고유한 인수 조합은 한 번만 집계됩니다. 반복되는 값은 무시됩니다.
예제: `sum(DISTINCT x)` (또는 `sumDistinct(x)`), `groupArray(DISTINCT x)` (또는 `groupArrayDistinct(x)`), `corrStable(DISTINCT x, y)` (또는 `corrStableDistinct(x, y)`) 등.

## -OrDefault {#-ordefault}

집계 함수의 동작 방식을 변경합니다.

집계 함수에 입력 값이 없으면, 이 조합기를 사용하여 반환 데이터 유형의 기본값을 반환합니다. 입력 데이터가 비어 있는 집계 함수에 적용됩니다.

`-OrDefault`는 다른 조합기와 함께 사용할 수 있습니다.

**문법**

```sql
<aggFunction>OrDefault(x)
```

**인수**

- `x` — 집계 함수 매개변수.

**반환 값**

집계할 것이 아무것도 없으면 집계 함수의 반환 유형의 기본값을 반환합니다.

유형은 사용된 집계 함수에 따라 다릅니다.

**예제**

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

또한 `-OrDefault`는 다른 조합기와 함께 사용할 수 있습니다. 이는 집계 함수가 빈 입력을 허용하지 않을 때 유용합니다.

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

## -OrNull {#-ornull}

집계 함수의 동작 방식을 변경합니다.

이 조합기는 집계 함수의 결과를 [Nullable](../../sql-reference/data-types/nullable.md) 데이터 유형으로 변환합니다. 만약 집계 함수에 계산할 값이 없다면 [NULL](/operations/settings/formats#input_format_null_as_default)을 반환합니다.

`-OrNull`은 다른 조합기와 함께 사용할 수 있습니다.

**문법**

```sql
<aggFunction>OrNull(x)
```

**인수**

- `x` — 집계 함수 매개변수.

**반환 값**

- 집계 함수의 결과, `Nullable` 데이터 유형으로 변환됨.
- 집계할 것이 아무것도 없으면 `NULL`.

유형: `Nullable(집계 함수 반환 유형)`.

**예제**

집계 함수의 끝에 `-orNull`을 추가합니다.

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

또한 `-OrNull`은 다른 조합기와 함께 사용할 수 있습니다. 이는 집계 함수가 빈 입력을 허용하지 않을 때 유용합니다.

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

## -Resample {#-resample}

데이터를 그룹으로 나누고, 각 그룹의 데이터를 별도로 집계할 수 있습니다. 그룹은 한 컬럼의 값들을 간격으로 나누어 생성됩니다.

```sql
<aggFunction>Resample(start, end, step)(<aggFunction_params>, resampling_key)
```

**인수**

- `start` — `resampling_key` 값의 전체 필요한 간격의 시작 값.
- `stop` — `resampling_key` 값의 전체 필요한 간격의 종료 값. 전체 간격은 `stop` 값을 포함하지 않습니다 `[start, stop)`.
- `step` — 전체 간격을 하위 간격으로 구분하는 단계. `aggFunction`은 각 하위 간격에 대해 독립적으로 실행됩니다.
- `resampling_key` — 데이터 분리를 위해 값이 사용되는 컬럼.
- `aggFunction_params` — `aggFunction` 매개변수.

**반환 값**

각 하위 간격에 대한 `aggFunction` 결과 배열.

**예제**

다음 데이터를 가진 `people` 테이블을 고려해 보세요:

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

`[30,60)` 및 `[60,75)` 간격에 있는 사람들의 이름을 가져와 봅시다. 나이에 대한 정수 표현을 사용하므로, `[30, 59]` 및 `[60,74]` 간격의 나이를 가져옵니다.

이름을 배열로 집계하기 위해 `[groupArray](/sql-reference/aggregate-functions/reference/grouparray)` 집계 함수를 사용합니다. 이 함수는 하나의 인수를 사용합니다. 우리의 경우, 그것은 `name` 컬럼입니다. `groupArrayResample` 함수는 나이에 따라 이름을 집계하기 위해 `age` 컬럼을 사용해야 합니다. 필요한 간격을 정의하기 위해, `30, 75, 30` 인수를 `groupArrayResample` 함수에 전달합니다.

```sql
SELECT groupArrayResample(30, 75, 30)(name, age) FROM people
```

```text
┌─groupArrayResample(30, 75, 30)(name, age)─────┐
│ [['Alice','Mary','Evelyn'],['David','Brian']] │
└───────────────────────────────────────────────┘
```

결과를 고려해 보세요.

`John`은 너무 젊기 때문에 샘플에서 제외됩니다. 다른 사람들은 지정된 나이 간격에 따라 분포되어 있습니다.

이제 특정 나이 간격에서 사람의 총 수와 평균 임금을 계산해 보겠습니다.

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

## -ArgMin {#-argmin}

접미사 -ArgMin은 모든 집계 함수 이름에 추가할 수 있습니다. 이 경우, 집계 함수는 추가 인수를 수용하는데, 이는 비교 가능한 표현식이어야 합니다. 집계 함수는 지정된 추가 표현식의 최소 값을 가진 행만 처리합니다.

예제: `sumArgMin(column, expr)`, `countArgMin(expr)`, `avgArgMin(x, expr)` 등.

## -ArgMax {#-argmax}

접미사 -ArgMin과 유사하지만, 지정된 추가 표현식의 최대 값을 가진 행만 처리합니다.

## 관련 콘텐츠 {#related-content}

- 블로그: [ClickHouse에서 집계 조합기 사용하기](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
