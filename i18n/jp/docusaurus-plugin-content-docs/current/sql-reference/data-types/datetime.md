---
description: '秒精度のタイムスタンプを格納する ClickHouse の DateTime データ型についてのドキュメント'
sidebar_label: 'DateTime'
sidebar_position: 16
slug: /sql-reference/data-types/datetime
title: 'DateTime'
doc_type: 'reference'
---



# DateTime

カレンダーの日付と一日の時刻で表現できる瞬間を保存するための型です。

構文:

```sql
DateTime([timezone])
```

サポートされる値の範囲: [1970-01-01 00:00:00, 2106-02-07 06:28:15]。

精度: 1秒。


## 速度 {#speed}

`Date`データ型は、_ほとんど_の条件下で`DateTime`よりも高速です。

`Date`型は2バイトのストレージを必要としますが、`DateTime`は4バイトを必要とします。しかし、圧縮時には、DateとDateTimeのサイズ差がより顕著になります。この増幅は、`DateTime`の分と秒の部分が圧縮されにくいことに起因します。`DateTime`の代わりに`Date`を使用してフィルタリングや集計を行う方が高速です。


## 使用上の注意 {#usage-remarks}

時刻は、タイムゾーンや夏時間に関係なく、[Unixタイムスタンプ](https://en.wikipedia.org/wiki/Unix_time)として保存されます。タイムゾーンは、`DateTime`型の値がテキスト形式で表示される方法と、文字列として指定された値('2020-01-01 05:00:01')が解析される方法に影響します。

タイムゾーンに依存しないUnixタイムスタンプがテーブルに格納され、タイムゾーンはデータのインポート/エクスポート時にテキスト形式への変換や逆変換を行う際、または値に対するカレンダー計算(例:`toDate`、`toHour`関数など)を行う際に使用されます。タイムゾーンはテーブルの行(または結果セット)には格納されず、列のメタデータに格納されます。

サポートされているタイムゾーンのリストは、[IANA Time Zone Database](https://www.iana.org/time-zones)で確認でき、`SELECT * FROM system.time_zones`でクエリすることもできます。[このリスト](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)はWikipediaでも参照可能です。

テーブル作成時に`DateTime`型の列に対してタイムゾーンを明示的に設定できます。例:`DateTime('UTC')`。タイムゾーンが設定されていない場合、ClickHouseはサーバー設定の[timezone](../../operations/server-configuration-parameters/settings.md#timezone)パラメータの値、またはClickHouseサーバー起動時のオペレーティングシステムの設定を使用します。

[clickhouse-client](../../interfaces/cli.md)は、データ型の初期化時にタイムゾーンが明示的に設定されていない場合、デフォルトでサーバーのタイムゾーンを適用します。クライアントのタイムゾーンを使用するには、`--use_client_time_zone`パラメータを指定して`clickhouse-client`を実行してください。

ClickHouseは[date_time_output_format](../../operations/settings/settings-formats.md#date_time_output_format)設定の値に応じて値を出力します。デフォルトでは`YYYY-MM-DD hh:mm:ss`のテキスト形式です。さらに、[formatDateTime](../../sql-reference/functions/date-time-functions.md#formatDateTime)関数を使用して出力を変更できます。

ClickHouseにデータを挿入する際、[date_time_input_format](../../operations/settings/settings-formats.md#date_time_input_format)設定の値に応じて、さまざまな形式の日付と時刻の文字列を使用できます。


## 例 {#examples}

**1.** `DateTime`型のカラムを持つテーブルを作成し、データを挿入する:

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
-- - 文字列から
-- - 1970-01-01からの秒数として解釈される整数から
INSERT INTO dt VALUES ('2019-01-01 00:00:00', 1), (1546300800, 2);

SELECT * FROM dt;
```

```text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        1 │
│ 2019-01-01 03:00:00 │        2 │
└─────────────────────┴──────────┘
```

- datetimeを整数として挿入する場合、Unixタイムスタンプ(UTC)として扱われます。`1546300800`は`'2019-01-01 00:00:00'` UTCを表します。ただし、`timestamp`カラムには`Asia/Istanbul`(UTC+3)タイムゾーンが指定されているため、文字列として出力する際には`'2019-01-01 03:00:00'`として表示されます
- 文字列値をdatetimeとして挿入する場合、カラムのタイムゾーンとして扱われます。`'2019-01-01 00:00:00'`は`Asia/Istanbul`タイムゾーンとして扱われ、`1546290000`として保存されます。

**2.** `DateTime`値でのフィルタリング

```sql
SELECT * FROM dt WHERE timestamp = toDateTime('2019-01-01 00:00:00', 'Asia/Istanbul')
```

```text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        1 │
└─────────────────────┴──────────┘
```

`DateTime`カラムの値は、`WHERE`述語で文字列値を使用してフィルタリングできます。自動的に`DateTime`に変換されます:

```sql
SELECT * FROM dt WHERE timestamp = '2019-01-01 00:00:00'
```

```text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        1 │
└─────────────────────┴──────────┘
```

**3.** `DateTime`型カラムのタイムゾーンを取得する:

```sql
SELECT toDateTime(now(), 'Asia/Istanbul') AS column, toTypeName(column) AS x
```

```text
┌──────────────column─┬─x─────────────────────────┐
│ 2019-10-16 04:12:04 │ DateTime('Asia/Istanbul') │
└─────────────────────┴───────────────────────────┘
```

**4.** タイムゾーン変換

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

タイムゾーン変換はメタデータのみを変更するため、この操作に計算コストはかかりません。


## タイムゾーンサポートの制限事項 {#limitations-on-time-zones-support}

一部のタイムゾーンは完全にサポートされていない場合があります。以下のようなケースがあります:

UTCからのオフセットが15分の倍数でない場合、時間と分の計算が正しく行われない可能性があります。例えば、リベリアのモンロビアのタイムゾーンは1972年1月7日以前はUTC -0:44:30のオフセットでした。モンロビアのタイムゾーンで過去の時刻を計算する場合、時刻処理関数が誤った結果を返す可能性があります。ただし、1972年1月7日以降の結果は正確です。

時刻の切り替え(夏時間やその他の理由による)が15分の倍数でない時点で実行された場合、その特定の日において誤った結果が得られる可能性があります。

非単調なカレンダー日付。例えば、Happy Valley - Goose Bayでは、2010年11月7日00:01:00(深夜の1分後)に時刻が1時間戻されました。つまり、11月6日が終了した後、人々は11月7日を1分間観測し、その後時刻が11月6日23:01に戻され、さらに59分後に再び11月7日が始まりました。ClickHouseは(まだ)このような事象をサポートしていません。これらの日において、時刻処理関数の結果はわずかに不正確になる可能性があります。

同様の問題が2010年のケーシー南極基地にも存在します。3月5日02:00に時刻が3時間戻されました。南極基地で作業している場合でも、ClickHouseの使用を恐れる必要はありません。タイムゾーンをUTCに設定するか、不正確さがあることを認識しておくようにしてください。

複数日にわたる時刻のずれ。一部の太平洋の島々はタイムゾーンオフセットをUTC+14からUTC-12に変更しました。これ自体は問題ありませんが、変更日の過去の時点についてそのタイムゾーンで計算を行う場合、不正確さが生じる可能性があります。


## 夏時間（DST）の処理 {#handling-daylight-saving-time-dst}

ClickHouseのタイムゾーン付きDateTime型は、夏時間（DST）の切り替え時に予期しない動作を示すことがあります。特に以下の場合に発生します：

- [`date_time_output_format`](../../operations/settings/settings-formats.md#date_time_output_format)が`simple`に設定されている場合
- 時計が後退する（「秋の切り替え」）ことで1時間の重複が発生する場合
- 時計が前進する（「春の切り替え」）ことで1時間の空白が発生する場合

デフォルトでは、ClickHouseは重複する時刻のうち早い方を常に選択し、前進時の存在しない時刻を解釈することがあります。

例えば、夏時間（DST）から標準時への以下の切り替えを考えてみましょう。

- 2023年10月29日の02:00:00に、時計が01:00:00に後退します（BST → GMT）
- 01:00:00から01:59:59の1時間が2回出現します（1回目はBST、2回目はGMT）
- ClickHouseは常に最初の出現（BST）を選択するため、時間間隔を加算する際に予期しない結果が生じます

```sql
SELECT '2023-10-29 01:30:00'::DateTime('Europe/London') AS time, time + toIntervalHour(1) AS one_hour_later

┌────────────────time─┬──────one_hour_later─┐
│ 2023-10-29 01:30:00 │ 2023-10-29 01:30:00 │
└─────────────────────┴─────────────────────┘
```

同様に、標準時から夏時間への切り替え時には、1時間がスキップされたように見えることがあります。

例えば：

- 2023年3月26日の`00:59:59`に、時計が02:00:00に前進します（GMT → BST）
- `01:00:00`から`01:59:59`の1時間は存在しません

```sql
SELECT '2023-03-26 01:30:00'::DateTime('Europe/London') AS time, time + toIntervalHour(1) AS one_hour_later

┌────────────────time─┬──────one_hour_later─┐
│ 2023-03-26 00:30:00 │ 2023-03-26 02:30:00 │
└─────────────────────┴─────────────────────┘
```

この場合、ClickHouseは存在しない時刻`2023-03-26 01:30:00`を`2023-03-26 00:30:00`に後退させます。


## 関連項目 {#see-also}

- [型変換関数](../../sql-reference/functions/type-conversion-functions.md)
- [日付と時刻を扱う関数](../../sql-reference/functions/date-time-functions.md)
- [配列を扱う関数](../../sql-reference/functions/array-functions.md)
- [`date_time_input_format` 設定](../../operations/settings/settings-formats.md#date_time_input_format)
- [`date_time_output_format` 設定](../../operations/settings/settings-formats.md#date_time_output_format)
- [`timezone` サーバー設定パラメータ](../../operations/server-configuration-parameters/settings.md#timezone)
- [`session_timezone` 設定](../../operations/settings/settings.md#session_timezone)
- [日付と時刻を扱う演算子](../../sql-reference/operators#operators-for-working-with-dates-and-times)
- [`Date` データ型](../../sql-reference/data-types/date.md)
