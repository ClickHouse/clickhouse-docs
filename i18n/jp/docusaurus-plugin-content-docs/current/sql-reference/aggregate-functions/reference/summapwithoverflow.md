---
description: '指定された `key` 配列に従って `value` 配列の合計を算出します。ソートされた順序のキーと、対応するキーに対して合計された値の二つの配列から成るタプルを返します。オーバーフローありで合計を行うため、`sumMap` 関数とは異なります。'
sidebar_position: 199
slug: /sql-reference/aggregate-functions/reference/summapwithoverflow
title: 'sumMapWithOverflow'
---


# sumMapWithOverflow

指定された `key` 配列に従って `value` 配列の合計を算出します。ソートされた順序のキーと、対応するキーに対して合計された値の二つの配列から成るタプルを返します。オーバーフローありで合計を行うため、[sumMap](../reference/summap.md) 関数とは異なります - つまり、合計のデータ型は引数のデータ型と同じになります。

**構文**

- `sumMapWithOverflow(key <Array>, value <Array>)` [Array type](../../data-types/array.md)。
- `sumMapWithOverflow(Tuple(key <Array>, value <Array>))` [Tuple type](../../data-types/tuple.md)。

**引数**

- `key`: [配列](../../data-types/array.md)のキー。
- `value`: [配列](../../data-types/array.md)の値。

キーと値の配列のタプルを渡すことは、キーの配列と値の配列を別々に渡すことの同義です。

:::note 
`key` と `value` の要素数は、合計される各行で同じでなければなりません。
:::

**返される値**

- ソートされた順序のキーと、対応するキーに対して合計された値から成る二つの配列のタプルが返されます。

**例**

まず、`sum_map` というテーブルを作成し、いくつかのデータを挿入します。キーと値の配列は、[Nested](../../data-types/nested-data-structures/index.md)型の `statusMap` というカラムとして個別に保存され、また [tuple](../../data-types/tuple.md)型の `statusMapTuple` というカラムとして一緒に保存されます。これは上記で説明したこの関数の二つの異なる構文の使用例を示しています。

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

`sumMap` および `sumMapWithOverflow` を配列型構文で使用し、`toTypeName` 関数を使ってテーブルをクエリすると、`sumMapWithOverflow` 関数では、合計された値の配列のデータ型が引数の型と同じ `UInt8` であることがわかります（つまり、オーバーフローありで合計が行われたことを示します）。一方、`sumMap` では合計された値の配列のデータ型は `UInt8` から `UInt64` に変わり、オーバーフローが発生しないようになっています。

クエリ:

```sql
SELECT
    timeslot,
    toTypeName(sumMap(statusMap.status, statusMap.requests)),
    toTypeName(sumMapWithOverflow(statusMap.status, statusMap.requests)),
FROM sum_map
GROUP BY timeslot
```

同等の結果を得るために、タプル構文を使用することもできます。

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

**関連情報**

- [sumMap](../reference/summap.md)
