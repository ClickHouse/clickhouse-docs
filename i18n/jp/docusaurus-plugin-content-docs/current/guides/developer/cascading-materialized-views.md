---
slug: /guides/developer/cascading-materialized-views
title: 'カスケーディングマテリアライズドビュー'
description: '単一のソーステーブルから複数のマテリアライズドビューを利用する方法。'
keywords: ['マテリアライズドビュー', '集約']
doc_type: 'guide'
---

# カスケードするマテリアライズドビュー \\{#cascading-materialized-views\\}

この例では、まずマテリアライズドビューの作成方法を示し、その後、2つ目のマテリアライズドビューを1つ目にカスケードさせる方法を説明します。このページでは、その手順、さまざまな活用方法、および制約について説明します。2つ目のマテリアライズドビューをソースとして使用してマテリアライズドビューを作成することで、さまざまなユースケースに対応できます。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/QDAJTKZT8y4?si=1KqPNHHfaKfxtPat" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

<br />

例:

複数のドメイン名について、1時間ごとの閲覧数を含む架空のデータセットを使用します。

目的

1. 各ドメイン名ごとに、データを月単位で集計する必要があります。
2. 各ドメイン名ごとに、データを年単位で集計する必要もあります。

次のいずれかの選択肢を取ることができます。

* SELECT クエリ実行時にデータを読み取り、集計するクエリを書く
* データ取り込み時に、新しい形式に合うようデータを準備する
* データ取り込み時に、特定の集計に合わせてデータを準備する

マテリアライズドビューを使ってデータを準備することで、ClickHouse が処理する必要のあるデータ量と計算量を抑え、SELECT クエリを高速化できます。

## マテリアライズドビュー用のソーステーブル \\{#source-table-for-the-materialized-views\\}

ソーステーブルを作成します。今回の目的は個々の行ではなく集約されたデータに対してレポートすることなので、受信データをパースしてその情報をマテリアライズドビューに渡し、実際の入力データ自体は破棄して構いません。これにより目的を達成しつつストレージを節約できるため、`Null` テーブルエンジンを使用します。

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
Null テーブルに対してマテリアライズドビューを作成できます。つまり、テーブルに書き込まれたデータはビューには反映されますが、元の生データそのものは破棄されます。
:::

## 月次集計テーブルとマテリアライズドビュー \\{#monthly-aggregated-table-and-materialized-view\\}

最初のマテリアライズドビューのために `Target` テーブルを作成する必要があります。この例では `analytics.monthly_aggregated_data` とし、月単位およびドメイン名単位でビュー数の合計を保存します。

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

ターゲットテーブルにデータを転送するマテリアライズドビューは、以下のようになります。

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

## 年次集計テーブルとマテリアライズドビュー \\{#yearly-aggregated-table-and-materialized-view\\}

次に、先ほど作成したターゲットテーブル `monthly_aggregated_data` に関連付けられる 2つ目のマテリアライズドビューを作成します。

まず、各ドメイン名ごとに年単位で集計された `views` の合計値を保存する、新しいターゲットテーブルを作成します。

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

このステップではカスケードを定義します。`FROM` ステートメントは `monthly_aggregated_data` テーブルを使用します。これは、データフローが次のようになることを意味します。

1. データは `hourly_data` テーブルに入ります。
2. ClickHouse は受信したデータを、最初のマテリアライズドビューである `monthly_aggregated_data` テーブルに転送します。
3. 最後に、ステップ 2 で受信したデータが `year_aggregated_data` テーブルに転送されます。

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
マテリアライズドビューを扱う際によくある誤解として、「テーブルからデータが読み出される」と考えてしまうことがあります。`マテリアライズドビュー` はそのようには動作しません。フォワードされるデータはテーブル内の最終結果ではなく、「挿入されたブロック」です。

この例で `monthly_aggregated_data` で使用されているエンジンが CollapsingMergeTree だとします。この場合、2 つ目のマテリアライズドビュー `year_aggregated_data_mv` にフォワードされるデータは、コラップス後のテーブルの最終結果ではなく、`SELECT ... GROUP BY` で定義されたフィールドを持つデータブロックになります。

もし CollapsingMergeTree、ReplacingMergeTree、あるいは SummingMergeTree を使用していて、カスケード構成のマテリアライズドビューを作成する予定がある場合は、ここで説明している制限事項を理解しておく必要があります。
:::

## サンプルデータ \\{#sample-data\\}

ここで、カスケードマテリアライズドビューをテストするために、いくつかのデータを挿入します。

```sql
INSERT INTO analytics.hourly_data (domain_name, event_time, count_views)
VALUES ('clickhouse.com', '2019-01-01 10:00:00', 1),
       ('clickhouse.com', '2019-02-02 00:00:00', 2),
       ('clickhouse.com', '2019-02-01 00:00:00', 3),
       ('clickhouse.com', '2020-01-01 00:00:00', 6);
```

`analytics.hourly_data` の内容を SELECT すると、テーブルエンジンが `Null` でありながらデータ自体は処理されているため、次のような結果が表示されます。

```sql
SELECT * FROM analytics.hourly_data
```

```response
Ok.

0 rows in set. Elapsed: 0.002 sec.
```

ここでは、期待どおりの結果と突き合わせて検証しやすいように、小さなデータセットを使用しています。小さなデータセットでフローが正しく動作することを確認できたら、その設定のまま大規模なデータに切り替えることができます。

## 結果 \\{#results\\}

ターゲットテーブルに対して `sumCountViews` フィールドを選択するクエリを実行すると、一部のターミナルではバイナリ表現が表示されます。これは、その値が数値ではなく AggregateFunction 型として保存されているためです。
集計の最終結果を取得するには、`-Merge` サフィックスを使用する必要があります。

次のクエリで、AggregateFunction に保存されている特殊な文字列（バイト列）を確認できます。

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

代わりに、`Merge` サフィックスを使用して `sumCountViews` の値を取得してみましょう。

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

`AggregatingMergeTree` では、`AggregateFunction` を `sum` として定義しているため、`sumMerge` を使用できます。`AggregateFunction` に対して関数 `avg` を使用する場合は、`avgMerge` を使用します。他の関数についても同様です。

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

これで、マテリアライズドビューが定義した目的を満たしていることを確認できます。

ターゲットテーブル `monthly_aggregated_data` にデータが保存されたので、各ドメイン名ごとに月単位で集計されたデータを取得できます。

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

各ドメイン名ごとの年次集計データ:

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

## 複数のソーステーブルを単一のターゲットテーブルに結合する \\{#combining-multiple-source-tables-to-single-target-table\\}

マテリアライズドビューは、複数のソーステーブルを 1 つのターゲットテーブルに結合するためにも使用できます。これは、`UNION ALL` のロジックに近いマテリアライズドビューを作成する際に有用です。

まず、異なるメトリクスのセットを表す 2 つのソーステーブルを作成します。

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

次に、結合済みのメトリクスセットを格納する `Target` テーブルを作成します。

```sql
CREATE TABLE analytics.daily_overview
(
    `on_date` Date,
    `domain_name` String,
    `impressions` SimpleAggregateFunction(sum, UInt64),
    `clicks` SimpleAggregateFunction(sum, UInt64)
) ENGINE = AggregatingMergeTree ORDER BY (on_date, domain_name)
```

同じ `Target` テーブルを参照するマテリアライズドビューを 2 つ作成します。不足しているカラムを明示的に指定する必要はありません。

```sql
CREATE MATERIALIZED VIEW analytics.daily_impressions_mv
TO analytics.daily_overview
AS
SELECT
    toDate(event_time) AS on_date,
    domain_name,
    count() AS impressions,
    0 clicks         ---<<<--- if you omit this, it will be the same 0
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
    0 impressions    ---<<<--- if you omit this, it will be the same 0
FROM
    analytics.clicks
GROUP BY
    toDate(event_time) AS on_date,
    domain_name
;
```

これで値を挿入すると、その値は `Target` テーブルの対応する列ごとに集計されます。

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

`Target` テーブルには、インプレッションとクリックを統合したデータが含まれます。

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

このクエリを実行すると、次のような結果が得られます。

```response
┌────on_date─┬─domain_name────┬─impressions─┬─clicks─┐
│ 2019-01-01 │ clickhouse.com │           2 │      2 │
│ 2019-03-01 │ clickhouse.com │           1 │      1 │
│ 2019-02-01 │ clickhouse.com │           1 │      0 │
└────────────┴────────────────┴─────────────┴────────┘

3 rows in set. Elapsed: 0.018 sec.
```
