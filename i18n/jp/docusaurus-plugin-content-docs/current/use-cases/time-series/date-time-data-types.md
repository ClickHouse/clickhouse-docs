---
'title': '日付と時刻データ型 - タイムシリーズ'
'sidebar_label': '日付と時刻データ型'
'description': 'ClickHouse におけるタイムシリーズデータ型。'
'slug': '/use-cases/time-series/date-time-data-types'
'keywords':
- 'time-series'
---




# 日付と時間のデータ型

包括的な日付と時間のデータ型のセットは、効果的な時系列データ管理に必要であり、ClickHouseはまさにそれを提供します。 
コンパクトな日付表現からナノ秒精度の高精度タイムスタンプまで、これらの型は異なる時系列アプリケーションのためにストレージの効率と実用的な要件のバランスを取るように設計されています。

過去の金融データ、IoTセンサーの読み取り、または将来の日付のイベントに取り組んでいるかどうかにかかわらず、ClickHouseの日時型はさまざまな時間データシナリオを扱うために必要な柔軟性を提供します。 
サポートされている型の範囲は、ストレージの最適化とクエリパフォーマンスを維持しながら、ユースケースが要求する精度を維持することを可能にします。

* [`Date`](/sql-reference/data-types/date) 型は大抵の場合に十分です。この型は日付を保存するのに2バイトを必要とし、範囲は `[1970-01-01, 2149-06-06]` に制限されます。

* [`Date32`](/sql-reference/data-types/date32) はより広い範囲の日付をカバーします。この型は日付を保存するのに4バイトを必要とし、範囲は `[1900-01-01, 2299-12-31]` に制限されます。

* [`DateTime`](/sql-reference/data-types/datetime) は秒単位の精度で日時値を保存し、範囲は `[1970-01-01 00:00:00, 2106-02-07 06:28:15]` です。1つの値に対して4バイトが必要です。

* さらなる精度が必要な場合は、[`DateTime64`](/sql-reference/data-types/datetime64) を使用できます。これはナノ秒単位の精度で時間を保存でき、範囲は `[1900-01-01 00:00:00, 2299-12-31 23:59:59.99999999]` です。1つの値に対して8バイトが必要です。

さまざまな日付型を保存するテーブルを作成しましょう：

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

[`now()`](/sql-reference/functions/date-time-functions#now) 関数を使用して現在の時間を返し、[`now64()`](/sql-reference/functions/date-time-functions#now64) を使用して指定された精度で取得できます。

```sql
INSERT INTO dates 
SELECT now(), 
       now()::Date32 + toIntervalYear(100),
       now(), 
       now64(3), 
       now64(9) + toIntervalYear(200);
```

これにより、列型に応じて、列が時間で適切に埋められます：

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

多くのユースケースでは、タイムゾーンも保存する必要があります。`DateTime` または `DateTime64` 型にタイムゾーンを最後の引数として設定できます：

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

DDLでタイムゾーンを定義したので、異なるタイムゾーンを使用して時間を挿入できます：

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

テーブルに何が入っているか見てみましょう：

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

1行目では、すべての値を `America/New_York` タイムゾーンを使用して挿入しました。
* `dt_1` と `dt64_1` はクエリ時に自動的に `Europe/Berlin` に変換されます。
* `dt_2` と `dt64_2` はタイムゾーンが指定されていないため、サーバーのローカルタイムゾーン（この場合は `Europe/London`）が使用されます。

2行目では、すべての値をタイムゾーンなしで挿入したため、サーバーのローカルタイムゾーンが使用されました。
1行目と同様に、`dt_1` と `dt_3` は `Europe/Berlin` に変換され、`dt_2` と `dt64_2` はサーバーのローカルタイムゾーンを使用します。

## 日付と時間の関数 {#time-series-date-time-functions}

ClickHouseは、異なるデータ型間を変換するための関数のセットも備えています。

例えば、[`toDate`](/sql-reference/functions/type-conversion-functions#todate) を使用して `DateTime` 値を `Date` 型に変換できます：

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

そして、[`toDateTime`](/sql-reference/functions/type-conversion-functions#todatetime) を使用して `Date` または `DateTime64` から `DateTime` に戻すことができます：

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
