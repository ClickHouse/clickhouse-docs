---
slug: /sql-reference/aggregate-functions/reference/maxmap
sidebar_position: 165
title: "maxMap"
description: "`value` 配列から、`key` 配列で指定されたキーに基づいて最大値を計算します。"
---


# maxMap

`value` 配列から、`key` 配列で指定されたキーに基づいて最大値を計算します。

**構文**

```sql
maxMap(key, value)
```
または
```sql
maxMap(Tuple(key, value))
```

エイリアス: `maxMappedArrays`

:::note
- キーと値の配列のタプルを渡すのは、キーと値の2つの配列を渡すのと同じです。
- `key` と `value` の要素数は、合計される各行に対して同じでなければなりません。
:::

**パラメータ**

- `key` — キーの配列。[Array](../../data-types/array.md)。
- `value` — 値の配列。[Array](../../data-types/array.md)。

**戻り値**

- ソートされた順序でのキーと、対応するキーに対して計算された値の2つの配列のタプルを返します。[Tuple](../../data-types/tuple.md)([Array](../../data-types/array.md), [Array](../../data-types/array.md))。

**例**

クエリ:

```sql
SELECT maxMap(a, b)
FROM values('a Array(Char), b Array(Int64)', (['x', 'y'], [2, 2]), (['y', 'z'], [3, 1]))
```

結果:

```text
┌─maxMap(a, b)───────────┐
│ [['x','y','z'],[2,3,1]]│
└────────────────────────┘
```
