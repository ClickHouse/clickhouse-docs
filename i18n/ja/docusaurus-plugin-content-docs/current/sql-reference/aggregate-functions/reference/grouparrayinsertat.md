---
slug: /sql-reference/aggregate-functions/reference/grouparrayinsertat
sidebar_position: 140
---

# groupArrayInsertAt

指定された位置に値を配列に挿入します。

**構文**

``` sql
groupArrayInsertAt(default_x, size)(x, pos)
```

1つのクエリでいくつかの値が同じ位置に挿入される場合、関数は以下のように動作します。

- クエリが単一スレッドで実行される場合、挿入された値の最初のものが使用されます。
- クエリが複数スレッドで実行される場合、結果の値は挿入された値のいずれか不定のものになります。

**引数**

- `x` — 挿入する値。 [式](../../../sql-reference/syntax.md#syntax-expressions)は、[サポートされているデータ型](../../../sql-reference/data-types/index.md)のいずれかを結果として返します。
- `pos` — 指定された要素 `x` が挿入される位置。配列のインデックス番号はゼロから始まります。 [UInt32](../../../sql-reference/data-types/int-uint.md#uint-ranges)。
- `default_x` — 空の位置に置き換え用のデフォルト値。オプションのパラメータ。 [式](../../../sql-reference/syntax.md#syntax-expressions)は、`x` パラメータに設定されているデータ型を返します。`default_x` が定義されていない場合、[デフォルト値](../../../sql-reference/statements/create/table.md#create-default-values)が使用されます。
- `size` — 結果の配列の長さ。オプションのパラメータ。このパラメータを使用する場合、デフォルト値 `default_x` を指定する必要があります。 [UInt32](../../../sql-reference/data-types/int-uint.md#uint-ranges)。

**返される値**

- 挿入された値を持つ配列。

タイプ: [Array](../../../sql-reference/data-types/array.md#data-type-array)。

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

1つの位置に要素を複数スレッドで挿入。

クエリ:

``` sql
SELECT groupArrayInsertAt(number, 0) FROM numbers_mt(10) SETTINGS max_block_size = 1;
```

このクエリの結果、 `[0,9]` の範囲内のランダムな整数が得られます。例えば:

``` text
┌─groupArrayInsertAt(number, 0)─┐
│ [7]                           │
└───────────────────────────────┘
```
