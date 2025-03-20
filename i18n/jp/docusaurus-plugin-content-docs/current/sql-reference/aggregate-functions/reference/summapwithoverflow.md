---
slug: /sql-reference/aggregate-functions/reference/summapwithoverflow
sidebar_position: 199
title: "sumMapWithOverflow"
description: "`key` 配列で指定されたキーに従って `value` 配列の合計を計算します。ソートされたキーの配列と、対応するキーの合計値を含むタプルを返します。sumMap 関数とは異なり、オーバーフローを伴う合計を行います。"
---


# sumMapWithOverflow

`key` 配列で指定されたキーに従って `value` 配列の合計を計算します。ソートされたキーの配列と、対応するキーの合計値を含むタプルを返します。
これは、オーバーフローを伴う合計を行う点で、[sumMap](../reference/summap.md) 関数とは異なります。つまり、合計のデータ型は引数のデータ型と同じになります。

**構文**

- `sumMapWithOverflow(key <Array>, value <Array>)` [Array type](../../data-types/array.md).
- `sumMapWithOverflow(Tuple(key <Array>, value <Array>))` [Tuple type](../../data-types/tuple.md).

**引数**

- `key`: キーの [Array](../../data-types/array.md)。
- `value`: 値の [Array](../../data-types/array.md)。

キーと値の配列のタプルを渡すことは、キーの配列と値の配列をそれぞれ渡すことの同義です。

:::note 
`key` と `value` の要素数は、合計される各行に対して同じでなければなりません。
:::

**返される値**

- ソートされたキーの配列と、対応するキーの合計値を含むタプルを返します。

**例**

まず、`sum_map` というテーブルを作成し、データを挿入します。キーと値の配列は、[Nested](../../data-types/nested-data-structures/index.md) 型の `statusMap` というカラムに別々に保存され、また [tuple](../../data-types/tuple.md) 型の `statusMapTuple` というカラムに一緒に保存され、上記のこの関数の2つの異なる構文の使用を示します。

クエリ:

``` sql
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

テーブルを `sumMap` および `sumMapWithOverflow` を使用して、配列型構文でクエリを実行し、`toTypeName` 関数を使用すると、`sumMapWithOverflow` 関数では、合計された値の配列のデータ型が引数の型と同じであることがわかります。両方とも `UInt8` です（つまり、オーバーフローを伴う合計が行われました）。`sumMap` では、合計された値の配列のデータ型が `UInt8` から `UInt64` に変更され、オーバーフローが発生しないようになっています。

クエリ:

``` sql
SELECT
    timeslot,
    toTypeName(sumMap(statusMap.status, statusMap.requests)),
    toTypeName(sumMapWithOverflow(statusMap.status, statusMap.requests)),
FROM sum_map
GROUP BY timeslot
```

同様に、同じ結果を得るためにタプル構文を使用することもできます。

``` sql
SELECT
    timeslot,
    toTypeName(sumMap(statusMapTuple)),
    toTypeName(sumMapWithOverflow(statusMapTuple)),
FROM sum_map
GROUP BY timeslot
```

結果:

``` text
   ┌────────────timeslot─┬─toTypeName(sumMap(statusMap.status, statusMap.requests))─┬─toTypeName(sumMapWithOverflow(statusMap.status, statusMap.requests))─┐
1. │ 2000-01-01 00:01:00 │ Tuple(Array(UInt8), Array(UInt64))                       │ Tuple(Array(UInt8), Array(UInt8))                                    │
2. │ 2000-01-01 00:00:00 │ Tuple(Array(UInt8), Array(UInt64))                       │ Tuple(Array(UInt8), Array(UInt8))                                    │
   └─────────────────────┴──────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────────┘
```

**関連情報**

- [sumMap](../reference/summap.md)
