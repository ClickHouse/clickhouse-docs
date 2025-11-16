---
'description': 'ClickHouse에서 Tuple 데이터 유형에 대한 문서'
'sidebar_label': 'Tuple(T1, T2, ...)'
'sidebar_position': 34
'slug': '/sql-reference/data-types/tuple'
'title': 'Tuple(T1, T2, ...)'
'doc_type': 'reference'
---


# Tuple(T1, T2, ...)

각각 고유한 [타입](/sql-reference/data-types)을 가진 요소의 튜플입니다. 튜플은 최소한 하나의 요소를 포함해야 합니다.

튜플은 임시 컬럼 그룹화에 사용됩니다. IN 표현식이 쿼리에서 사용될 때 컬럼을 그룹화할 수 있으며, 람다 함수의 특정 형식 매개변수를 지정하는 데에도 사용됩니다. 자세한 내용은 [IN 연산자](../../sql-reference/operators/in.md) 및 [고차 함수](/sql-reference/functions/overview#higher-order-functions) 섹션을 참조하십시오.

튜플은 쿼리의 결과가 될 수 있습니다. 이 경우 JSON 이외의 텍스트 형식에서는 값이 괄호 안에 쉼표로 구분됩니다. JSON 형식에서는 튜플이 배열(대괄호 안에)로 출력됩니다.

## Creating Tuples {#creating-tuples}

함수를 사용하여 튜플을 생성할 수 있습니다:

```sql
tuple(T1, T2, ...)
```

튜플 생성 예:

```sql
SELECT tuple(1, 'a') AS x, toTypeName(x)
```

```text
┌─x───────┬─toTypeName(tuple(1, 'a'))─┐
│ (1,'a') │ Tuple(UInt8, String)      │
└─────────┴───────────────────────────┘
```

튜플은 단일 요소를 포함할 수 있습니다.

예:

```sql
SELECT tuple('a') AS x;
```

```text
┌─x─────┐
│ ('a') │
└───────┘
```

`(tuple_element1, tuple_element2)` 구문을 사용하면 `tuple()` 함수를 호출하지 않고도 여러 요소의 튜플을 생성할 수 있습니다.

예:

```sql
SELECT (1, 'a') AS x, (today(), rand(), 'someString') AS y, ('a') AS not_a_tuple;
```

```text
┌─x───────┬─y──────────────────────────────────────┬─not_a_tuple─┐
│ (1,'a') │ ('2022-09-21',2006973416,'someString') │ a           │
└─────────┴────────────────────────────────────────┴─────────────┘
```

## Data Type Detection {#data-type-detection}

즉석에서 튜플을 생성할 때, ClickHouse는 제공된 인수 값을 수용할 수 있는 가장 작은 타입으로 튜플의 인수 타입을 추론합니다. 값이 [NULL](/operations/settings/formats#input_format_null_as_default)인 경우, 추론된 타입은 [Nullable](../../sql-reference/data-types/nullable.md)입니다.

자동 데이터 타입 감지 예:

```sql
SELECT tuple(1, NULL) AS x, toTypeName(x)
```

```text
┌─x─────────┬─toTypeName(tuple(1, NULL))──────┐
│ (1, NULL) │ Tuple(UInt8, Nullable(Nothing)) │
└───────────┴─────────────────────────────────┘
```

## Referring to Tuple Elements {#referring-to-tuple-elements}

튜플 요소는 이름 또는 인덱스로 참조할 수 있습니다:

```sql
CREATE TABLE named_tuples (`a` Tuple(s String, i Int64)) ENGINE = Memory;
INSERT INTO named_tuples VALUES (('y', 10)), (('x',-10));

SELECT a.s FROM named_tuples; -- by name
SELECT a.2 FROM named_tuples; -- by index
```

결과:

```text
┌─a.s─┐
│ y   │
│ x   │
└─────┘

┌─tupleElement(a, 2)─┐
│                 10 │
│                -10 │
└────────────────────┘
```

## Comparison operations with Tuple {#comparison-operations-with-tuple}

두 개의 튜플은 왼쪽에서 오른쪽으로 순차적으로 요소를 비교하여 비교됩니다. 만약 첫 번째 튜플의 요소가 두 번째 튜플의 해당 요소보다 크거나(작거나) 작다면, 첫 번째 튜플은 두 번째 튜플보다 크거나(작거나) 작습니다. 그렇지 않으면(두 요소가 같다면) 다음 요소를 비교합니다.

예:

```sql
SELECT (1, 'z') > (1, 'a') c1, (2022, 01, 02) > (2023, 04, 02) c2, (1,2,3) = (3,2,1) c3;
```

```text
┌─c1─┬─c2─┬─c3─┐
│  1 │  0 │  0 │
└────┴────┴────┘
```

실제 예제:

```sql
CREATE TABLE test
(
    `year` Int16,
    `month` Int8,
    `day` Int8
)
ENGINE = Memory AS
SELECT *
FROM values((2022, 12, 31), (2000, 1, 1));

SELECT * FROM test;

┌─year─┬─month─┬─day─┐
│ 2022 │    12 │  31 │
│ 2000 │     1 │   1 │
└──────┴───────┴─────┘

SELECT *
FROM test
WHERE (year, month, day) > (2010, 1, 1);

┌─year─┬─month─┬─day─┐
│ 2022 │    12 │  31 │
└──────┴───────┴─────┘
CREATE TABLE test
(
    `key` Int64,
    `duration` UInt32,
    `value` Float64
)
ENGINE = Memory AS
SELECT *
FROM values((1, 42, 66.5), (1, 42, 70), (2, 1, 10), (2, 2, 0));

SELECT * FROM test;

┌─key─┬─duration─┬─value─┐
│   1 │       42 │  66.5 │
│   1 │       42 │    70 │
│   2 │        1 │    10 │
│   2 │        2 │     0 │
└─────┴──────────┴───────┘

-- Let's find a value for each key with the biggest duration, if durations are equal, select the biggest value

SELECT
    key,
    max(duration),
    argMax(value, (duration, value))
FROM test
GROUP BY key
ORDER BY key ASC;

┌─key─┬─max(duration)─┬─argMax(value, tuple(duration, value))─┐
│   1 │            42 │                                    70 │
│   2 │             2 │                                     0 │
└─────┴───────────────┴───────────────────────────────────────┘
```
