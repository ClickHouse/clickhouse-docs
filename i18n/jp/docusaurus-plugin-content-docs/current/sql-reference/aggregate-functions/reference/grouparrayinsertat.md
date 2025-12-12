---
description: '配列の指定した位置に値を挿入します。'
sidebar_position: 140
slug: /sql-reference/aggregate-functions/reference/grouparrayinsertat
title: 'groupArrayInsertAt'
doc_type: 'reference'
---

# groupArrayInsertAt {#grouparrayinsertat}

配列の指定した位置に値を挿入します。

**構文**

```sql
groupArrayInsertAt(default_x, size)(x, pos)
```

1 つのクエリ内で同じ位置に複数の値が挿入される場合、この関数は次のように動作します。

* クエリが単一スレッドで実行される場合、挿入された値のうち最初のものが使用されます。
* クエリがマルチスレッドで実行される場合、結果の値が挿入された値のどれになるかは不定です。

**引数**

* `x` — 挿入する値。[式](/sql-reference/syntax#expressions) であり、[サポートされているデータ型](../../../sql-reference/data-types/index.md) のいずれかになります。
* `pos` — 要素 `x` を挿入する位置。配列のインデックス番号は 0 から始まります。[UInt32](/sql-reference/data-types/int-uint#integer-ranges)。
* `default_x` — 空の位置を埋めるためのデフォルト値。省略可能なパラメータ。[式](/sql-reference/syntax#expressions) であり、パラメータ `x` に設定されたデータ型になります。`default_x` が定義されていない場合は、[デフォルト値](/sql-reference/statements/create/table) が使用されます。
* `size` — 結果の配列の長さ。省略可能なパラメータ。このパラメータを使用する場合、デフォルト値 `default_x` を指定する必要があります。[UInt32](/sql-reference/data-types/int-uint#integer-ranges)。

**返される値**

* 値が挿入された配列。

型: [Array](/sql-reference/data-types/array)。

**例**

クエリ:

```sql
SELECT groupArrayInsertAt(toString(number), number * 2) FROM numbers(5);
```

結果：

```text
┌─groupArrayInsertAt(toString(number), multiply(number, 2))─┐
│ ['0','','1','','2','','3','','4']                         │
└───────────────────────────────────────────────────────────┘
```

クエリ:

```sql
SELECT groupArrayInsertAt('-')(toString(number), number * 2) FROM numbers(5);
```

結果：

```text
┌─groupArrayInsertAt('-')(toString(number), multiply(number, 2))─┐
│ ['0','-','1','-','2','-','3','-','4']                          │
└────────────────────────────────────────────────────────────────┘
```

クエリ:

```sql
SELECT groupArrayInsertAt('-', 5)(toString(number), number * 2) FROM numbers(5);
```

結果:

```text
┌─groupArrayInsertAt('-', 5)(toString(number), multiply(number, 2))─┐
│ ['0','-','1','-','2']                                             │
└───────────────────────────────────────────────────────────────────┘
```

1 つの位置に要素をマルチスレッドで挿入。

クエリ:

```sql
SELECT groupArrayInsertAt(number, 0) FROM numbers_mt(10) SETTINGS max_block_size = 1;
```

このクエリの結果として、`[0,9]` の範囲のランダムな整数が得られます。たとえば次のようになります。

```text
┌─groupArrayInsertAt(number, 0)─┐
│ [7]                           │
└───────────────────────────────┘
```
