---
slug: '/examples/aggregate-function-combinators/minSimpleState'
title: 'minSimpleState'
description: 'minSimpleState コンビネータの使用例'
keywords: ['min', 'state', 'simple', 'combinator', 'examples', 'minSimpleState']
sidebar_label: 'minSimpleState'
doc_type: 'reference'
---



# minSimpleState {#minsimplestate}



## 説明 {#description}

[`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) コンビネータを [`min`](/sql-reference/aggregate-functions/reference/min)
関数に適用することで、すべての入力値の中での最小値を返すことができます。戻り値の型は
[`SimpleAggregateFunction`](/docs/sql-reference/data-types/simpleaggregatefunction) です。



## 使用例 {#example-usage}

日々の気温観測値を記録するテーブルを使った実用的な例を見てみます。各地点ごとに、記録された最低気温を保持したいとします。
`SimpleAggregateFunction` 型を `min` と合わせて使用すると、より低い気温が記録されたときに保存されている値が自動的に更新されます。

生の気温データを保存するためのソーステーブルを作成します：

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

最低気温を格納する集約テーブルを作成します：

```sql
CREATE TABLE temperature_extremes
(
    location_id UInt32,
    location_name String,
    min_temp SimpleAggregateFunction(min, Int32),  -- 最低気温を保持
    max_temp SimpleAggregateFunction(max, Int32)   -- 最高気温を保持
)
ENGINE = AggregatingMergeTree()
ORDER BY location_id;
```

挿入されたデータに対する INSERT トリガーとして機能し、各ロケーションごとの最小・最大温度を保持するインクリメンタルマテリアライズドビューを作成します。

```sql
CREATE MATERIALIZED VIEW temperature_extremes_mv
TO temperature_extremes
AS SELECT
    location_id,
    location_name,
    minSimpleState(temperature) AS min_temp,     -- SimpleState コンビネータを使用しています
    maxSimpleState(temperature) AS max_temp      -- SimpleState コンビネータを使用しています
FROM raw_temperature_readings
GROUP BY location_id, location_name;
```

初期の温度データをいくつか挿入します：

```sql
INSERT INTO raw_temperature_readings (location_id, location_name, temperature) VALUES
(1, '北', 5),
(2, '南', 15),
(3, '西', 10),
(4, '東', 8);
```

これらの値はマテリアライズドビューによって自動的に処理されます。現在の状態を確認してみましょう。

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
│           1 │ 北部          │        5 │        5 │
│           2 │ 南部          │       15 │       15 │
│           3 │ 西部          │       10 │       10 │
│           4 │ 東部          │        8 │        8 │
└─────────────┴───────────────┴──────────┴──────────┘
```

データをさらに挿入します：

```sql
INSERT INTO raw_temperature_readings (location_id, location_name, temperature) VALUES
    (1, '北', 3),
    (2, '南', 18),
    (3, '西', 10),
    (1, '北', 8),
    (4, '東', 2);
```

新しいデータを追加した後の最新の極値を表示：

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
│           1 │ 北部         │        3 │        8 │
│           1 │ 北部         │        5 │        5 │
│           2 │ 南部         │       18 │       18 │
│           2 │ 南部         │       15 │       15 │
│           3 │ 西部          │       10 │       10 │
│           3 │ 西部          │       10 │       10 │
│           4 │ 東部          │        2 │        2 │
│           4 │ 東部          │        8 │        8 │
└─────────────┴───────────────┴──────────┴──────────┘
```

上に示したように、各 location には 2 つの値が挿入されています。これは、
parts がまだマージされておらず（`AggregatingMergeTree` による集約も行われていない）ためです。部分状態から最終的な結果を得るには、`GROUP BY` を追加する必要があります。

```sql
SELECT
    location_id,
    location_name,
    min(min_temp) AS min_temp,  -- 全パートを集約 
    max(max_temp) AS max_temp   -- 全パートを集約
FROM temperature_extremes
GROUP BY location_id, location_name
ORDER BY location_id;
```

これで期待どおりの結果が得られました。


```sql
┌─location_id─┬─location_name─┬─min_temp─┬─max_temp─┐
│           1 │ 北部          │        3 │        8 │
│           2 │ 南部          │       15 │       18 │
│           3 │ 西部          │       10 │       10 │
│           4 │ 東部          │        2 │        8 │
└─────────────┴───────────────┴──────────┴──────────┘
```

:::note
`SimpleState` を使用すると、部分集計状態を結合するために `Merge` コンビネータを使う必要がなくなります。
:::


## 関連項目 {#see-also}
- [`min`](/sql-reference/aggregate-functions/reference/min)
- [`SimpleState combinator`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [`SimpleAggregateFunction type`](/sql-reference/data-types/simpleaggregatefunction)
