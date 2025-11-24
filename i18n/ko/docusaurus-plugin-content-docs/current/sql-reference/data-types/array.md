---
'description': 'ClickHouse의 Array 데이터 유형에 대한 문서'
'sidebar_label': 'Array(T)'
'sidebar_position': 32
'slug': '/sql-reference/data-types/array'
'title': 'Array(T)'
'doc_type': 'reference'
---


# Array(T)

`T`-타입 아이템의 배열, 시작 배열 인덱스는 1입니다. `T`는 배열을 포함한 모든 데이터 타입일 수 있습니다.

## Creating an Array {#creating-an-array}

배열을 만들기 위해 함수를 사용할 수 있습니다:

```sql
array(T)
```

또한 대괄호를 사용할 수도 있습니다.

```sql
[]
```

배열을 생성하는 예시:

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

## Working with Data Types {#working-with-data-types}

즉석에서 배열을 생성할 때, ClickHouse는 모든 나열된 인수를 저장할 수 있는 가장 좁은 데이터 타입으로 인수 타입을 자동으로 정의합니다. [Nullable](/sql-reference/data-types/nullable) 또는 리터럴 [NULL](/operations/settings/formats#input_format_null_as_default) 값이 있는 경우, 배열 요소의 타입도 [Nullable](../../sql-reference/data-types/nullable.md)로 됩니다.

ClickHouse가 데이터 타입을 결정할 수 없으면 예외가 발생합니다. 예를 들어, 문자열과 숫자를 동시에 포함하는 배열을 만들려고 할 때(`SELECT array(1, 'a')`), 이런 일이 발생합니다.

자동 데이터 타입 감지의 예:

```sql
SELECT array(1, 2, NULL) AS x, toTypeName(x)
```

```text
┌─x──────────┬─toTypeName(array(1, 2, NULL))─┐
│ [1,2,NULL] │ Array(Nullable(UInt8))        │
└────────────┴───────────────────────────────┘
```

호환되지 않는 데이터 타입의 배열을 생성하려고 하면 ClickHouse는 예외를 발생시킵니다:

```sql
SELECT array(1, 'a')
```

```text
Received exception from server (version 1.1.54388):
Code: 386. DB::Exception: Received from localhost:9000, 127.0.0.1. DB::Exception: There is no supertype for types UInt8, String because some of them are String/FixedString and some of them are not.
```

## Array Size {#array-size}

`size0` 서브컬럼을 사용하여 전체 컬럼을 읽지 않고도 배열의 크기를 찾을 수 있습니다. 다차원 배열의 경우에는 원하는 차원인 `N`에 대해 `sizeN-1`을 사용할 수 있습니다.

**Example**

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

## Reading nested subcolumns from Array {#reading-nested-subcolumns-from-array}

`Array` 내부의 중첩 타입 `T`가 서브컬럼을 가지고 있는 경우(예: [명명된 튜플](./tuple.md)), 같은 서브컬럼 이름을 가진 `Array(T)` 타입에서 그 서브컬럼을 읽을 수 있습니다. 서브컬럼의 타입은 원래 서브컬럼 타입의 `Array`가 됩니다.

**Example**

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
