---
'description': '指定された `key` 配列のキーに従って、1つ以上の `value` 配列の合計を計算します。結果は、ソートされた順序のキーのタプルと、それに対応するキーの合計値をオーバーフローなしで続きます。'
'sidebar_position': 198
'slug': '/sql-reference/aggregate-functions/reference/summap'
'title': 'sumMap'
'doc_type': 'reference'
---


# sumMap

指定された `key` 配列のキーに従って、1つ以上の `value` 配列を合計します。ソートされた順序のキーと、対応するキーに対して合計された値の配列のタプルを返します、オーバーフローなく。

**構文**

- `sumMap(key <Array>, value1 <Array>[, value2 <Array>, ...])` [Array type](../../data-types/array.md).
- `sumMap(Tuple(key <Array>[, value1 <Array>, value2 <Array>, ...]))` [Tuple type](../../data-types/tuple.md).

エイリアス: `sumMappedArrays`.

**引数** 

- `key`: [Array](../../data-types/array.md) 型のキーの配列。
- `value1`, `value2`, ...: 各キーに対して合計される [Array](../../data-types/array.md) 型の値の配列。

キーと値の配列のタプルを渡すことは、キーの配列と値の配列を別々に渡すことの同義語です。

:::note 
合計される各行について、`key` とすべての `value` 配列の要素数は同じでなければなりません。
:::

**返される値** 

- タプルの配列を返します: 最初の配列はソートされた順序のキーを含み、その後に対応するキーに対して合計された値を含む配列が続きます。

**例**

まず、`sum_map` という名のテーブルを作成し、いくつかのデータを挿入します。キーと値の配列がそれぞれ [Nested](../../data-types/nested-data-structures/index.md) 型の `statusMap` というカラムに、タプル型の `statusMapTuple` というカラムに一緒に保存され、上記の2つの異なる構文の使用例を示します。

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

次に、`sumMap` 関数を使用してテーブルをクエリし、配列およびタプル型の構文の両方を利用します:

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

**複数の値配列を使用した例**

`sumMap` は複数の値配列を同時に集約することもサポートしています。
これは、同じキーを共有する関連するメトリックを持っている場合に便利です。

```sql title="Query"
CREATE TABLE multi_metrics(
    date Date,
    browser_metrics Nested(
        browser String,
        impressions UInt32,
        clicks UInt32
    )
)
ENGINE = MergeTree()
ORDER BY tuple();

INSERT INTO multi_metrics VALUES
    ('2000-01-01', ['Firefox', 'Chrome'], [100, 200], [10, 25]),
    ('2000-01-01', ['Chrome', 'Safari'], [150, 50], [20, 5]),
    ('2000-01-01', ['Firefox', 'Edge'], [80, 40], [8, 4]);

SELECT 
    sumMap(browser_metrics.browser, browser_metrics.impressions, browser_metrics.clicks) AS result
FROM multi_metrics;
```

```text title="Response"
┌─result────────────────────────────────────────────────────────────────────────┐
│ (['Chrome', 'Edge', 'Firefox', 'Safari'], [350, 40, 180, 50], [45, 4, 18, 5]) │
└───────────────────────────────────────────────────────────────────────────────┘
```

この例では:
- 結果のタプルは3つの配列を含んでいます
- 最初の配列: ソートされた順序のキー（ブラウザ名）
- 2番目の配列: 各ブラウザの合計インプレッション
- 3番目の配列: 各ブラウザの合計クリック

**関連情報**

- [Map combinator for Map datatype](../combinators.md#-map)
- [sumMapWithOverflow](../reference/summapwithoverflow.md)
