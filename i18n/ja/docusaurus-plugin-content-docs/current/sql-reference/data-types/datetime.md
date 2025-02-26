---
slug: /sql-reference/data-types/datetime
sidebar_position: 16
sidebar_label: DateTime
---

# DateTime

日時を保存することができ、カレンダーの日付と日の時間として表すことができます。

構文：

``` sql
DateTime([timezone])
```

サポートされる値の範囲: \[1970-01-01 00:00:00, 2106-02-07 06:28:15\].

解像度: 1 秒。

## スピード {#speed}

`Date` データ型は _ほとんど_ の条件下で `DateTime` よりも高速です。

`Date` 型は 2 バイトのストレージを必要としますが、`DateTime` は 4 バイトを必要とします。しかし、データベースが圧縮されると、この違いは拡大します。この拡大は、`DateTime` の分と秒が圧縮しにくいためです。`Date` ではなく `DateTime` を使ってフィルタリングおよび集約することも、より迅速です。

## 使用上の注意 {#usage-remarks}

時点は、タイムゾーンや夏時間に関係なく [Unix タイムスタンプ](https://en.wikipedia.org/wiki/Unix_time) として保存されます。タイムゾーンは、`DateTime` 型の値がテキスト形式でどのように表示されるか、また文字列として指定された値がどのように解析されるか（例: `('2020-01-01 05:00:01')`）に影響を与えます。

タイムゾーンに依存しない Unix タイムスタンプがテーブルに保存され、データのインポート/エクスポート中や値に対するカレンダー計算を行う際に（例: `toDate`, `toHour` 関数など）テキスト形式に変換するために使用されます。タイムゾーンはテーブルの行（または結果セット）には保存されず、カラムメタデータに保存されます。

サポートされているタイムゾーンのリストは [IANA タイムゾーン データベース](https://www.iana.org/time-zones) に見つけることができ、`SELECT * FROM system.time_zones` でクエリすることもできます。[リスト](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) は Wikipedia でも入手可能です。

テーブルを作成する際に、`DateTime` 型のカラムに対して明示的にタイムゾーンを設定できます。例: `DateTime('UTC')`。タイムゾーンが設定されていない場合、ClickHouse はサーバー設定の [timezone](../../operations/server-configuration-parameters/settings.md#timezone) パラメータの値を使用するか、ClickHouse サーバー開始時のオペレーティングシステム設定を使用します。

[clickhouse-client](../../interfaces/cli.md) は、データ型を初期化する際に明示的にタイムゾーンが設定されていない場合、デフォルトでサーバーのタイムゾーンを適用します。クライアントのタイムゾーンを使用するには、`--use_client_time_zone` パラメータで `clickhouse-client` を実行します。

ClickHouse は [date_time_output_format](../../operations/settings/settings-formats.md#date_time_output_format) 設定の値に応じて値を出力します。デフォルトは `YYYY-MM-DD hh:mm:ss` テキスト形式です。さらに、[formatDateTime](../../sql-reference/functions/date-time-functions.md#formatdatetime) 関数を使用して出力を変更することもできます。

ClickHouse にデータを挿入する際には、[date_time_input_format](../../operations/settings/settings-formats.md#date_time_input_format) 設定の値に応じて、異なる形式の日付および時間の文字列を使用できます。

## 例 {#examples}

**1.** `DateTime` 型のカラムを持つテーブルを作成し、そのテーブルにデータを挿入する:

``` sql
CREATE TABLE dt
(
    `timestamp` DateTime('Asia/Istanbul'),
    `event_id` UInt8
)
ENGINE = TinyLog;
```

``` sql
-- DateTimeを解析する
-- - 文字列から、
-- - 1970-01-01からの秒数として解釈される整数から。
INSERT INTO dt VALUES ('2019-01-01 00:00:00', 1), (1546300800, 3);

SELECT * FROM dt;
```

``` text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        2 │
│ 2019-01-01 03:00:00 │        1 │
└─────────────────────┴──────────┘
```

- 整数として datetime を挿入する場合、それは Unix タイムスタンプ (UTC) として扱われます。`1546300800` は `'2019-01-01 00:00:00'` UTC を示します。しかし、`timestamp` カラムには `Asia/Istanbul`（UTC+3）タイムゾーンが指定されているため、文字列として出力されると値は `'2019-01-01 03:00:00'` として表示されます。
- 文字列値を datetime として挿入する場合、それはカラムのタイムゾーンにあるものと見なされます。`'2019-01-01 00:00:00'` は `Asia/Istanbul` タイムゾーンのものとして扱われ、`1546290000` として保存されます。

**2.** `DateTime` 値に基づいてフィルタリングする

``` sql
SELECT * FROM dt WHERE timestamp = toDateTime('2019-01-01 00:00:00', 'Asia/Istanbul')
```

``` text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        1 │
└─────────────────────┴──────────┘
```

`DateTime` カラムの値は、`WHERE` 述語内で文字列値を使用してフィルタリングできます。それは自動的に `DateTime` に変換されます：

``` sql
SELECT * FROM dt WHERE timestamp = '2019-01-01 00:00:00'
```

``` text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        1 │
└─────────────────────┴──────────┘
```

**3.** `DateTime` 型のカラムのタイムゾーンを取得する:

``` sql
SELECT toDateTime(now(), 'Asia/Istanbul') AS column, toTypeName(column) AS x
```

``` text
┌──────────────column─┬─x─────────────────────────┐
│ 2019-10-16 04:12:04 │ DateTime('Asia/Istanbul') │
└─────────────────────┴───────────────────────────┘
```

**4.** タイムゾーンの変換

``` sql
SELECT
toDateTime(timestamp, 'Europe/London') as lon_time,
toDateTime(timestamp, 'Asia/Istanbul') as mos_time
FROM dt
```

``` text
┌───────────lon_time──┬────────────mos_time─┐
│ 2019-01-01 00:00:00 │ 2019-01-01 03:00:00 │
│ 2018-12-31 21:00:00 │ 2019-01-01 00:00:00 │
└─────────────────────┴─────────────────────┘
```

タイムゾーンの変換はメタデータだけを変更するため、この操作に計算コストはかかりません。

## タイムゾーンサポートに関する制限 {#limitations-on-time-zones-support}

いくつかのタイムゾーンは完全にはサポートされていない可能性があります。以下のようなケースがあります：

UTC からのオフセットが 15 分の倍数でない場合、時間と分の計算が不正確になることがあります。例えば、リベリアのモンロビアのタイムゾーンは、1972 年 1 月 7 日以前は UTC -0:44:30 でした。モンロビアタイムゾーンでの歴史的な時間について計算を行う場合、時間処理関数が不正確な結果を返すことがあります。ただし、1972 年 1 月 7 日以降の結果は正確です。

時間の移行（夏時間または他の理由による）が 15 分の倍数でないポイントで行われた場合、この特定の日に不正確な結果が得られることもあります。

非単調カレンダー日付。例えば、ハッピーバレー - グースベイでは、2010 年 11 月 7 日の 00:01:00 に時間が 1 時間遡られました（真夜中の 1 分後）。そのため、11 月 6 日が終了した後、人々は 11 月 7 日の 1 分を観測し、その後 11 月 6 日の 23:01 に戻され、さらに 59 分後に 11 月 7 日が再び始まりました。ClickHouse はこのような現象を（まだ）サポートしていません。このような日には、時間処理関数の結果がわずかに不正確になることがあります。

同様の問題が 2010 年のケイシー南極観測所にも存在します。彼らは、3 月 5 日の 02:00 に 3 時間遡りました。南極観測所で作業している場合、ClickHouse を使用することを恐れないでください。ただし、タイムゾーンを UTC に設定するか、不正確さに注意してください。

複数日の時間変更。いくつかの太平洋の島々は、UTC+14 から UTC-12 にタイムゾーンオフセットを変更しました。それは問題ありませんが、変換の日に歴史的な時点での計算を行う場合に不正確さが生じる可能性があります。

## 夏時間（DST）の取り扱い {#handling-daylight-saving-time-dst}

ClickHouse の DateTime 型は、夏時間（DST）移行中に予期しない動作を示すことがあります。特に以下のような場合です：

- [`date_time_output_format`](../../operations/settings/settings-formats.md#date_time_output_format) が `simple` に設定されている場合。
- 時計が逆戻りする ("Fall Back") ため、1 時間の重複が発生する場合。
- 時計が前進する ("Spring Forward") ため、1 時間のギャップが発生する場合。

デフォルトで、ClickHouse は常に重複する時間の早い方を選び、前進するシフト中に存在しない時間を解釈することがあります。

たとえば、夏時間（DST）から標準時間への移行を考えます。

- 2023 年 10 月 29 日、02:00:00 に時計が逆戻りして 01:00:00 になります (BST → GMT)。
- 01:00:00 - 01:59:59 の時間が 2 回現れます（1 回は BST で、もう 1 回は GMT で）。
- ClickHouse は常に最初の発生（BST）を選択し、時間間隔を加えるときに予期しない結果を引き起こします。

```sql
SELECT '2023-10-29 01:30:00'::DateTime('Europe/London') AS time, time + toIntervalHour(1) AS one_hour_later

┌────────────────time─┬──────one_hour_later─┐
│ 2023-10-29 01:30:00 │ 2023-10-29 01:30:00 │
└─────────────────────┴─────────────────────┘
```

同様に、標準時間から夏時間への移行中に、1 時間がスキップされたように見えることがあります。

たとえば：

- 2023 年 3 月 26 日、`00:59:59` に時計が進んで 02:00:00 になります (GMT → BST)。
- 時間 `01:00:00` - `01:59:59` は存在しません。

```sql
SELECT '2023-03-26 01:30:00'::DateTime('Europe/London') AS time, time + toIntervalHour(1) AS one_hour_later

┌────────────────time─┬──────one_hour_later─┐
│ 2023-03-26 00:30:00 │ 2023-03-26 02:30:00 │
└─────────────────────┴─────────────────────┘
```

この場合、ClickHouse は存在しない時間 `2023-03-26 01:30:00` を `2023-03-26 00:30:00` に遡らせます。

## 関連項目 {#see-also}

- [型変換関数](../../sql-reference/functions/type-conversion-functions.md)
- [日付および時間を扱うための関数](../../sql-reference/functions/date-time-functions.md)
- [配列を扱うための関数](../../sql-reference/functions/array-functions.md)
- [`date_time_input_format` 設定](../../operations/settings/settings-formats.md#date_time_input_format)
- [`date_time_output_format` 設定](../../operations/settings/settings-formats.md#date_time_output_format)
- [`timezone` サーバー構成パラメータ](../../operations/server-configuration-parameters/settings.md#timezone)
- [`session_timezone` 設定](../../operations/settings/settings.md#session_timezone)
- [日付および時間を扱うための演算子](../../sql-reference/operators/index.md#operators-datetime)
- [`Date` データ型](../../sql-reference/data-types/date.md)
