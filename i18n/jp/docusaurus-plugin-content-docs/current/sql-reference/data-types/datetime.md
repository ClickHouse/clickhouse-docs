---
'description': 'Documentation for the DateTime data type in ClickHouse, which stores
  timestamps with second precision'
'sidebar_label': 'DateTime'
'sidebar_position': 16
'slug': '/sql-reference/data-types/datetime'
'title': 'DateTime'
---




# DateTime

時刻を保存でき、カレンダーの日付と日の時間として表現できます。

構文：

```sql
DateTime([timezone])
```

サポートされる値の範囲： \[1970-01-01 00:00:00, 2106-02-07 06:28:15\]。

解像度：1秒。

## Speed {#speed}

`Date`データ型は、_ほとんど_ の条件下で `DateTime` よりも高速です。

`Date`型は2バイトのストレージを必要とし、`DateTime`は4バイトを必要とします。しかし、データベースが圧縮される際、この差は増幅されます。この増幅は、`DateTime`の分と秒が圧縮しにくいためです。`Date`をフィルタリングおよび集約する方が`DateTime`よりも速いです。

## Usage Remarks {#usage-remarks}

時点は、タイムゾーンや夏時間に関係なく、[Unixタイムスタンプ](https://en.wikipedia.org/wiki/Unix_time)として保存されます。タイムゾーンは、`DateTime`型の値がテキスト形式でどのように表示されるか、また文字列として指定された値がどのように解析されるか（例：`'2020-01-01 05:00:01'`）に影響を与えます。

タイムゾーンに依存しないUnixタイムスタンプはテーブルに保存され、タイムゾーンはデータのインポート/エクスポート中にテキスト形式に変換するために、または値に対してカレンダー計算を行うために使用されます（例：`toDate`、`toHour`関数など）。タイムゾーンはテーブルの行（または結果セット）には保存されませんが、カラムのメタデータに保存されます。

サポートされているタイムゾーンのリストは、[IANAタイムゾーンデータベース](https://www.iana.org/time-zones)で確認でき、`SELECT * FROM system.time_zones`を実行することでも照会できます。[リスト](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)もWikipediaにあります。

テーブルを作成する際に `DateTime`型のカラムのタイムゾーンを明示的に設定できます。例：`DateTime('UTC')`。タイムゾーンが設定されていない場合、ClickHouseはサーバ設定の[timezone](../../operations/server-configuration-parameters/settings.md#timezone)パラメーターの値や、ClickHouseサーバの起動時のオペレーティングシステム設定の値を使用します。

[clickhouse-client](../../interfaces/cli.md)は、データ型を初期化する際にタイムゾーンが明示的に設定されていない場合、デフォルトでサーバのタイムゾーンを適用します。クライアントタイムゾーンを使用するには、`--use_client_time_zone`パラメーターを使用して`clickhouse-client`を実行します。

ClickHouseは、[date_time_output_format](../../operations/settings/settings-formats.md#date_time_output_format)設定の値に応じて値を出力します。デフォルトでは`YYYY-MM-DD hh:mm:ss`テキスト形式です。さらに、[formatDateTime](../../sql-reference/functions/date-time-functions.md#formatdatetime)関数を使用して出力を変更できます。

ClickHouseにデータを挿入する際、[date_time_input_format](../../operations/settings/settings-formats.md#date_time_input_format)設定の値に応じて、異なる日付および時間形式の文字列を使用できます。

## Examples {#examples}

**1.** `DateTime`型のカラムを持つテーブルを作成し、データを挿入します：

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
-- - 1970-01-01以降の秒数として解釈される整数から。
INSERT INTO dt VALUES ('2019-01-01 00:00:00', 1), (1546300800, 3);

SELECT * FROM dt;
```

```text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        2 │
│ 2019-01-01 03:00:00 │        1 │
└─────────────────────┴──────────┘
```

- 整数として日付時刻を挿入すると、それはUnixタイムスタンプ（UTC）として扱われます。`1546300800`は`'2019-01-01 00:00:00'` UTCを表します。しかし、`timestamp`カラムには`Asia/Istanbul`（UTC+3）タイムゾーンが指定されているため、文字列として出力される時は`'2019-01-01 03:00:00'`として表示されます。
- 文字列値として日付時刻を挿入すると、それはカラムのタイムゾーン内にあるものとして扱われます。`'2019-01-01 00:00:00'`は`Asia/Istanbul`タイムゾーンにあるものとして扱われ、`1546290000`として保存されます。

**2.** `DateTime`値でのフィルタリング

```sql
SELECT * FROM dt WHERE timestamp = toDateTime('2019-01-01 00:00:00', 'Asia/Istanbul')
```

```text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        1 │
└─────────────────────┴──────────┘
```

`DateTime`カラムの値は、`WHERE`述語で文字列値を使用してフィルタリングできます。自動的に`DateTime`に変換されます：

```sql
SELECT * FROM dt WHERE timestamp = '2019-01-01 00:00:00'
```

```text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        1 │
└─────────────────────┴──────────┘
```

**3.** `DateTime`型カラムのタイムゾーンの取得：

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

タイムゾーンの変換はメタデータのみを変更するため、計算コストはかかりません。

## Limitations on time zones support {#limitations-on-time-zones-support}

一部のタイムゾーンは完全にはサポートされていない場合があります。いくつかのケースがあります：

UTCからのオフセットが15分の倍数でない場合、時間と分の計算が不正確になる可能性があります。たとえば、リベリアのモンロビアのタイムゾーンは、1972年1月7日以前はUTC -0:44:30のオフセットを持っていました。モンロビアタイムゾーンで歴史的な時間の計算を行っている場合、時間処理関数は不正確な結果を返す可能性があります。ただし、1972年1月7日以降の結果は正しいです。

時間遷移（夏時間のためやその他の理由による）が15分の倍数でない時点で実施された場合、その特定の日には不正確な結果が得られる可能性があります。

非単調なカレンダー日付。たとえば、ハッピーバレー - グースベイでは、2010年11月7日の00:01:00に1時間遡ります。したがって、6日が終了すると、人々は7日のまる1分を観測し、その後、時間は23:01 6日に戻り、さらに59分後に7日が再び始まりました。ClickHouseはこのような事例を（まだ）サポートしていません。このような日には、時間処理関数の結果がわずかに不正確になる可能性があります。

2010年のケースィ南極基地にも同様の問題があります。彼らは2010年3月5日02:00に3時間戻しました。南極基地で作業している場合は、ClickHouseを使用することを恐れないでください。ただし、タイムゾーンをUTCに設定するか、不正確さを認識していることを確認してください。

複数日にわたる時間シフト。一部の太平洋の島々は、タイムゾーンオフセットをUTC+14からUTC-12に変更しました。それは問題ありませんが、変換の日における歴史的なタイムポイントの計算時に不正確さが生じる可能性があります。

## Handling Daylight Saving Time (DST) {#handling-daylight-saving-time-dst}

ClickHouseのDateTime型は、特に次の場合に夏時間（DST）遷移中に予期しない動作を示すことがあります：

- [`date_time_output_format`](../../operations/settings/settings-formats.md#date_time_output_format)が`simple`に設定されている場合。
- 時計が後ろに動く（「秋に戻る」）場合、1時間の重複が発生します。
- 時計が前に動く（「春に前進」）場合、1時間のギャップが発生します。

デフォルトでは、ClickHouseは常に重複する時間の早い時点を選択し、前方シフト中に存在しない時間を解釈する可能性があります。

たとえば、夏時間（DST）から標準時間への遷移を考えてみます。

- 2023年10月29日02:00:00に時計が01:00:00に戻ります（BST → GMT）。
- 01:00:00 - 01:59:59の時間が2回表示されます（1回はBST、1回はGMT）。
- ClickHouseは常に最初の発生（BST）を選択します。このため、時間間隔を加算する際に予期しない結果が生じます。

```sql
SELECT '2023-10-29 01:30:00'::DateTime('Europe/London') AS time, time + toIntervalHour(1) AS one_hour_later

┌────────────────time─┬──────one_hour_later─┐
│ 2023-10-29 01:30:00 │ 2023-10-29 01:30:00 │
└─────────────────────┴─────────────────────┘
```

同様に、標準時間から夏時間への遷移中には、1時間がスキップされるように見えることがあります。

たとえば：

- 2023年3月26日、`00:59:59`に時計が02:00:00にジャンプします（GMT → BST）。
- `01:00:00` - `01:59:59`の時間は存在しません。

```sql
SELECT '2023-03-26 01:30:00'::DateTime('Europe/London') AS time, time + toIntervalHour(1) AS one_hour_later

┌────────────────time─┬──────one_hour_later─┐
│ 2023-03-26 00:30:00 │ 2023-03-26 02:30:00 │
└─────────────────────┴─────────────────────┘
```

この場合、ClickHouseは存在しない時間`2023-03-26 01:30:00`を`2023-03-26 00:30:00`にシフトします。

## See Also {#see-also}

- [型変換関数](../../sql-reference/functions/type-conversion-functions.md)
- [日付と時間の操作用関数](../../sql-reference/functions/date-time-functions.md)
- [配列操作用関数](../../sql-reference/functions/array-functions.md)
- [date_time_input_format設定](../../operations/settings/settings-formats.md#date_time_input_format)
- [date_time_output_format設定](../../operations/settings/settings-formats.md#date_time_output_format)
- [timezoneサーバー設定パラメーター](../../operations/server-configuration-parameters/settings.md#timezone)
- [session_timezone設定](../../operations/settings/settings.md#session_timezone)
- [日付と時間の操作用演算子](../../sql-reference/operators#operators-for-working-with-dates-and-times)
- [Dateデータ型](../../sql-reference/data-types/date.md)
