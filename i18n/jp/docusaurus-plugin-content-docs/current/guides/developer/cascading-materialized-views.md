---
slug: /guides/developer/cascading-materialized-views
title: '階層型マテリアライズドビュー'
description: 'ソーステーブルから複数のマテリアライズドビューを使用する方法。'
keywords: ['マテリアライズドビュー', '集約']
---


# 階層型マテリアライズドビュー

この例では、マテリアライズドビューを作成し、次に2番目のマテリアライズドビューを最初のものに連鎖させる方法を示します。このページでは、その方法や多くの可能性、制限を確認できます。さまざまなユースケースに対して、第二のマテリアライズドビューをソースとして持つことで、マテリアライズドビューを作成することができます。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/QDAJTKZT8y4?si=1KqPNHHfaKfxtPat" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

<br />

例:

私たちは、ドメイン名のグループに対する時間ごとのビュー数を持つフェイクデータセットを使用します。

私たちの目標

1. 各ドメイン名のデータを月ごとに集約する必要があります。
2. 各ドメイン名のデータを年ごとに集約する必要があります。

次のオプションのいずれかを選択できます。

- SELECTリクエスト中にデータを読み取り集約するクエリを書く
- データを新しい形式に変換して取り込む
- 特定の集約に基づいてデータを取り込む

マテリアライズドビューを使用してデータを準備すると、ClickHouseが実行する必要のあるデータ量と計算を制限でき、SELECTリクエストをより速くします。

## マテリアライズドビューのためのソーステーブル {#source-table-for-the-materialized-views}

ソーステーブルを作成します。私たちの目標は集約データを報告することであり、個々の行ではないため、データをパースし、マテリアライズドビューに情報を渡し、実際の受信データを破棄します。これにより私たちの目標が達成され、ストレージの節約にもなりますので、`Null`テーブルエンジンを使用します。

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
Nullテーブルの上にマテリアライズドビューを作成できます。したがって、テーブルに書き込まれたデータはビューに影響しますが、元の生データは依然として破棄されます。
:::

## 月次集約テーブルとマテリアライズドビュー {#monthly-aggregated-table-and-materialized-view}

最初のマテリアライズドビューのために、`Target`テーブルを作成します。今回は`analytics.monthly_aggregated_data`とし、月ごとおよびドメイン名ごとのビューの合計を保存します。

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

データをターゲットテーブルに転送するマテリアライズドビューは次のようになります。

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

## 年次集約テーブルとマテリアライズドビュー {#yearly-aggregated-table-and-materialized-view}

次に、前のターゲットテーブル`monthly_aggregated_data`にリンクされる2番目のマテリアライズドビューを作成します。

まず、各ドメイン名の年ごとに集約されたビューの合計を保存する新しいターゲットテーブルを作成します。

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

このステップは連鎖を定義します。`FROM`句は`monthly_aggregated_data`テーブルを使用します。これは、データフローが以下のようになることを意味します。

1. データは`hourly_data`テーブルに入ります。
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
マテリアライズドビューを扱う際の一般的な誤解は、テーブルからデータを読み込むということです。`マテリアライズドビュー`は、転送されるデータが挿入されたブロックであり、あなたのテーブルの最終的な結果ではありません。

この例で、`monthly_aggregated_data`で使用されるエンジンが`CollapsingMergeTree`であると仮定しましょう。二番目のマテリアライズドビュー`year_aggregated_data_mv`に転送されるデータは、結合されたテーブルの最終的な結果ではなく、`SELECT ... GROUP BY`で定義されたフィールドを持つデータブロックを転送します。

`CollapsingMergeTree`、`ReplacingMergeTree`、またはたとえば`SummingMergeTree`を使用して連鎖マテリアライズドビューを作成する場合は、ここに記載されている制限を理解する必要があります。
:::

## サンプルデータ {#sample-data}

今は、データを挿入して階層型マテリアライズドビューをテストする時です。

```sql
INSERT INTO analytics.hourly_data (domain_name, event_time, count_views)
VALUES ('clickhouse.com', '2019-01-01 10:00:00', 1),
       ('clickhouse.com', '2019-02-02 00:00:00', 2),
       ('clickhouse.com', '2019-02-01 00:00:00', 3),
       ('clickhouse.com', '2020-01-01 00:00:00', 6);
```

`analytics.hourly_data`の内容をSELECTすると、テーブルエンジンが`Null`であるため、以下のようになりますが、データは処理されています。

```sql
SELECT * FROM analytics.hourly_data
```

```response
Ok.

0 rows in set. Elapsed: 0.002 sec.
```

小さなデータセットを使用して、作業の流れを確認し、期待される結果と比較できます。小さなデータセットで正しい流れとなったら、大量のデータに移行できます。

## 結果 {#results}

ターゲットテーブルをクエリし、`sumCountViews`フィールドを選択すると、バイナリ表現（いくつかのターミナルで）を見ることができます。値は数として保存されておらず、AggregateFunction型として保存されています。
集約の最終結果を得るには、`-Merge`サフィックスを使用する必要があります。

このクエリを使用してAggregateFunctionに保存されている特殊文字を確認できます。

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

代わりに、`Merge`サフィックスを使用して`sumCountViews`の値を取得してみましょう。

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

`AggregatingMergeTree`では、`AggregateFunction`を`sum`として定義したので、`sumMerge`を使用できます。`AggregateFunction`の`avg`を使用する場合は、`avgMerge`を使用し、同様に続けます。

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

これで、マテリアライズドビューが私たちが定義した目標に応えていることを確認できます。

ターゲットテーブル`monthly_aggregated_data`にデータが保存されたので、各ドメイン名について月ごとに集約されたデータを取得できます。

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

各ドメイン名について年ごとに集約されたデータ:

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

マテリアライズドビューは、複数のソーステーブルを同じターゲットテーブルに結合するためにも使用できます。これは、`UNION ALL`ロジックに似たマテリアライズドビューを作成するのに便利です。

最初に、異なるメトリクスのセットを表す2つのソーステーブルを作成します。

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

次に、結合されたメトリクスのセットを持つ`Target`テーブルを作成します。

```sql
CREATE TABLE analytics.daily_overview
(
    `on_date` Date,
    `domain_name` String,
    `impressions` SimpleAggregateFunction(sum, UInt64),
    `clicks` SimpleAggregateFunction(sum, UInt64)
) ENGINE = AggregatingMergeTree ORDER BY (on_date, domain_name)
```

同じ`Target`テーブルを指す2つのマテリアライズドビューを作成します。欠落しているカラムを明示的に含める必要はありません。

```sql
CREATE MATERIALIZED VIEW analytics.daily_impressions_mv
TO analytics.daily_overview
AS
SELECT
    toDate(event_time) AS on_date,
    domain_name,
    count() AS impressions,
    0 clicks         ---<<<--- これを省略すると、0になります
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
    0 impressions    ---<<<--- これを省略すると、0になります
FROM
    analytics.clicks
GROUP BY
    toDate(event_time) AS on_date,
    domain_name
;
```

値を挿入すると、それらの値はターゲットテーブルのそれぞれのカラムに集約されます。

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

ターゲットテーブルに結合されたインプレッションとクリック:

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

このクエリは次のような出力を生成します。

```response
┌────on_date─┬─domain_name────┬─impressions─┬─clicks─┐
│ 2019-01-01 │ clickhouse.com │           2 │      2 │
│ 2019-03-01 │ clickhouse.com │           1 │      1 │
│ 2019-02-01 │ clickhouse.com │           1 │      0 │
└────────────┴────────────────┴─────────────┴────────┘

3 rows in set. Elapsed: 0.018 sec.
```
