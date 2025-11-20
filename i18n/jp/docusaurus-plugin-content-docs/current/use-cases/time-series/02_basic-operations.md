---
title: '基本操作 - 時系列'
sidebar_label: '基本操作'
description: 'ClickHouse における基本的な時系列処理。'
slug: /use-cases/time-series/basic-operations
keywords: ['time-series', 'basic operations', 'data ingestion', 'querying', 'filtering', 'grouping', 'aggregation']
show_related_blogs: true
doc_type: 'guide'
---



# 基本的な時系列操作

ClickHouse は時系列データを扱うためのいくつかの方法を提供しており、さまざまな時間期間にわたってデータポイントを集計、グループ化、分析できます。
このセクションでは、時間ベースのデータを扱う際によく使用される基本的な操作について説明します。

一般的な操作には、時間間隔ごとのデータのグループ化、時系列データにおける欠損（ギャップ）の処理、時間期間間の変化量の計算などがあります。
これらの操作は、標準的な SQL 構文と ClickHouse の組み込みの時間関数を組み合わせて実行できます。

ここでは、Wikistat（Wikipedia ページビュー データ）のデータセットを使って、ClickHouse の時系列クエリ機能を見ていきます。

```sql
CREATE TABLE wikistat
(
    `time` DateTime,
    `project` String,
    `subproject` String,
    `path` String,
    `hits` UInt64
)
ENGINE = MergeTree
ORDER BY (time);
```

このテーブルに 10 億件のレコードを挿入してみましょう。

```sql
INSERT INTO wikistat 
SELECT *
FROM s3('https://ClickHouse-public-datasets.s3.amazonaws.com/wikistat/partitioned/wikistat*.native.zst') 
LIMIT 1e9;
```


## Aggregating by time bucket {#time-series-aggregating-time-bucket}

最も一般的な要件は、期間に基づいてデータを集計することです。例えば、各日のヒット数の合計を取得する場合:

```sql
SELECT
    toDate(time) AS date,
    sum(hits) AS hits
FROM wikistat
GROUP BY ALL
ORDER BY date ASC
LIMIT 5;
```

```text
┌───────date─┬─────hits─┐
│ 2015-05-01 │ 25524369 │
│ 2015-05-02 │ 25608105 │
│ 2015-05-03 │ 28567101 │
│ 2015-05-04 │ 29229944 │
│ 2015-05-05 │ 29383573 │
└────────────┴──────────┘
```

ここでは[`toDate()`](/sql-reference/functions/type-conversion-functions#todate)関数を使用しています。この関数は指定された時刻を日付型に変換します。また、時間単位で集計し、特定の日付でフィルタリングすることもできます:

```sql
SELECT
    toStartOfHour(time) AS hour,
    sum(hits) AS hits
FROM wikistat
WHERE date(time) = '2015-07-01'
GROUP BY ALL
ORDER BY hour ASC
LIMIT 5;
```

```text
┌────────────────hour─┬───hits─┐
│ 2015-07-01 00:00:00 │ 656676 │
│ 2015-07-01 01:00:00 │ 768837 │
│ 2015-07-01 02:00:00 │ 862311 │
│ 2015-07-01 03:00:00 │ 829261 │
│ 2015-07-01 04:00:00 │ 749365 │
└─────────────────────┴────────┘
```

ここで使用している[`toStartOfHour()`](/docs/sql-reference/functions/date-time-functions#toStartOfHour)関数は、指定された時刻をその時間の開始時刻に変換します。
年、四半期、月、日でグループ化することもできます。


## カスタムグループ化間隔 {#time-series-custom-grouping-intervals}

[`toStartOfInterval()`](/docs/sql-reference/functions/date-time-functions#toStartOfInterval)関数を使用すると、5分などの任意の間隔でグループ化することができます。

例えば、4時間間隔でグループ化したい場合を考えてみましょう。
[`INTERVAL`](/docs/sql-reference/data-types/special-data-types/interval)句を使用してグループ化間隔を指定できます:

```sql
SELECT
    toStartOfInterval(time, INTERVAL 4 HOUR) AS interval,
    sum(hits) AS hits
FROM wikistat
WHERE date(time) = '2015-07-01'
GROUP BY ALL
ORDER BY interval ASC
LIMIT 6;
```

または、[`toIntervalHour()`](/docs/sql-reference/functions/type-conversion-functions#tointervalhour)関数を使用することもできます:

```sql
SELECT
    toStartOfInterval(time, toIntervalHour(4)) AS interval,
    sum(hits) AS hits
FROM wikistat
WHERE date(time) = '2015-07-01'
GROUP BY ALL
ORDER BY interval ASC
LIMIT 6;
```

いずれの方法でも、以下の結果が得られます:

```text
┌────────────interval─┬────hits─┐
│ 2015-07-01 00:00:00 │ 3117085 │
│ 2015-07-01 04:00:00 │ 2928396 │
│ 2015-07-01 08:00:00 │ 2679775 │
│ 2015-07-01 12:00:00 │ 2461324 │
│ 2015-07-01 16:00:00 │ 2823199 │
│ 2015-07-01 20:00:00 │ 2984758 │
└─────────────────────┴─────────┘
```


## 空のグループの補完 {#time-series-filling-empty-groups}

多くの場合、一部の区間が欠損した疎なデータを扱うことになります。これにより空のバケットが生じます。以下の例では、データを1時間間隔でグループ化しています。これにより、一部の時間帯で値が欠損した以下の統計が出力されます:

```sql
SELECT
    toStartOfHour(time) AS hour,
    sum(hits)
FROM wikistat
WHERE (project = 'ast') AND (subproject = 'm') AND (date(time) = '2015-07-01')
GROUP BY ALL
ORDER BY hour ASC;
```

```text
┌────────────────hour─┬─sum(hits)─┐
│ 2015-07-01 00:00:00 │         3 │ <- 欠損値
│ 2015-07-01 02:00:00 │         1 │ <- missing values
│ 2015-07-01 04:00:00 │         1 │
│ 2015-07-01 05:00:00 │         2 │
│ 2015-07-01 06:00:00 │         1 │
│ 2015-07-01 07:00:00 │         1 │
│ 2015-07-01 08:00:00 │         3 │
│ 2015-07-01 09:00:00 │         2 │ <- missing values
│ 2015-07-01 12:00:00 │         2 │
│ 2015-07-01 13:00:00 │         4 │
│ 2015-07-01 14:00:00 │         2 │
│ 2015-07-01 15:00:00 │         2 │
│ 2015-07-01 16:00:00 │         2 │
│ 2015-07-01 17:00:00 │         1 │
│ 2015-07-01 18:00:00 │         5 │
│ 2015-07-01 19:00:00 │         5 │
│ 2015-07-01 20:00:00 │         4 │
│ 2015-07-01 21:00:00 │         4 │
│ 2015-07-01 22:00:00 │         2 │
│ 2015-07-01 23:00:00 │         2 │
└─────────────────────┴───────────┘
```

ClickHouseはこの問題に対処するために[`WITH FILL`](/docs/guides/developer/time-series-filling-gaps#with-fill)修飾子を提供しています。これにより、すべての空の時間帯がゼロで埋められ、時間経過に伴う分布をより正確に把握できるようになります:

```sql
SELECT
    toStartOfHour(time) AS hour,
    sum(hits)
FROM wikistat
WHERE (project = 'ast') AND (subproject = 'm') AND (date(time) = '2015-07-01')
GROUP BY ALL
ORDER BY hour ASC WITH FILL STEP toIntervalHour(1);
```


```text
┌────────────────hour─┬─sum(hits)─┐
│ 2015-07-01 00:00:00 │         3 │
│ 2015-07-01 01:00:00 │         0 │ <- 新しい値
│ 2015-07-01 02:00:00 │         1 │
│ 2015-07-01 03:00:00 │         0 │ <- 新しい値
│ 2015-07-01 04:00:00 │         1 │
│ 2015-07-01 05:00:00 │         2 │
│ 2015-07-01 06:00:00 │         1 │
│ 2015-07-01 07:00:00 │         1 │
│ 2015-07-01 08:00:00 │         3 │
│ 2015-07-01 09:00:00 │         2 │
│ 2015-07-01 10:00:00 │         0 │ <- 新しい値
│ 2015-07-01 11:00:00 │         0 │ <- 新しい値
│ 2015-07-01 12:00:00 │         2 │
│ 2015-07-01 13:00:00 │         4 │
│ 2015-07-01 14:00:00 │         2 │
│ 2015-07-01 15:00:00 │         2 │
│ 2015-07-01 16:00:00 │         2 │
│ 2015-07-01 17:00:00 │         1 │
│ 2015-07-01 18:00:00 │         5 │
│ 2015-07-01 19:00:00 │         5 │
│ 2015-07-01 20:00:00 │         4 │
│ 2015-07-01 21:00:00 │         4 │
│ 2015-07-01 22:00:00 │         2 │
│ 2015-07-01 23:00:00 │         2 │
└─────────────────────┴───────────┘
```


## ローリング時間ウィンドウ {#time-series-rolling-time-windows}

時には、間隔の開始時点(日や時間の開始など)ではなく、ウィンドウ間隔を扱いたい場合があります。
例えば、日単位ではなく、午後6時を起点とした24時間周期のウィンドウで合計ヒット数を把握したいとします。

[`date_diff()`](/docs/sql-reference/functions/date-time-functions#timeDiff)関数を使用して、基準時刻と各レコードの時刻との差を計算できます。
この場合、`day`列は日数の差(例:1日前、2日前など)を表します:

```sql
SELECT
    dateDiff('day', toDateTime('2015-05-01 18:00:00'), time) AS day,
    sum(hits),
FROM wikistat
GROUP BY ALL
ORDER BY day ASC
LIMIT 5;
```

```text
┌─day─┬─sum(hits)─┐
│   0 │  25524369 │
│   1 │  25608105 │
│   2 │  28567101 │
│   3 │  29229944 │
│   4 │  29383573 │
└─────┴───────────┘
```
