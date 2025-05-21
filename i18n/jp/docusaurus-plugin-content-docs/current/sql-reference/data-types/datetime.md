---
description: 'ClickHouseのDateTimeデータ型に関するドキュメントで、秒単位の精度でタイムスタンプを保存します。'
sidebar_label: 'DateTime'
sidebar_position: 16
slug: /sql-reference/data-types/datetime
title: 'DateTime'
---


# DateTime

カレンダー日付と1日の時間として表現できる瞬間を保存します。

構文:

```sql
DateTime([timezone])
```

サポートされる値の範囲: \[1970-01-01 00:00:00, 2106-02-07 06:28:15\]。

解像度: 1秒。

## Speed {#speed}

`Date` データ型は _ほとんどの_ 条件下で `DateTime` よりも高速です。

`Date` 型は2バイトのストレージを必要とし、`DateTime` は4バイトが必要です。しかし、データベースが圧縮されると、この違いは増幅されます。この増幅は、`DateTime` の分と秒が圧縮に適していないためです。また、`Date` を使用して `DateTime` の代わりにフィルタリングおよび集計する方が高速です。

## Usage Remarks {#usage-remarks}

時点は、タイムゾーンや夏時間に関係なく、[Unix タイムスタンプ](https://en.wikipedia.org/wiki/Unix_time)として保存されます。タイムゾーンは `DateTime` 型の値がテキスト形式で表示される方法や、文字列として指定された値がどのように解析されるかに影響します（例: '2020-01-01 05:00:01'）。

タイムゾーンに依存しないUnixタイムスタンプはテーブルに保存され、タイムゾーンはデータのインポート/エクスポート中や値に対するカレンダー計算を行うためにテキスト形式に変換される際に使用されます（例: `toDate`, `toHour` 関数など）。タイムゾーンはテーブルの行（または結果セット）には保存されず、カラムのメタデータに保存されます。

サポートされているタイムゾーンのリストは [IANA タイムゾーンデータベース](https://www.iana.org/time-zones) で見つけることができ、`SELECT * FROM system.time_zones` でクエリを実行することもできます。[リスト](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) はウィキペディアでも入手可能です。

テーブルを作成する際に、`DateTime` 型カラムのために明示的にタイムゾーンを設定することができます。例: `DateTime('UTC')`。タイムゾーンが設定されていない場合、ClickHouse はサーバー設定内の [timezone](../../operations/server-configuration-parameters/settings.md#timezone) パラメータの値またはClickHouseサーバーが起動した時点でのオペレーティングシステム設定を使用します。

[clickhouse-client](../../interfaces/cli.md) は、データ型を初期化する際に明示的にタイムゾーンが設定されていない場合、デフォルトでサーバーのタイムゾーンを適用します。クライアントのタイムゾーンを使用するには、`--use_client_time_zone` パラメータを付けて `clickhouse-client` を実行してください。

ClickHouse は [date_time_output_format](../../operations/settings/settings-formats.md#date_time_output_format) 設定の値に基づいて出力値を決定します。デフォルトは `YYYY-MM-DD hh:mm:ss` のテキスト形式です。さらに、[formatDateTime](../../sql-reference/functions/date-time-functions.md#formatdatetime) 関数を使用して出力を変更することができます。

ClickHouse にデータを挿入する際には、[date_time_input_format](../../operations/settings/settings-formats.md#date_time_input_format) 設定の値に応じて、異なる形式の日時文字列を使用することができます。

## Examples {#examples}

**1.** `DateTime` 型のカラムを持つテーブルを作成し、そこにデータを挿入します:

```sql
CREATE TABLE dt
(
    `timestamp` DateTime('Asia/Istanbul'),
    `event_id` UInt8
)
ENGINE = TinyLog;
```

```sql
-- DateTimeを解析
-- - 文字列から、
-- - 1970-01-01からの秒数として解釈される整数から。
INSERT INTO dt VALUES ('2019-01-01 00:00:00', 1), (1546300800, 3);

SELECT * FROM dt;
```

```text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        2 │
│ 2019-01-01 03:00:00 │        1 │
└─────────────────────┴──────────┘
```

- 整数として日時を挿入すると、Unix タイムスタンプ（UTC）として扱われます。 `1546300800` は `'2019-01-01 00:00:00'` UTC を表します。ただし、`timestamp` カラムには `Asia/Istanbul` (UTC+3) のタイムゾーンが指定されているため、文字列として出力すると値は `'2019-01-01 03:00:00'` と表示されます。
- 文字列値を日時として挿入すると、カラムのタイムゾーンとして扱われます。`'2019-01-01 00:00:00'` は `Asia/Istanbul` タイムゾーンであるとみなされ、`1546290000` として保存されます。

**2.** `DateTime` 値のフィルタリング

```sql
SELECT * FROM dt WHERE timestamp = toDateTime('2019-01-01 00:00:00', 'Asia/Istanbul')
```

```text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        1 │
└─────────────────────┴──────────┘
```

`DateTime` カラムの値は、`WHERE` 述語で文字列値を使用してフィルタリングできます。それは自動的に `DateTime` に変換されます:

```sql
SELECT * FROM dt WHERE timestamp = '2019-01-01 00:00:00'
```

```text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        1 │
└─────────────────────┴──────────┘
```

**3.** `DateTime` 型カラムのタイムゾーンを取得する:

```sql
SELECT toDateTime(now(), 'Asia/Istanbul') AS column, toTypeName(column) AS x
```

```text
┌──────────────column─┬─x─────────────────────────┐
│ 2019-10-16 04:12:04 │ DateTime('Asia/Istanbul') │
└─────────────────────┴───────────────────────────┘
```

**4.** タイムゾーンの変換

```sql
SELECT
toDateTime(timestamp, 'Europe/London') as lon_time,
toDateTime(timestamp, 'Asia/Istanbul') as mos_time
FROM dt
```

```text
┌───────────lon_time──┬────────────mos_time─┐
│ 2019-01-01 00:00:00 │ 2019-01-01 03:00:00 │
│ 2018-12-31 21:00:00 │ 2019-01-01 00:00:00 │
└─────────────────────┴─────────────────────┘
```

タイムゾーンの変換はメタデータのみを変更するため、この操作には計算コストはかかりません。


## Limitations on time zones support {#limitations-on-time-zones-support}

一部のタイムゾーンは完全にはサポートされていない場合があります。いくつかのケースがあります：

UTCからのオフセットが15分の倍数でない場合、時間と分の計算が不正確になる可能性があります。例えば、リベリアのモンロビアのタイムゾーンは、1972年1月7日以前はUTC -0:44:30でした。モンロビアのタイムゾーンの歴史的な時間で計算を行うと、時間処理関数が不正確な結果を返す可能性があります。ただし、1972年1月7日以降の結果は正確です。

時間の移行（夏時間によるものや他の理由によるもの）が15分の倍数でない時点で行われた場合、この特定の日に不正確な結果が得られることもあります。

非単調のカレンダー日付。例えば、ハッピーバレー - グーズベイでは、2010年11月7日の00:01:00に1時間戻されました（真夜中の1分後）。そのため、11月6日が終わった後、人々は11月7日の全1分を観察した後、時間が11月6日の23:01に戻され、さらに59分後に11月7日が再び始まりました。ClickHouseは、このような奇妙なことを（まだ）サポートしていません。このような日の間、時間処理関数の結果は若干不正確である可能性があります。

同様の問題は、2010年にケイシー南極基地にも存在します。彼らは、3月5日の02:00に3時間戻しました。南極基地で働いている場合、ClickHouseを使用することを恐れないでください。ただし、タイムゾーンをUTCに設定するか、不正確さに留意してください。

複数日の時間のシフト。一部の太平洋の島々は、UTC+14からUTC-12にタイムゾーンオフセットを変更しました。それは問題ありませんが、変換の日における歴史的な時間ポイントの計算で不正確さが生じる可能性があります。

## Handling Daylight Saving Time (DST) {#handling-daylight-saving-time-dst}

ClickHouseのDateTime型はタイムゾーンを含む場合、特に以下のような夏時間（DST）移行時に予期しない動作を示すことがあります：

- [`date_time_output_format`](../../operations/settings/settings-formats.md#date_time_output_format) が `simple` に設定されている場合。
- 時計が逆に進む（「秋に戻る」）場合、1時間の重複が発生します。
- 時計が前方に進む（「春に進む」）場合、1時間のギャップが発生します。

デフォルトでは、ClickHouseは常に重複する時間の最初の発生を選択し、前方シフト中に存在しない時間を解釈することがあります。

例えば、夏時間（DST）から標準時間へ移行する場合を考えます。

- 2023年10月29日の02:00:00に、時計は01:00:00に戻ります（BST → GMT）。
- 01:00:00 – 01:59:59の時間は2回現れます（BSTの1回とGMTの1回）。
- ClickHouseは常に最初の出現（BST）を選択するため、時間間隔を加算すると予期しない結果が得られます。

```sql
SELECT '2023-10-29 01:30:00'::DateTime('Europe/London') AS time, time + toIntervalHour(1) AS one_hour_later

┌────────────────time─┬──────one_hour_later─┐
│ 2023-10-29 01:30:00 │ 2023-10-29 01:30:00 │
└─────────────────────┴─────────────────────┘
```

同様に、標準時間から夏時間への移行中に、1時間がスキップされることがあります。

例えば：

- 2023年3月26日の `00:59:59` に、時計は02:00:00に進みます（GMT → BST）。
- 時間 `01:00:00` – `01:59:59` は存在しません。

```sql
SELECT '2023-03-26 01:30:00'::DateTime('Europe/London') AS time, time + toIntervalHour(1) AS one_hour_later

┌────────────────time─┬──────one_hour_later─┐
│ 2023-03-26 00:30:00 │ 2023-03-26 02:30:00 │
└─────────────────────┴─────────────────────┘
```

この場合、ClickHouseは存在しない時間 `2023-03-26 01:30:00` を `2023-03-26 00:30:00` にシフトします。

## See Also {#see-also}

- [型変換関数](../../sql-reference/functions/type-conversion-functions.md)
- [日付および時刻での作業に関する関数](../../sql-reference/functions/date-time-functions.md)
- [配列での作業に関する関数](../../sql-reference/functions/array-functions.md)
- [date_time_input_format 設定](../../operations/settings/settings-formats.md#date_time_input_format)
- [date_time_output_format 設定](../../operations/settings/settings-formats.md#date_time_output_format)
- [timezone サーバー構成パラメータ](../../operations/server-configuration-parameters/settings.md#timezone)
- [session_timezone 設定](../../operations/settings/settings.md#session_timezone)
- [日付および時刻での作業に関する演算子](../../sql-reference/operators#operators-for-working-with-dates-and-times)
- [Date データ型](../../sql-reference/data-types/date.md)
