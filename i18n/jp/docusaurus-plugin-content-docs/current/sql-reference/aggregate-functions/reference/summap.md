---
description: '`key` 配列で指定されたキーに従って、1つ以上の `value` 配列を集計します。キーをソート順に並べた配列と、それぞれのキーに対応する値をオーバーフローなしで合計した配列から成るタプルを返します。'
sidebar_position: 198
slug: /sql-reference/aggregate-functions/reference/summap
title: 'sumMap'
doc_type: 'reference'
---

# sumMap

`key` 配列で指定されたキーに従って、1 つ以上の `value` 配列を合計します。ソート済みのキー配列と、それぞれのキーに対応する値をオーバーフローなしで合計した配列からなるタプルを返します。

**構文**

* `sumMap(key <Array>, value1 <Array>[, value2 <Array>, ...])` [Array 型](../../data-types/array.md)。
* `sumMap(Tuple(key <Array>[, value1 <Array>, value2 <Array>, ...]))` [Tuple 型](../../data-types/tuple.md)。

エイリアス: `sumMappedArrays`。

**引数**

* `key`: キーの [Array](../../data-types/array.md)。
* `value1`, `value2`, ...: 各キーごとに合計する値の [Array](../../data-types/array.md)。

キー配列と値配列からなるタプルを渡すことは、キー配列と値配列を個別に渡すことと同義です。

:::note
合計対象となる各行において、`key` とすべての `value` 配列の要素数は同じでなければなりません。
:::

**戻り値**

* 配列のタプルを返します。最初の配列にはソート済みのキーが含まれ、それに続く配列にはそれぞれ対応するキーごとに合計された値が含まれます。

**例**

まず `sum_map` というテーブルを作成し、いくつかのデータを挿入します。キーと値の配列は [Nested](../../data-types/nested-data-structures/index.md) 型の `statusMap` という列として個別に保存されており、上で説明したこの関数の 2 つの異なる構文の利用例を示すために、それらをまとめた [Tuple](../../data-types/tuple.md) 型の `statusMapTuple` という列としても保存されています。

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

次に、`sumMap` 関数を使用してテーブルにクエリを実行し、配列型とタプル型の両方の構文を利用します。

クエリ:

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

**複数の値配列を扱う例**

`sumMap` は、複数の値配列を一度に集約することもできます。
これは、同じキーを共有する関連するメトリクスがある場合に有用です。


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

* 結果のタプルには 3 つの配列が含まれます
* 1 つ目の配列: ソート済みのキー（ブラウザー名）
* 2 つ目の配列: 各ブラウザーの合計インプレッション数
* 3 つ目の配列: 各ブラウザーの合計クリック数

**関連項目**

* [Map データ型向けの Map コンビネーター](../combinators.md#-map)
* [sumMapWithOverflow](../reference/summapwithoverflow.md)
