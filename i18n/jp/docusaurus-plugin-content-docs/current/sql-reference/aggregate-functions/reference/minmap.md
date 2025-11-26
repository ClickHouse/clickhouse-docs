---
description: '`key` 配列で指定されたキーごとに、`value` 配列から最小値を計算します。'
sidebar_position: 169
slug: /sql-reference/aggregate-functions/reference/minmap
title: 'minMap'
doc_type: 'reference'
---

# minMap

`key` 配列で指定されたキーに基づいて、`value` 配列の最小値を計算します。

**構文**

```sql
`minMap(key, value)`
```

または

```sql
minMap(Tuple(key, value))
```

Alias: `minMappedArrays`

:::note

* キー配列と値配列のタプルを渡すことは、キーの配列と値の配列をそれぞれ渡すことと同等です。
* 集計対象となる各行について、`key` と `value` の要素数は同じでなければなりません。
  :::

**パラメータ**

* `key` — キーの配列。[Array](../../data-types/array.md)。
* `value` — 値の配列。[Array](../../data-types/array.md)。

**返り値**

* 2 つの配列からなるタプルを返します。キーはソート済みで、値は対応するキーごとに計算されたものです。[Tuple](../../data-types/tuple.md)([Array](../../data-types/array.md), [Array](../../data-types/array.md))。

**例**

クエリ:

```sql
SELECT minMap(a, b)
FROM VALUES('a Array(Int32), b Array(Int64)', ([1, 2], [2, 2]), ([2, 3], [1, 1]))
```

結果:

```text
┌─minMap(a, b)──────┐
│ ([1,2,3],[2,1,1]) │
└───────────────────┘
```
