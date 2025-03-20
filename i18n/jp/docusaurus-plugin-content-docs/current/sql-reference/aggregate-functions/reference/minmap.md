---
slug: /sql-reference/aggregate-functions/reference/minmap
sidebar_position: 169
title: "minMap"
description: "`value` 配列から、`key` 配列で指定されたキーに基づいて最小値を計算します。"
---


# minMap

`value` 配列から、`key` 配列で指定されたキーに基づいて最小値を計算します。

**構文**

```sql
`minMap(key, value)`
```
または
```sql
minMap(Tuple(key, value))
```

エイリアス: `minMappedArrays`

:::note
- キーと値の配列のタプルを渡すことは、キーの配列と値の配列を渡すのと同じです。
- `key` と `value` の要素数は、合計する各行について同じでなければなりません。
:::

**パラメータ**

- `key` — キーの配列。 [Array](../../data-types/array.md).
- `value` — 値の配列。 [Array](../../data-types/array.md).

**戻り値**

- ソートされた順序のキーと、それに対応するキーのために計算された値からなる二つの配列のタプルを返します。 [Tuple](../../data-types/tuple.md)([Array](../../data-types/array.md), [Array](../../data-types/array.md)).

**例**

クエリ:

``` sql
SELECT minMap(a, b)
FROM values('a Array(Int32), b Array(Int64)', ([1, 2], [2, 2]), ([2, 3], [1, 1]))
```

結果:

``` text
┌─minMap(a, b)──────┐
│ ([1,2,3],[2,1,1]) │
└───────────────────┘
```
