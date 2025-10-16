---
'description': '指定された `key` 配列のキーに従って `value` 配列の合計を計算します。ソートされた順序のキーと、対応するキーの合計値から成る二つの配列のタプルを返します。sumMap
  関数とは異なり、オーバーフローを伴う合計を行います。'
'sidebar_position': 199
'slug': '/sql-reference/aggregate-functions/reference/summapwithoverflow'
'title': 'sumMapWithOverflow'
'doc_type': 'reference'
---


# sumMapWithOverflow

`value` の配列を `key` の配列で指定されたキーに基づいて合計します。ソートされた順序のキーと、対応するキーの合計値からなる二つの配列のタプルを返します。
これは [sumMap](../reference/summap.md) 関数とは異なり、オーバーフローを伴って合計を行います。つまり、合計のデータ型は引数のデータ型と同じになります。

**構文**

- `sumMapWithOverflow(key <Array>, value <Array>)` [Array type](../../data-types/array.md).
- `sumMapWithOverflow(Tuple(key <Array>, value <Array>))` [Tuple type](../../data-types/tuple.md).

**引数** 

- `key`: キーの [Array](../../data-types/array.md)。
- `value`: 値の [Array](../../data-types/array.md)。

キーと値の配列のタプルを渡すことは、キーの配列と値の配列を個別に渡すのと同義です。

:::note 
合計を求める各行に対して `key` と `value` の要素数は同じでなければなりません。
:::

**戻り値** 

- ソートされた順序のキーと、対応するキーの合計値からなる二つの配列のタプルを返します。

**例**

まず、`sum_map` という名前のテーブルを作成し、その中にいくつかのデータを挿入します。キーと値の配列は、[Nested](../../data-types/nested-data-structures/index.md) 型の `statusMap` というカラムとして別々に格納され、両者を合わせたものは [tuple](../../data-types/tuple.md) 型の `statusMapTuple` というカラムとして示され、上記の二つの異なる構文の使用例を示します。

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

`sumMap` および `sumMapWithOverflow` を配列型構文、さらに `toTypeName` 関数を使用してテーブルをクエリすると、`sumMapWithOverflow` 関数の合計値配列のデータ型は引数の型と同じで、どちらも `UInt8` であることが分かります（つまり、オーバーフローを伴って合計が行われた）。`sumMap` では、合計値の配列のデータ型は `UInt8` から `UInt64` に変更され、オーバーフローが発生しないようになっています。

クエリ:

```sql
SELECT
    timeslot,
    toTypeName(sumMap(statusMap.status, statusMap.requests)),
    toTypeName(sumMapWithOverflow(statusMap.status, statusMap.requests)),
FROM sum_map
GROUP BY timeslot
```

同等の結果を得るためにタプル構文を使用することもできます。

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
