---
description: '指定された `key` 配列のキーに基づいて、`value` 配列から最大値を計算します。'
sidebar_position: 165
slug: /sql-reference/aggregate-functions/reference/maxmap
title: 'maxMap'
---


# maxMap

指定された `key` 配列のキーに基づいて、`value` 配列から最大値を計算します。

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
- キーと値の配列のタプルを渡すことは、キーと値の2つの配列を渡すことと同じです。
- `key` と `value` の要素数は、合計される各行で同じでなければなりません。
:::

**パラメータ**

- `key` — キーの配列。 [Array](../../data-types/array.md).
- `value` — 値の配列。 [Array](../../data-types/array.md).

**返される値**

- 整列された順序のキーと、対応するキーに対して計算された値の2つの配列のタプルを返します。 [Tuple](../../data-types/tuple.md)([Array](../../data-types/array.md), [Array](../../data-types/array.md)).

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
