---
title: '基本操作 - 時系列'
sidebar_label: '基本操作'
description: 'ClickHouse における基本的な時系列の基本操作。'
slug: /use-cases/time-series/basic-operations
keywords: ['時系列', '基本操作', 'データインジェスト', 'クエリ', 'フィルタリング', 'グルーピング', '集約']
show_related_blogs: true
doc_type: 'guide'
---



# 基本的な時系列操作

ClickHouse は時系列データを扱うための複数の方法を提供しており、さまざまな期間にわたってデータポイントを集計・グループ化・分析できます。
このセクションでは、時間を基準としたデータを扱う際によく使用される基本的な操作について説明します。

一般的な操作には、時間間隔ごとのデータのグループ化、時系列データの欠損の扱い、異なる期間間の変化量の計算などがあります。
これらの操作は、標準的な SQL 構文と ClickHouse の組み込み時間関数を組み合わせて実行できます。

ここでは、Wikistat（Wikipedia ページビューのデータ）データセットを用いて、ClickHouse の時系列クエリ機能を見ていきます。

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

このテーブルに 10 億件のレコードを挿入してみましょう:

```sql
INSERT INTO wikistat 
SELECT *
FROM s3('https://ClickHouse-public-datasets.s3.amazonaws.com/wikistat/partitioned/wikistat*.native.zst') 
LIMIT 1e9;
```


## 時間バケットごとの集計

最も一般的な要件の一つは、期間に基づいてデータを集計することです。たとえば、各日ごとのヒット数の合計を取得する場合などです。

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

ここでは、指定した時刻を日付型に変換する [`toDate()`](/sql-reference/functions/type-conversion-functions#todate) 関数を使用しています。別の方法として、1時間単位でバッチ化し、特定の日付でフィルタリングすることもできます。

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
┌────────────────時刻─┬───ヒット数─┐
│ 2015-07-01 00:00:00 │ 656676 │
│ 2015-07-01 01:00:00 │ 768837 │
│ 2015-07-01 02:00:00 │ 862311 │
│ 2015-07-01 03:00:00 │ 829261 │
│ 2015-07-01 04:00:00 │ 749365 │
└─────────────────────┴────────┘
```

ここで使用されている[`toStartOfHour()`](/docs/sql-reference/functions/date-time-functions#toStartOfHour)関数は、指定された時刻をその時間の開始時刻に変換します。
年、四半期、月、日単位でグループ化することもできます。


## カスタムグループ化間隔

[`toStartOfInterval()`](/docs/sql-reference/functions/date-time-functions#toStartOfInterval) 関数を使うと、例えば 5 分間隔のように任意の間隔でグループ化することもできます。

4 時間ごとの区切りでグループ化したいとします。
[`INTERVAL`](/docs/sql-reference/data-types/special-data-types/interval) 句を使用して、グループ化の間隔を指定できます。

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

または [`toIntervalHour()`](/docs/sql-reference/functions/type-conversion-functions#tointervalhour) 関数を使用することもできます。

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

いずれにしても、次のような結果になります。

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


## 空のグループを埋める

多くの場合、欠損している時間帯を含む疎なデータを扱うことがあります。その結果、バケットが空になることがあります。次の例では、データを 1 時間ごとの間隔でグループ化します。これにより、一部の時間帯の値が欠けている、次のような統計が出力されます。

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
│ 2015-07-01 02:00:00 │         1 │ <- 欠損値
│ 2015-07-01 04:00:00 │         1 │
│ 2015-07-01 05:00:00 │         2 │
│ 2015-07-01 06:00:00 │         1 │
│ 2015-07-01 07:00:00 │         1 │
│ 2015-07-01 08:00:00 │         3 │
│ 2015-07-01 09:00:00 │         2 │ <- 欠損値
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

ClickHouse には、この問題に対応するための [`WITH FILL`](/docs/guides/developer/time-series-filling-gaps#with-fill) 修飾子があります。これにより、すべての欠損している時間帯が 0 で補完され、時間経過に伴う分布をより正確に把握できるようになります。

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


## ローリング時間ウィンドウ

日や時間の始まりといった時刻の区切りではなく、任意の長さの時間ウィンドウを扱いたい場合があります。
例えば、日単位ではなく、「午後 6 時を起点とした 24 時間」という期間ごとの合計ヒット数を把握したいとします。

[`date_diff()`](/docs/sql-reference/functions/date-time-functions#timeDiff) 関数を使うと、基準となる時刻と各レコードの時刻との差を計算できます。
この例では、`day` 列は日数の差（例: 1 日前、2 日前など）を表します。

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
