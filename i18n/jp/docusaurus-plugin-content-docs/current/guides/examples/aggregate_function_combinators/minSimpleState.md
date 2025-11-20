---
slug: '/examples/aggregate-function-combinators/minSimpleState'
title: 'minSimpleState'
description: 'minSimpleState コンビネーターの使用例'
keywords: ['min', 'state', 'simple', 'combinator', 'examples', 'minSimpleState']
sidebar_label: 'minSimpleState'
doc_type: 'reference'
---



# minSimpleState {#minsimplestate}


## 説明 {#description}

[`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate)コンビネータを[`min`](/sql-reference/aggregate-functions/reference/min)関数に適用することで、すべての入力値における最小値を返すことができます。結果は[`SimpleAggregateFunction`](/docs/sql-reference/data-types/simpleaggregatefunction)型として返されます。


## 使用例 {#example-usage}

日々の気温測定値を記録するテーブルを使った実用的な例を見てみましょう。各地点について、記録された最低気温を保持したいとします。
`SimpleAggregateFunction`型を`min`と共に使用すると、より低い気温が検出された際に保存された値が自動的に更新されます。

生の気温測定値用のソーステーブルを作成します:

```sql
CREATE TABLE raw_temperature_readings
(
    location_id UInt32,
    location_name String,
    temperature Int32,
    recorded_at DateTime DEFAULT now()
)
    ENGINE = MergeTree()
ORDER BY (location_id, recorded_at);
```

最低気温を保存する集約テーブルを作成します:

```sql
CREATE TABLE temperature_extremes
(
    location_id UInt32,
    location_name String,
    min_temp SimpleAggregateFunction(min, Int32),  -- 最低気温を保存
    max_temp SimpleAggregateFunction(max, Int32)   -- 最高気温を保存
)
ENGINE = AggregatingMergeTree()
ORDER BY location_id;
```

挿入されたデータに対する挿入トリガーとして機能し、地点ごとの最低気温と最高気温を維持する増分マテリアライズドビューを作成します。

```sql
CREATE MATERIALIZED VIEW temperature_extremes_mv
TO temperature_extremes
AS SELECT
    location_id,
    location_name,
    minSimpleState(temperature) AS min_temp,     -- SimpleStateコンビネータを使用
    maxSimpleState(temperature) AS max_temp      -- SimpleStateコンビネータを使用
FROM raw_temperature_readings
GROUP BY location_id, location_name;
```

初期の気温測定値をいくつか挿入します:

```sql
INSERT INTO raw_temperature_readings (location_id, location_name, temperature) VALUES
(1, 'North', 5),
(2, 'South', 15),
(3, 'West', 10),
(4, 'East', 8);
```

これらの測定値はマテリアライズドビューによって自動的に処理されます。現在の状態を確認してみましょう:

```sql
SELECT
    location_id,
    location_name,
    min_temp,     -- SimpleAggregateFunction値に直接アクセス
    max_temp      -- SimpleAggregateFunctionでは終了関数は不要
FROM temperature_extremes
ORDER BY location_id;
```

```response
┌─location_id─┬─location_name─┬─min_temp─┬─max_temp─┐
│           1 │ North         │        5 │        5 │
│           2 │ South         │       15 │       15 │
│           3 │ West          │       10 │       10 │
│           4 │ East          │        8 │        8 │
└─────────────┴───────────────┴──────────┴──────────┘
```

さらにデータを挿入します:

```sql
INSERT INTO raw_temperature_readings (location_id, location_name, temperature) VALUES
    (1, 'North', 3),
    (2, 'South', 18),
    (3, 'West', 10),
    (1, 'North', 8),
    (4, 'East', 2);
```

新しいデータ投入後の更新された極値を表示します:

```sql
SELECT
    location_id,
    location_name,
    min_temp,
    max_temp
FROM temperature_extremes
ORDER BY location_id;
```

```response
┌─location_id─┬─location_name─┬─min_temp─┬─max_temp─┐
│           1 │ North         │        3 │        8 │
│           1 │ North         │        5 │        5 │
│           2 │ South         │       18 │       18 │
│           2 │ South         │       15 │       15 │
│           3 │ West          │       10 │       10 │
│           3 │ West          │       10 │       10 │
│           4 │ East          │        2 │        2 │
│           4 │ East          │        8 │        8 │
└─────────────┴───────────────┴──────────┴──────────┘
```

上記では各地点に対して2つの挿入値があることに注意してください。これは、パーツがまだマージされていない(そして`AggregatingMergeTree`によって集約されていない)ためです。部分的な状態から最終結果を取得するには、`GROUP BY`を追加する必要があります:

```sql
SELECT
    location_id,
    location_name,
    min(min_temp) AS min_temp,  -- すべてのパーツにわたって集約
    max(max_temp) AS max_temp   -- すべてのパーツにわたって集約
FROM temperature_extremes
GROUP BY location_id, location_name
ORDER BY location_id;
```

これで期待される結果が得られます:


```sql
┌─location_id─┬─location_name─┬─min_temp─┬─max_temp─┐
│           1 │ 北         │        3 │        8 │
│           2 │ 南         │       15 │       18 │
│           3 │ 西          │       10 │       10 │
│           4 │ 東          │        2 │        8 │
└─────────────┴───────────────┴──────────┴──────────┘
```

:::note
`SimpleState` を使用すると、部分集計状態を結合するために `Merge` コンビネータを使う必要はありません。
:::


## 関連項目 {#see-also}

- [`min`](/sql-reference/aggregate-functions/reference/min)
- [`SimpleState combinator`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [`SimpleAggregateFunction type`](/sql-reference/data-types/simpleaggregatefunction)
