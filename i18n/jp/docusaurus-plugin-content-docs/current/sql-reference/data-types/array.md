---
description: 'ClickHouse の Array データ型に関するドキュメント'
sidebar_label: 'Array(T)'
sidebar_position: 32
slug: /sql-reference/data-types/array
title: 'Array(T)'
doc_type: 'reference'
---

# Array(T) \{#arrayt\}

`T` 型の要素からなる配列で、配列の先頭インデックスは 1 です。`T` は配列を含む任意のデータ型になり得ます。

## 配列の作成 \{#creating-an-array\}

関数を使用して配列を作成できます：

```sql
array(T)
```

角括弧（[]）を使用することもできます。

```sql
[]
```

配列の作成例：

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

## データ型の扱い \{#working-with-data-types\}

配列をその場で作成する場合、ClickHouse は、指定されたすべての引数を格納できる中で最も狭いデータ型を自動的に選択します。[Nullable](/sql-reference/data-types/nullable) やリテラルの [NULL](/operations/settings/formats#input_format_null_as_default) 値が含まれている場合、配列要素の型も [Nullable](../../sql-reference/data-types/nullable.md) になります。

ClickHouse がデータ型を決定できない場合は、例外をスローします。例えば、文字列と数値を同時に含む配列を作成しようとした場合（`SELECT array(1, 'a')`）にこのような状況が発生します。

自動データ型推定の例:

```sql
SELECT array(1, 2, NULL) AS x, toTypeName(x)
```

```text
┌─x──────────┬─toTypeName(array(1, 2, NULL))─┐
│ [1,2,NULL] │ Array(Nullable(UInt8))        │
└────────────┴───────────────────────────────┘
```

互換性のないデータ型の配列を作成しようとすると、ClickHouse は例外を発生させます。

```sql
SELECT array(1, 'a')
```

```text
Received exception from server (version 1.1.54388):
Code: 386. DB::Exception: Received from localhost:9000, 127.0.0.1. DB::Exception: There is no supertype for types UInt8, String because some of them are String/FixedString and some of them are not.
```

## 配列サイズ \{#array-size\}

`size0` サブカラムを使用すると、列全体を読み込むことなく配列のサイズを取得できます。多次元配列の場合は `sizeN-1` を使用できます。ここで `N` は取得したい次元の番号です。

**例**

クエリ:

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

## Array からのネストされたサブカラムの読み取り \{#reading-nested-subcolumns-from-array\}

`Array` 内のネストされた型 `T` がサブカラムを持つ場合（たとえば [named tuple](./tuple.md) である場合など）、`Array(T)` 型から同じサブカラム名を使ってサブカラムを読み取ることができます。サブカラムの型は、元のサブカラムの型を要素とする `Array` 型になります。

**例**

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
