---
slug: /guides/developer/cascading-materialized-views
title: 階層化マテリアライズドビュー
description: ソーステーブルから複数のマテリアライズドビューを使用する方法。
keywords: [マテリアライズドビュー, 集計]
---

# 階層化マテリアライズドビュー

この例では、マテリアライズドビューを作成し、最初のマテリアライズドビューに対して2つ目のマテリアライズドビューを階層化する方法を示します。このページでは、どのように行うか、さまざまな可能性、制限について説明します。異なるユースケースは、2つ目のマテリアライズドビューをソースとして使用することでマテリアライズドビューを作成することによって解決できます。

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

例：

ドメイン名のグループごとの時間ごとのビュー数を持つ偽データセットを使用します。

私たちの目標

1. 各ドメイン名ごとに集計されたデータを月単位で取得する必要があります、
2. 各ドメイン名ごとに集計されたデータを年単位で取得する必要があります。

これらのオプションのいずれかを選択できます：

- SELECTリクエスト中にデータを読み取り、集計するクエリを書く
- 新しいフォーマットにデータをインジェスト時に準備する
- 特定の集計にデータをインジェスト時に準備する

マテリアライズドビューを使用してデータを準備することで、ClickHouseが実行する必要があるデータと計算の量を制限し、SELECTリクエストを高速化することができます。

## マテリアライズドビューのためのソーステーブル {#source-table-for-the-materialized-views}

ソーステーブルを作成します。私たちの目標は集計データに基づいてレポートを作成することであり、個々の行ではないため、データを解析し、マテリアライズドビューに情報を渡し、実際の受信データを破棄します。これは私たちの目標を満たし、ストレージを節約するために `Null` テーブルエンジンを使用します。

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
Nullテーブル上にマテリアライズドビューを作成できます。したがって、テーブルに書き込まれたデータはビューに影響しますが、元の生データは破棄され続けます。
:::

## 月次集計テーブルとマテリアライズドビュー {#monthly-aggregated-table-and-materialized-view}

最初のマテリアライズドビューのために、`Target` テーブルを作成する必要があります。この例では、それは `analytics.monthly_aggregated_data` であり、月ごとおよびドメイン名ごとのビューの合計を保存します。

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

ターゲットテーブルにデータを転送するマテリアライズドビューは次のようになります。

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

## 年次集計テーブルとマテリアライズドビュー {#yearly-aggregated-table-and-materialized-view}

次に、前のターゲットテーブル `monthly_aggregated_data` にリンクされた2つ目のマテリアライズドビューを作成します。

最初に、各ドメイン名ごとの年単位の集計されたビューの合計を保存する新しいターゲットテーブルを作成します。

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

このステップは階層を定義しています。`FROM` ステートメントは `monthly_aggregated_data` テーブルを使用します。これはデータの流れが次のようになることを意味します：

1. データが `hourly_data` テーブルに来ます。
2. ClickHouseは受信したデータを最初のマテリアライズドビュー `monthly_aggregated_data` テーブルに転送します。
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
マテリアライズドビューを使うときの一般的な誤解は、データがテーブルから読み取られることです。これは `マテリアライズドビュー` の動作方法ではありません。転送されるデータは挿入されたブロックであり、テーブル内の最終結果ではありません。

この例で `monthly_aggregated_data` で使用されるエンジンが CollapsingMergeTree であると考えてみましょう。私たちの2つ目のマテリアライズドビュー `year_aggregated_data_mv` に転送されるデータは、折りたたまれたテーブルの最終結果ではなく、`SELECT ... GROUP BY` で定義されたフィールドを持つデータブロックを転送します。

CollapsingMergeTree、ReplacingMergeTree、または SummingMergeTree を使用している場合で、階層化マテリアライズドビューを作成しようとしている場合は、ここに記載されている制限を理解する必要があります。
:::

## サンプルデータ {#sample-data}

データを挿入して階層化マテリアライズドビューをテストする時間です：

```sql
INSERT INTO analytics.hourly_data (domain_name, event_time, count_views)
VALUES ('clickhouse.com', '2019-01-01 10:00:00', 1),
       ('clickhouse.com', '2019-02-02 00:00:00', 2),
       ('clickhouse.com', '2019-02-01 00:00:00', 3),
       ('clickhouse.com', '2020-01-01 00:00:00', 6);
```

`analytics.hourly_data` の内容をSELECTすると、テーブルエンジンが `Null` であるため次のようになりますが、データは処理されました。

```sql
SELECT * FROM analytics.hourly_data
```

```response
Ok.

0 rows in set. Elapsed: 0.002 sec.
```

私たちは小さなデータセットを使用して期待している結果と比較し、追跡できることを確認しました。小さなデータセットでフローが正しくなったら、大量のデータに移動できます。

## 結果 {#results}

ターゲットテーブルを `sumCountViews` フィールドを選択してクエリすると、値が数値ではなく AggregateFunction タイプとして保存されるため、バイナリ表現が表示されます。
集計の最終結果を得るには、`-Merge` サフィックスを使用する必要があります。

AggregateFunction に保存されている特殊文字を見るには、このクエリを使用します：

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

代わりに、`Sum` サフィックスを使用して `sumCountViews` 値を取得してみましょう：

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

`AggregatingMergeTree` では `AggregateFunction` として `sum` を定義したため、`sumMerge` を使用できます。`AggregateFunction` に `avg` を使用する場合は `avgMerge` を使用し、同様に進めます。

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

今や、ターゲットテーブル `monthly_aggregated_data` に保存されているデータを使用して、各ドメイン名の月単位の集計データを取得できます：

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

各ドメイン名の年次集計データ：

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

マテリアライズドビューは、複数のソーステーブルを同じ宛先テーブルに結合するためにも使用できます。これは `UNION ALL` ロジックに似たマテリアライズドビューを作成するのに便利です。

まず、異なるメトリクスのセットを表す2つのソーステーブルを作成します：

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

次に、結合されたメトリクスのセットを持つ `Target` テーブルを作成します：

```sql
CREATE TABLE analytics.daily_overview
(
    `on_date` Date,
    `domain_name` String,
    `impressions` SimpleAggregateFunction(sum, UInt64),
    `clicks` SimpleAggregateFunction(sum, UInt64)
) ENGINE = AggregatingMergeTree ORDER BY (on_date, domain_name)
```

同じ `Target` テーブルを指す2つのマテリアライズドビューを作成します。欠落しているカラムを明示的に含める必要はありません：

```sql
CREATE MATERIALIZED VIEW analytics.daily_impressions_mv
TO analytics.daily_overview
AS                                                
SELECT
    toDate(event_time) AS on_date,
    domain_name,
    count() AS impressions,
    0 clicks         ---<<<--- 省略すると、同じ0になります
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
    0 impressions    ---<<<--- 省略すると、同じ0になります
FROM
    analytics.clicks
GROUP BY
    toDate(event_time) AS on_date,
    domain_name
;
```

これで、値を挿入すると、それらの値は `Target` テーブル内のそれぞれのカラムに集計されます：

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

`Target` テーブル内で結合されたインプレッションとクリック：

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

このクエリは次のような出力を返すはずです：

```response
┌────on_date─┬─domain_name────┬─impressions─┬─clicks─┐
│ 2019-01-01 │ clickhouse.com │           2 │      2 │
│ 2019-03-01 │ clickhouse.com │           1 │      1 │
│ 2019-02-01 │ clickhouse.com │           1 │      0 │
└────────────┴────────────────┴─────────────┴────────┘

3 rows in set. Elapsed: 0.018 sec.
```
