---
description: '`key` 配列で指定されたキーに従って `value` 配列を合計します。ソート順に並べられたキー配列と、対応するキーごとに合計された値の配列という 2 つの配列からなるタプルを返します。`sumMap` 関数とは、オーバーフローさせながら合計処理を行う点で異なります。'
sidebar_position: 199
slug: /sql-reference/aggregate-functions/reference/summapwithoverflow
title: 'sumMapWithOverflow'
doc_type: 'reference'
---

# sumMapWithOverflow

`key` 配列で指定されたキーに従って `value` 配列を合計します。結果として 2 つの配列からなるタプルを返します。1 つ目はソート済みのキー、2 つ目は対応するキーごとに合計された値です。
この関数は [sumMap](../reference/summap.md) 関数と異なり、オーバーフローありで加算を行います。つまり、合計結果のデータ型は引数のデータ型と同じになります。

**構文**

* `sumMapWithOverflow(key <Array>, value <Array>)` [Array 型](../../data-types/array.md)。
* `sumMapWithOverflow(Tuple(key <Array>, value <Array>))` [Tuple 型](../../data-types/tuple.md)。

**引数**

* `key`: キーの [Array](../../data-types/array.md)。
* `value`: 値の [Array](../../data-types/array.md)。

キー配列と値配列のタプルを渡すことは、キーの配列と値の配列を個別に渡すことと同等です。

:::note
集計される各行において、`key` と `value` の要素数は同じでなければなりません。
:::

**戻り値**

* 2 つの配列からなるタプルを返します。ソートされたキーの配列と、それぞれのキーに対応する合計値の配列です。

**例**

まず `sum_map` というテーブルを作成し、データを挿入します。キーと値の配列は [Nested](../../data-types/nested-data-structures/index.md) 型の `statusMap` という列として別々に保存され、それらをまとめたものが [tuple](../../data-types/tuple.md) 型の `statusMapTuple` という列として保存されます。これにより、上述したこの関数の 2 つの異なる構文の使い方を示します。

クエリ:

```sql
CREATE TABLE sum_map(
    date Date,
    timeslot DateTime,
    statusMap Nested(
        status UInt8,
        requests UInt8
    ),
    statusMapTuple Tuple(Array(Int8), Array(Int8))
) ENGINE = Log;
```

```sql
INSERT INTO sum_map VALUES
    ('2000-01-01', '2000-01-01 00:00:00', [1, 2, 3], [10, 10, 10], ([1, 2, 3], [10, 10, 10])),
    ('2000-01-01', '2000-01-01 00:00:00', [3, 4, 5], [10, 10, 10], ([3, 4, 5], [10, 10, 10])),
    ('2000-01-01', '2000-01-01 00:01:00', [4, 5, 6], [10, 10, 10], ([4, 5, 6], [10, 10, 10])),
    ('2000-01-01', '2000-01-01 00:01:00', [6, 7, 8], [10, 10, 10], ([6, 7, 8], [10, 10, 10]));
```

`sumMap`、配列型構文を用いた`sumMapWithOverflow`、および`toTypeName`関数を使ってテーブルに対してクエリを実行すると、
`sumMapWithOverflow`関数では、合計された値の配列のデータ型が引数の型と同じくどちらも`UInt8`（すなわち桁あふれを許容して加算が行われている）であることが分かります。一方、`sumMap`では、合計された値の配列のデータ型は`UInt8`から`UInt64`に変わっており、桁あふれが発生しないようになっています。

クエリ:

```sql
SELECT
    timeslot,
    toTypeName(sumMap(statusMap.status, statusMap.requests)),
    toTypeName(sumMapWithOverflow(statusMap.status, statusMap.requests)),
FROM sum_map
GROUP BY timeslot
```

同じ結果を得るには、`tuple` 構文を使用することもできます。

```sql
SELECT
    timeslot,
    toTypeName(sumMap(statusMapTuple)),
    toTypeName(sumMapWithOverflow(statusMapTuple)),
FROM sum_map
GROUP BY timeslot
```

結果:


```text
   ┌────────────timeslot─┬─toTypeName(sumMap(statusMap.status, statusMap.requests))─┬─toTypeName(sumMapWithOverflow(statusMap.status, statusMap.requests))─┐
1. │ 2000-01-01 00:01:00 │ Tuple(Array(UInt8), Array(UInt64))                       │ Tuple(Array(UInt8), Array(UInt8))                                    │
2. │ 2000-01-01 00:00:00 │ Tuple(Array(UInt8), Array(UInt64))                       │ Tuple(Array(UInt8), Array(UInt8))                                    │
   └─────────────────────┴──────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────────┘
```

**関連項目**

* [sumMap](../reference/summap.md)
