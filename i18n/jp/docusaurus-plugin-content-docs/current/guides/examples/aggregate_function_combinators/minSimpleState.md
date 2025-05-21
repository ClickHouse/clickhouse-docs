---
slug: '/examples/aggregate-function-combinators/minSimpleState'
title: 'minSimpleState'
description: 'minSimpleState コンビネータの使用例'
keywords: ['min', 'state', 'simple', 'combinator', 'examples', 'minSimpleState']
sidebar_label: 'minSimpleState'
---


# minSimpleState {#minsimplestate}

## 説明 {#description}

[`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) コンビネータは、[`min`](/sql-reference/aggregate-functions/reference/min) 関数に適用でき、すべての入力値の中から最小値を返します。返される結果の型は、[`SimpleAggregateFunction`](/docs/sql-reference/data-types/simpleaggregatefunction) です。

## 使用例 {#example-usage}

毎日の温度測定を追跡するテーブルを使用した実践的な例を見てみましょう。各場所について、記録された最低温度を維持したいと考えています。`min` とともに `SimpleAggregateFunction` 型を使用すると、低い温度が遇ったときに自動的に保存された値が更新されます。

生の温度測定のソーステーブルを作成します：

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

最小温度を保存する集約テーブルを作成します：

```sql
CREATE TABLE temperature_extremes
(
    location_id UInt32,
    location_name String,
    min_temp SimpleAggregateFunction(min, Int32),  -- 最小温度を保存
    max_temp SimpleAggregateFunction(max, Int32)   -- 最大温度を保存
)
ENGINE = AggregatingMergeTree()
ORDER BY location_id;
```

挿入されたデータのためのトリガーとして機能し、各場所の最小、最大温度を維持する増分マテリアライズドビュを作成します。

```sql
CREATE MATERIALIZED VIEW temperature_extremes_mv
TO temperature_extremes
AS SELECT
    location_id,
    location_name,
    minSimpleState(temperature) AS min_temp,     -- SimpleState コンビネータを使用
    maxSimpleState(temperature) AS max_temp      -- SimpleState コンビネータを使用
FROM raw_temperature_readings
GROUP BY location_id, location_name;
```

最初の温度測定値を挿入します：

```sql
INSERT INTO raw_temperature_readings (location_id, location_name, temperature) VALUES
(1, 'North', 5),
(2, 'South', 15),
(3, 'West', 10),
(4, 'East', 8);
```

これらの測定値は、マテリアライズドビュによって自動的に処理されます。現在の状態を確認します：

```sql
SELECT
    location_id,
    location_name,
    min_temp,     -- SimpleAggregateFunction 値に直接アクセス
    max_temp      -- SimpleAggregateFunction ではファイナライゼーション関数は不要
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

さらにデータを挿入します：

```sql
INSERT INTO raw_temperature_readings (location_id, location_name, temperature) VALUES
    (1, 'North', 3),
    (2, 'South', 18),
    (3, 'West', 10),
    (1, 'North', 8),
    (4, 'East', 2);
```

新しいデータの後に更新された極値を表示します：

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

上記のように、各場所に対して2つの挿入値があります。これは、パーツがまだマージされていないためです（`AggregatingMergeTree` によって集約されます）。部分的な状態から最終結果を得るためには、`GROUP BY` を追加する必要があります：

```sql
SELECT
    location_id,
    location_name,
    min(min_temp) AS min_temp,  -- すべてのパーツで集約 
    max(max_temp) AS max_temp   -- すべてのパーツで集約
FROM temperature_extremes
GROUP BY location_id, location_name
ORDER BY location_id;
```

期待通りの結果が得られます：

```sql
┌─location_id─┬─location_name─┬─min_temp─┬─max_temp─┐
│           1 │ North         │        3 │        8 │
│           2 │ South         │       15 │       18 │
│           3 │ West          │       10 │       10 │
│           4 │ East          │        2 │        8 │
└─────────────┴───────────────┴──────────┴──────────┘
```

:::note
`SimpleState` では、部分的な集計状態を結合するために `Merge` コンビネータを使用する必要はありません。
:::

## 参照 {#see-also}
- [`min`](/sql-reference/aggregate-functions/reference/min)
- [`SimpleState combinator`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [`SimpleAggregateFunction type`](/sql-reference/data-types/simpleaggregatefunction)
