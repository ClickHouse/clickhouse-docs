---
'description': 'Totals a `value` array according to the keys specified in the `key`
  array. Returns a tuple of two arrays: keys in sorted order, and values summed for
  the corresponding keys. Differs from the sumMap function in that it does summation
  with overflow.'
'sidebar_position': 199
'slug': '/sql-reference/aggregate-functions/reference/summapwithoverflow'
'title': 'sumMapWithOverflow'
---




# sumMapWithOverflow

指定された `key` 配列に従って `value` 配列の合計を計算します。ソートされた順序のキーと、対応するキーの合計値の2つの配列のタプルを返します。
これは [sumMap](../reference/summap.md) 関数とは異なり、オーバーフローを伴う合計を行います。つまり、合計のデータ型は引数のデータ型と同じです。

**構文**

- `sumMapWithOverflow(key <Array>, value <Array>)` [Array type](../../data-types/array.md)。
- `sumMapWithOverflow(Tuple(key <Array>, value <Array>))` [Tuple type](../../data-types/tuple.md)。

**引数**

- `key`: [Array](../../data-types/array.md) 型のキー。
- `value`: [Array](../../data-types/array.md) 型の値。

キーと値の配列のタプルを渡すことは、鍵の配列と値の配列を別々に渡すことの同義です。

:::note 
`key` と `value` の要素数は、合計を取る各行で同じでなければなりません。
:::

**戻り値**

- ソートされた順序のキーと、対応するキーの合計値の2つの配列のタプルを返します。

**例**

まず、`sum_map` と呼ばれるテーブルを作成し、いくつかのデータを挿入します。キーと値の配列は、[Nested](../../data-types/nested-data-structures/index.md) 型の `statusMap` というカラムとして別々に保存され、2つの異なる構文の使用を示すために [tuple](../../data-types/tuple.md) 型の `statusMapTuple` というカラムとして一緒に保存されます。

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

テーブルを `sumMap` と `sumMapWithOverflow` の配列タイプ構文、および `toTypeName` 関数を使用してクエリすると、`sumMapWithOverflow` 関数の場合、合計値配列のデータ型が引数の型と同じであることがわかります。両方とも `UInt8` です（つまり、オーバーフローを伴う合計が行われました）。 `sumMap` に対しては、合計値のデータ型が `UInt8` から `UInt64` に変更され、オーバーフローが発生しないようになっています。 

クエリ:

```sql
SELECT
    timeslot,
    toTypeName(sumMap(statusMap.status, statusMap.requests)),
    toTypeName(sumMapWithOverflow(statusMap.status, statusMap.requests)),
FROM sum_map
GROUP BY timeslot
```

同じ結果を得るために、タプル構文を使用することもできます。

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
    
- [sumMap](../reference/summap.md)
