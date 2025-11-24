---
'description': 'ClickHouse의 Variant 데이터 유형에 대한 문서'
'sidebar_label': 'Variant(T1, T2, ...)'
'sidebar_position': 40
'slug': '/sql-reference/data-types/variant'
'title': 'Variant(T1, T2, ...)'
'doc_type': 'reference'
---


# Variant(T1, T2, ...)

이 유형은 다른 데이터 유형의 집합을 나타냅니다. 유형 `Variant(T1, T2, ..., TN)`은 이 유형의 각 행이 `T1` 또는 `T2` 또는 ... 또는 `TN` 유형의 값을 가지거나 그 중 어느 것도 가지지 않음을 의미합니다 (`NULL` 값).

중첩 유형의 순서는 중요하지 않습니다: Variant(T1, T2) = Variant(T2, T1).  
중첩 유형은 Nullable(...), LowCardinality(Nullable(...)), Variant(...) 유형을 제외한 임의의 유형일 수 있습니다.

:::note  
유사한 유형을 변형으로 사용하는 것은 권장하지 않습니다(예: `Variant(UInt32, Int64)`와 같은 서로 다른 숫자 유형 또는 `Variant(Date, DateTime)`와 같은 서로 다른 날짜 유형). 이러한 유형의 값을 다루는 것은 모호성을 초래할 수 있습니다. 기본적으로 이러한 `Variant` 유형을 생성하면 예외가 발생하지만 `allow_suspicious_variant_types` 설정을 사용하여 활성화할 수 있습니다.  
:::

## Creating Variant {#creating-variant}

테이블 컬럼 정의에서 `Variant` 유형 사용:

```sql
CREATE TABLE test (v Variant(UInt64, String, Array(UInt64))) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('Hello, World!'), ([1, 2, 3]);
SELECT v FROM test;
```

```text
┌─v─────────────┐
│ ᴺᵁᴸᴸ          │
│ 42            │
│ Hello, World! │
│ [1,2,3]       │
└───────────────┘
```

일반 컬럼에서 CAST 사용:

```sql
SELECT toTypeName(variant) AS type_name, 'Hello, World!'::Variant(UInt64, String, Array(UInt64)) as variant;
```

```text
┌─type_name──────────────────────────────┬─variant───────┐
│ Variant(Array(UInt64), String, UInt64) │ Hello, World! │
└────────────────────────────────────────┴───────────────┘
```

인수에 공통 유형이 없을 경우 `if/multiIf` 함수 사용(이를 위해 `use_variant_as_common_type` 설정을 활성화해야 함):

```sql
SET use_variant_as_common_type = 1;
SELECT if(number % 2, number, range(number)) as variant FROM numbers(5);
```

```text
┌─variant───┐
│ []        │
│ 1         │
│ [0,1]     │
│ 3         │
│ [0,1,2,3] │
└───────────┘
```

```sql
SET use_variant_as_common_type = 1;
SELECT multiIf((number % 4) = 0, 42, (number % 4) = 1, [1, 2, 3], (number % 4) = 2, 'Hello, World!', NULL) AS variant FROM numbers(4);
```

```text
┌─variant───────┐
│ 42            │
│ [1,2,3]       │
│ Hello, World! │
│ ᴺᵁᴸᴸ          │
└───────────────┘
```

배열 요소/맵 값에 공통 유형이 없는 경우 'array/map' 함수 사용(이를 위해 `use_variant_as_common_type` 설정을 활성화해야 함):

```sql
SET use_variant_as_common_type = 1;
SELECT array(range(number), number, 'str_' || toString(number)) as array_of_variants FROM numbers(3);
```

```text
┌─array_of_variants─┐
│ [[],0,'str_0']    │
│ [[0],1,'str_1']   │
│ [[0,1],2,'str_2'] │
└───────────────────┘
```

```sql
SET use_variant_as_common_type = 1;
SELECT map('a', range(number), 'b', number, 'c', 'str_' || toString(number)) as map_of_variants FROM numbers(3);
```

```text
┌─map_of_variants───────────────┐
│ {'a':[],'b':0,'c':'str_0'}    │
│ {'a':[0],'b':1,'c':'str_1'}   │
│ {'a':[0,1],'b':2,'c':'str_2'} │
└───────────────────────────────┘
```

## Reading Variant nested types as subcolumns {#reading-variant-nested-types-as-subcolumns}

Variant 유형은 Variant 컬럼에서 단일 중첩 유형을 하위 컬럼으로 읽는 것을 지원합니다. 따라서, `variant Variant(T1, T2, T3)`라는 컬럼이 있으면 구문 `variant.T2`를 사용하여 `T2` 유형의 하위 컬럼을 읽을 수 있습니다. 이 하위 컬럼은 `T2`가 `Nullable`일 수 있는 경우 `Nullable(T2)` 유형이고, 그렇지 않은 경우 `T2` 유형을 가집니다. 이 하위 컬럼은 원래 `Variant` 컬럼과 같은 크기를 가지며 원래 `Variant` 컬럼이 `T2` 유형을 가지지 않는 모든 행에서 `NULL` 값(또는 `T2`가 `Nullable`일 수 없는 경우에는 빈 값)을 포함합니다.

Variant 하위 컬럼은 `variantElement(variant_column, type_name)` 함수를 사용하여 읽을 수도 있습니다.

예시:

```sql
CREATE TABLE test (v Variant(UInt64, String, Array(UInt64))) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('Hello, World!'), ([1, 2, 3]);
SELECT v, v.String, v.UInt64, v.`Array(UInt64)` FROM test;
```

```text
┌─v─────────────┬─v.String──────┬─v.UInt64─┬─v.Array(UInt64)─┐
│ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ          │     ᴺᵁᴸᴸ │ []              │
│ 42            │ ᴺᵁᴸᴸ          │       42 │ []              │
│ Hello, World! │ Hello, World! │     ᴺᵁᴸᴸ │ []              │
│ [1,2,3]       │ ᴺᵁᴸᴸ          │     ᴺᵁᴸᴸ │ [1,2,3]         │
└───────────────┴───────────────┴──────────┴─────────────────┘
```

```sql
SELECT toTypeName(v.String), toTypeName(v.UInt64), toTypeName(v.`Array(UInt64)`) FROM test LIMIT 1;
```

```text
┌─toTypeName(v.String)─┬─toTypeName(v.UInt64)─┬─toTypeName(v.Array(UInt64))─┐
│ Nullable(String)     │ Nullable(UInt64)     │ Array(UInt64)               │
└──────────────────────┴──────────────────────┴─────────────────────────────┘
```

```sql
SELECT v, variantElement(v, 'String'), variantElement(v, 'UInt64'), variantElement(v, 'Array(UInt64)') FROM test;
```

```text
┌─v─────────────┬─variantElement(v, 'String')─┬─variantElement(v, 'UInt64')─┬─variantElement(v, 'Array(UInt64)')─┐
│ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ                        │                        ᴺᵁᴸᴸ │ []                                 │
│ 42            │ ᴺᵁᴸᴸ                        │                          42 │ []                                 │
│ Hello, World! │ Hello, World!               │                        ᴺᵁᴸᴸ │ []                                 │
│ [1,2,3]       │ ᴺᵁᴸᴸ                        │                        ᴺᵁᴸᴸ │ [1,2,3]                            │
└───────────────┴─────────────────────────────┴─────────────────────────────┴────────────────────────────────────┘
```

각 행에 저장된 변형을 알기 위해 `variantType(variant_column)` 함수를 사용할 수 있습니다. 이 함수는 각 행에 대해 변형 유형 이름의 `Enum`을 반환합니다(행이 `NULL`인 경우 `'None'`를 반환).

예시:

```sql
CREATE TABLE test (v Variant(UInt64, String, Array(UInt64))) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('Hello, World!'), ([1, 2, 3]);
SELECT variantType(v) FROM test;
```

```text
┌─variantType(v)─┐
│ None           │
│ UInt64         │
│ String         │
│ Array(UInt64)  │
└────────────────┘
```

```sql
SELECT toTypeName(variantType(v)) FROM test LIMIT 1;
```

```text
┌─toTypeName(variantType(v))──────────────────────────────────────────┐
│ Enum8('None' = -1, 'Array(UInt64)' = 0, 'String' = 1, 'UInt64' = 2) │
└─────────────────────────────────────────────────────────────────────┘
```

## Conversion between a Variant column and other columns {#conversion-between-a-variant-column-and-other-columns}

`Variant` 유형의 컬럼으로 수행할 수 있는 4가지 가능한 변환이 있습니다.

### Converting a String column to a Variant column {#converting-a-string-column-to-a-variant-column}

`String`에서 `Variant`로의 변환은 문자열 값에서 `Variant` 유형의 값을 구문 분석하여 수행됩니다:

```sql
SELECT '42'::Variant(String, UInt64) AS variant, variantType(variant) AS variant_type
```

```text
┌─variant─┬─variant_type─┐
│ 42      │ UInt64       │
└─────────┴──────────────┘
```

```sql
SELECT '[1, 2, 3]'::Variant(String, Array(UInt64)) as variant, variantType(variant) as variant_type
```

```text
┌─variant─┬─variant_type──┐
│ [1,2,3] │ Array(UInt64) │
└─────────┴───────────────┘
```

```sql
SELECT CAST(map('key1', '42', 'key2', 'true', 'key3', '2020-01-01'), 'Map(String, Variant(UInt64, Bool, Date))') AS map_of_variants, mapApply((k, v) -> (k, variantType(v)), map_of_variants) AS map_of_variant_types```
```

```text
┌─map_of_variants─────────────────────────────┬─map_of_variant_types──────────────────────────┐
│ {'key1':42,'key2':true,'key3':'2020-01-01'} │ {'key1':'UInt64','key2':'Bool','key3':'Date'} │
└─────────────────────────────────────────────┴───────────────────────────────────────────────┘
```

`String`에서 `Variant`로의 변환 시 구문 분석을 비활성화하려면 `cast_string_to_dynamic_use_inference` 설정을 비활성화할 수 있습니다:

```sql
SET cast_string_to_variant_use_inference = 0;
SELECT '[1, 2, 3]'::Variant(String, Array(UInt64)) as variant, variantType(variant) as variant_type
```

```text
┌─variant───┬─variant_type─┐
│ [1, 2, 3] │ String       │
└───────────┴──────────────┘
```

### Converting an ordinary column to a Variant column {#converting-an-ordinary-column-to-a-variant-column}

유형 `T`를 가진 일반 컬럼을 이 유형을 포함하는 `Variant` 컬럼으로 변환하는 것이 가능합니다:

```sql
SELECT toTypeName(variant) AS type_name, [1,2,3]::Array(UInt64)::Variant(UInt64, String, Array(UInt64)) as variant, variantType(variant) as variant_name
```

```text
┌─type_name──────────────────────────────┬─variant─┬─variant_name──┐
│ Variant(Array(UInt64), String, UInt64) │ [1,2,3] │ Array(UInt64) │
└────────────────────────────────────────┴─────────┴───────────────┘
```

참고: `String` 유형에서 변환은 항상 구문 분석을 통해 수행됩니다. `String` 컬럼을 구문 분석 없이 `Variant` 변형의 `String`으로 변환하려면 다음과 같이 할 수 있습니다:  
```sql
SELECT '[1, 2, 3]'::Variant(String)::Variant(String, Array(UInt64), UInt64) as variant, variantType(variant) as variant_type
```

```sql
┌─variant───┬─variant_type─┐
│ [1, 2, 3] │ String       │
└───────────┴──────────────┘
```

### Converting a Variant column to an ordinary column {#converting-a-variant-column-to-an-ordinary-column}

`Variant` 컬럼을 일반 컬럼으로 변환하는 것이 가능합니다. 이 경우 모든 중첩 변형이 대상 유형으로 변환됩니다:

```sql
CREATE TABLE test (v Variant(UInt64, String)) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('42.42');
SELECT v::Nullable(Float64) FROM test;
```

```text
┌─CAST(v, 'Nullable(Float64)')─┐
│                         ᴺᵁᴸᴸ │
│                           42 │
│                        42.42 │
└──────────────────────────────┘
```

### Converting a Variant to another Variant {#converting-a-variant-to-another-variant}

`Variant` 컬럼을 다른 `Variant` 컬럼으로 변환하는 것이 가능하지만, 대상 `Variant` 컬럼이 원래 `Variant`의 모든 중첩 유형을 포함하는 경우에만 가능합니다:

```sql
CREATE TABLE test (v Variant(UInt64, String)) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('String');
SELECT v::Variant(UInt64, String, Array(UInt64)) FROM test;
```

```text
┌─CAST(v, 'Variant(UInt64, String, Array(UInt64))')─┐
│ ᴺᵁᴸᴸ                                              │
│ 42                                                │
│ String                                            │
└───────────────────────────────────────────────────┘
```

## Reading Variant type from the data {#reading-variant-type-from-the-data}

모든 텍스트 형식(TSV, CSV, CustomSeparated, Values, JSONEachRow 등)은 `Variant` 유형 읽기를 지원합니다. 데이터 분석 중 ClickHouse는 가장 적합한 변형 유형에 값을 삽입하려고 시도합니다.

예시:

```sql
SELECT
    v,
    variantElement(v, 'String') AS str,
    variantElement(v, 'UInt64') AS num,
    variantElement(v, 'Float64') AS float,
    variantElement(v, 'DateTime') AS date,
    variantElement(v, 'Array(UInt64)') AS arr
FROM format(JSONEachRow, 'v Variant(String, UInt64, Float64, DateTime, Array(UInt64))', $$
{"v" : "Hello, World!"},
{"v" : 42},
{"v" : 42.42},
{"v" : "2020-01-01 00:00:00"},
{"v" : [1, 2, 3]}
$$)
```

```text
┌─v───────────────────┬─str───────────┬──num─┬─float─┬────────────────date─┬─arr─────┐
│ Hello, World!       │ Hello, World! │ ᴺᵁᴸᴸ │  ᴺᵁᴸᴸ │                ᴺᵁᴸᴸ │ []      │
│ 42                  │ ᴺᵁᴸᴸ          │   42 │  ᴺᵁᴸᴸ │                ᴺᵁᴸᴸ │ []      │
│ 42.42               │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ │ 42.42 │                ᴺᵁᴸᴸ │ []      │
│ 2020-01-01 00:00:00 │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ │  ᴺᵁᴸᴸ │ 2020-01-01 00:00:00 │ []      │
│ [1,2,3]             │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ │  ᴺᵁᴸᴸ │                ᴺᵁᴸᴸ │ [1,2,3] │
└─────────────────────┴───────────────┴──────┴───────┴─────────────────────┴─────────┘
```

## Comparing values of Variant type {#comparing-values-of-variant-data}

`Variant` 유형의 값은 동일한 `Variant` 유형의 값과만 비교할 수 있습니다.

`Variant(..., T1, ... T2, ...)` 유형에서 기본 유형 `T1`을 가진 값 `v1`과 기본 유형 `T2`을 가진 값 `v2`의 연산자 `<` 결과는 다음과 같이 정의됩니다:  
- `T1 = T2 = T`인 경우 결과는 `v1.T < v2.T`(기본 값을 비교함)입니다.  
- `T1 != T2`인 경우 결과는 `T1 < T2`(유형 이름을 비교함)입니다.

예시:

```sql
CREATE TABLE test (v1 Variant(String, UInt64, Array(UInt32)), v2 Variant(String, UInt64, Array(UInt32))) ENGINE=Memory;
INSERT INTO test VALUES (42, 42), (42, 43), (42, 'abc'), (42, [1, 2, 3]), (42, []), (42, NULL);
```

```sql
SELECT v2, variantType(v2) AS v2_type FROM test ORDER BY v2;
```

```text
┌─v2──────┬─v2_type───────┐
│ []      │ Array(UInt32) │
│ [1,2,3] │ Array(UInt32) │
│ abc     │ String        │
│ 42      │ UInt64        │
│ 43      │ UInt64        │
│ ᴺᵁᴸᴸ    │ None          │
└─────────┴───────────────┘
```

```sql
SELECT v1, variantType(v1) AS v1_type, v2, variantType(v2) AS v2_type, v1 = v2, v1 < v2, v1 > v2 FROM test;
```

```text
┌─v1─┬─v1_type─┬─v2──────┬─v2_type───────┬─equals(v1, v2)─┬─less(v1, v2)─┬─greater(v1, v2)─┐
│ 42 │ UInt64  │ 42      │ UInt64        │              1 │            0 │               0 │
│ 42 │ UInt64  │ 43      │ UInt64        │              0 │            1 │               0 │
│ 42 │ UInt64  │ abc     │ String        │              0 │            0 │               1 │
│ 42 │ UInt64  │ [1,2,3] │ Array(UInt32) │              0 │            0 │               1 │
│ 42 │ UInt64  │ []      │ Array(UInt32) │              0 │            0 │               1 │
│ 42 │ UInt64  │ ᴺᵁᴸᴸ    │ None          │              0 │            1 │               0 │
└────┴─────────┴─────────┴───────────────┴────────────────┴──────────────┴─────────────────┘

```

특정 `Variant` 값을 가진 행을 찾으려면 다음 중 하나를 수행할 수 있습니다:

- 값을 해당하는 `Variant` 유형으로 캐스트합니다:

```sql
SELECT * FROM test WHERE v2 == [1,2,3]::Array(UInt32)::Variant(String, UInt64, Array(UInt32));
```

```text
┌─v1─┬─v2──────┐
│ 42 │ [1,2,3] │
└────┴─────────┘
```

- 요구하는 유형으로 `Variant` 하위 컬럼을 비교합니다:

```sql
SELECT * FROM test WHERE v2.`Array(UInt32)` == [1,2,3] -- or using variantElement(v2, 'Array(UInt32)')
```

```text
┌─v1─┬─v2──────┐
│ 42 │ [1,2,3] │
└────┴─────────┘
```

때때로 `Array/Map/Tuple`과 같은 복합 유형을 가진 하위 컬럼이 `Nullable` 안에 있을 수 없고 기본 값이 `NULL` 대신 다르게 나타납니다. 따라서 변형 유형에 대한 추가 검사를 하는 것이 유용할 수 있습니다:

```sql
SELECT v2, v2.`Array(UInt32)`, variantType(v2) FROM test WHERE v2.`Array(UInt32)` == [];
```

```text
┌─v2───┬─v2.Array(UInt32)─┬─variantType(v2)─┐
│ 42   │ []               │ UInt64          │
│ 43   │ []               │ UInt64          │
│ abc  │ []               │ String          │
│ []   │ []               │ Array(UInt32)   │
│ ᴺᵁᴸᴸ │ []               │ None            │
└──────┴──────────────────┴─────────────────┘
```

```sql
SELECT v2, v2.`Array(UInt32)`, variantType(v2) FROM test WHERE variantType(v2) == 'Array(UInt32)' AND v2.`Array(UInt32)` == [];
```

```text
┌─v2─┬─v2.Array(UInt32)─┬─variantType(v2)─┐
│ [] │ []               │ Array(UInt32)   │
└────┴──────────────────┴─────────────────┘
```

**참고:** 서로 다른 숫자 유형을 가진 변형의 값은 서로 다른 변형으로 간주되며 서로 비교되지 않습니다. 대신 이들의 유형 이름이 비교됩니다.

예시:

```sql
SET allow_suspicious_variant_types = 1;
CREATE TABLE test (v Variant(UInt32, Int64)) ENGINE=Memory;
INSERT INTO test VALUES (1::UInt32), (1::Int64), (100::UInt32), (100::Int64);
SELECT v, variantType(v) FROM test ORDER by v;
```

```text
┌─v───┬─variantType(v)─┐
│ 1   │ Int64          │
│ 100 │ Int64          │
│ 1   │ UInt32         │
│ 100 │ UInt32         │
└─────┴────────────────┘
```

**참고** 기본적으로 `Variant` 유형은 `GROUP BY`/`ORDER BY` 키에서 허용되지 않습니다. 이를 사용하려면 특별한 비교 규칙을 고려하고 `allow_suspicious_types_in_group_by`/`allow_suspicious_types_in_order_by` 설정을 활성화해야 합니다.

## JSONExtract functions with Variant {#jsonextract-functions-with-variant}

모든 `JSONExtract*` 함수는 `Variant` 유형을 지원합니다:

```sql
SELECT JSONExtract('{"a" : [1, 2, 3]}', 'a', 'Variant(UInt32, String, Array(UInt32))') AS variant, variantType(variant) AS variant_type;
```

```text
┌─variant─┬─variant_type──┐
│ [1,2,3] │ Array(UInt32) │
└─────────┴───────────────┘
```

```sql
SELECT JSONExtract('{"obj" : {"a" : 42, "b" : "Hello", "c" : [1,2,3]}}', 'obj', 'Map(String, Variant(UInt32, String, Array(UInt32)))') AS map_of_variants, mapApply((k, v) -> (k, variantType(v)), map_of_variants) AS map_of_variant_types
```

```text
┌─map_of_variants──────────────────┬─map_of_variant_types────────────────────────────┐
│ {'a':42,'b':'Hello','c':[1,2,3]} │ {'a':'UInt32','b':'String','c':'Array(UInt32)'} │
└──────────────────────────────────┴─────────────────────────────────────────────────┘
```

```sql
SELECT JSONExtractKeysAndValues('{"a" : 42, "b" : "Hello", "c" : [1,2,3]}', 'Variant(UInt32, String, Array(UInt32))') AS variants, arrayMap(x -> (x.1, variantType(x.2)), variants) AS variant_types
```

```text
┌─variants───────────────────────────────┬─variant_types─────────────────────────────────────────┐
│ [('a',42),('b','Hello'),('c',[1,2,3])] │ [('a','UInt32'),('b','String'),('c','Array(UInt32)')] │
└────────────────────────────────────────┴───────────────────────────────────────────────────────┘
```
