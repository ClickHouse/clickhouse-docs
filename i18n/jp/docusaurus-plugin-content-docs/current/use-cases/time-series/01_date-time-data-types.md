---
title: '日付と時刻のデータ型 - 時系列'
sidebar_label: '日付と時刻のデータ型'
description: 'ClickHouseの時系列データ型。'
slug: /use-cases/time-series/date-time-data-types
keywords: ['時系列', 'DateTime', 'DateTime64', 'Date', 'Time', 'Time64', 'データ型', '日時データ', 'タイムスタンプ']
show_related_blogs: true
doc_type: 'reference'
---

# 日付と時刻のデータ型 \{#date-and-time-data-types\}

日付と時刻の型を包括的に備えることは、時系列データを効果的に管理するうえで不可欠であり、ClickHouse はまさにそれを実現します。
コンパクトな日付表現から、ナノ秒精度の高精度タイムスタンプまで、これらの型は、ストレージ効率とさまざまな時系列アプリケーションの実用的な要件とのバランスを取るように設計されています。

過去の金融データ、IoT センサーの測定値、将来日時のイベントのいずれを扱う場合でも、ClickHouse の日付・時刻型は、多様な時刻データのユースケースに対応するために必要な柔軟性を提供します。
サポートされている型の幅広さにより、ユースケースで求められる精度を維持しながら、ストレージ容量とクエリパフォーマンスの両方を最適化できます。

* ほとんどの場合、[`Date`](/sql-reference/data-types/date) 型で十分です。この型は日付の保存に 2 バイトを必要とし、範囲は `[1970-01-01, 2149-06-06]` に制限されます。

* [`Date32`](/sql-reference/data-types/date32) は、より広い日付範囲をカバーします。日付の保存に 4 バイトを必要とし、範囲は `[1900-01-01, 2299-12-31]` に制限されます

* [`DateTime`](/sql-reference/data-types/datetime) は、秒精度の日時値を保存し、範囲は `[1970-01-01 00:00:00, 2106-02-07 06:28:15]` です。値ごとに 4 バイトを必要とします。

* より高い精度が必要な場合は、[`DateTime64`](/sql-reference/data-types/datetime64) を使うことができます。これにより、最大ナノ秒精度で時刻を保存でき、範囲は `[1900-01-01 00:00:00, 2299-12-31 23:59:59.99999999]` です。値ごとに 8 バイトを必要とします。

さまざまな日付型を保存するテーブルを作成してみましょう。

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

現在時刻を返すには [`now()`](/sql-reference/functions/date-time-functions#now) 関数を使います。[`now64()`](/sql-reference/functions/date-time-functions#now64) を使うと、第1引数で指定した精度で取得できます。

```sql
INSERT INTO dates 
SELECT now(), 
       now()::Date32 + toIntervalYear(100),
       now(), 
       now64(3), 
       now64(9) + toIntervalYear(200);
```

これにより、各カラムにはカラム型に応じた時刻が格納されます：

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

## Time 型と Time64 型 \{#time-series-time-types\}

日付要素を含まない時刻値を格納する必要がある場合、ClickHouse では [`Time`](/sql-reference/data-types/time) 型と [`Time64`](/sql-reference/data-types/time64) 型を利用できます。これらはバージョン 25.6 で導入されました。繰り返しのスケジュールや日次パターン、あるいは日付と時刻を分けて扱うのが適切なケースを表現する際に便利です。

:::note
`Time` と `Time64` を使うには、次の設定を有効にする必要があります: `SET enable_time_time64_type = 1;`

これらの型はバージョン 25.6 で導入されました
:::

`Time` 型は、時・分・秒を秒精度で格納します。内部的には符号付き 32 ビット整数として保存され、`[-999:59:59, 999:59:59]` の範囲をサポートしているため、24 時間を超える値も扱えます。これは、経過時間を追跡する場合や、1 日の範囲を超える値となる算術演算を行う場合に便利です。

秒未満の精度が必要な場合、`Time64` は設定可能な小数秒精度を持つ時刻を、符号付き Decimal64 値として格納します。小数部の桁数を指定するための精度パラメータ (0-9) を受け付けます。一般的な精度の値は、3 (ミリ秒) 、6 (マイクロ秒) 、9 (ナノ秒) です。

`Time` と `Time64` はどちらもタイムゾーンをサポートしません。これらは、地域的な文脈を持たない純粋な時刻値を表します。

時刻カラムを含むテーブルを作成してみましょう:

```sql
SET enable_time_time64_type = 1;

CREATE TABLE time_examples
(
    `event_id` UInt8,
    `basic_time` Time,
    `precise_time` Time64(3)
)
ENGINE = MergeTree
ORDER BY event_id;
```

文字列リテラルまたは数値を使用して、時刻値をinsertできます。`Time` では、数値は 00:00:00 からの経過秒数として解釈されます。`Time64` では、数値は 00:00:00 からの経過秒数として解釈され、小数部はカラムの精度に応じて解釈されます。

```sql
INSERT INTO time_examples VALUES 
    (1, '14:30:25', '14:30:25.123'),
    (2, 52225, 52225.456),
    (3, '26:11:10', '26:11:10.789');  -- Values normalize beyond 24 hours

SELECT * FROM time_examples ORDER BY event_id;
```

```text
┌─event_id─┬─basic_time─┬─precise_time─┐
│        1 │ 14:30:25   │ 14:30:25.123 │
│        2 │ 14:30:25   │ 14:30:25.456 │
│        3 │ 26:11:10   │ 26:11:10.789 │
└──────────┴────────────┴──────────────┘
```

時刻の値は直感的にフィルタリングできます:

```sql
SELECT * FROM time_examples WHERE basic_time = '14:30:25';
```

## タイムゾーン \{#time-series-timezones\}

多くのユースケースでは、タイムゾーンも保存する必要があります。`DateTime` または `DateTime64` 型の最後の引数としてタイムゾーンを指定できます:

```sql
CREATE TABLE dtz
(
    `id` Int8,
    `dt_1` DateTime('Europe/Berlin'),
    `dt_2` DateTime,
    `dt64_1` DateTime64(9, 'Europe/Berlin'),
    `dt64_2` DateTime64(9)
)
ENGINE = MergeTree
ORDER BY id;
```

DDLでタイムゾーンを定義したので、異なるタイムゾーンを指定して時刻を挿入できるようになりました。

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

それでは、テーブルの中身を見てみましょう。

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

最初の行では、`America/New_York` タイムゾーンを使ってすべての値を insert しました。

* `dt_1` と `dt64_1` は、クエリ時に自動的に `Europe/Berlin` に変換されます。
* `dt_2` と `dt64_2` にはタイムゾーンが指定されていなかったため、サーバーのローカルタイムゾーンが使われます。この場合は `Europe/London` です。

2 行目では、タイムゾーンを指定せずにすべての値を insert したため、サーバーのローカルタイムゾーンが使われました。
最初の行と同様に、`dt_1` と `dt64_1` は `Europe/Berlin` に変換され、`dt_2` と `dt64_2` はサーバーのローカルタイムゾーンを使います。

## 日付と時刻の関数 \{#time-series-date-time-functions\}

ClickHouse には、異なるデータ型の間で変換するための関数群も用意されています。

たとえば、[`toDate`](/sql-reference/functions/type-conversion-functions#toDate) を使って、`DateTime` 値を `Date` 型に変換できます。

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

`DateTime` を `DateTime64` に変換するには、[`toDateTime64`](/sql-reference/functions/type-conversion-functions#toDateTime64) を使います。

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

また、[`toDateTime`](/sql-reference/functions/type-conversion-functions#toDateTime) を使うと、`Date` または `DateTime64` を `DateTime` に戻せます。

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