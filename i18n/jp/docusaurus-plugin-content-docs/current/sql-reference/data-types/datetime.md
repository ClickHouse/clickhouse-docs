---
description: 'ClickHouse の DateTime データ型に関するドキュメント。秒単位の精度でタイムスタンプを格納します'
sidebar_label: 'DateTime'
sidebar_position: 16
slug: /sql-reference/data-types/datetime
title: 'DateTime'
doc_type: 'reference'
---

# DateTime \{#datetime\}

カレンダー形式の日付と一日の時刻で表現できる、時間上の瞬間を保存します。

構文:

```sql
DateTime([timezone])
```

サポートされる値の範囲: [1970-01-01 00:00:00, 2106-02-07 06:28:15]。

精度: 1秒。

## 速度 \{#speed\}

`Date` データ型は、_ほとんど_ の場合において `DateTime` より高速です。

`Date` 型は 2 バイトのストレージを必要としますが、`DateTime` 型は 4 バイトを必要とします。ただし、圧縮時には、`Date` と `DateTime` のサイズ差はさらに大きくなります。これは、`DateTime` に含まれる分と秒が圧縮されにくいためです。`DateTime` ではなく `Date` でフィルタリングおよび集計を行う方が、高速です。

## 使用上の注意 \{#usage-remarks\}

時刻は、タイムゾーンや夏時間に関係なく [Unix タイムスタンプ](https://en.wikipedia.org/wiki/Unix_time) として保存されます。タイムゾーンは、`DateTime` 型の値がテキスト形式でどのように表示されるか、および文字列として指定された値（`'2020-01-01 05:00:01'`）がどのようにパースされるかに影響します。

テーブルにはタイムゾーンに依存しない Unix タイムスタンプが保存され、タイムゾーンはデータのインポート/エクスポート時にそれをテキスト形式へ、またはその逆へ変換したり、値に対して暦に基づく計算（例: `toDate`, `toHour` 関数など）を行うために使用されます。タイムゾーンはテーブルの行（または結果セット）には保存されず、カラムのメタデータに保存されます。

サポートされているタイムゾーンの一覧は [IANA Time Zone Database](https://www.iana.org/time-zones) で確認でき、`SELECT * FROM system.time_zones` によって問い合わせることもできます。[一覧](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) は Wikipedia にも掲載されています。

テーブル作成時に、`DateTime` 型カラムに対して明示的にタイムゾーンを設定できます。例: `DateTime('UTC')`。タイムゾーンが設定されていない場合、ClickHouse はサーバー設定における [timezone](../../operations/server-configuration-parameters/settings.md#timezone) パラメータの値、もしくは ClickHouse サーバー起動時点のオペレーティングシステムの設定値を使用します。

[clickhouse-client](../../interfaces/cli.md) は、データ型の初期化時にタイムゾーンが明示的に設定されていない場合、デフォルトでサーバーのタイムゾーンを適用します。クライアント側のタイムゾーンを使用するには、`--use_client_time_zone` パラメータを付けて `clickhouse-client` を実行します。

ClickHouse は、[date_time_output_format](../../operations/settings/settings-formats.md#date_time_output_format) 設定の値に応じて値を出力します。デフォルトでは `YYYY-MM-DD hh:mm:ss` 形式のテキストで出力されます。さらに、[formatDateTime](../../sql-reference/functions/date-time-functions.md#formatDateTime) 関数を使用して出力形式を変更できます。

ClickHouse にデータを挿入する際には、[date_time_input_format](../../operations/settings/settings-formats.md#date_time_input_format) 設定の値に応じて、さまざまな形式の日付および時刻文字列を使用できます。

## 例 \{#examples\}

**1.** `DateTime` 型の列を持つテーブルを作成し、そのテーブルにデータを挿入する：

```sql
CREATE TABLE dt
(
    `timestamp` DateTime('Asia/Istanbul'),
    `event_id` UInt8
)
ENGINE = TinyLog;
```

```sql
-- Parse DateTime
-- - from string,
-- - from integer interpreted as number of seconds since 1970-01-01.
INSERT INTO dt VALUES ('2019-01-01 00:00:00', 1), (1546300800, 2);

SELECT * FROM dt;
```

```text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        1 │
│ 2019-01-01 03:00:00 │        2 │
└─────────────────────┴──────────┘
```

* datetime を整数として挿入する場合、それは Unix タイムスタンプ (UTC) として扱われます。`1546300800` は UTC の `'2019-01-01 00:00:00'` を表します。ただし、`timestamp` 列には `Asia/Istanbul` (UTC+3) のタイムゾーンが指定されているため、文字列として出力すると値は `'2019-01-01 03:00:00'` と表示されます。
* 文字列値を datetime として挿入する場合、その値は列に指定されているタイムゾーンの時刻として解釈されます。`'2019-01-01 00:00:00'` は `Asia/Istanbul` タイムゾーンの時刻として扱われ、`1546290000` として保存されます。

**2.** `DateTime` 値でのフィルタリング

```sql
SELECT * FROM dt WHERE timestamp = toDateTime('2019-01-01 00:00:00', 'Asia/Istanbul')
```

```text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        1 │
└─────────────────────┴──────────┘
```

`DateTime` 列の値は、`WHERE` 句で文字列値を使ってフィルタリングできます。文字列は自動的に `DateTime` に変換されます。

```sql
SELECT * FROM dt WHERE timestamp = '2019-01-01 00:00:00'
```

```text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        1 │
└─────────────────────┴──────────┘
```

**3.** `DateTime` 型列のタイムゾーンを取得する:

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
toDateTime(timestamp, 'Europe/London') AS lon_time,
toDateTime(timestamp, 'Asia/Istanbul') AS mos_time
FROM dt
```

```text
┌───────────lon_time──┬────────────mos_time─┐
│ 2019-01-01 00:00:00 │ 2019-01-01 03:00:00 │
│ 2018-12-31 21:00:00 │ 2019-01-01 00:00:00 │
└─────────────────────┴─────────────────────┘
```

タイムゾーン変換はメタデータのみを変更するため、この操作に計算コストは発生しません。

## タイムゾーンサポートの制限事項 \{#limitations-on-time-zones-support\}

一部のタイムゾーンは完全にはサポートされていない場合があります。次のようなケースがあります。

UTC からのオフセットが 15 分の倍数ではない場合、時と分の計算が正しくないことがあります。たとえば、リベリアのモンロビアのタイムゾーンは、1972 年 1 月 7 日以前は UTC -0:44:30 のオフセットを持っていました。モンロビアのタイムゾーンにおける過去時刻の計算を行うと、時刻処理関数が誤った結果を返す可能性があります。ただし、1972 年 1 月 7 日以降の結果は正しくなります。

時間の切り替え（夏時間やその他の理由による）が、15 分の倍数ではない時刻で行われた場合、その特定の日の計算結果が誤ってしまうことがあります。

暦日が単調に増加しないケース。たとえば、Happy Valley - Goose Bay では、2010 年 11 月 7 日 00:01:00（真夜中の 1 分後）に時間が 1 時間戻されました。その結果、11 月 6 日が終わった後に 11 月 7 日を 1 分間だけ迎え、その後時間が 11 月 6 日 23:01 に戻され、さらに 59 分経過した後に再び 11 月 7 日が始まりました。ClickHouse は（まだ）このような楽しいケースをサポートしていません。これらの日付においては、時刻処理関数の結果がわずかに不正確になる可能性があります。

同様の問題が、2010 年の Casey 南極基地にもあります。3 月 5 日 02:00 に時間を 3 時間戻しました。もしあなたが南極基地で作業している場合でも、安心して ClickHouse を使用できます。ただし、タイムゾーンを UTC に設定するか、若干の不正確さが生じうることを理解しておいてください。

複数日にわたる時間のシフト。一部の太平洋の島々は、タイムゾーンのオフセットを UTC+14 から UTC-12 に変更しました。これは問題ありませんが、そのタイムゾーンを用いて、切り替えが行われた日の過去時点の計算を行うと、いくらかの不正確さが生じる可能性があります。

## 夏時間（DST）の扱い \{#handling-daylight-saving-time-dst\}

タイムゾーン付きの ClickHouse の `DateTime` 型は、夏時間（Daylight Saving Time, DST）の切り替え時に、特に次のような場合に予期しない動作を示すことがあります。

* [`date_time_output_format`](../../operations/settings/settings-formats.md#date_time_output_format) が `simple` に設定されている場合
* 時計が戻され（「Fall Back」）、1 時間分の重複が発生する場合
* 時計が進められ（「Spring Forward」）、1 時間分の欠損が発生する場合

デフォルトでは、ClickHouse は常に重複する時刻のうち先に出現する方を選択し、時計が進められる際に存在しない時刻を有効な時刻として解釈してしまうことがあります。

例として、夏時間（DST）から標準時への次のような切り替えを考えてみます。

* 2023 年 10 月 29 日の 02:00:00 に、時計が 01:00:00 に戻されます（BST → GMT）。
* 01:00:00 ～ 01:59:59 の 1 時間が（BST と GMT のそれぞれで）2 回出現します。
* ClickHouse は常に最初の出現（BST）を選択するため、時間間隔を加算する際に予期しない結果を引き起こす可能性があります。

```sql
SELECT '2023-10-29 01:30:00'::DateTime('Europe/London') AS time, time + toIntervalHour(1) AS one_hour_later

┌────────────────time─┬──────one_hour_later─┐
│ 2023-10-29 01:30:00 │ 2023-10-29 01:30:00 │
└─────────────────────┴─────────────────────┘
```

同様に、標準時から夏時間への切り替え時には、1時間分の時刻が飛ばされたように見えることがあります。

例：

* 2023年3月26日の `00:59:59` に、時計は `02:00:00` に進みます（GMT → BST）。
* `01:00:00` ～ `01:59:59` の1時間は存在しません。

```sql
SELECT '2023-03-26 01:30:00'::DateTime('Europe/London') AS time, time + toIntervalHour(1) AS one_hour_later

┌────────────────time─┬──────one_hour_later─┐
│ 2023-03-26 00:30:00 │ 2023-03-26 02:30:00 │
└─────────────────────┴─────────────────────┘
```

この場合、ClickHouse は存在しない時刻 `2023-03-26 01:30:00` を、ひとつ前の時刻である `2023-03-26 00:30:00` にずらします。

## 関連項目 \{#see-also\}

- [型変換関数](../../sql-reference/functions/type-conversion-functions.md)
- [日付と時刻を扱う関数](../../sql-reference/functions/date-time-functions.md)
- [配列を扱う関数](../../sql-reference/functions/array-functions.md)
- [`date_time_input_format` 設定](../../operations/settings/settings-formats.md#date_time_input_format)
- [`date_time_output_format` 設定](../../operations/settings/settings-formats.md#date_time_output_format)
- [`timezone` サーバー構成パラメータ](../../operations/server-configuration-parameters/settings.md#timezone)
- [`session_timezone` 設定](../../operations/settings/settings.md#session_timezone)
- [日付と時刻を扱う演算子](../../sql-reference/operators#operators-for-working-with-dates-and-times)
- [`Date` データ型](../../sql-reference/data-types/date.md)
