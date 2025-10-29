---
'title': '日付と時刻のデータ型 - 時系列'
'sidebar_label': '日付と時刻のデータ型'
'description': 'ClickHouseの時系列データ型。'
'slug': '/use-cases/time-series/date-time-data-types'
'keywords':
- 'Time Series'
- 'DateTime'
'show_related_blogs': true
'doc_type': 'reference'
---


# 日付と時刻のデータ型

効果的な時系列データ管理には、包括的な日付および時刻型のセットが必要であり、ClickHouseはまさにそれを提供します。 
コンパクトな日付表現からナノ秒精度の高精度タイムスタンプまで、これらの型はさまざまな時系列アプリケーションのための実用的な要件とストレージ効率のバランスを取るように設計されています。

歴史的な金融データ、IoTセンサーの読み取り、または未来の日付のイベントに取り組んでいる場合でも、ClickHouseの日付および時刻型はさまざまな時間データシナリオを処理するために必要な柔軟性を提供します。 
サポートされている型の範囲は、ストレージスペースとクエリパフォーマンスの最適化を可能にし、同時に使用ケースが要求する精度を維持します。

* [`Date`](/sql-reference/data-types/date) 型は、ほとんどの場合に十分です。この型は日付を保存するのに2バイトを必要とし、範囲は `[1970-01-01, 2149-06-06]` に制限されています。

* [`Date32`](/sql-reference/data-types/date32) は、より広い範囲の日付をカバーします。日付を保存するのに4バイトを必要とし、範囲は `[1900-01-01, 2299-12-31]` に制限されています。

* [`DateTime`](/sql-reference/data-types/datetime) は、秒精度で日付時刻値を保存し、範囲は `[1970-01-01 00:00:00, 2106-02-07 06:28:15]` です。1つの値あたり4バイトを必要とします。

* より精度が必要な場合は、[`DateTime64`](/sql-reference/data-types/datetime64) を使用することができます。これにより、ナノ秒精度までの時間を保存でき、範囲は `[1900-01-01 00:00:00, 2299-12-31 23:59:59.99999999]` です。1つの値あたり8バイトを必要とします。

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

[`now()`](/sql-reference/functions/date-time-functions#now) 関数を使用して現在の時刻を返し、 [`now64()`](/sql-reference/functions/date-time-functions#now64) で指定された精度で取得することができます。

```sql
INSERT INTO dates 
SELECT now(), 
       now()::Date32 + toIntervalYear(100),
       now(), 
       now64(3), 
       now64(9) + toIntervalYear(200);
```

これは、カラムタイプに応じて列を時刻で埋めます：

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

多くのユースケースでは、タイムゾーンも保存する必要があります。 `DateTime` または `DateTime64` 型の最後の引数としてタイムゾーンを設定できます：

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

DDLでタイムゾーンを定義したので、異なるタイムゾーンを使用して時刻を挿入することができます：

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

さて、テーブルの内容を見てみましょう：

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

最初の行では、`America/New_York` タイムゾーンを使用してすべての値を挿入しました。
* `dt_1` と `dt64_1` は、クエリ時に自動的に `Europe/Berlin` に変換されます。
* `dt_2` と `dt64_2` は明示的なタイムゾーンが指定されていないため、サーバーのローカルタイムゾーンである `Europe/London` を使用します。

2行目では、タイムゾーンを指定せずにすべての値を挿入したため、サーバーのローカルタイムゾーンが使用されました。
最初の行と同様に、`dt_1` と `dt_3` は `Europe/Berlin` に変換され、一方で `dt_2` と `dt64_2` はサーバーのローカルタイムゾーンを使用します。

## 日付と時刻の関数 {#time-series-date-time-functions}

ClickHouseは、異なるデータ型間で変換するための関数のセットも提供しています。

たとえば、 [`toDate`](/sql-reference/functions/type-conversion-functions#todate) を使用して `DateTime` 値を `Date` 型に変換できます：

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

[`toDateTime64`](/sql-reference/functions/type-conversion-functions#todatetime64) を使用して `DateTime` を `DateTime64` に変換できます：

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

さらに、 [`toDateTime`](/sql-reference/functions/type-conversion-functions#todatetime) を使用して `Date` または `DateTime64` から `DateTime` に戻すことができます：

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
