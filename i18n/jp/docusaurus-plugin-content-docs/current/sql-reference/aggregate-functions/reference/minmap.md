---
description: '指定されたキーの `key` 配列に従って、`value` 配列の最小値を計算します。'
sidebar_position: 169
slug: /sql-reference/aggregate-functions/reference/minmap
title: 'minMap'
---


# minMap

指定されたキーの `key` 配列に従って、`value` 配列の最小値を計算します。

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
- キーとバリューの配列のタプルを渡すことは、キーの配列とバリューの配列を渡すことと同じです。
- `key` と `value` の要素数は、合計される各行で同じでなければなりません。
:::

**パラメータ**

- `key` — キーの配列。[Array](../../data-types/array.md).
- `value` — 値の配列。[Array](../../data-types/array.md).

**返される値**

- ソートされたキーの配列と、対応するキーに対して計算された値の配列からなるタプルを返します。[Tuple](../../data-types/tuple.md)([Array](../../data-types/array.md), [Array](../../data-types/array.md)).

**例**

クエリ:

```sql
SELECT minMap(a, b)
FROM values('a Array(Int32), b Array(Int64)', ([1, 2], [2, 2]), ([2, 3], [1, 1]))
```

結果:

```text
┌─minMap(a, b)──────┐
│ ([1,2,3],[2,1,1]) │
└───────────────────┘
```
