---
'slug': '/guides/developer/cascading-materialized-views'
'title': 'カスケード マテリアライズド ビュー'
'description': 'ソース テーブルから複数の Materialized View を使用する方法。'
'keywords':
- 'materialized view'
- 'aggregation'
'doc_type': 'guide'
---


# カスケード マテリアライズド ビュー

この例では、マテリアライズド ビューを作成し、次に1つ目のマテリアライズド ビューに対して2つ目のマテリアライズド ビューをカスケードする方法を示します。このページでは、その方法、多くの可能性、および制限について説明します。異なるユースケースは、2つ目のマテリアライズド ビューをソースとして使用することで、マテリアライズド ビューを作成することによって対応できます。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/QDAJTKZT8y4?si=1KqPNHHfaKfxtPat" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

<br />

例:

特定のドメイン名の時間ごとのビュー数を持つ偽のデータセットを使用します。

私たちの目標

1. 各ドメイン名に対して、月ごとに集計されたデータが必要です。
2. 各ドメイン名に対して、年ごとに集計されたデータも必要です。

これらのオプションのいずれかを選択できます:

- SELECT リクエスト中にデータを読み込み、集計するクエリを書く
- データを新しいフォーマットに変換するために、取り込み時に準備する
- 特定の集計に向けて取り込み時にデータを準備する。

マテリアライズド ビューを使用してデータを準備することで、ClickHouse が処理するデータと計算の量を制限でき、SELECT リクエストを高速化することができます。

## マテリアライズド ビューのためのソーステーブル {#source-table-for-the-materialized-views}

ソーステーブルを作成します。私たちの目標は、個々の行ではなく集計データを報告することなので、データを解析し、情報をマテリアライズド ビューに渡し、実際の入ってくるデータを破棄します。これにより、私たちの目標が達成され、ストレージの節約にもなりますので、`Null` テーブルエンジンを使用します。

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
Null テーブルにマテリアライズド ビューを作成できます。そのため、テーブルに書き込まれたデータはビューに影響を及ぼしますが、元の生データは依然として破棄されます。
:::

## 月次集計テーブルとマテリアライズド ビュー {#monthly-aggregated-table-and-materialized-view}

最初のマテリアライズド ビューでは、`Target` テーブルを作成する必要があります。この例では、`analytics.monthly_aggregated_data` とし、月ごとおよびドメイン名ごとのビューの合計を保存します。

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

データをターゲットテーブルに転送するマテリアライズド ビューは次のようになります。

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

## 年次集計テーブルとマテリアライズド ビュー {#yearly-aggregated-table-and-materialized-view}

次に、前述のターゲットテーブル `monthly_aggregated_data` にリンクされた2つ目のマテリアライズド ビューを作成します。

まず、各ドメイン名に対して年ごとに集計されたビューの合計を保存する新しいターゲットテーブルを作成します。

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

このステップがカスケードを定義します。`FROM` ステートメントは `monthly_aggregated_data` テーブルを使用します。これは、データフローが次のようになることを意味します。

1. データが `hourly_data` テーブルに来ます。
2. ClickHouse は受け取ったデータを最初のマテリアライズド ビュー `monthly_aggregated_data` テーブルに転送します。
3. 最後に、ステップ2で受け取ったデータが `year_aggregated_data` に転送されます。

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
マテリアライズド ビューを使用する際の一般的な誤解は、テーブルからデータが読み取られることです。これが `Materialized views` の動作方式ではありません。転送されるデータは挿入されたブロックであり、テーブル内の最終結果ではありません。

この例では、`monthly_aggregated_data` で使用されるエンジンが CollapsingMergeTree と仮定します。2つ目のマテリアライズド ビュー `year_aggregated_data_mv` に転送されるデータは、崩壊したテーブルの最終結果ではなく、`SELECT ... GROUP BY` で定義されたフィールドを持つデータブロックを転送します。

CollapsingMergeTree、ReplacingMergeTree、または SummingMergeTree を使用し、カスケード マテリアライズド ビューを作成する予定がある場合は、ここで述べる制限を理解する必要があります。
:::

## サンプルデータ {#sample-data}

データを挿入してカスケード マテリアライズド ビューをテストする時が来ました:

```sql
INSERT INTO analytics.hourly_data (domain_name, event_time, count_views)
VALUES ('clickhouse.com', '2019-01-01 10:00:00', 1),
       ('clickhouse.com', '2019-02-02 00:00:00', 2),
       ('clickhouse.com', '2019-02-01 00:00:00', 3),
       ('clickhouse.com', '2020-01-01 00:00:00', 6);
```

`analytics.hourly_data` の内容を SELECT すると、テーブルエンジンが `Null` であるため、データは処理されましたが次のようになります。

```sql
SELECT * FROM analytics.hourly_data
```

```response
Ok.

0 rows in set. Elapsed: 0.002 sec.
```

小さなデータセットを使用して、期待される結果とを比較して確認できるようにしています。小さなデータセットでフローが正しいことを確認できたら、大量のデータに移行することができます。

## 結果 {#results}

ターゲットテーブルで `sumCountViews` フィールドを選択してクエリを実行すると、バイナリ表現が表示される場合があります (一部の端末では) 。値が数値としてではなく、AggregateFunction タイプとして保存されるためです。
集計の最終結果を取得するには、`-Merge` サフィックスを使用する必要があります。

次のクエリで AggregateFunction に保存されている特殊文字を確認できます:

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

代わりに、`Merge` サフィックスを使用して `sumCountViews` 値を取得してみましょう:

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

`AggregatingMergeTree` では、`AggregateFunction` を `sum` として定義したため、`sumMerge` を使用できます。`AggregateFunction` に対して `avg` 関数を使用する場合は `avgMerge` を使用することになり、同様に進めます。

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

これで、マテリアライズド ビューが私たちの定義した目標に応えているか確認できます。

ターゲットテーブル `monthly_aggregated_data` にデータが保存されたので、各ドメイン名の月ごとに集計されたデータを取得できます。

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

各ドメイン名の年ごとに集計されたデータは次のとおりです。

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

## 複数のソーステーブルを単一のターゲットテーブルに組み合わせる {#combining-multiple-source-tables-to-single-target-table}

マテリアライズド ビューは、複数のソーステーブルを同じ宛先テーブルに組み合わせるためにも使用できます。これは、`UNION ALL` ロジックに似たマテリアライズド ビューを作成するのに便利です。

まず、異なるメトリックの異なるセットを表す2つのソーステーブルを作成します。

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

次に、メトリックの結合セットを持つ `Target` テーブルを作成します。

```sql
CREATE TABLE analytics.daily_overview
(
    `on_date` Date,
    `domain_name` String,
    `impressions` SimpleAggregateFunction(sum, UInt64),
    `clicks` SimpleAggregateFunction(sum, UInt64)
) ENGINE = AggregatingMergeTree ORDER BY (on_date, domain_name)
```

同じ `Target` テーブルを指す2つのマテリアライズド ビューを作成します。欠落している列を明示的に含める必要はありません。

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

今、値を挿入すると、その値は `Target` テーブルのそれぞれのコラムに集計されます。

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

`Target` テーブル内の結合されたインプレッションとクリック:

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

このクエリは次のような結果を出力するはずです:

```response
┌────on_date─┬─domain_name────┬─impressions─┬─clicks─┐
│ 2019-01-01 │ clickhouse.com │           2 │      2 │
│ 2019-03-01 │ clickhouse.com │           1 │      1 │
│ 2019-02-01 │ clickhouse.com │           1 │      0 │
└────────────┴────────────────┴─────────────┴────────┘

3 rows in set. Elapsed: 0.018 sec.
```
