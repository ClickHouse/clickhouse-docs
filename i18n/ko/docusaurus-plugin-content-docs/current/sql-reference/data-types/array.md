---
description: 'ClickHouse의 Array 데이터 유형에 대한 문서'
sidebar_label: 'Array(T)'
sidebar_position: 32
slug: /sql-reference/data-types/array
title: 'Array(T)'
doc_type: 'reference'
---

# Array(T) \{#arrayt\}

`T` 타입 항목으로 구성된 배열로, 배열 인덱스는 1부터 시작합니다. `T`는 배열을 포함하여 어떤 데이터 타입이든 될 수 있습니다.

## 배열 생성하기 \{#creating-an-array\}

함수를 사용해 배열을 생성할 수 있습니다.

```sql
array(T)
```

대괄호도 사용할 수 있습니다.

```sql
[]
```

배열 생성 예시:

```sql
SELECT array(1, 2) AS x, toTypeName(x)
```

```text
┌─x─────┬─toTypeName(array(1, 2))─┐
│ [1,2] │ Array(UInt8)            │
└───────┴─────────────────────────┘
```

```sql
SELECT [1, 2] AS x, toTypeName(x)
```

```text
┌─x─────┬─toTypeName([1, 2])─┐
│ [1,2] │ Array(UInt8)       │
└───────┴────────────────────┘
```

## 데이터 타입 다루기 \{#working-with-data-types\}

배열을 즉석에서 생성할 때 ClickHouse는 나열된 모든 인수를 저장할 수 있는 가장 범위가 좁은(최소 범위의) 데이터 타입을 배열 인자 타입으로 자동으로 정의합니다. [Nullable(널 허용)](/sql-reference/data-types/nullable) 값이나 리터럴 [NULL](/operations/settings/formats#input_format_null_as_default) 값이 하나라도 있으면, 배열 요소의 타입도 [Nullable](../../sql-reference/data-types/nullable.md)이 됩니다.

ClickHouse가 데이터 타입을 결정하지 못하면 예외를 발생시킵니다. 예를 들어 문자열과 숫자를 동시에 사용해 배열을 생성하려고 할 때 (`SELECT array(1, 'a')`) 이런 상황이 발생합니다.

자동 데이터 타입 판별 예:

```sql
SELECT array(1, 2, NULL) AS x, toTypeName(x)
```

```text
┌─x──────────┬─toTypeName(array(1, 2, NULL))─┐
│ [1,2,NULL] │ Array(Nullable(UInt8))        │
└────────────┴───────────────────────────────┘
```

호환되지 않는 데이터 타입으로 배열을 생성하려고 하면 ClickHouse에서 예외가 발생합니다:

```sql
SELECT array(1, 'a')
```

```text
Received exception from server (version 1.1.54388):
Code: 386. DB::Exception: Received from localhost:9000, 127.0.0.1. DB::Exception: There is no supertype for types UInt8, String because some of them are String/FixedString and some of them are not.
```

## 배열 크기 \{#array-size\}

`size0` 서브컬럼을 사용하면 해당 컬럼 전체를 읽지 않고도 배열의 크기를 확인할 수 있습니다. 다차원 배열의 경우 원하는 차원을 `N`이라고 할 때 `sizeN-1`을 사용할 수 있습니다.

**예시**

쿼리:

```sql
CREATE TABLE t_arr (`arr` Array(Array(Array(UInt32)))) ENGINE = MergeTree ORDER BY tuple();

INSERT INTO t_arr VALUES ([[[12, 13, 0, 1],[12]]]);

SELECT arr.size0, arr.size1, arr.size2 FROM t_arr;
```

결과:

```text
┌─arr.size0─┬─arr.size1─┬─arr.size2─┐
│         1 │ [2]       │ [[4,1]]   │
└───────────┴───────────┴───────────┘
```

## Array에서 중첩 서브컬럼 읽기 \{#reading-nested-subcolumns-from-array\}

`Array` 안의 중첩 타입 `T`에 서브컬럼이 있는 경우(예: [named tuple](./tuple.md)인 경우), `Array(T)` 타입에서도 동일한 서브컬럼 이름으로 해당 서브컬럼을 읽을 수 있습니다. 서브컬럼의 타입은 원래 서브컬럼 타입을 요소 타입으로 하는 `Array`가 됩니다.

**예시**

```sql
CREATE TABLE t_arr (arr Array(Tuple(field1 UInt32, field2 String))) ENGINE = MergeTree ORDER BY tuple();
INSERT INTO t_arr VALUES ([(1, 'Hello'), (2, 'World')]), ([(3, 'This'), (4, 'is'), (5, 'subcolumn')]);
SELECT arr.field1, toTypeName(arr.field1), arr.field2, toTypeName(arr.field2) from t_arr;
```

```test
┌─arr.field1─┬─toTypeName(arr.field1)─┬─arr.field2────────────────┬─toTypeName(arr.field2)─┐
│ [1,2]      │ Array(UInt32)          │ ['Hello','World']         │ Array(String)          │
│ [3,4,5]    │ Array(UInt32)          │ ['This','is','subcolumn'] │ Array(String)          │
└────────────┴────────────────────────┴───────────────────────────┴────────────────────────┘
```
