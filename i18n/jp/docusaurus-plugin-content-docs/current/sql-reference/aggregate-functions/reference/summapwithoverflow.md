---
description: '`key` 配列で指定されたキーに基づいて `value` 配列を合計します。キーを昇順に並べた配列と、それぞれのキーに対応する値を合計した配列の 2 つからなるタプルを返します。sumMap 関数とは異なり、オーバーフローを許容して加算を行います。'
sidebar_position: 199
slug: /sql-reference/aggregate-functions/reference/summapwithoverflow
title: 'sumMapWithOverflow'
doc_type: 'reference'
---

# sumMapWithOverflow {#summapwithoverflow}

`key` 配列で指定されたキーに従って、`value` 配列の値を集計します。結果として 2 つの配列からなるタプルを返します。1 つ目はソートされたキーの配列、2 つ目は対応するキーごとに合計された値の配列です。
この関数は [sumMap](../reference/summap.md) 関数と異なり、オーバーフローを許容する形で加算を行います。すなわち、集計結果のデータ型は引数のデータ型と同じになります。

**構文**

* `sumMapWithOverflow(key <Array>, value <Array>)` [Array 型](../../data-types/array.md)。
* `sumMapWithOverflow(Tuple(key <Array>, value <Array>))` [Tuple 型](../../data-types/tuple.md)。

**引数**

* `key`: キーの [Array](../../data-types/array.md)。
* `value`: 値の [Array](../../data-types/array.md)。

キー配列と値配列のタプルを渡すことは、キー配列と値配列をそれぞれ個別に渡すことと同等です。

:::note
合計対象となる各行において、`key` と `value` の要素数は同じでなければなりません。
:::

**返される値**

* 2 つの配列からなるタプルを返します。1 つ目はソートされたキーの配列、2 つ目は対応するキーごとに合計された値の配列です。

**例**

まず `sum_map` というテーブルを作成し、いくつかデータを挿入します。キーと値の配列は、それぞれ [Nested](../../data-types/nested-data-structures/index.md) 型の `statusMap` というカラムとして個別に保存し、さらに両者をまとめて [tuple](../../data-types/tuple.md) 型の `statusMapTuple` というカラムとしても保存して、この関数で前述した 2 種類の構文の使い方を示します。

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

`sumMap`、配列型の構文を使った `sumMapWithOverflow`、および `toTypeName` 関数を用いてテーブルをクエリすると、
`sumMapWithOverflow` 関数では、合計された値の配列のデータ型が引数の型と同じく `UInt8` であることが分かります（つまり、オーバーフローを許容したまま加算が行われています）。一方、`sumMap` では合計された値の配列のデータ型が `UInt8` から `UInt64` に変更され、オーバーフローが発生しないようになっています。

Query:

```sql
SELECT
    timeslot,
    toTypeName(sumMap(statusMap.status, statusMap.requests)),
    toTypeName(sumMapWithOverflow(statusMap.status, statusMap.requests)),
FROM sum_map
GROUP BY timeslot
```

同様に、タプル構文を使っても同じ結果が得られます。

```sql
SELECT
    timeslot,
    toTypeName(sumMap(statusMapTuple)),
    toTypeName(sumMapWithOverflow(statusMapTuple)),
FROM sum_map
GROUP BY timeslot
```

結果：

```text
   ┌────────────timeslot─┬─toTypeName(sumMap(statusMap.status, statusMap.requests))─┬─toTypeName(sumMapWithOverflow(statusMap.status, statusMap.requests))─┐
1. │ 2000-01-01 00:01:00 │ Tuple(Array(UInt8), Array(UInt64))                       │ Tuple(Array(UInt8), Array(UInt8))                                    │
2. │ 2000-01-01 00:00:00 │ Tuple(Array(UInt8), Array(UInt64))                       │ Tuple(Array(UInt8), Array(UInt8))                                    │
   └─────────────────────┴──────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────────┘
```

**関連項目**

* [sumMap](../reference/summap.md)
