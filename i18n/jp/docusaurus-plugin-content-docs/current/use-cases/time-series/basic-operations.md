---
title: '基本操作 - 時系列'
sidebar_label: '基本操作'
description: 'ClickHouse における基本的な時系列操作。'
slug: /use-cases/time-series/basic-operations
keywords: ['time-series']
---


# 基本的な時系列操作

ClickHouse は、時系列データを扱うためのいくつかの方法を提供しており、異なる期間のデータポイントを集計、グループ化、および分析することができます。 
このセクションでは、時間ベースのデータを扱う際に一般的に使用される基本的な操作について説明します。

一般的な操作には、時間間隔でのデータのグループ化、時系列データのギャップの処理、および期間ごとの変化の計算が含まれます。 
これらの操作は、標準的な SQL 構文と ClickHouse の組み込みの時間関数を組み合わせて実行できます。

Wikistat（Wikipedia ページビュー データ）データセットを使用して、ClickHouse の時系列クエリ機能を探求してみましょう：

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

このテーブルに 10 億件のレコードを挿入してみましょう：

```sql
INSERT INTO wikistat 
SELECT *
FROM s3('https://ClickHouse-public-datasets.s3.amazonaws.com/wikistat/partitioned/wikistat*.native.zst') 
LIMIT 1e9;
```

## 時間バケットによる集計  {#time-series-aggregating-time-bucket}

最も一般的な要件は、期間に基づいてデータを集計することです。たとえば、各日の合計ヒット数を取得します：

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

ここでは [`toDate()`](/sql-reference/functions/type-conversion-functions#todate) 関数を使用しています。これは、指定した時間を日付型に変換します。あるいは、時間ごとにバッチ処理を行い、特定の日付でフィルタリングすることもできます：

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

ここで使用されている [`toStartOfHour()`](/docs/sql-reference/functions/date-time-functions#tostartofhour) 関数は、与えられた時刻を時間の始まりに変換します。 
年、四半期、月、または日ごとにグループ化することもできます。

## カスタムグルーピング間隔 {#time-series-custom-grouping-intervals}

任意の間隔でグループ化することもできます。たとえば、5 分の場合は、[`toStartOfInterval()`](/docs/sql-reference/functions/date-time-functions#tostartofinterval) 関数を使用します。 

4 時間ごとにグループ化したいとしましょう。
[`INTERVAL`](/docs/sql-reference/data-types/special-data-types/interval) 句を使用して、グルーピング間隔を指定できます：

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

または、[`toIntervalHour()`](/docs/sql-reference/functions/type-conversion-functions#tointervalhour) 関数を使用することもできます：

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

いずれにせよ、以下の結果が得られます：

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

## 空のグループの埋め込み {#time-series-filling-empty-groups}

多くの場合、スパースデータを扱い、いくつかの間隔が欠落しています。これにより、空のバケットが生成されます。1 時間ごとにデータをグループ化する以下の例を見てみましょう。これは、いくつかの時間帯に値が欠落している統計を出力します：

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
│ 2015-07-01 00:00:00 │         3 │ <- 値が欠落している
│ 2015-07-01 02:00:00 │         1 │ <- 値が欠落している
│ 2015-07-01 04:00:00 │         1 │
│ 2015-07-01 05:00:00 │         2 │
│ 2015-07-01 06:00:00 │         1 │
│ 2015-07-01 07:00:00 │         1 │
│ 2015-07-01 08:00:00 │         3 │
│ 2015-07-01 09:00:00 │         2 │ <- 値が欠落している
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

ClickHouse では、この問題に対処するために [`WITH FILL`](/docs/guides/developer/time-series-filling-gaps#with-fill) 修飾子が提供されています。これを使用すると、すべての空の時間をゼロで埋めることができ、時間にわたる分布をより良く理解できます：

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

時には、間隔の開始（例えば、日の開始や時間の開始）ではなく、ウィンドウ間隔で処理したいことがあります。 
たとえば、6 時からの 24 時間の期間でウィンドウの合計ヒット数を理解したいとします。 

[`date_diff()`](/docs/sql-reference/functions/date-time-functions#date_diff) 関数を使用して、基準時刻と各レコードの時刻の違いを計算できます。 
この場合、`day` 列は日数の差を表し（例えば、1 日前、2 日前など）、次のように記述できます：

```sql
SELECT    
    dateDiff('day', toDateTime('2015-05-01 18:00:00'), time) AS day,
    sum(hits)
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
