---
'slug': '/examples/aggregate-function-combinators/minSimpleState'
'title': 'minSimpleState'
'description': 'minSimpleState コマンビネーターを使用する例'
'keywords':
- 'min'
- 'state'
- 'simple'
- 'combinator'
- 'examples'
- 'minSimpleState'
'sidebar_label': 'minSimpleState'
'doc_type': 'reference'
---


# minSimpleState {#minsimplestate}

## 説明 {#description}

[`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) コンビネータは、[`min`](/sql-reference/aggregate-functions/reference/min) 関数に適用でき、すべての入力値の中で最小値を返します。結果は [`SimpleAggregateFunction`](/docs/sql-reference/data-types/simpleaggregatefunction) 型で返されます。

## 使用例 {#example-usage}

日々の温度測定値を追跡するテーブルを使用した実用的な例を見てみましょう。各ロケーションについて、記録された最低温度を維持したいと考えています。`min` を使用した `SimpleAggregateFunction` 型は、より低い温度が記録されると、自動的に格納された値を更新します。

生の温度測定値用のソーステーブルを作成します：

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

最低温度を格納する集約テーブルを作成します：

```sql
CREATE TABLE temperature_extremes
(
    location_id UInt32,
    location_name String,
    min_temp SimpleAggregateFunction(min, Int32),  -- Stores minimum temperature
    max_temp SimpleAggregateFunction(max, Int32)   -- Stores maximum temperature
)
ENGINE = AggregatingMergeTree()
ORDER BY location_id;
```

挿入されたデータのトリガーとして機能し、各ロケーションごとの最低および最高温度を維持する増分マテリアライズドビューを作成します。

```sql
CREATE MATERIALIZED VIEW temperature_extremes_mv
TO temperature_extremes
AS SELECT
    location_id,
    location_name,
    minSimpleState(temperature) AS min_temp,     -- Using SimpleState combinator
    maxSimpleState(temperature) AS max_temp      -- Using SimpleState combinator
FROM raw_temperature_readings
GROUP BY location_id, location_name;
```

初期の温度測定値を挿入します：

```sql
INSERT INTO raw_temperature_readings (location_id, location_name, temperature) VALUES
(1, 'North', 5),
(2, 'South', 15),
(3, 'West', 10),
(4, 'East', 8);
```

これらの測定値は自動的にマテリアライズドビューによって処理されます。現在の状態を確認してみましょう：

```sql
SELECT
    location_id,
    location_name,
    min_temp,     -- Directly accessing the SimpleAggregateFunction values
    max_temp      -- No need for finalization function with SimpleAggregateFunction
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

上記のように、各ロケーションに2つの挿入値があります。これは、パーツがまだマージ（および `AggregatingMergeTree` によって集約）されていないためです。部分的な状態から最終結果を取得するためには、`GROUP BY` を追加する必要があります：

```sql
SELECT
    location_id,
    location_name,
    min(min_temp) AS min_temp,  -- Aggregate across all parts 
    max(max_temp) AS max_temp   -- Aggregate across all parts
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
`SimpleState` を使用すると、部分的な集計状態を結合するために `Merge` コンビネータを使用する必要はありません。
:::

## 関連項目 {#see-also}
- [`min`](/sql-reference/aggregate-functions/reference/min)
- [`SimpleState combinator`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [`SimpleAggregateFunction type`](/sql-reference/data-types/simpleaggregatefunction)
