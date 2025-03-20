---
slug: /guides/developer/cascading-materialized-views
title: Cascading Materialized Views
description: ソーステーブルから複数のマテリアライズドビューを使用する方法。
keywords: [マテリアライズドビュー, 集約]
---


# Cascading Materialized Views

この例では、マテリアライズドビューを作成し、さらに二つ目のマテリアライズドビューを最初のビューに連鎖させる方法を示します。このページでは、どのように行うのか、さまざまな可能性、制限について見ることができます。異なるユースケースは、二つ目のマテリアライズドビューをソースとして使用して、マテリアライズドビューを作成することで対応できます。

<div style={{width:'640px', height: '360px'}}>
  <iframe src="//www.youtube.com/embed/QDAJTKZT8y4"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

<br />

例:

ドメイン名のグループごとに時間ごとの視聴数を持つ偽のデータセットを使用します。

私たちの目標

1. 各ドメイン名で月ごとの集約データが必要です。
2. 各ドメイン名で年ごとの集約データも必要です。

これらのオプションのいずれかを選択できます：

- SELECTリクエスト中にデータを読み取り、集約するクエリを書く
- 新しいフォーマットでデータを取り込むときに準備する
- 特定の集約のために取り込み時にデータを準備する。

マテリアライズドビューを使用してデータを準備することで、ClickHouseが処理するデータ量と計算量を制限でき、SELECTリクエストが高速化されます。

## マテリアライズドビューのソーステーブル {#source-table-for-the-materialized-views}

ソーステーブルを作成します。目標は個々の行ではなく集約データのレポートを行うことなので、それを解析し、マテリアライズドビューに情報を渡して、実際に受信したデータを破棄できます。これにより、目標が達成され、ストレージの節約になりますので、 `Null` テーブルエンジンを使用します。

```sql
CREATE DATABASE IF NOT EXISTS analytics;
```

```sql
CREATE TABLE analytics.hourly_data
(
    `domain_name` String,
    `event_time` DateTime,
    `count_views` UInt64
)
ENGINE = Null
```

:::note
Nullテーブル上にマテリアライズドビューを作成できます。テーブルに書き込まれたデータはビューに影響しますが、元の生データは破棄されます。
:::

## 月ごとの集約テーブルとマテリアライズドビュー {#monthly-aggregated-table-and-materialized-view}

最初のマテリアライズドビューのために、`Target` テーブルを作成します。この例では、それを `analytics.monthly_aggregated_data` とし、月ごととドメイン名ごとの視聴数の合計を保存します。

```sql
CREATE TABLE analytics.monthly_aggregated_data
(
    `domain_name` String,
    `month` Date,
    `sumCountViews` AggregateFunction(sum, UInt64)
)
ENGINE = AggregatingMergeTree
ORDER BY (domain_name, month)
```

ターゲットテーブルにデータを転送するマテリアライズドビューは次のようになります：

```sql
CREATE MATERIALIZED VIEW analytics.monthly_aggregated_data_mv
TO analytics.monthly_aggregated_data
AS
SELECT
    toDate(toStartOfMonth(event_time)) AS month,
    domain_name,
    sumState(count_views) AS sumCountViews
FROM analytics.hourly_data
GROUP BY
    domain_name,
    month
```

## 年ごとの集約テーブルとマテリアライズドビュー {#yearly-aggregated-table-and-materialized-view}

次に、以前のターゲットテーブル `monthly_aggregated_data` にリンクされた二つ目のマテリアライズドビューを作成します。

まず、各ドメイン名ごとの年ごとに集約された視聴数の合計を保存する新しいターゲットテーブルを作成します。

```sql
CREATE TABLE analytics.year_aggregated_data
(
    `domain_name` String,
    `year` UInt16,
    `sumCountViews` UInt64
)
ENGINE = SummingMergeTree()
ORDER BY (domain_name, year)
```

このステップが連鎖を定義します。`FROM` ステートメントは `monthly_aggregated_data` テーブルを使用します。つまり、データフローは次のようになります：

1. データが `hourly_data` テーブルに来ます。
2. ClickHouseは、最初のマテリアライズドビュー `monthly_aggregated_data` テーブルに受信したデータを転送します。
3. 最後に、ステップ2で受信したデータが `year_aggregated_data` に転送されます。

```sql
CREATE MATERIALIZED VIEW analytics.year_aggregated_data_mv
TO analytics.year_aggregated_data
AS
SELECT
    toYear(toStartOfYear(month)) AS year,
    domain_name,
    sumMerge(sumCountViews) as sumCountViews
FROM analytics.monthly_aggregated_data
GROUP BY
    domain_name,
    year
```

:::note
マテリアライズドビューを扱う際の一般的な誤解は、データがテーブルから読み込まれることです。これは `Materialized views` の動作ではありません。転送されるデータは挿入されたブロックであり、テーブル内の最終結果ではありません。

この例では、`monthly_aggregated_data` で使用されるエンジンが `CollapsingMergeTree` だと仮定すると、二つ目のマテリアライズドビュー `year_aggregated_data_mv` に転送されるデータは、圧縮されたテーブルの最終結果ではなく、`SELECT ... GROUP BY` で定義されたフィールドを持つデータブロックが転送されます。

`CollapsingMergeTree`、`ReplacingMergeTree`、または `SummingMergeTree` を使用している場合、連鎖マテリアライズドビューを作成する計画がある場合は、ここで説明されている制限を理解する必要があります。
:::

## サンプルデータ {#sample-data}

今こそ、データを挿入して連鎖エリートビューをテストする時です：

```sql
INSERT INTO analytics.hourly_data (domain_name, event_time, count_views)
VALUES ('clickhouse.com', '2019-01-01 10:00:00', 1),
       ('clickhouse.com', '2019-02-02 00:00:00', 2),
       ('clickhouse.com', '2019-02-01 00:00:00', 3),
       ('clickhouse.com', '2020-01-01 00:00:00', 6);
```

`analytics.hourly_data` の内容を SELECT すると、テーブルエンジンが `Null` なので、以下の結果が表示されますが、データは処理されています。

```sql
SELECT * FROM analytics.hourly_data
```

```response
Ok.

0 rows in set. Elapsed: 0.002 sec.
```

小さなデータセットを使用して、期待する結果と比較できるようにしました。フローが小さなデータセットで正しいことが確認できたら、大量のデータに移行できます。

## 結果 {#results}

`sumCountViews` フィールドを選択してターゲットテーブルをクエリすると、値は数値ではなく AggregateFunction タイプとして保存されるため、バイナリ表現（いくつかのターミナルで表示されることがあります）を確認することになります。
集約の最終結果を取得するには、`-Merge` サフィックスを使用する必要があります。

このクエリで AggregateFunction に保存されている特殊文字を確認できます：

```sql
SELECT sumCountViews FROM analytics.monthly_aggregated_data
```

```response
┌─sumCountViews─┐
│               │
│               │
│               │
└───────────────┘

3 rows in set. Elapsed: 0.003 sec.
```

その代わり、`Merge` サフィックスを使用して `sumCountViews` の値を取得してみましょう：

```sql
SELECT
   sumMerge(sumCountViews) as sumCountViews
FROM analytics.monthly_aggregated_data;
```

```response
┌─sumCountViews─┐
│            12 │
└───────────────┘

1 row in set. Elapsed: 0.003 sec.
```

`AggregatingMergeTree` では、`AggregateFunction` を `sum` と定義しているため、`sumMerge` を使用できます。`AggregateFunction` に対して `avg` 関数を使用する場合は、`avgMerge` を使用します。

```sql
SELECT
    month,
    domain_name,
    sumMerge(sumCountViews) as sumCountViews
FROM analytics.monthly_aggregated_data
GROUP BY
    domain_name,
    month
```

これで、マテリアライズドビューが我々の定義した目標に応えることができることを確認できます。

`monthly_aggregated_data` ターゲットテーブルにデータが保存されたので、各ドメイン名について月ごとに集約したデータを取得できます：

```sql
SELECT
   month,
   domain_name,
   sumMerge(sumCountViews) as sumCountViews
FROM analytics.monthly_aggregated_data
GROUP BY
   domain_name,
   month
```

```response
┌──────month─┬─domain_name────┬─sumCountViews─┐
│ 2020-01-01 │ clickhouse.com │             6 │
│ 2019-01-01 │ clickhouse.com │             1 │
│ 2019-02-01 │ clickhouse.com │             5 │
└────────────┴────────────────┴───────────────┘

3 rows in set. Elapsed: 0.004 sec.
```

各ドメイン名について年ごとに集約されたデータ：

```sql
SELECT
   year,
   domain_name,
   sum(sumCountViews)
FROM analytics.year_aggregated_data
GROUP BY
   domain_name,
   year
```

```response
┌─year─┬─domain_name────┬─sum(sumCountViews)─┐
│ 2019 │ clickhouse.com │                  6 │
│ 2020 │ clickhouse.com │                  6 │
└──────┴────────────────┴────────────────────┘

2 rows in set. Elapsed: 0.004 sec.
```


## 複数のソーステーブルを単一のターゲットテーブルに統合する {#combining-multiple-source-tables-to-single-target-table}

マテリアライズドビューは、複数のソーステーブルを同じ宛先テーブルに統合するためにも使用できます。これは、`UNION ALL` ロジックに似たマテリアライズドビューを作成するのに便利です。

まず、異なるメトリックセットを表す二つのソーステーブルを作成します：

```sql
CREATE TABLE analytics.impressions
(
    `event_time` DateTime,
    `domain_name` String
) ENGINE = MergeTree ORDER BY (domain_name, event_time)
;

CREATE TABLE analytics.clicks
(
    `event_time` DateTime,
    `domain_name` String
) ENGINE = MergeTree ORDER BY (domain_name, event_time)
;
```

次に、メトリックセットを統合した `Target` テーブルを作成します：

```sql
CREATE TABLE analytics.daily_overview
(
    `on_date` Date,
    `domain_name` String,
    `impressions` SimpleAggregateFunction(sum, UInt64),
    `clicks` SimpleAggregateFunction(sum, UInt64)
) ENGINE = AggregatingMergeTree ORDER BY (on_date, domain_name)
```

同じ `Target` テーブルを指す二つのマテリアライズドビューを作成します。欠落しているカラムを明示的に含める必要はありません：

```sql
CREATE MATERIALIZED VIEW analytics.daily_impressions_mv
TO analytics.daily_overview
AS                                                
SELECT
    toDate(event_time) AS on_date,
    domain_name,
    count() AS impressions,
    0 clicks         ---<<<--- これを省略すると、同じ0になります
FROM                                              
    analytics.impressions
GROUP BY
    toDate(event_time) AS on_date,
    domain_name
;

CREATE MATERIALIZED VIEW analytics.daily_clicks_mv
TO analytics.daily_overview
AS
SELECT
    toDate(event_time) AS on_date,
    domain_name,
    count() AS clicks,
    0 impressions    ---<<<--- これを省略すると、同じ0になります
FROM
    analytics.clicks
GROUP BY
    toDate(event_time) AS on_date,
    domain_name
;
```

値を挿入すると、それらの値は `Target` テーブルのそれぞれのカラムに集約されます：

```sql
INSERT INTO analytics.impressions (domain_name, event_time)
VALUES ('clickhouse.com', '2019-01-01 00:00:00'),
       ('clickhouse.com', '2019-01-01 12:00:00'),
       ('clickhouse.com', '2019-02-01 00:00:00'),
       ('clickhouse.com', '2019-03-01 00:00:00')
;

INSERT INTO analytics.clicks (domain_name, event_time)
VALUES ('clickhouse.com', '2019-01-01 00:00:00'),
       ('clickhouse.com', '2019-01-01 12:00:00'),
       ('clickhouse.com', '2019-03-01 00:00:00')
;
```

ターゲットテーブルに統合されたインプレッションとクリックのデータ：

```sql
SELECT
    on_date,
    domain_name,
    sum(impressions) AS impressions,
    sum(clicks) AS clicks
FROM
    analytics.daily_overview
GROUP BY
    on_date,
    domain_name
;
```

このクエリは以下のような出力を返すべきです：

```response
┌────on_date─┬─domain_name────┬─impressions─┬─clicks─┐
│ 2019-01-01 │ clickhouse.com │           2 │      2 │
│ 2019-03-01 │ clickhouse.com │           1 │      1 │
│ 2019-02-01 │ clickhouse.com │           1 │      0 │
└────────────┴────────────────┴─────────────┴────────┘

3 rows in set. Elapsed: 0.018 sec.
```
