---
slug: /guides/developer/cascading-materialized-views
title: 'カスケーディングマテリアライズドビュー'
description: 'ソーステーブルから複数のマテリアライズドビューを利用する方法'
keywords: ['マテリアライズドビュー', '集約']
doc_type: 'guide'
---



# カスケード型マテリアライズドビュー

この例では、まずマテリアライズドビューを作成し、そのビューを基に 2 つ目のマテリアライズドビューをカスケードして作成する方法を示します。このページでは、その手順、多くの活用パターン、および制約について説明します。さまざまなユースケースに対して、2 つ目のマテリアライズドビューをソースとして利用するマテリアライズドビューを作成することで対応できます。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/QDAJTKZT8y4?si=1KqPNHHfaKfxtPat" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

<br />

例:

ドメイン名のグループごとに、1 時間あたりの閲覧数を示す架空のデータセットを使用します。

目標

1. 各ドメイン名について、月ごとに集計されたデータが必要です。
2. また、各ドメイン名について、年ごとに集計されたデータも必要です。

次のいずれかの方法を選択できます:

- SELECT 実行時にデータを読み取り、その場で集計するクエリを書く
- 取り込み時にデータを新しいフォーマットに前処理する
- 取り込み時にデータを特定の集計単位で前処理する

マテリアライズドビューを使ってデータを準備することで、ClickHouse が処理すべきデータ量と計算量を抑え、SELECT クエリの高速化が可能になります。



## マテリアライズドビューのソーステーブル {#source-table-for-the-materialized-views}

ソーステーブルを作成します。今回の目的は個々の行ではなく集約データのレポート作成であるため、データを解析してマテリアライズドビューに情報を渡し、実際の受信データは破棄できます。これにより目的を達成しつつストレージを節約できるため、`Null`テーブルエンジンを使用します。

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
Nullテーブル上にマテリアライズドビューを作成できます。テーブルに書き込まれたデータはビューに反映されますが、元の生データは破棄されます。
:::


## 月次集計テーブルとマテリアライズドビュー {#monthly-aggregated-table-and-materialized-view}

最初のマテリアライズドビューでは、`Target`テーブルを作成する必要があります。この例では、`analytics.monthly_aggregated_data`という名前で作成し、月とドメイン名ごとのビュー数の合計を格納します。

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

ターゲットテーブルにデータを転送するマテリアライズドビューは次のようになります:

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

次に、前のターゲットテーブル`monthly_aggregated_data`にリンクする2つ目のマテリアライズドビューを作成します。

まず、各ドメイン名について年単位で集計されたビュー数の合計を格納する新しいターゲットテーブルを作成します。

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

このステップでカスケードを定義します。`FROM`句は`monthly_aggregated_data`テーブルを使用するため、データフローは次のようになります:

1. データは`hourly_data`テーブルに到着します。
2. ClickHouseは受信したデータを最初のマテリアライズドビュー`monthly_aggregated_data`テーブルに転送します。
3. 最後に、ステップ2で受信したデータが`year_aggregated_data`に転送されます。

```sql
CREATE MATERIALIZED VIEW analytics.year_aggregated_data_mv
TO analytics.year_aggregated_data
AS
SELECT
    toYear(toStartOfYear(month)) AS year,
    domain_name,
    sumMerge(sumCountViews) AS sumCountViews
FROM analytics.monthly_aggregated_data
GROUP BY
    domain_name,
    year
```

:::note
マテリアライズドビューを使用する際のよくある誤解は、データがテーブルから読み取られるというものです。しかし、これは`マテリアライズドビュー`の動作方法ではありません。転送されるデータは挿入されたブロックであり、テーブル内の最終結果ではありません。

この例で`monthly_aggregated_data`で使用されているエンジンがCollapsingMergeTreeであると仮定すると、2つ目のマテリアライズドビュー`year_aggregated_data_mv`に転送されるデータは、折りたたまれたテーブルの最終結果ではなく、`SELECT ... GROUP BY`で定義されたフィールドを持つデータブロックになります。

CollapsingMergeTree、ReplacingMergeTree、またはSummingMergeTreeを使用していて、カスケードマテリアライズドビューを作成する予定がある場合は、ここで説明されている制限事項を理解しておく必要があります。
:::


## サンプルデータ {#sample-data}

それでは、データを挿入してカスケードマテリアライズドビューをテストしてみましょう。

```sql
INSERT INTO analytics.hourly_data (domain_name, event_time, count_views)
VALUES ('clickhouse.com', '2019-01-01 10:00:00', 1),
       ('clickhouse.com', '2019-02-02 00:00:00', 2),
       ('clickhouse.com', '2019-02-01 00:00:00', 3),
       ('clickhouse.com', '2020-01-01 00:00:00', 6);
```

`analytics.hourly_data`の内容をSELECTすると、テーブルエンジンが`Null`であるため以下のように表示されますが、データは処理されています。

```sql
SELECT * FROM analytics.hourly_data
```

```response
Ok.

0 rows in set. Elapsed: 0.002 sec.
```

結果を追跡し、期待値と比較できるように小規模なデータセットを使用しています。小規模なデータセットでフローが正しく動作することを確認したら、大量のデータに移行できます。


## 結果 {#results}

`sumCountViews`フィールドを選択してターゲットテーブルをクエリしようとすると、(一部のターミナルでは)バイナリ表現が表示されます。これは、値が数値ではなくAggregateFunction型として格納されているためです。
集約の最終結果を取得するには、`-Merge`サフィックスを使用する必要があります。

次のクエリで、AggregateFunctionに格納されている特殊文字を確認できます:

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

代わりに、`Merge`サフィックスを使用して`sumCountViews`の値を取得してみましょう:

```sql
SELECT
   sumMerge(sumCountViews) AS sumCountViews
FROM analytics.monthly_aggregated_data;
```

```response
┌─sumCountViews─┐
│            12 │
└───────────────┘

1 row in set. Elapsed: 0.003 sec.
```

`AggregatingMergeTree`では`AggregateFunction`を`sum`として定義しているため、`sumMerge`を使用できます。`AggregateFunction`に対して`avg`関数を使用する場合は`avgMerge`を使用し、以下同様です。

```sql
SELECT
    month,
    domain_name,
    sumMerge(sumCountViews) AS sumCountViews
FROM analytics.monthly_aggregated_data
GROUP BY
    domain_name,
    month
```

これで、マテリアライズドビューが定義した目標を満たしていることを確認できます。

ターゲットテーブル`monthly_aggregated_data`にデータが格納されたので、各ドメイン名について月ごとに集約されたデータを取得できます:

```sql
SELECT
   month,
   domain_name,
   sumMerge(sumCountViews) AS sumCountViews
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


## 複数のソーステーブルを単一のターゲットテーブルに統合する {#combining-multiple-source-tables-to-single-target-table}

マテリアライズドビューは、複数のソーステーブルを同一の宛先テーブルに統合する用途にも使用できます。これは、`UNION ALL`ロジックに類似したマテリアライズドビューを作成する際に便利です。

まず、異なるメトリクスセットを表す2つのソーステーブルを作成します:

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

次に、統合されたメトリクスセットを持つ`Target`テーブルを作成します:

```sql
CREATE TABLE analytics.daily_overview
(
    `on_date` Date,
    `domain_name` String,
    `impressions` SimpleAggregateFunction(sum, UInt64),
    `clicks` SimpleAggregateFunction(sum, UInt64)
) ENGINE = AggregatingMergeTree ORDER BY (on_date, domain_name)
```

同じ`Target`テーブルを指す2つのマテリアライズドビューを作成します。欠落している列を明示的に含める必要はありません:

```sql
CREATE MATERIALIZED VIEW analytics.daily_impressions_mv
TO analytics.daily_overview
AS
SELECT
    toDate(event_time) AS on_date,
    domain_name,
    count() AS impressions,
    0 clicks         ---<<<--- これを省略しても、同じく0になります
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
    0 impressions    ---<<<--- これを省略しても、同じく0になります
FROM
    analytics.clicks
GROUP BY
    toDate(event_time) AS on_date,
    domain_name
;
```

これで値を挿入すると、それらの値は`Target`テーブルのそれぞれの列に集約されます:

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

`Target`テーブル内で統合されたインプレッションとクリック:

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

このクエリは次のような出力を返します:

```response
┌────on_date─┬─domain_name────┬─impressions─┬─clicks─┐
│ 2019-01-01 │ clickhouse.com │           2 │      2 │
│ 2019-03-01 │ clickhouse.com │           1 │      1 │
│ 2019-02-01 │ clickhouse.com │           1 │      0 │
└────────────┴────────────────┴─────────────┴────────┘

3 rows in set. Elapsed: 0.018 sec.
```
