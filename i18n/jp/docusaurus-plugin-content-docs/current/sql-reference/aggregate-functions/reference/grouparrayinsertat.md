---
slug: /sql-reference/aggregate-functions/reference/grouparrayinsertat
sidebar_position: 140
title: "groupArrayInsertAt"
description: "指定された位置に値を配列に挿入します。"
---


# groupArrayInsertAt

指定された位置に値を配列に挿入します。

**構文**

``` sql
groupArrayInsertAt(default_x, size)(x, pos)
```

1つのクエリで複数の値が同じ位置に挿入されると、関数は次のように振る舞います。

- もしクエリが単一スレッドで実行される場合、挿入された値の最初のものが使用されます。
- もしクエリが複数スレッドで実行される場合、結果の値は挿入された値のうちの不定のものとなります。

**引数**

- `x` — 挿入する値。 [式](/sql-reference/syntax#expressions)で、[サポートされているデータ型](../../../sql-reference/data-types/index.md)の1つを生成します。
- `pos` — 指定された要素 `x` を挿入する位置。配列内のインデックス番号はゼロから始まります。 [UInt32](/sql-reference/data-types/int-uint#integer-ranges)。
- `default_x` — 空の位置に代入するためのデフォルト値。オプションのパラメータ。 [式](/sql-reference/syntax#expressions)で、`x` パラメータに設定されているデータ型を生成します。`default_x` が定義されていない場合、[デフォルト値](/sql-reference/statements/create/table)が使用されます。
- `size` — 結果として得られる配列の長さ。オプションのパラメータ。このパラメータを使用する場合、デフォルト値 `default_x` を指定する必要があります。 [UInt32](/sql-reference/data-types/int-uint#integer-ranges)。

**返される値**

- 挿入された値を持つ配列。

タイプ: [Array](/sql-reference/data-types/array)。

**例**

クエリ:

``` sql
SELECT groupArrayInsertAt(toString(number), number * 2) FROM numbers(5);
```

結果:

``` text
┌─groupArrayInsertAt(toString(number), multiply(number, 2))─┐
│ ['0','','1','','2','','3','','4']                         │
└───────────────────────────────────────────────────────────┘
```

クエリ:

``` sql
SELECT groupArrayInsertAt('-')(toString(number), number * 2) FROM numbers(5);
```

結果:

``` text
┌─groupArrayInsertAt('-')(toString(number), multiply(number, 2))─┐
│ ['0','-','1','-','2','-','3','-','4']                          │
└────────────────────────────────────────────────────────────────┘
```

クエリ:

``` sql
SELECT groupArrayInsertAt('-', 5)(toString(number), number * 2) FROM numbers(5);
```

結果:

``` text
┌─groupArrayInsertAt('-', 5)(toString(number), multiply(number, 2))─┐
│ ['0','-','1','-','2']                                             │
└───────────────────────────────────────────────────────────────────┘
```

1つの位置に要素をマルチスレッドで挿入します。

クエリ:

``` sql
SELECT groupArrayInsertAt(number, 0) FROM numbers_mt(10) SETTINGS max_block_size = 1;
```

このクエリの結果、`[0,9]` の範囲のランダムな整数が得られます。例えば:

``` text
┌─groupArrayInsertAt(number, 0)─┐
│ [7]                           │
└───────────────────────────────┘
```
