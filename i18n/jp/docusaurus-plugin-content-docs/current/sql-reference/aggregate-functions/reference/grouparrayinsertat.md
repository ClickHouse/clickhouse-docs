---
description: 'Inserts a value into the array at the specified position.'
sidebar_position: 140
slug: '/sql-reference/aggregate-functions/reference/grouparrayinsertat'
title: 'groupArrayInsertAt'
---




# groupArrayInsertAt

指定された位置に配列に値を挿入します。

**構文**

```sql
groupArrayInsertAt(default_x, size)(x, pos)
```

1つのクエリで複数の値が同じ位置に挿入される場合、関数は次のように動作します：

- クエリが単一スレッドで実行される場合、挿入された値の最初のものが使用されます。
- クエリが複数スレッドで実行される場合、結果の値は挿入された値のうちの不確定なものになります。

**引数**

- `x` — 挿入される値。[式](/sql-reference/syntax#expressions)は、[サポートされているデータ型](../../../sql-reference/data-types/index.md)のいずれかになります。
- `pos` — 指定された要素 `x` を挿入する位置。配列のインデックス番号はゼロから始まります。[UInt32](/sql-reference/data-types/int-uint#integer-ranges)。
- `default_x` — 空の位置を代替するためのデフォルト値。オプションのパラメータ。[式](/sql-reference/syntax#expressions)は、`x` パラメータに設定されたデータ型のものでなければなりません。`default_x` が定義されていない場合、[デフォルト値](/sql-reference/statements/create/table)が使用されます。
- `size` — 結果の配列の長さ。オプションのパラメータ。このパラメータを使用する場合、デフォルト値 `default_x` を指定する必要があります。[UInt32](/sql-reference/data-types/int-uint#integer-ranges)。

**返される値**

- 挿入された値を含む配列。

タイプ: [配列](/sql-reference/data-types/array)。

**例**

クエリ：

```sql
SELECT groupArrayInsertAt(toString(number), number * 2) FROM numbers(5);
```

結果：

```text
┌─groupArrayInsertAt(toString(number), multiply(number, 2))─┐
│ ['0','','1','','2','','3','','4']                         │
└───────────────────────────────────────────────────────────┘
```

クエリ：

```sql
SELECT groupArrayInsertAt('-')(toString(number), number * 2) FROM numbers(5);
```

結果：

```text
┌─groupArrayInsertAt('-')(toString(number), multiply(number, 2))─┐
│ ['0','-','1','-','2','-','3','-','4']                          │
└────────────────────────────────────────────────────────────────┘
```

クエリ：

```sql
SELECT groupArrayInsertAt('-', 5)(toString(number), number * 2) FROM numbers(5);
```

結果：

```text
┌─groupArrayInsertAt('-', 5)(toString(number), multiply(number, 2))─┐
│ ['0','-','1','-','2']                                             │
└───────────────────────────────────────────────────────────────────┘
```

1つの位置に要素をマルチスレッドで挿入する。

クエリ：

```sql
SELECT groupArrayInsertAt(number, 0) FROM numbers_mt(10) SETTINGS max_block_size = 1;
```

このクエリの結果、`[0,9]` の範囲内のランダムな整数が得られます。例えば：

```text
┌─groupArrayInsertAt(number, 0)─┐
│ [7]                           │
└───────────────────────────────┘
```
