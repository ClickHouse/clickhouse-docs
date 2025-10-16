---
'title': '基本操作 - 時系列'
'sidebar_label': '基本操作'
'description': 'ClickHouse の基本的な時系列操作。'
'slug': '/use-cases/time-series/basic-operations'
'keywords':
- 'time-series'
'show_related_blogs': true
'doc_type': 'guide'
---


# 基本的な時系列操作

ClickHouseは時系列データを扱うためのいくつかの方法を提供しており、異なる時間期間にわたってデータポイントを集約、グループ化、分析することができます。
このセクションでは、時間ベースのデータを操作するときに一般的に使用される基本的な操作について説明します。

一般的な操作には、時間間隔でのデータグループ化、時系列データのギャップの処理、および時間期間間の変化の計算が含まれます。
これらの操作は、標準のSQL構文とClickHouseの組み込みの時間関数を組み合わせて実行できます。

Wikistat（Wikipediaページビューデータ）データセットを使用して、ClickHouseの時系列クエリ機能を探っていきます：

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

このテーブルに10億レコードを挿入しましょう：

```sql
INSERT INTO wikistat 
SELECT *
FROM s3('https://ClickHouse-public-datasets.s3.amazonaws.com/wikistat/partitioned/wikistat*.native.zst') 
LIMIT 1e9;
```

## 時間バケットによる集約 {#time-series-aggregating-time-bucket}

最も一般的な要件は、期間に基づいてデータを集約することです。たとえば、各日のヒット数の合計を取得します：

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

ここでは、指定された時間を日付型に変換する[`toDate()`](/sql-reference/functions/type-conversion-functions#todate)関数を使用しました。あるいは、1時間ごとにバッチ処理を行い、特定の日付でフィルタリングすることもできます：

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

ここで使用される[`toStartOfHour()`](/docs/sql-reference/functions/date-time-functions#toStartOfHour)関数は、指定された時間をその時間の開始時刻に変換します。
年、四半期、月、または日でグループ化することも可能です。

## カスタムグループ間隔 {#time-series-custom-grouping-intervals}

5分ごとなど、任意の間隔でグループ化することもできます。これには[`toStartOfInterval()`](/docs/sql-reference/functions/date-time-functions#toStartOfInterval)関数を使用します。

たとえば、4時間ごとの間隔でグループ化したい場合、[`INTERVAL`](/docs/sql-reference/data-types/special-data-types/interval)句を使用してグループ化間隔を指定できます：

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

あるいは、[`toIntervalHour()`](/docs/sql-reference/functions/type-conversion-functions#tointervalhour)関数を使用することもできます。

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

いずれにしても、以下の結果が得られます：

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

## 空のグループを埋める {#time-series-filling-empty-groups}

多くの場合、欠損した間隔を持つスパースデータを扱います。これにより、空のバケットが生成されます。1時間ごとにデータをグループ化する次の例を見てみましょう。これにより、いくつかの時間に値が欠けた統計が出力されます：

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
│ 2015-07-01 00:00:00 │         3 │ <- missing values
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

ClickHouseは、これに対処するために[`WITH FILL`](/docs/guides/developer/time-series-filling-gaps#with-fill)修飾子を提供しています。これにより、すべての空の時間がゼロで埋められ、時間による分布をよりよく理解できるようになります：

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
│ 2015-07-01 01:00:00 │         0 │ <- new value
│ 2015-07-01 02:00:00 │         1 │
│ 2015-07-01 03:00:00 │         0 │ <- new value
│ 2015-07-01 04:00:00 │         1 │
│ 2015-07-01 05:00:00 │         2 │
│ 2015-07-01 06:00:00 │         1 │
│ 2015-07-01 07:00:00 │         1 │
│ 2015-07-01 08:00:00 │         3 │
│ 2015-07-01 09:00:00 │         2 │
│ 2015-07-01 10:00:00 │         0 │ <- new value
│ 2015-07-01 11:00:00 │         0 │ <- new value
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

時には、間隔の開始（例えば、日の開始や時間の開始）ではなく、ウィンドウ間隔を扱いたいことがあります。
たとえば、6時からオフセットされた24時間の期間に基づいてではなく、ウィンドウの合計ヒット数を理解したいとします。

この場合、[`date_diff()`](/docs/sql-reference/functions/date-time-functions#timeDiff)関数を使用して参照時間と各レコードの時間との差を計算できます。
この場合、`day`カラムは日数の差を表します（例：1日前、2日前など）：

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
