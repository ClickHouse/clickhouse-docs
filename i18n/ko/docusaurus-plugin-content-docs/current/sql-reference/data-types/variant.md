---
description: 'ClickHouse의 Variant 데이터 유형에 대한 문서'
sidebar_label: 'Variant(T1, T2, ...)'
sidebar_position: 40
slug: /sql-reference/data-types/variant
title: 'Variant(T1, T2, ...)'
doc_type: 'reference'
---

# Variant(T1, T2, ...) \{#variantt1-t2\}

이 타입은 다른 데이터 타입들의 합(union)을 나타냅니다. `Variant(T1, T2, ..., TN)` 타입은 이 타입의 각 행이
`T1`, `T2`, ... 또는 `TN` 타입 중 하나의 값이거나, 어느 것에도 속하지 않는 값(`NULL` 값)을 가질 수 있음을 의미합니다.

중첩된 타입의 순서는 중요하지 않습니다: Variant(T1, T2) = Variant(T2, T1)입니다.
중첩 타입은 Nullable(...), LowCardinality(Nullable(...)) 및 Variant(...) 타입을 제외한 임의의 타입이 될 수 있습니다.

:::note
유사한 타입들을 Variant의 구성 요소로 사용하는 것은 권장되지 않습니다(예: 서로 다른 숫자 타입인 `Variant(UInt32, Int64)` 또는 서로 다른 날짜 타입인 `Variant(Date, DateTime)`).
이러한 타입의 값으로 작업하면 모호성이 발생할 수 있기 때문입니다. 기본적으로 이러한 `Variant` 타입을 생성하면 예외가 발생하지만, `allow_suspicious_variant_types` 설정을 사용하여 허용하도록 변경할 수 있습니다.
:::

## Variant 생성하기 \{#creating-variant\}

테이블 컬럼 정의에서 `Variant` 타입 사용:

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

일반 컬럼에서 CAST 사용하기:

```sql
SELECT toTypeName(variant) AS type_name, 'Hello, World!'::Variant(UInt64, String, Array(UInt64)) as variant;
```

```text
┌─type_name──────────────────────────────┬─variant───────┐
│ Variant(Array(UInt64), String, UInt64) │ Hello, World! │
└────────────────────────────────────────┴───────────────┘
```

인자들에 공통 타입이 없을 때 함수 `if/multiIf`를 사용하는 경우 (`use_variant_as_common_type` SETTING을 활성화해야 합니다):

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

배열 요소나 맵 값에 공통 타입이 없는 경우 함수 &#39;array/map&#39;을 사용합니다(이를 사용하려면 `use_variant_as_common_type` 설정을 활성화해야 합니다):

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


## Variant 중첩 타입을 서브컬럼으로 읽기 \{#reading-variant-nested-types-as-subcolumns\}

Variant 타입은 타입 이름을 서브컬럼으로 사용하여 Variant 컬럼에서 단일 중첩 타입을 읽을 수 있도록 지원합니다.
따라서 `variant Variant(T1, T2, T3)` 컬럼이 있는 경우 `variant.T2` 구문을 사용하여 타입 `T2`의 서브컬럼을 읽을 수 있습니다.
이 서브컬럼은 `T2`가 `Nullable` 안에 올 수 있는 타입이라면 `Nullable(T2)` 타입을 갖고, 그렇지 않다면 `T2` 타입을 갖습니다.
이 서브컬럼은 원래 `Variant` 컬럼과 동일한 크기를 가지며, 원래 `Variant` 컬럼에 타입 `T2`가 없는 모든 행에서는
`NULL` 값(또는 `T2`가 `Nullable` 안에 올 수 없는 타입인 경우 비어 있는 값)을 포함합니다.

Variant 서브컬럼은 함수 `variantElement(variant_column, type_name)`을 사용해서도 읽을 수 있습니다.

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

각 행에 어떤 variant가 저장되어 있는지 확인하려면 `variantType(variant_column)` 함수를 사용할 수 있습니다. 이 함수는 각 행에 대해 variant 타입 이름을 나타내는 `Enum`을 반환하며, 행이 `NULL`인 경우에는 `'None'`을 반환합니다.

예제:

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


## Variant 컬럼과 다른 컬럼 간 변환 \{#conversion-between-a-variant-column-and-other-columns\}

`Variant` 타입 컬럼에 대해 수행할 수 있는 변환은 4가지입니다.

### String 컬럼을 Variant 컬럼으로 변환하기 \{#converting-a-string-column-to-a-variant-column\}

`String`에서 `Variant`로의 변환은 문자열 값에서 `Variant` 타입의 값을 파싱하여 수행됩니다.

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

````sql
SELECT CAST(map('key1', '42', 'key2', 'true', 'key3', '2020-01-01'), 'Map(String, Variant(UInt64, Bool, Date))') AS map_of_variants, mapApply((k, v) -> (k, variantType(v)), map_of_variants) AS map_of_variant_types```
````

```text
┌─map_of_variants─────────────────────────────┬─map_of_variant_types──────────────────────────┐
│ {'key1':42,'key2':true,'key3':'2020-01-01'} │ {'key1':'UInt64','key2':'Bool','key3':'Date'} │
└─────────────────────────────────────────────┴───────────────────────────────────────────────┘
```

`String`에서 `Variant`로 변환하는 동안 파싱을 하지 않으려면 `cast_string_to_dynamic_use_inference` 설정을 비활성화하면 됩니다:

```sql
SET cast_string_to_variant_use_inference = 0;
SELECT '[1, 2, 3]'::Variant(String, Array(UInt64)) as variant, variantType(variant) as variant_type
```

```text
┌─variant───┬─variant_type─┐
│ [1, 2, 3] │ String       │
└───────────┴──────────────┘
```


### 일반 컬럼을 Variant 컬럼으로 변환하기 \{#converting-an-ordinary-column-to-a-variant-column\}

타입이 `T`인 일반 컬럼을 해당 타입을 포함하는 `Variant` 컬럼으로 변환할 수 있습니다.

```sql
SELECT toTypeName(variant) AS type_name, [1,2,3]::Array(UInt64)::Variant(UInt64, String, Array(UInt64)) as variant, variantType(variant) as variant_name
```

```text
┌─type_name──────────────────────────────┬─variant─┬─variant_name──┐
│ Variant(Array(UInt64), String, UInt64) │ [1,2,3] │ Array(UInt64) │
└────────────────────────────────────────┴─────────┴───────────────┘
```

참고: `String` 타입에서의 변환은 항상 파싱을 통해 이루어집니다. 파싱 없이 `String` 컬럼을 `Variant`의 `String` variant로 변환해야 하는 경우, 다음과 같이 할 수 있습니다:

```sql
SELECT '[1, 2, 3]'::Variant(String)::Variant(String, Array(UInt64), UInt64) as variant, variantType(variant) as variant_type
```

```sql
┌─variant───┬─variant_type─┐
│ [1, 2, 3] │ String       │
└───────────┴──────────────┘
```


### Variant 컬럼을 일반 컬럼으로 변환하기 \{#converting-a-variant-column-to-an-ordinary-column\}

`Variant` 컬럼을 일반 컬럼으로 변환할 수 있습니다. 이때 모든 중첩 `Variant`는 대상 타입으로 변환됩니다.

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


### 하나의 Variant를 다른 Variant로 변환하기 \{#converting-a-variant-to-another-variant\}

`Variant` 컬럼을 다른 `Variant` 컬럼으로 변환할 수는 있지만, 대상 `Variant` 컬럼이 원래 `Variant`에 포함된 모든 중첩 타입을 모두 포함하는 경우에만 가능합니다:

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


## 데이터에서 Variant 타입 읽기 \{#reading-variant-type-from-the-data\}

모든 텍스트 형식(TSV, CSV, CustomSeparated, Values, JSONEachRow 등)은 `Variant` 타입 읽기를 지원합니다. 데이터를 파싱하는 동안 ClickHouse는 값을 해당 Variant의 구성 타입 중 가장 적절한 타입에 삽입하려고 시도합니다.

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


## Variant 타입 값 비교 \{#comparing-values-of-variant-data\}

`Variant` 타입의 값은 동일한 `Variant` 타입을 가진 값과만 비교할 수 있습니다.

기본적으로 비교 연산자는 [Variant에 대한 기본 구현](#functions-with-variant-arguments)을 사용하여,
각 Variant 타입에 대해 개별적으로 값을 비교합니다. 이는 설정 `use_variant_default_implementation_for_comparisons = 0`을 사용하여 비활성화할 수 있으며,
이 경우 아래에 설명된 네이티브 Variant 비교 규칙을 사용합니다. **주의**: `ORDER BY`는 항상 네이티브 비교를 사용합니다.

**네이티브 Variant 비교 규칙:**

타입 `Variant(..., T1, ... T2, ...)`에서 내부 타입이 `T1`인 값 `v1`과 내부 타입이 `T2`인 값 `v2`에 대해
연산자 `<`의 결과는 다음과 같이 정의됩니다.

* `T1 = T2 = T`인 경우, 결과는 `v1.T < v2.T`가 됩니다(내부 값이 비교됨).
* `T1 != T2`인 경우, 결과는 `T1 < T2`가 됩니다(타입 이름이 비교됨).

예시:

```sql
SET allow_suspicious_types_in_order_by = 1;
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

특정 `Variant` 값을 가진 행을 찾아야 하는 경우, 다음 중 하나를 사용할 수 있습니다:

* 값을 해당 `Variant` 타입으로 변환합니다:

```sql
SELECT * FROM test WHERE v2 == [1,2,3]::Array(UInt32)::Variant(String, UInt64, Array(UInt32));
```

```text
┌─v1─┬─v2──────┐
│ 42 │ [1,2,3] │
└────┴─────────┘
```

* `Variant` 서브컬럼을 필요한 타입과 비교합니다:

```sql
SELECT * FROM test WHERE v2.`Array(UInt32)` == [1,2,3] -- or using variantElement(v2, 'Array(UInt32)')
```

```text
┌─v1─┬─v2──────┐
│ 42 │ [1,2,3] │
└────┴─────────┘
```


때로는 추가적인 Variant 타입 검사를 수행하는 것이 유용할 수 있습니다. `Array/Map/Tuple`과 같은 복합 타입을 가진 서브컬럼은 `Nullable` 안에 있을 수 없으며, 다른 타입의 행에서는 `NULL` 대신 기본값을 갖게 됩니다.

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

**참고:** 서로 다른 숫자 타입을 가진 Variant 값들은 서로 다른 Variant로 간주되며, 값 자체는 서로 비교되지 않습니다. 대신 해당 타입 이름이 서로 비교됩니다.

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

**참고** 기본적으로 `Variant` 타입은 `GROUP BY`/`ORDER BY` 키에서 허용되지 않습니다. 이를 사용하려면 이 타입의 고유한 비교 규칙을 고려한 뒤 `allow_suspicious_types_in_group_by`/`allow_suspicious_types_in_order_by` 설정을 활성화하십시오.


## Variant와 함께 사용하는 JSONExtract 함수 \{#jsonextract-functions-with-variant\}

모든 `JSONExtract*` 함수는 `Variant` 타입을 지원합니다.

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


## Variant 인수를 사용하는 함수 \{#functions-with-variant-arguments\}

ClickHouse의 대부분의 함수는 **Variant에 대한 기본 구현**을 통해 `Variant` 타입 인수를 자동으로 지원합니다.
버전 `26.1`부터는 Variant 타입을 명시적으로 처리하지 않는 함수가 Variant 컬럼을 입력으로 받으면 ClickHouse는 다음과 같이 동작합니다:

1. Variant 컬럼에서 각 variant 타입을 추출합니다.
2. 각 variant 타입에 대해 함수를 개별적으로 실행합니다.
3. 결과 타입에 따라 결과를 적절히 결합합니다.

이를 통해 Variant 컬럼에 대해 별도의 처리를 하지 않고도 일반 함수를 사용할 수 있습니다.

**예시:**

```sql
CREATE TABLE test (v Variant(UInt32, String)) ENGINE = Memory;
INSERT INTO test VALUES (42), ('hello'), (NULL);
SELECT *, toTypeName(v) FROM test WHERE v = 42;
```

```text
   ┌─v──┬─toTypeName(v)───────────┐
1. │ 42 │ Variant(String, UInt32) │
   └────┴─────────────────────────┘
```

비교 연산자는 각 variant 타입에 개별적으로 자동 적용되며, Variant 컬럼을 필터링할 수 있습니다.

**결과 타입 동작 방식:**

결과 타입은 각 variant 타입에 대해 함수가 반환하는 값에 따라 달라집니다:

* **결과 타입이 서로 다른 경우**: `Variant(T1, T2, ...)`

  ```sql
  CREATE TABLE test2 (v Variant(UInt64, Float64)) ENGINE = Memory;
  INSERT INTO test2 VALUES (42::UInt64), (42.42);
  SELECT v + 1 AS result, toTypeName(result) FROM test2;
  ```

  ```text
  ┌─result─┬─toTypeName(plus(v, 1))──┐
  │     43 │ Variant(Float64, UInt64) │
  │  43.42 │ Variant(Float64, UInt64) │
  └────────┴─────────────────────────┘
  ```

* **타입이 호환되지 않는 경우**: 호환되지 않는 variant에는 `NULL`

  ```sql
  CREATE TABLE test3 (v Variant(Array(UInt32), UInt32)) ENGINE = Memory;
  INSERT INTO test3 VALUES ([1,2,3]), (42);
  SELECT v + 10 AS result, toTypeName(result) FROM test3;
  ```

  ```text
  ┌─result─┬─toTypeName(plus(v, 10))─┐
  │   ᴺᵁᴸᴸ │ Nullable(UInt64)        │
  │     52 │ Nullable(UInt64)        │
  └────────┴─────────────────────────┘
  ```

:::note
**오류 처리:** 함수가 특정 variant 타입을 처리할 수 없는 경우, 타입 관련 오류(ILLEGAL&#95;TYPE&#95;OF&#95;ARGUMENT,
TYPE&#95;MISMATCH, CANNOT&#95;CONVERT&#95;TYPE, NO&#95;COMMON&#95;TYPE)만 포착되며, 해당 행에 대해서는 결과로 NULL이 반환됩니다. 0으로 나누기나 메모리 부족과 같은 기타 오류는 실제 문제를 조용히 숨기지 않기 위해 그대로 발생합니다.
:::
