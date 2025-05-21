---
description: '指定された `key` 配列に従って `value` 配列の合計を求めます。オーバーフローなく対応するキーの合計値を持つ、ソートされた順序のキーと二つの配列のタプルを返します。'
sidebar_position: 198
slug: /sql-reference/aggregate-functions/reference/summap
title: 'sumMap'
---


# sumMap

指定された `key` 配列に従って `value` 配列の合計を求めます。オーバーフローなく対応するキーの合計値を持つ、ソートされた順序のキーと二つの配列のタプルを返します。

**構文**

- `sumMap(key <Array>, value <Array>)` [Array type](../../data-types/array.md).
- `sumMap(Tuple(key <Array>, value <Array>))` [Tuple type](../../data-types/tuple.md).

エイリアス: `sumMappedArrays`.

**引数**

- `key`: [Array](../../data-types/array.md) のキー。
- `value`: [Array](../../data-types/array.md) の値。

キーと値の配列のタプルを渡すことは、キーの配列と値の配列を別々に渡すことの同義語です。

:::note 
`key` と `value` の要素数は、合計される各行について同じである必要があります。
:::

**返される値**

- ソートされた順序のキーと、対応するキーの合計値を持つ二つの配列のタプルを返します。

**例**

最初に `sum_map` という名前のテーブルを作成し、データを挿入します。キーと値の配列は、[Nested](../../data-types/nested-data-structures/index.md) 型のカラム `statusMap` として別々に保存され、[tuple](../../data-types/tuple.md) 型のカラム `statusMapTuple` として一緒に保存され、上記で説明したこの関数の二つの異なる構文の使用を示します。

クエリ:

```sql
CREATE TABLE sum_map(
    date Date,
    timeslot DateTime,
    statusMap Nested(
        status UInt16,
        requests UInt64
    ),
    statusMapTuple Tuple(Array(Int32), Array(Int32))
) ENGINE = Log;
```
```sql
INSERT INTO sum_map VALUES
    ('2000-01-01', '2000-01-01 00:00:00', [1, 2, 3], [10, 10, 10], ([1, 2, 3], [10, 10, 10])),
    ('2000-01-01', '2000-01-01 00:00:00', [3, 4, 5], [10, 10, 10], ([3, 4, 5], [10, 10, 10])),
    ('2000-01-01', '2000-01-01 00:01:00', [4, 5, 6], [10, 10, 10], ([4, 5, 6], [10, 10, 10])),
    ('2000-01-01', '2000-01-01 00:01:00', [6, 7, 8], [10, 10, 10], ([6, 7, 8], [10, 10, 10]));
```

次に、`sumMap` 関数を使用してテーブルをクエリし、配列とタプル型の構文の両方を利用します。

クエリ:

```sql
SELECT
    timeslot,
    sumMap(statusMap.status, statusMap.requests),
    sumMap(statusMapTuple)
FROM sum_map
GROUP BY timeslot
```

結果:

```text
┌────────────timeslot─┬─sumMap(statusMap.status, statusMap.requests)─┬─sumMap(statusMapTuple)─────────┐
│ 2000-01-01 00:00:00 │ ([1,2,3,4,5],[10,10,20,10,10])               │ ([1,2,3,4,5],[10,10,20,10,10]) │
│ 2000-01-01 00:01:00 │ ([4,5,6,7,8],[10,10,20,10,10])               │ ([4,5,6,7,8],[10,10,20,10,10]) │
└─────────────────────┴──────────────────────────────────────────────┴────────────────────────────────┘
```

**関連情報**

- [Map データ型のための Map コンビネータ](../combinators.md#-map)
- [sumMapWithOverflow](../reference/summapwithoverflow.md)
