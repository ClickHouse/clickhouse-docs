---
description: '`key` 配列で指定されたキーに従って、1 つ以上の `value` 配列を集計します。ソートされたキーの配列と、それぞれのキーに対応する値をオーバーフローなしで合計した配列からなるタプルを返します。'
sidebar_position: 198
slug: /sql-reference/aggregate-functions/reference/summap
title: 'sumMap'
doc_type: 'reference'
---

# sumMap

`key` 配列で指定されたキーに従って、1 個以上の `value` 配列を合計します。返り値は配列のタプルであり、キーをソート順で格納した配列と、それぞれのキーに対応する値をオーバーフローしないように合計した配列が続きます。

**構文**

* `sumMap(key <Array>, value1 <Array>[, value2 <Array>, ...])` [Array 型](../../data-types/array.md)。
* `sumMap(Tuple(key <Array>[, value1 <Array>, value2 <Array>, ...]))` [Tuple 型](../../data-types/tuple.md)。

エイリアス: `sumMappedArrays`。

**引数**

* `key`: キーの [Array](../../data-types/array.md)。
* `value1`, `value2`, ...: 各キーごとに合計する値の [Array](../../data-types/array.md)。

キー配列と値配列からなるタプルを渡すことは、キーの配列と値の配列を個別に渡すことと同じ意味になります。

:::note
集計される各行について、`key` とすべての `value` 配列内の要素数は同一でなければなりません。
:::

**戻り値**

* 配列のタプルを返します。最初の配列にはソート順のキーが含まれ、その後に、対応するキーごとに合計された値を含む配列が続きます。

**例**

まず `sum_map` というテーブルを作成し、いくつかのデータを挿入します。キーと値の配列は、それぞれ [Nested](../../data-types/nested-data-structures/index.md) 型の `statusMap` というカラムに個別に格納されるほか、それらをまとめて [tuple](../../data-types/tuple.md) 型の `statusMapTuple` というカラムにも格納します。これは、上で説明したこの関数の 2 種類の構文の使い方を示すためです。

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

次に、`sumMap` 関数を使ってテーブルにクエリを実行し、配列型およびタプル型の両方の構文を使用します。

クエリ：

```sql
SELECT
    timeslot,
    sumMap(statusMap.status, statusMap.requests),
    sumMap(statusMapTuple)
FROM sum_map
GROUP BY timeslot
```

結果：

```text
┌────────────timeslot─┬─sumMap(statusMap.status, statusMap.requests)─┬─sumMap(statusMapTuple)─────────┐
│ 2000-01-01 00:00:00 │ ([1,2,3,4,5],[10,10,20,10,10])               │ ([1,2,3,4,5],[10,10,20,10,10]) │
│ 2000-01-01 00:01:00 │ ([4,5,6,7,8],[10,10,20,10,10])               │ ([4,5,6,7,8],[10,10,20,10,10]) │
└─────────────────────┴──────────────────────────────────────────────┴────────────────────────────────┘
```

**複数の値配列を集約する例**

`sumMap` は、複数の値配列を同時に集約することもできます。
これは、共通のキーを持つ関連メトリクスがある場合に便利です。


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

この例では、次のようになります。

* 結果タプルには 3 つの配列が含まれます
* 1 番目の配列: ソート順に並んだキー（ブラウザー名）
* 2 番目の配列: 各ブラウザーの合計インプレッション数
* 3 番目の配列: 各ブラウザーの合計クリック数

**関連項目**

* [Map データ型向けの Map コンビネータ](../combinators.md#-map)
* [sumMapWithOverflow](../reference/summapwithoverflow.md)
