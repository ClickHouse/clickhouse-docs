---
slug: '/guides/developer/cascading-materialized-views'
title: 'Cascading Materialized Views'
description: 'ソーステーブルから複数のマテリアライズドビューを使用する方法。'
keywords:
- 'materialized view'
- 'aggregation'
---




# カスケーディングマテリアライズドビュー

この例では、マテリアライズドビューを作成し、次に、最初のマテリアライズドビューにカスケードする2番目のマテリアライズドビューを作成する方法を示します。このページでは、その方法、さまざまな可能性、および制限について説明します。さまざまなユースケースは、2番目のマテリアライズドビューをソースとして使用して、マテリアライズドビューを作成することで対応できます。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/QDAJTKZT8y4?si=1KqPNHHfaKfxtPat" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

<br />

例:

ドメイン名のグループに対する1時間ごとのビュー数を持つ架空のデータセットを使用します。

私たちの目標

1. 各ドメイン名ごとに月ごとに集約されたデータが必要です。
2. 各ドメイン名ごとに年ごとに集約されたデータが必要です。

これらのオプションのいずれかを選ぶことができます：

- SELECTリクエスト中にデータを読み取って集約するクエリを書く
- データを新しい形式で取り込む時点で準備する
- 特定の集約に対してデータを取り込む時点で準備する。

マテリアライズドビューを使用してデータを準備することで、ClickHouseが実行する必要のあるデータと計算の量を制限でき、SELECTリクエストが高速化されます。

## マテリアライズドビューのソーステーブル {#source-table-for-the-materialized-views}

データを集約したものを報告することが目標であるため、個々の行ではなくソーステーブルを作成します。これにより、情報をマテリアライズドビューに渡し、実際の入力データを破棄することができます。これにより目標が達成され、ストレージの節約にもなりますので、`Null`テーブルエンジンを使用します。

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
Nullテーブルにマテリアライズドビューを作成できます。したがって、テーブルに書き込まれたデータはビューに影響しますが、元の生データは依然として破棄されます。
:::

## 月単位の集約テーブルとマテリアライズドビュー {#monthly-aggregated-table-and-materialized-view}

最初のマテリアライズドビューのために、`Target`テーブルを作成する必要があります。この例では、`analytics.monthly_aggregated_data`とし、月単位およびドメイン名ごとにビューの合計を保存します。

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

## 年単位の集約テーブルとマテリアライズドビュー {#yearly-aggregated-table-and-materialized-view}

次に、前のターゲットテーブル`monthly_aggregated_data`にリンクされた2番目のマテリアライズドビューを作成します。

まず、各ドメイン名ごとに年単位で集約されたビューの合計を保存する新しいターゲットテーブルを作成します。

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

このステップでカスケードが定義されます。`FROM`ステートメントは`monthly_aggregated_data`テーブルを使用します。これはデータのフローが次のようになることを意味します：

1. データが`hourly_data`テーブルに送られます。
2. ClickHouseは受信したデータを最初のマテリアライズドビュー`monthly_aggregated_data`テーブルに転送します。
3. 最後に、ステップ2で受信したデータが`year_aggregated_data`に転送されます。

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
マテリアライズドビューを操作する際の一般的な誤解は、データがテーブルから読み取られるというものです。`マテリアライズドビュー`は、挿入されたブロックのデータを転送するものであり、テーブル内の最終結果ではありません。

この例で`monthly_aggregated_data`に使用されるエンジンがCollapsingMergeTreeであると仮定すると、私たちの2番目のマテリアライズドビュー`year_aggregated_data_mv`に転送されるデータは、圧縮されたテーブルの最終結果ではなく、むしろ`SELECT ... GROUP BY`で定義されたフィールドを持つデータのブロックが転送されます。

CollapsingMergeTree、ReplacingMergeTree、またはSummingMergeTreeを使用している場合で、カスケードマテリアライズドビューを作成する予定がある場合は、ここで説明されている制限を理解する必要があります。
:::

## サンプルデータ {#sample-data}

今、データを挿入してカスケードマテリアライズドビューをテストする時が来ました：

```sql
INSERT INTO analytics.hourly_data (domain_name, event_time, count_views)
VALUES ('clickhouse.com', '2019-01-01 10:00:00', 1),
       ('clickhouse.com', '2019-02-02 00:00:00', 2),
       ('clickhouse.com', '2019-02-01 00:00:00', 3),
       ('clickhouse.com', '2020-01-01 00:00:00', 6);
```

`analytics.hourly_data`の内容をSELECTすると、テーブルエンジンが`Null`であるため、次のように表示されますが、データは処理されました。

```sql
SELECT * FROM analytics.hourly_data
```

```response
Ok.

0 rows in set. Elapsed: 0.002 sec.
```

小さなデータセットを使用しているため、結果を追跡し、期待されるものと比較できます。フローが小さなデータセットで正常であれば、大規模なデータに移動できます。

## 結果 {#results}

ターゲットテーブルで`sumCountViews`フィールドを選択してクエリを実行すると、バイナリ表現が表示されます（いくつかの端末では）。値が数としてではなく、AggregateFunction型として保存されているためです。集約の最終結果を取得するには、`-Merge`サフィックスを使用する必要があります。

このクエリでAggregateFunctionに保存されている特殊文字を確認できます：

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

代わりに、`Merge`サフィックスを使用して`sumCountViews`の値を取得してみます：

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

`AggregatingMergeTree`では`AggregateFunction`を`sum`として定義しましたので、`sumMerge`を使用できます。`AggregateFunction`の`avg`を使用するときは、`avgMerge`を使用します。

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

これで、マテリアライズドビューが定義した目標にきちんと応じていることが確認できます。

ターゲットテーブル`monthly_aggregated_data`にデータが保存されたので、各ドメイン名ごとに月単位で集約されたデータを取得できます：

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

年単位で各ドメイン名ごとに集約されたデータ：

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


## 複数のソーステーブルを単一のターゲットテーブルに結合する {#combining-multiple-source-tables-to-single-target-table}

マテリアライズドビューは、複数のソーステーブルを同じ宛先テーブルに結合するためにも使用できます。これは、`UNION ALL`ロジックに似たマテリアライズドビューを作成するのに役立ちます。

まず、異なるメトリックセットを表す2つのソーステーブルを作成します：

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

次に、メトリックの結合セットを持つ`Target`テーブルを作成します：

```sql
CREATE TABLE analytics.daily_overview
(
    `on_date` Date,
    `domain_name` String,
    `impressions` SimpleAggregateFunction(sum, UInt64),
    `clicks` SimpleAggregateFunction(sum, UInt64)
) ENGINE = AggregatingMergeTree ORDER BY (on_date, domain_name)
```

同じ`Target`テーブルを指す2つのマテリアライズドビューを作成します。欠落している列を明示的に含める必要はありません：

```sql
CREATE MATERIALIZED VIEW analytics.daily_impressions_mv
TO analytics.daily_overview
AS
SELECT
    toDate(event_time) AS on_date,
    domain_name,
    count() AS impressions,
    0 clicks         ---<<<--- これを省略すると同じ0になります
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
    0 impressions    ---<<<--- これを省略すると同じ0になります
FROM
    analytics.clicks
GROUP BY
    toDate(event_time) AS on_date,
    domain_name
;
```

値を挿入すると、それらの値は`Target`テーブルのそれぞれの列に集約されます：

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

`Target`テーブルには、印象とクリックが結合されています：

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

このクエリは次のような結果を出力するはずです：

```response
┌────on_date─┬─domain_name────┬─impressions─┬─clicks─┐
│ 2019-01-01 │ clickhouse.com │           2 │      2 │
│ 2019-03-01 │ clickhouse.com │           1 │      1 │
│ 2019-02-01 │ clickhouse.com │           1 │      0 │
└────────────┴────────────────┴─────────────┴────────┘

3 rows in set. Elapsed: 0.018 sec.
```
