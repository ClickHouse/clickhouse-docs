---
slug: /sql-reference/aggregate-functions/reference/summap
sidebar_position: 198
---

# sumMap

指定された `key` 配列のキーに従って `value` 配列の合計を計算します。ソートされたキーと、それぞれのキーに対して合計された値の2つの配列のタプルを返します。

**構文**

- `sumMap(key <Array>, value <Array>)` [配列型](../../data-types/array.md)。
- `sumMap(Tuple(key <Array>, value <Array>))` [タプル型](../../data-types/tuple.md)。

別名: `sumMappedArrays`.

**引数**

- `key`: [配列](../../data-types/array.md)のキー。
- `value`: [配列](../../data-types/array.md)の値。

キーと値の配列をタプルで渡すことは、キーの配列と値の配列を別々に渡すことと同義です。

:::note 
`key` と `value` の要素数は、合計される各行で同じでなければなりません。
:::

**返される値**

- ソートされた順序のキーと、それぞれのキーに対する合計値の2つの配列を含むタプルを返します。

**例**

まず、`sum_map` という名前のテーブルを作成し、そこにデータを挿入します。キーと値の配列は、[ネストデータ構造](../../data-types/nested-data-structures/index.md)型の `statusMap` というカラムとして別々に保存され、[タプル](../../data-types/tuple.md)型の `statusMapTuple` というカラムとして一緒に保存され、この関数の2つの異なる構文の使用を示します。

クエリ:

``` sql
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

次に、`sumMap` 関数を使用してテーブルをクエリし、配列型とタプル型の両方の構文を利用します：

クエリ:

``` sql
SELECT
    timeslot,
    sumMap(statusMap.status, statusMap.requests),
    sumMap(statusMapTuple)
FROM sum_map
GROUP BY timeslot
```

結果:

``` text
┌────────────timeslot─┬─sumMap(statusMap.status, statusMap.requests)─┬─sumMap(statusMapTuple)─────────┐
│ 2000-01-01 00:00:00 │ ([1,2,3,4,5],[10,10,20,10,10])               │ ([1,2,3,4,5],[10,10,20,10,10]) │
│ 2000-01-01 00:01:00 │ ([4,5,6,7,8],[10,10,20,10,10])               │ ([4,5,6,7,8],[10,10,20,10,10]) │
└─────────────────────┴──────────────────────────────────────────────┴────────────────────────────────┘
```

**関連情報**

- [Map データ型のためのマップコンビネータ](../combinators.md#-map)
- [sumMapWithOverflow](../reference/summapwithoverflow.md)
