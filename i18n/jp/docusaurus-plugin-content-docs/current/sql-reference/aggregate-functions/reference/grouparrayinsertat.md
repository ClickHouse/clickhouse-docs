---
description: '配列の指定された位置に値を挿入します。'
sidebar_position: 140
slug: /sql-reference/aggregate-functions/reference/grouparrayinsertat
title: 'groupArrayInsertAt'
doc_type: 'reference'
---

# groupArrayInsertAt

配列の指定した位置に値を挿入します。

**構文**

```sql
groupArrayInsertAt(default_x, size)(x, pos)
```

1つのクエリ内で同じ位置に複数の値が挿入される場合、この関数は次のように動作します。

* クエリが単一スレッドで実行される場合、挿入された値のうち最初のものが使用されます。
* クエリが複数スレッドで実行される場合、結果として得られる値は、挿入された値のうちどれになるかは不定です。

**引数**

* `x` — 挿入される値。[式](/sql-reference/syntax#expressions) であり、[サポートされているデータ型](../../../sql-reference/data-types/index.md) のいずれかになります。
* `pos` — 要素 `x` を挿入する位置。配列のインデックス番号は 0 から始まります。[UInt32](/sql-reference/data-types/int-uint#integer-ranges)。
* `default_x` — 空の位置を埋めるためのデフォルト値。省略可能なパラメータ。[式](/sql-reference/syntax#expressions) であり、`x` パラメータに設定されているデータ型になります。`default_x` が定義されていない場合は、[デフォルト値](/sql-reference/statements/create/table) が使用されます。
* `size` — 結果配列の長さ。省略可能なパラメータ。このパラメータを使用する場合は、デフォルト値である `default_x` を指定する必要があります。[UInt32](/sql-reference/data-types/int-uint#integer-ranges)。

**戻り値**

* 値が挿入された配列。

型: [Array](/sql-reference/data-types/array).

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

同一位置への要素のマルチスレッド挿入。

クエリ:

```sql
SELECT groupArrayInsertAt(number, 0) FROM numbers_mt(10) SETTINGS max_block_size = 1;
```

このクエリを実行すると、`[0,9]` の範囲でランダムな整数が返されます。例えば次のとおりです。

```text
┌─groupArrayInsertAt(number, 0)─┐
│ [7]                           │
└───────────────────────────────┘
```
