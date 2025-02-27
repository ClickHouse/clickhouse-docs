---
slug: /sql-reference/aggregate-functions/reference/summapwithoverflow
sidebar_position: 199
---

# sumMapWithOverflow

`value` 配列を `key` 配列で指定されたキーに従って合計します。ソートされた順序のキーと、それに対応する値の合計を含む2つの配列のタプルを返します。
これは、合計のデータ型が引数のデータ型と同じであるため、オーバーフローのある合計を行う点で [sumMap](../reference/summap.md) 関数とは異なります。

**構文**

- `sumMapWithOverflow(key <Array>, value <Array>)` [Array type](../../data-types/array.md)。
- `sumMapWithOverflow(Tuple(key <Array>, value <Array>))` [Tuple type](../../data-types/tuple.md)。

**引数**

- `key`: キーの [Array](../../data-types/array.md)。
- `value`: 値の [Array](../../data-types/array.md)。

キーと値の配列のタプルを渡すことは、キーの配列と値の配列を別々に渡すことの同義です。

:::note 
合計される各行において、`key` と `value` の要素数は同じでなければなりません。
:::

**返される値**

- ソートされた順序のキーと、それに対応するキーの合計された値を含む2つの配列のタプルを返します。

**例**

まず `sum_map` という名前のテーブルを作成し、データを挿入します。キーと値の配列は、それぞれ [Nested](../../data-types/nested-data-structures/index.md) 型の `statusMap` というカラムに、また [tuple](../../data-types/tuple.md) 型の `statusMapTuple` というカラムに格納され、上記で説明した2つの異なる構文の使用例を示します。

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

テーブルを `sumMap` と `sumMapWithOverflow` の配列タイプ構文を使って、そして `toTypeName` 関数を使用してクエリすると、`sumMapWithOverflow` 関数に対して合計値の配列のデータ型が引数の型と同じであることがわかります。どちらも `UInt8` であり、つまり合計はオーバーフローで行われました。`sumMap` では、合計値の配列のデータ型が `UInt8` から `UInt64` に変わり、オーバーフローが発生しないようになります。

クエリ:

``` sql
SELECT
    timeslot,
    toTypeName(sumMap(statusMap.status, statusMap.requests)),
    toTypeName(sumMapWithOverflow(statusMap.status, statusMap.requests)),
FROM sum_map
GROUP BY timeslot
```

同様に、タプル構文を使って同じ結果を得ることもできます。

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

**参照**

- [sumMap](../reference/summap.md)
