---
'description': 'ClickHouse에서 다양한 유형의 값을 하나의 컬럼에 저장할 수 있는 Dynamic 데이터 유형에 대한 문서'
'sidebar_label': '동적'
'sidebar_position': 62
'slug': '/sql-reference/data-types/dynamic'
'title': '동적'
'doc_type': 'guide'
---


# Dynamic

이 유형은 모든 유형의 값을 미리 알지 않고도 내부에 저장할 수 있도록 허용합니다.

`Dynamic` 유형의 컬럼을 선언하려면 다음 구문을 사용합니다:

```sql
<column_name> Dynamic(max_types=N)
```

여기서 `N`은 `Dynamic` 유형을 가진 컬럼 안에 서로 다른 데이터 유형이 별도의 서브컬럼으로 저장될 수 있는 수를 나타내는 선택적 매개변수로, 0에서 254 사이의 값을 가질 수 있습니다. 이 한도를 초과하면 모든 새로운 유형의 값은 이진 형태로 특별 공유 데이터 구조에 함께 저장됩니다. `max_types`의 기본값은 `32`입니다.

## Creating Dynamic {#creating-dynamic}

테이블 컬럼 정의에서 `Dynamic` 유형 사용:

```sql
CREATE TABLE test (d Dynamic) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('Hello, World!'), ([1, 2, 3]);
SELECT d, dynamicType(d) FROM test;
```

```text
┌─d─────────────┬─dynamicType(d)─┐
│ ᴺᵁᴸᴸ          │ None           │
│ 42            │ Int64          │
│ Hello, World! │ String         │
│ [1,2,3]       │ Array(Int64)   │
└───────────────┴────────────────┘
```

일반 컬럼에서 CAST 사용:

```sql
SELECT 'Hello, World!'::Dynamic AS d, dynamicType(d);
```

```text
┌─d─────────────┬─dynamicType(d)─┐
│ Hello, World! │ String         │
└───────────────┴────────────────┘
```

`Variant` 컬럼에서 CAST 사용:

```sql
SET use_variant_as_common_type = 1;
SELECT multiIf((number % 3) = 0, number, (number % 3) = 1, range(number + 1), NULL)::Dynamic AS d, dynamicType(d) FROM numbers(3)
```

```text
┌─d─────┬─dynamicType(d)─┐
│ 0     │ UInt64         │
│ [0,1] │ Array(UInt64)  │
│ ᴺᵁᴸᴸ  │ None           │
└───────┴────────────────┘
```

## Reading Dynamic nested types as subcolumns {#reading-dynamic-nested-types-as-subcolumns}

`Dynamic` 유형은 유형 이름을 서브컬럼으로 사용하여 `Dynamic` 컬럼에서 단일 중첩 유형을 읽는 것을 지원합니다.
즉, `d Dynamic` 컬럼이 있는 경우, 구문 `d.T`를 사용하여 유효한 유형 `T`의 서브컬럼을 읽을 수 있으며, 이 서브컬럼의 유형은 `T`가 `Nullable` 안에 있을 수 있는 경우 `Nullable(T)`가 되고, 그렇지 않은 경우는 `T`가 됩니다. 이 서브컬럼은 원래 `Dynamic` 컬럼과 동일한 크기를 가지며, 원래 `Dynamic` 컬럼에 유형 `T`가 없는 모든 행에서 `NULL` 값(또는 `T`가 `Nullable` 안에 존재할 수 없는 경우에는 빈 값)을 포함합니다.

`Dynamic` 서브컬럼은 또한 함수 `dynamicElement(dynamic_column, type_name)`을 사용하여 읽을 수 있습니다.

예시:

```sql
CREATE TABLE test (d Dynamic) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('Hello, World!'), ([1, 2, 3]);
SELECT d, dynamicType(d), d.String, d.Int64, d.`Array(Int64)`, d.Date, d.`Array(String)` FROM test;
```

```text
┌─d─────────────┬─dynamicType(d)─┬─d.String──────┬─d.Int64─┬─d.Array(Int64)─┬─d.Date─┬─d.Array(String)─┐
│ ᴺᵁᴸᴸ          │ None           │ ᴺᵁᴸᴸ          │    ᴺᵁᴸᴸ │ []             │   ᴺᵁᴸᴸ │ []              │
│ 42            │ Int64          │ ᴺᵁᴸᴸ          │      42 │ []             │   ᴺᵁᴸᴸ │ []              │
│ Hello, World! │ String         │ Hello, World! │    ᴺᵁᴸᴸ │ []             │   ᴺᵁᴸᴸ │ []              │
│ [1,2,3]       │ Array(Int64)   │ ᴺᵁᴸᴸ          │    ᴺᵁᴸᴸ │ [1,2,3]        │   ᴺᵁᴸᴸ │ []              │
└───────────────┴────────────────┴───────────────┴─────────┴────────────────┴────────┴─────────────────┘
```

```sql
SELECT toTypeName(d.String), toTypeName(d.Int64), toTypeName(d.`Array(Int64)`), toTypeName(d.Date), toTypeName(d.`Array(String)`)  FROM test LIMIT 1;
```

```text
┌─toTypeName(d.String)─┬─toTypeName(d.Int64)─┬─toTypeName(d.Array(Int64))─┬─toTypeName(d.Date)─┬─toTypeName(d.Array(String))─┐
│ Nullable(String)     │ Nullable(Int64)     │ Array(Int64)               │ Nullable(Date)     │ Array(String)               │
└──────────────────────┴─────────────────────┴────────────────────────────┴────────────────────┴─────────────────────────────┘
```

```sql
SELECT d, dynamicType(d), dynamicElement(d, 'String'), dynamicElement(d, 'Int64'), dynamicElement(d, 'Array(Int64)'), dynamicElement(d, 'Date'), dynamicElement(d, 'Array(String)') FROM test;```
```

```text
┌─d─────────────┬─dynamicType(d)─┬─dynamicElement(d, 'String')─┬─dynamicElement(d, 'Int64')─┬─dynamicElement(d, 'Array(Int64)')─┬─dynamicElement(d, 'Date')─┬─dynamicElement(d, 'Array(String)')─┐
│ ᴺᵁᴸᴸ          │ None           │ ᴺᵁᴸᴸ                        │                       ᴺᵁᴸᴸ │ []                                │                      ᴺᵁᴸᴸ │ []                                 │
│ 42            │ Int64          │ ᴺᵁᴸᴸ                        │                         42 │ []                                │                      ᴺᵁᴸᴸ │ []                                 │
│ Hello, World! │ String         │ Hello, World!               │                       ᴺᵁᴸᴸ │ []                                │                      ᴺᵁᴸᴸ │ []                                 │
│ [1,2,3]       │ Array(Int64)   │ ᴺᵁᴸᴸ                        │                       ᴺᵁᴸᴸ │ [1,2,3]                           │                      ᴺᵁᴸᴸ │ []                                 │
└───────────────┴────────────────┴─────────────────────────────┴────────────────────────────┴───────────────────────────────────┴───────────────────────────┴────────────────────────────────────┘
```

각 행에 저장된 변형을 알기 위해 함수 `dynamicType(dynamic_column)`을 사용할 수 있습니다. 이 함수는 각 행에 대해 값의 유형 이름이 포함된 `String`을 반환합니다 (또는 행이 `NULL`인 경우 `'None'`).

예시:

```sql
CREATE TABLE test (d Dynamic) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('Hello, World!'), ([1, 2, 3]);
SELECT dynamicType(d) FROM test;
```

```text
┌─dynamicType(d)─┐
│ None           │
│ Int64          │
│ String         │
│ Array(Int64)   │
└────────────────┘
```

## Conversion between Dynamic column and other columns {#conversion-between-dynamic-column-and-other-columns}

`Dynamic` 컬럼으로 수행할 수 있는 4가지 가능한 변환이 있습니다.

### Converting an ordinary column to a Dynamic column {#converting-an-ordinary-column-to-a-dynamic-column}

```sql
SELECT 'Hello, World!'::Dynamic AS d, dynamicType(d);
```

```text
┌─d─────────────┬─dynamicType(d)─┐
│ Hello, World! │ String         │
└───────────────┴────────────────┘
```

### Converting a String column to a Dynamic column through parsing {#converting-a-string-column-to-a-dynamic-column-through-parsing}

`String` 컬럼에서 `Dynamic` 유형 값을 파싱하기 위해 설정 `cast_string_to_dynamic_use_inference`를 활성화할 수 있습니다:

```sql
SET cast_string_to_dynamic_use_inference = 1;
SELECT CAST(materialize(map('key1', '42', 'key2', 'true', 'key3', '2020-01-01')), 'Map(String, Dynamic)') as map_of_dynamic, mapApply((k, v) -> (k, dynamicType(v)), map_of_dynamic) as map_of_dynamic_types;
```

```text
┌─map_of_dynamic──────────────────────────────┬─map_of_dynamic_types─────────────────────────┐
│ {'key1':42,'key2':true,'key3':'2020-01-01'} │ {'key1':'Int64','key2':'Bool','key3':'Date'} │
└─────────────────────────────────────────────┴──────────────────────────────────────────────┘
```

### Converting a Dynamic column to an ordinary column {#converting-a-dynamic-column-to-an-ordinary-column}

`Dynamic` 컬럼을 일반 컬럼으로 변환할 수 있습니다. 이 경우 모든 중첩 유형이 대상 유형으로 변환됩니다:

```sql
CREATE TABLE test (d Dynamic) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('42.42'), (true), ('e10');
SELECT d::Nullable(Float64) FROM test;
```

```text
┌─CAST(d, 'Nullable(Float64)')─┐
│                         ᴺᵁᴸᴸ │
│                           42 │
│                        42.42 │
│                            1 │
│                            0 │
└──────────────────────────────┘
```

### Converting a Variant column to Dynamic column {#converting-a-variant-column-to-dynamic-column}

```sql
CREATE TABLE test (v Variant(UInt64, String, Array(UInt64))) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('String'), ([1, 2, 3]);
SELECT v::Dynamic AS d, dynamicType(d) FROM test; 
```

```text
┌─d───────┬─dynamicType(d)─┐
│ ᴺᵁᴸᴸ    │ None           │
│ 42      │ UInt64         │
│ String  │ String         │
│ [1,2,3] │ Array(UInt64)  │
└─────────┴────────────────┘
```

### Converting a Dynamic(max_types=N) column to another Dynamic(max_types=K) {#converting-a-dynamicmax_typesn-column-to-another-dynamicmax_typesk}

`K >= N`일 경우 변환 중에 데이터는 변경되지 않습니다:

```sql
CREATE TABLE test (d Dynamic(max_types=3)) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), (43), ('42.42'), (true);
SELECT d::Dynamic(max_types=5) as d2, dynamicType(d2) FROM test;
```

```text
┌─d─────┬─dynamicType(d)─┐
│ ᴺᵁᴸᴸ  │ None           │
│ 42    │ Int64          │
│ 43    │ Int64          │
│ 42.42 │ String         │
│ true  │ Bool           │
└───────┴────────────────┘
```

`K < N`, 그러면 가장 희귀한 유형의 값은 단일 특별 서브컬럼에 삽입되지만 여전히 접근 가능합니다:
```text
CREATE TABLE test (d Dynamic(max_types=4)) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), (43), ('42.42'), (true), ([1, 2, 3]);
SELECT d, dynamicType(d), d::Dynamic(max_types=2) as d2, dynamicType(d2), isDynamicElementInSharedData(d2) FROM test;
```

```text
┌─d───────┬─dynamicType(d)─┬─d2──────┬─dynamicType(d2)─┬─isDynamicElementInSharedData(d2)─┐
│ ᴺᵁᴸᴸ    │ None           │ ᴺᵁᴸᴸ    │ None            │ false                            │
│ 42      │ Int64          │ 42      │ Int64           │ false                            │
│ 43      │ Int64          │ 43      │ Int64           │ false                            │
│ 42.42   │ String         │ 42.42   │ String          │ false                            │
│ true    │ Bool           │ true    │ Bool            │ true                             │
│ [1,2,3] │ Array(Int64)   │ [1,2,3] │ Array(Int64)    │ true                             │
└─────────┴────────────────┴─────────┴─────────────────┴──────────────────────────────────┘
```

함수 `isDynamicElementInSharedData`는 특별 공유 데이터 구조 안에 저장된 행에 대해 `true`를 반환하며, 결과 컬럼은 공유 데이터 구조에 저장되지 않은 2개의 유형만 포함됩니다.

`K=0`일 경우 모든 유형은 단일 특별 서브컬럼에 삽입됩니다:

```text
CREATE TABLE test (d Dynamic(max_types=4)) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), (43), ('42.42'), (true), ([1, 2, 3]);
SELECT d, dynamicType(d), d::Dynamic(max_types=0) as d2, dynamicType(d2), isDynamicElementInSharedData(d2) FROM test;
```

```text
┌─d───────┬─dynamicType(d)─┬─d2──────┬─dynamicType(d2)─┬─isDynamicElementInSharedData(d2)─┐
│ ᴺᵁᴸᴸ    │ None           │ ᴺᵁᴸᴸ    │ None            │ false                            │
│ 42      │ Int64          │ 42      │ Int64           │ true                             │
│ 43      │ Int64          │ 43      │ Int64           │ true                             │
│ 42.42   │ String         │ 42.42   │ String          │ true                             │
│ true    │ Bool           │ true    │ Bool            │ true                             │
│ [1,2,3] │ Array(Int64)   │ [1,2,3] │ Array(Int64)    │ true                             │
└─────────┴────────────────┴─────────┴─────────────────┴──────────────────────────────────┘
```

## Reading Dynamic type from the data {#reading-dynamic-type-from-the-data}

모든 텍스트 형식(TSV, CSV, CustomSeparated, Values, JSONEachRow 등)은 `Dynamic` 유형의 읽기를 지원합니다. 데이터 파싱 동안 ClickHouse는 각 값의 유형을 추론하고 이를 `Dynamic` 컬럼에 삽입할 때 사용합니다. 

예시:

```sql
SELECT
    d,
    dynamicType(d),
    dynamicElement(d, 'String') AS str,
    dynamicElement(d, 'Int64') AS num,
    dynamicElement(d, 'Float64') AS float,
    dynamicElement(d, 'Date') AS date,
    dynamicElement(d, 'Array(Int64)') AS arr
FROM format(JSONEachRow, 'd Dynamic', $$
{"d" : "Hello, World!"},
{"d" : 42},
{"d" : 42.42},
{"d" : "2020-01-01"},
{"d" : [1, 2, 3]}
$$)
```

```text
┌─d─────────────┬─dynamicType(d)─┬─str───────────┬──num─┬─float─┬───────date─┬─arr─────┐
│ Hello, World! │ String         │ Hello, World! │ ᴺᵁᴸᴸ │  ᴺᵁᴸᴸ │       ᴺᵁᴸᴸ │ []      │
│ 42            │ Int64          │ ᴺᵁᴸᴸ          │   42 │  ᴺᵁᴸᴸ │       ᴺᵁᴸᴸ │ []      │
│ 42.42         │ Float64        │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ │ 42.42 │       ᴺᵁᴸᴸ │ []      │
│ 2020-01-01    │ Date           │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ │  ᴺᵁᴸᴸ │ 2020-01-01 │ []      │
│ [1,2,3]       │ Array(Int64)   │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ │  ᴺᵁᴸᴸ │       ᴺᵁᴸᴸ │ [1,2,3] │
└───────────────┴────────────────┴───────────────┴──────┴───────┴────────────┴─────────┘
```

## Using Dynamic type in functions {#using-dynamic-type-in-functions}

대부분의 함수는 `Dynamic` 유형의 인수를 지원합니다. 이 경우 함수는 `Dynamic` 컬럼 내부에 저장된 각 데이터 유형에 대해 별도로 실행됩니다.
함수의 결과 유형이 인수 유형에 따라 달라지면, `Dynamic` 인수로 실행된 함수의 결과는 `Dynamic`이 됩니다. 함수의 결과 유형이 인수 유형과 관계가 없으면 결과는 `Nullable(T)`가 되며, 여기서 `T`는 해당 함수의 일반적인 결과 유형입니다.

예시:

```sql
CREATE TABLE test (d Dynamic) ENGINE=Memory;
INSERT INTO test VALUES (NULL), (1::Int8), (2::Int16), (3::Int32), (4::Int64);
```

```sql
SELECT d, dynamicType(d) FROM test;
```

```text
┌─d────┬─dynamicType(d)─┐
│ ᴺᵁᴸᴸ │ None           │
│ 1    │ Int8           │
│ 2    │ Int16          │
│ 3    │ Int32          │
│ 4    │ Int64          │
└──────┴────────────────┘
```

```sql
SELECT d, d + 1 AS res, toTypeName(res), dynamicType(res) FROM test;
```

```text
┌─d────┬─res──┬─toTypeName(res)─┬─dynamicType(res)─┐
│ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ Dynamic         │ None             │
│ 1    │ 2    │ Dynamic         │ Int16            │
│ 2    │ 3    │ Dynamic         │ Int32            │
│ 3    │ 4    │ Dynamic         │ Int64            │
│ 4    │ 5    │ Dynamic         │ Int64            │
└──────┴──────┴─────────────────┴──────────────────┘
```

```sql
SELECT d, d + d AS res, toTypeName(res), dynamicType(res) FROM test;
```

```text
┌─d────┬─res──┬─toTypeName(res)─┬─dynamicType(res)─┐
│ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ Dynamic         │ None             │
│ 1    │ 2    │ Dynamic         │ Int16            │
│ 2    │ 4    │ Dynamic         │ Int32            │
│ 3    │ 6    │ Dynamic         │ Int64            │
│ 4    │ 8    │ Dynamic         │ Int64            │
└──────┴──────┴─────────────────┴──────────────────┘
```

```sql
SELECT d, d < 3 AS res, toTypeName(res) FROM test;
```

```text
┌─d────┬──res─┬─toTypeName(res)─┐
│ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ Nullable(UInt8) │
│ 1    │    1 │ Nullable(UInt8) │
│ 2    │    1 │ Nullable(UInt8) │
│ 3    │    0 │ Nullable(UInt8) │
│ 4    │    0 │ Nullable(UInt8) │
└──────┴──────┴─────────────────┘
```

```sql
SELECT d, exp2(d) AS res, toTypeName(res) FROM test;
```

```sql
┌─d────┬──res─┬─toTypeName(res)───┐
│ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ Nullable(Float64) │
│ 1    │    2 │ Nullable(Float64) │
│ 2    │    4 │ Nullable(Float64) │
│ 3    │    8 │ Nullable(Float64) │
│ 4    │   16 │ Nullable(Float64) │
└──────┴──────┴───────────────────┘
```

```sql
TRUNCATE TABLE test;
INSERT INTO test VALUES (NULL), ('str_1'), ('str_2');
SELECT d, dynamicType(d) FROM test;
```

```text
┌─d─────┬─dynamicType(d)─┐
│ ᴺᵁᴸᴸ  │ None           │
│ str_1 │ String         │
│ str_2 │ String         │
└───────┴────────────────┘
```

```sql
SELECT d, upper(d) AS res, toTypeName(res) FROM test;
```

```text
┌─d─────┬─res───┬─toTypeName(res)──┐
│ ᴺᵁᴸᴸ  │ ᴺᵁᴸᴸ  │ Nullable(String) │
│ str_1 │ STR_1 │ Nullable(String) │
│ str_2 │ STR_2 │ Nullable(String) │
└───────┴───────┴──────────────────┘
```

```sql
SELECT d, extract(d, '([0-3])') AS res, toTypeName(res) FROM test;
```

```text
┌─d─────┬─res──┬─toTypeName(res)──┐
│ ᴺᵁᴸᴸ  │ ᴺᵁᴸᴸ │ Nullable(String) │
│ str_1 │ 1    │ Nullable(String) │
│ str_2 │ 2    │ Nullable(String) │
└───────┴──────┴──────────────────┘
```

```sql
TRUNCATE TABLE test;
INSERT INTO test VALUES (NULL), ([1, 2]), ([3, 4]);
SELECT d, dynamicType(d) FROM test;
```

```text
┌─d─────┬─dynamicType(d)─┐
│ ᴺᵁᴸᴸ  │ None           │
│ [1,2] │ Array(Int64)   │
│ [3,4] │ Array(Int64)   │
└───────┴────────────────┘
```

```sql
SELECT d, d[1] AS res, toTypeName(res), dynamicType(res) FROM test;
```

```text
┌─d─────┬─res──┬─toTypeName(res)─┬─dynamicType(res)─┐
│ ᴺᵁᴸᴸ  │ ᴺᵁᴸᴸ │ Dynamic         │ None             │
│ [1,2] │ 1    │ Dynamic         │ Int64            │
│ [3,4] │ 3    │ Dynamic         │ Int64            │
└───────┴──────┴─────────────────┴──────────────────┘
```

함수가 `Dynamic` 컬럼 내부의 특정 유형에서 실행될 수 없는 경우 예외가 발생합니다:

```sql
INSERT INTO test VALUES (42), (43), ('str_1');
SELECT d, dynamicType(d) FROM test;
```

```text
┌─d─────┬─dynamicType(d)─┐
│ 42    │ Int64          │
│ 43    │ Int64          │
│ str_1 │ String         │
└───────┴────────────────┘
┌─d─────┬─dynamicType(d)─┐
│ ᴺᵁᴸᴸ  │ None           │
│ [1,2] │ Array(Int64)   │
│ [3,4] │ Array(Int64)   │
└───────┴────────────────┘
```

```sql
SELECT d, d + 1 AS res, toTypeName(res), dynamicType(d) FROM test;
```

```text
Received exception:
Code: 43. DB::Exception: Illegal types Array(Int64) and UInt8 of arguments of function plus: while executing 'FUNCTION plus(__table1.d : 3, 1_UInt8 :: 1) -> plus(__table1.d, 1_UInt8) Dynamic : 0'. (ILLEGAL_TYPE_OF_ARGUMENT)
```

불필요한 유형을 필터링할 수 있습니다:

```sql
SELECT d, d + 1 AS res, toTypeName(res), dynamicType(res) FROM test WHERE dynamicType(d) NOT IN ('String', 'Array(Int64)', 'None')
```

```text
┌─d──┬─res─┬─toTypeName(res)─┬─dynamicType(res)─┐
│ 42 │ 43  │ Dynamic         │ Int64            │
│ 43 │ 44  │ Dynamic         │ Int64            │
└────┴─────┴─────────────────┴──────────────────┘
```

또는 필요한 유형을 서브컬럼으로 추출할 수 있습니다:

```sql
SELECT d, d.Int64 + 1 AS res, toTypeName(res) FROM test;
```

```text
┌─d─────┬──res─┬─toTypeName(res)─┐
│ 42    │   43 │ Nullable(Int64) │
│ 43    │   44 │ Nullable(Int64) │
│ str_1 │ ᴺᵁᴸᴸ │ Nullable(Int64) │
└───────┴──────┴─────────────────┘
┌─d─────┬──res─┬─toTypeName(res)─┐
│ ᴺᵁᴸᴸ  │ ᴺᵁᴸᴸ │ Nullable(Int64) │
│ [1,2] │ ᴺᵁᴸᴸ │ Nullable(Int64) │
│ [3,4] │ ᴺᵁᴸᴸ │ Nullable(Int64) │
└───────┴──────┴─────────────────┘
```

## Using Dynamic type in ORDER BY and GROUP BY {#using-dynamic-type-in-order-by-and-group-by}

`ORDER BY` 및 `GROUP BY` 중에 `Dynamic` 유형의 값은 `Variant` 유형의 값과 유사하게 비교됩니다:
유형 `Dynamic`의 기본 유형 `T1`을 가진 값 `d1`과 기본 유형 `T2`를 가진 값 `d2`에 대한 연산자 `<`의 결과는 다음과 같이 정의됩니다:
- `T1 = T2 = T`이면 결과는 `d1.T < d2.T` (기본 값이 비교됨).
- `T1 != T2`이면 결과는 `T1 < T2` (유형 이름이 비교됨).

기본적으로 `Dynamic` 유형은 `GROUP BY`/`ORDER BY` 키에는 사용이 허가되지 않습니다. 사용하려는 경우 특별 비교 규칙을 고려하고 `allow_suspicious_types_in_group_by`/`allow_suspicious_types_in_order_by` 설정을 활성화하세요.

예시:
```sql
CREATE TABLE test (d Dynamic) ENGINE=Memory;
INSERT INTO test VALUES (42), (43), ('abc'), ('abd'), ([1, 2, 3]), ([]), (NULL);
```

```sql
SELECT d, dynamicType(d) FROM test;
```

```text
┌─d───────┬─dynamicType(d)─┐
│ 42      │ Int64          │
│ 43      │ Int64          │
│ abc     │ String         │
│ abd     │ String         │
│ [1,2,3] │ Array(Int64)   │
│ []      │ Array(Int64)   │
│ ᴺᵁᴸᴸ    │ None           │
└─────────┴────────────────┘
```

```sql
SELECT d, dynamicType(d) FROM test ORDER BY d SETTINGS allow_suspicious_types_in_order_by=1;
```

```sql
┌─d───────┬─dynamicType(d)─┐
│ []      │ Array(Int64)   │
│ [1,2,3] │ Array(Int64)   │
│ 42      │ Int64          │
│ 43      │ Int64          │
│ abc     │ String         │
│ abd     │ String         │
│ ᴺᵁᴸᴸ    │ None           │
└─────────┴────────────────┘
```

**Note:** 서로 다른 숫자 유형의 동적 유형의 값은 서로 다른 값으로 간주되며 서로 비교되지 않고, 대신 그들의 유형 이름이 비교됩니다.

예시:

```sql
CREATE TABLE test (d Dynamic) ENGINE=Memory;
INSERT INTO test VALUES (1::UInt32), (1::Int64), (100::UInt32), (100::Int64);
SELECT d, dynamicType(d) FROM test ORDER BY d SETTINGS allow_suspicious_types_in_order_by=1;
```

```text
┌─v───┬─dynamicType(v)─┐
│ 1   │ Int64          │
│ 100 │ Int64          │
│ 1   │ UInt32         │
│ 100 │ UInt32         │
└─────┴────────────────┘
```

```sql
SELECT d, dynamicType(d) FROM test GROUP BY d SETTINGS allow_suspicious_types_in_group_by=1;
```

```text
┌─d───┬─dynamicType(d)─┐
│ 1   │ Int64          │
│ 100 │ UInt32         │
│ 1   │ UInt32         │
│ 100 │ Int64          │
└─────┴────────────────┘
```

**Note:** 설명된 비교 규칙은 `<`/`>`/`=` 등과 같은 비교 함수의 실행 중에는 적용되지 않습니다. 이는 [특별한 작업](#using-dynamic-type-in-functions) 때문입니다.

## Reaching the limit in number of different data types stored inside Dynamic {#reaching-the-limit-in-number-of-different-data-types-stored-inside-dynamic}

`Dynamic` 데이터 유형은 별도의 서브컬럼으로 제한된 수의 서로 다른 데이터 유형만 저장할 수 있습니다. 기본적으로 이 한도는 32이며, `Dynamic(max_types=N)` 구문을 사용하여 N을 0에서 254 사이의 값으로 변경할 수 있습니다 (구현 세부정보 때문에, 별도의 서브컬럼으로 저장할 수 있는 254개 이상의 서로 다른 데이터 유형은 불가능합니다).
한도에 도달하면 `Dynamic` 컬럼에 삽입되는 모든 새로운 데이터 유형은 다른 데이터 유형의 값을 이진 형태로 저장하는 공유 데이터 구조에 삽입됩니다.

다양한 시나리오에서 한도에 도달할 때 발생하는 일을 살펴보겠습니다.

### Reaching the limit during data parsing {#reaching-the-limit-during-data-parsing}

데이터에서 `Dynamic` 값을 파싱하는 동안 현재 데이터 블록의 한도에 도달하면 모든 새로운 값이 공유 데이터 구조에 삽입됩니다:

```sql
SELECT d, dynamicType(d), isDynamicElementInSharedData(d) FROM format(JSONEachRow, 'd Dynamic(max_types=3)', '
{"d" : 42}
{"d" : [1, 2, 3]}
{"d" : "Hello, World!"}
{"d" : "2020-01-01"}
{"d" : ["str1", "str2", "str3"]}
{"d" : {"a" : 1, "b" : [1, 2, 3]}}
')
```

```text
┌─d──────────────────────┬─dynamicType(d)─────────────────┬─isDynamicElementInSharedData(d)─┐
│ 42                     │ Int64                          │ false                           │
│ [1,2,3]                │ Array(Int64)                   │ false                           │
│ Hello, World!          │ String                         │ false                           │
│ 2020-01-01             │ Date                           │ true                            │
│ ['str1','str2','str3'] │ Array(String)                  │ true                            │
│ (1,[1,2,3])            │ Tuple(a Int64, b Array(Int64)) │ true                            │
└────────────────────────┴────────────────────────────────┴─────────────────────────────────┘
```

3개의 서로 다른 데이터 유형 `Int64`, `Array(Int64)` 및 `String`를 삽입한 후 모든 새로운 유형이 특별 공유 데이터 구조에 삽입된 것을 볼 수 있습니다.

### During merges of data parts in MergeTree table engines {#during-merges-of-data-parts-in-mergetree-table-engines}

MergeTree 테이블에서 여러 데이터 파트를 병합하는 동안, 결과 데이터 파트의 `Dynamic` 컬럼은 별도의 서브컬럼으로 저장할 수 있는 데이터 유형의 한도에 도달할 수 있으며, 소스 파트의 모든 유형을 서브컬럼으로 저장할 수 없습니다.
이 경우 ClickHouse는 병합 후 어떤 유형이 별도의 서브컬럼으로 남을지, 어떤 유형이 공유 데이터 구조에 삽입될지를 선택합니다. 대부분의 경우 ClickHouse는 가장 빈번한 유형을 유지하고 희귀한 유형은 공유 데이터 구조에 저장하려고 하지만, 이는 구현에 따라 다릅니다.

이러한 병합의 예를 살펴보겠습니다. 먼저, `Dynamic` 컬럼이 있는 테이블을 만들고, 서로 다른 데이터 유형의 한도를 `3`으로 설정한 후 `5`개의 서로 다른 유형의 값을 삽입합니다:

```sql
CREATE TABLE test (id UInt64, d Dynamic(max_types=3)) ENGINE=MergeTree ORDER BY id;
SYSTEM STOP MERGES test;
INSERT INTO test SELECT number, number FROM numbers(5);
INSERT INTO test SELECT number, range(number) FROM numbers(4);
INSERT INTO test SELECT number, toDate(number) FROM numbers(3);
INSERT INTO test SELECT number, map(number, number) FROM numbers(2);
INSERT INTO test SELECT number, 'str_' || toString(number) FROM numbers(1);
```

각 삽입은 단일 유형을 포함하는 별도의 데이터 파트를 생성합니다:
```sql
SELECT count(), dynamicType(d), isDynamicElementInSharedData(d), _part FROM test GROUP BY _part, dynamicType(d), isDynamicElementInSharedData(d) ORDER BY _part, count();
```

```text
┌─count()─┬─dynamicType(d)──────┬─isDynamicElementInSharedData(d)─┬─_part─────┐
│       5 │ UInt64              │ false                           │ all_1_1_0 │
│       4 │ Array(UInt64)       │ false                           │ all_2_2_0 │
│       3 │ Date                │ false                           │ all_3_3_0 │
│       2 │ Map(UInt64, UInt64) │ false                           │ all_4_4_0 │
│       1 │ String              │ false                           │ all_5_5_0 │
└─────────┴─────────────────────┴─────────────────────────────────┴───────────┘
```

이제 모든 파트를 하나로 병합하고 어떤 일이 발생하는지 보겠습니다:

```sql
SYSTEM START MERGES test;
OPTIMIZE TABLE test FINAL;
SELECT count(), dynamicType(d), isDynamicElementInSharedData(d), _part FROM test GROUP BY _part, dynamicType(d), isDynamicElementInSharedData(d) ORDER BY _part, count() desc;
```

```text
┌─count()─┬─dynamicType(d)──────┬─isDynamicElementInSharedData(d)─┬─_part─────┐
│       5 │ UInt64              │ false                           │ all_1_5_2 │
│       4 │ Array(UInt64)       │ false                           │ all_1_5_2 │
│       3 │ Date                │ false                           │ all_1_5_2 │
│       2 │ Map(UInt64, UInt64) │ true                            │ all_1_5_2 │
│       1 │ String              │ true                            │ all_1_5_2 │
└─────────┴─────────────────────┴─────────────────────────────────┴───────────┘
```

ClickHouse는 가장 빈번한 유형인 `UInt64`와 `Array(UInt64)`를 서브컬럼으로 유지하고 다른 모든 유형을 공유 데이터로 삽입한 것을 볼 수 있습니다.

## JSONExtract functions with Dynamic {#jsonextract-functions-with-dynamic}

모든 `JSONExtract*` 함수는 `Dynamic` 유형을 지원합니다:

```sql
SELECT JSONExtract('{"a" : [1, 2, 3]}', 'a', 'Dynamic') AS dynamic, dynamicType(dynamic) AS dynamic_type;
```

```text
┌─dynamic─┬─dynamic_type───────────┐
│ [1,2,3] │ Array(Nullable(Int64)) │
└─────────┴────────────────────────┘
```

```sql
SELECT JSONExtract('{"obj" : {"a" : 42, "b" : "Hello", "c" : [1,2,3]}}', 'obj', 'Map(String, Dynamic)') AS map_of_dynamics, mapApply((k, v) -> (k, dynamicType(v)), map_of_dynamics) AS map_of_dynamic_types
```

```text
┌─map_of_dynamics──────────────────┬─map_of_dynamic_types────────────────────────────────────┐
│ {'a':42,'b':'Hello','c':[1,2,3]} │ {'a':'Int64','b':'String','c':'Array(Nullable(Int64))'} │
└──────────────────────────────────┴─────────────────────────────────────────────────────────┘
```

```sql
SELECT JSONExtractKeysAndValues('{"a" : 42, "b" : "Hello", "c" : [1,2,3]}', 'Dynamic') AS dynamics, arrayMap(x -> (x.1, dynamicType(x.2)), dynamics) AS dynamic_types```
```

```text
┌─dynamics───────────────────────────────┬─dynamic_types─────────────────────────────────────────────────┐
│ [('a',42),('b','Hello'),('c',[1,2,3])] │ [('a','Int64'),('b','String'),('c','Array(Nullable(Int64))')] │
└────────────────────────────────────────┴───────────────────────────────────────────────────────────────┘
```

### Binary output format {#binary-output-format}

RowBinary 형식에서 `Dynamic` 유형의 값은 다음 형식으로 직렬화됩니다:

```text
<binary_encoded_data_type><value_in_binary_format_according_to_the_data_type>
```
