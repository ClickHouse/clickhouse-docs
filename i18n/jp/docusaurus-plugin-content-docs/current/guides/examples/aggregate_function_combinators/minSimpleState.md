---
slug: '/examples/aggregate-function-combinators/minSimpleState'
title: 'minSimpleState'
description: 'minSimpleState combinator の使用例'
keywords:
- 'min'
- 'state'
- 'simple'
- 'combinator'
- 'examples'
- 'minSimpleState'
sidebar_label: 'minSimpleState'
---





# minSimpleState {#minsimplestate}

## 説明 {#description}

[`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) コンビネーターは、[`min`](/sql-reference/aggregate-functions/reference/min) 関数に適用され、すべての入力値の中で最小値を返します。結果は [`SimpleAggregateFunction`](/sql-reference/data-types/simpleaggregatefunction) 型で返されます。

## 使用例 {#example-usage}

日々の温度測定を追跡するテーブルを使用した実用的な例を見てみましょう。各場所の記録された最低温度を維持したいと思います。`SimpleAggregateFunction` 型を `min` と共に使用すると、より低い温度が記録されると自動的に保存された値が更新されます。

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

最小温度を格納する集計テーブルを作成します：

```sql
CREATE TABLE temperature_extremes
(
    location_id UInt32,
    location_name String,
    min_temp SimpleAggregateFunction(min, Int32),  -- 最小温度を格納
    max_temp SimpleAggregateFunction(max, Int32)   -- 最大温度を格納
)
ENGINE = AggregatingMergeTree()
ORDER BY location_id;
```

挿入されたデータのトリガーとして機能し、各場所の最小および最大温度を維持するインクリメンタルマテリアライズドビューを作成します。

```sql
CREATE MATERIALIZED VIEW temperature_extremes_mv
TO temperature_extremes
AS SELECT
    location_id,
    location_name,
    minSimpleState(temperature) AS min_temp,     -- SimpleState コンビネーターを使用
    maxSimpleState(temperature) AS max_temp      -- SimpleState コンビネーターを使用
FROM raw_temperature_readings
GROUP BY location_id, location_name;
```

初期の温度測定を挿入します：

```sql
INSERT INTO raw_temperature_readings (location_id, location_name, temperature) VALUES
(1, 'North', 5),
(2, 'South', 15),
(3, 'West', 10),
(4, 'East', 8);
```

これらの測定はマテリアライズドビューによって自動的に処理されます。現在の状態を確認しましょう：

```sql
SELECT
    location_id,
    location_name,
    min_temp,     -- SimpleAggregateFunction の値に直接アクセス
    max_temp      -- SimpleAggregateFunction にはファイナライズ関数は不要
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

データをさらに挿入します：

```sql
INSERT INTO raw_temperature_readings (location_id, location_name, temperature) VALUES
    (1, 'North', 3),
    (2, 'South', 18),
    (3, 'West', 10),
    (1, 'North', 8),
    (4, 'East', 2);
```

新しいデータの後の更新された極値を表示します：

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

上記のように、各場所に対して2つの挿入値があることに注意してください。これは、パーツがまだマージされていない（`AggregatingMergeTree` によって集約されていない）ためです。部分状態から最終結果を得るには、`GROUP BY` を追加する必要があります：

```sql
SELECT
    location_id,
    location_name,
    min(min_temp) AS min_temp,  -- すべてのパーツを横断して集約
    max(max_temp) AS max_temp   -- すべてのパーツを横断して集約
FROM temperature_extremes
GROUP BY location_id, location_name
ORDER BY location_id;
```

期待される結果が得られます：

```sql
┌─location_id─┬─location_name─┬─min_temp─┬─max_temp─┐
│           1 │ North         │        3 │        8 │
│           2 │ South         │       15 │       18 │
│           3 │ West          │       10 │       10 │
│           4 │ East          │        2 │        8 │
└─────────────┴───────────────┴──────────┴──────────┘
```

:::note
`SimpleState` を使用すると、部分集計状態を結合するために `Merge` コンビネーターを使用する必要はありません。
:::

## 参照 {#see-also}
- [`min`](/sql-reference/aggregate-functions/reference/min)
- [`SimpleState コンビネーター`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [`SimpleAggregateFunction 型`](/sql-reference/data-types/simpleaggregatefunction)
