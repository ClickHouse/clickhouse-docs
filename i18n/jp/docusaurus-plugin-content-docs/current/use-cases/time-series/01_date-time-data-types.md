---
title: '日付と時刻のデータ型 - 時系列'
sidebar_label: '日付と時刻のデータ型'
description: 'ClickHouse における時系列データ向けの日付・時刻データ型。'
slug: /use-cases/time-series/date-time-data-types
keywords: ['time-series', 'DateTime', 'DateTime64', 'Date', 'データ型', '時間データ', 'タイムスタンプ']
show_related_blogs: true
doc_type: 'reference'
---

# 日付および時刻データ型 {#date-and-time-data-types}

効果的な時系列データ管理のためには、充実した日付および時刻型の体系が不可欠であり、ClickHouse はまさにそれを提供します。
コンパクトな日付表現からナノ秒精度を持つ高精度タイムスタンプまで、これらの型は、さまざまな時系列アプリケーションにおける実用上の要件とストレージ効率のバランスを取るように設計されています。

過去の金融データ、IoT センサーの計測値、将来日付のイベントのいずれを扱う場合でも、ClickHouse の日付および時刻型は、さまざまな時間データのシナリオに対応するために必要な柔軟性を提供します。
サポートされる型の幅広いラインナップにより、ユースケースが要求する精度を維持しつつ、ストレージ使用量とクエリ性能の両方を最適化できます。

* [`Date`](/sql-reference/data-types/date) 型は、ほとんどのケースで十分です。この型は日付を保存するのに 2 バイトを必要とし、範囲は `[1970-01-01, 2149-06-06]` に制限されます。

* [`Date32`](/sql-reference/data-types/date32) は、より広い日付範囲をカバーします。日付の保存に 4 バイトを必要とし、範囲は `[1900-01-01, 2299-12-31]` に制限されます。

* [`DateTime`](/sql-reference/data-types/datetime) は秒精度で日時値を保存し、範囲は `[1970-01-01 00:00:00, 2106-02-07 06:28:15]` です。各値あたり 4 バイトを必要とします。

* より高い精度が必要な場合は、[`DateTime64`](/sql-reference/data-types/datetime64) を使用できます。これはナノ秒精度までの時刻を保存でき、範囲は `[1900-01-01 00:00:00, 2299-12-31 23:59:59.99999999]` です。各値あたり 8 バイトを必要とします。

さまざまな日付型を格納するテーブルを作成してみましょう。

```sql
CREATE TABLE dates
(
    `date` Date,
    `wider_date` Date32,
    `datetime` DateTime,
    `precise_datetime` DateTime64(3),
    `very_precise_datetime` DateTime64(9)
)
ENGINE = MergeTree
ORDER BY tuple();
```

[`now()`](/sql-reference/functions/date-time-functions#now) 関数を使用して現在の時刻を返し、[`now64()`](/sql-reference/functions/date-time-functions#now64) 関数を使用すると、第 1 引数で指定した精度で取得できます。

```sql
INSERT INTO dates 
SELECT now(), 
       now()::Date32 + toIntervalYear(100),
       now(), 
       now64(3), 
       now64(9) + toIntervalYear(200);
```

これにより、各カラムの型に応じた時刻データが自動的に格納されます。

```sql
SELECT * FROM dates
FORMAT Vertical;
```

```text
Row 1:
──────
date:                  2025-03-12
wider_date:            2125-03-12
datetime:              2025-03-12 11:39:07
precise_datetime:      2025-03-12 11:39:07.196
very_precise_datetime: 2025-03-12 11:39:07.196724000
```

## タイムゾーン {#time-series-timezones}

多くのユースケースでは、タイムゾーンもあわせて保存しておく必要があります。`DateTime` または `DateTime64` 型の最後の引数として、タイムゾーンを指定できます。

```sql
CREATE TABLE dtz
(
    `id` Int8,
    `dt_1` DateTime('Europe/Berlin'),
    `dt_2` DateTime,
    `dt64_1` DateTime64(9, 'Europe/Berlin'),
    `dt64_2` DateTime64(9),
)
ENGINE = MergeTree
ORDER BY id;
```

DDL でタイムゾーンを定義したので、異なるタイムゾーンの日時を挿入できるようになりました。

```sql
INSERT INTO dtz 
SELECT 1, 
       toDateTime('2022-12-12 12:13:14', 'America/New_York'),
       toDateTime('2022-12-12 12:13:14', 'America/New_York'),
       toDateTime64('2022-12-12 12:13:14.123456789', 9, 'America/New_York'),
       toDateTime64('2022-12-12 12:13:14.123456789', 9, 'America/New_York')
UNION ALL
SELECT 2, 
       toDateTime('2022-12-12 12:13:15'),
       toDateTime('2022-12-12 12:13:15'),
       toDateTime64('2022-12-12 12:13:15.123456789', 9),
       toDateTime64('2022-12-12 12:13:15.123456789', 9);
```

それでは、テーブルの内容を確認してみましょう。

```sql
SELECT dt_1, dt64_1, dt_2, dt64_2
FROM dtz
FORMAT Vertical;
```

```text
Row 1:
──────
dt_1:   2022-12-12 18:13:14
dt64_1: 2022-12-12 18:13:14.123456789
dt_2:   2022-12-12 17:13:14
dt64_2: 2022-12-12 17:13:14.123456789

Row 2:
──────
dt_1:   2022-12-12 13:13:15
dt64_1: 2022-12-12 13:13:15.123456789
dt_2:   2022-12-12 12:13:15
dt64_2: 2022-12-12 12:13:15.123456789
```

最初の行では、すべての値を `America/New_York` タイムゾーンを使用して挿入しました。

* `dt_1` と `dt64_1` は、クエリ時に自動的に `Europe/Berlin` に変換されます。
* `dt_2` と `dt64_2` にはタイムゾーンが指定されていないため、この場合はサーバーのローカルタイムゾーンである `Europe/London` が使用されます。

2 行目では、すべての値をタイムゾーンを指定せずに挿入したため、サーバーのローカルタイムゾーンが使用されました。
1 行目と同様に、`dt_1` と `dt64_1` は `Europe/Berlin` に変換され、`dt_2` と `dt64_2` はサーバーのローカルタイムゾーンを使用します。

## 日付と時刻の関数 {#time-series-date-time-functions}

ClickHouse には、異なるデータ型同士を変換するための一連の関数も用意されています。

たとえば、[`toDate`](/sql-reference/functions/type-conversion-functions#toDate) を使って、`DateTime` の値を `Date` 型に変換できます。

```sql
SELECT
    now() AS current_time,
    toTypeName(current_time),
    toDate(current_time) AS date_only,
    toTypeName(date_only)
FORMAT Vertical;    
```

```text
Row 1:
──────
current_time:             2025-03-12 12:32:54
toTypeName(current_time): DateTime
date_only:                2025-03-12
toTypeName(date_only):    Date
```

[`toDateTime64`](/sql-reference/functions/type-conversion-functions#toDateTime64) を使用して、`DateTime` を `DateTime64` に変換できます。

```sql
SELECT
    now() AS current_time,
    toTypeName(current_time),
    toDateTime64(current_time, 3) AS date_only,
    toTypeName(date_only)
FORMAT Vertical;
```

```text
Row 1:
──────
current_time:             2025-03-12 12:35:01
toTypeName(current_time): DateTime
date_only:                2025-03-12 12:35:01.000
toTypeName(date_only):    DateTime64(3)
```

[`toDateTime`](/sql-reference/functions/type-conversion-functions#toDateTime) を使用すると、`Date` または `DateTime64` を `DateTime` に戻すことができます。

```sql
SELECT
    now64() AS current_time,
    toTypeName(current_time),
    toDateTime(current_time) AS date_time1,
    toTypeName(date_time1),
    today() AS current_date,
    toTypeName(current_date),
    toDateTime(current_date) AS date_time2,
    toTypeName(date_time2)
FORMAT Vertical;
```

```text
Row 1:
──────
current_time:             2025-03-12 12:41:00.598
toTypeName(current_time): DateTime64(3)
date_time1:               2025-03-12 12:41:00
toTypeName(date_time1):   DateTime
current_date:             2025-03-12
toTypeName(current_date): Date
date_time2:               2025-03-12 00:00:00
toTypeName(date_time2):   DateTime
```
