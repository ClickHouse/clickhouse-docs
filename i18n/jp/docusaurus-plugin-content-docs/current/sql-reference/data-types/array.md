---
'description': 'ClickHouseにおけるArrayデータ型に関するドキュメント'
'sidebar_label': 'Array(T)'
'sidebar_position': 32
'slug': '/sql-reference/data-types/array'
'title': 'Array(T)'
'doc_type': 'reference'
---


# Array(T)

`T`型アイテムの配列で、開始配列インデックスは1です。`T`は配列を含む任意のデータ型であることができます。

## Creating an Array {#creating-an-array}

関数を使用して配列を作成できます：

```sql
array(T)
```

角括弧を使用することもできます。

```sql
[]
```

配列を作成する例：

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

その場で配列を作成する際、ClickHouseは自動的に引数タイプを、リストされたすべての引数を格納できる最も狭いデータ型として定義します。もし[Nullable](/sql-reference/data-types/nullable)またはリテラル[NULL](/operations/settings/formats#input_format_null_as_default)の値がある場合、配列要素の型も[Nullable](../../sql-reference/data-types/nullable.md)になります。

ClickHouseがデータ型を特定できなかった場合、例外が発生します。例えば、文字列と数字を同時に含む配列を作成しようとすると、これが発生します（`SELECT array(1, 'a')`）。

自動データ型検出の例：

```sql
SELECT array(1, 2, NULL) AS x, toTypeName(x)
```

```text
┌─x──────────┬─toTypeName(array(1, 2, NULL))─┐
│ [1,2,NULL] │ Array(Nullable(UInt8))        │
└────────────┴───────────────────────────────┘
```

互換性のないデータ型の配列を作成しようとすると、ClickHouseは例外をスローします：

```sql
SELECT array(1, 'a')
```

```text
Received exception from server (version 1.1.54388):
Code: 386. DB::Exception: Received from localhost:9000, 127.0.0.1. DB::Exception: There is no supertype for types UInt8, String because some of them are String/FixedString and some of them are not.
```

## Array Size {#array-size}

`size0`サブカラムを使用して配列のサイズを求めることができ、すべてのカラムを読み込む必要はありません。多次元配列の場合、`sizeN-1`を使用できます。ここで、`N`は望ましい次元です。

**Example**

クエリ：

```sql
CREATE TABLE t_arr (`arr` Array(Array(Array(UInt32)))) ENGINE = MergeTree ORDER BY tuple();

INSERT INTO t_arr VALUES ([[[12, 13, 0, 1],[12]]]);

SELECT arr.size0, arr.size1, arr.size2 FROM t_arr;
```

結果：

```text
┌─arr.size0─┬─arr.size1─┬─arr.size2─┐
│         1 │ [2]       │ [[4,1]]   │
└───────────┴───────────┴───────────┘
```

## Reading nested subcolumns from Array {#reading-nested-subcolumns-from-array}

もし`Array`内のネストされた型`T`がサブカラムを持っている場合（例えば、[名前付きタプル](./tuple.md)の場合）、同じサブカラム名を持つ`Array(T)`型からそのサブカラムを読み取ることができます。サブカラムの型は、元のサブカラムの型の`Array`になります。

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
