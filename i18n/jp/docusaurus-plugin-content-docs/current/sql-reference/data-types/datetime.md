---
'description': 'ClickHouseにおけるDateTimeデータ型に関するドキュメントで、秒精度のタイムスタンプを保存します'
'sidebar_label': 'DateTime'
'sidebar_position': 16
'slug': '/sql-reference/data-types/datetime'
'title': 'DateTime'
'doc_type': 'reference'
---


# DateTime

カレンダーの日付と1日の時間として表現できる瞬時の時間を保存することができます。

構文:

```sql
DateTime([timezone])
```

サポートされている値の範囲: \[1970-01-01 00:00:00, 2106-02-07 06:28:15\]。

解像度: 1秒。

## Speed {#speed}

`Date`データ型は、_ほとんど_ の条件下で`DateTime`よりも高速です。

`Date`型は2バイトのストレージを必要とし、`DateTime`は4バイトを必要とします。しかし、圧縮中に、DateとDateTimeのサイズの違いはより顕著になります。この増幅は、`DateTime`の分と秒が圧縮しにくいためです。また、`Date`を使用してフィルタリングおよび集計する方が、`DateTime`を使用するよりも高速です。

## Usage Remarks {#usage-remarks}

時間点は、タイムゾーンや夏時間に関係なく、[Unix タイムスタンプ](https://en.wikipedia.org/wiki/Unix_time)として保存されます。タイムゾーンは、`DateTime`型の値がテキスト形式で表示される方法や、文字列として指定された値が解析される方法（例： `'2020-01-01 05:00:01'`）に影響します。

タイムゾーン非依存のUnixタイムスタンプはテーブルに保存され、タイムゾーンは、それをテキスト形式に変換したり、データのインポート/エクスポート中や値のカレンダー計算を行うために使用されます（例：`toDate`、`toHour`関数など）。タイムゾーンはテーブルの行に保存されるわけではなく、列のメタデータに保存されています。

サポートされているタイムゾーンのリストは、[IANA タイムゾーンデータベース](https://www.iana.org/time-zones)にあり、`SELECT * FROM system.time_zones`でクエリ可能です。また、[リスト](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)はWikipediaでも利用可能です。

テーブルを作成する際に、`DateTime`型のカラムに対してタイムゾーンを明示的に設定できます。例：`DateTime('UTC')`。タイムゾーンが設定されていない場合、ClickHouseはサーバー設定の[timezone](../../operations/server-configuration-parameters/settings.md#timezone)パラメータの値、またはClickHouseサーバーの起動時のオペレーティングシステム設定を使用します。

[clickhouse-client](../../interfaces/cli.md)は、データ型を初期化する際にタイムゾーンが明示的に設定されていない場合、デフォルトでサーバーのタイムゾーンを適用します。クライアントのタイムゾーンを使用するには、`--use_client_time_zone`パラメータを使用して`clickhouse-client`を実行します。

ClickHouseは、[date_time_output_format](../../operations/settings/settings-formats.md#date_time_output_format)設定の値に依存して値を出力します。デフォルトでは`YYYY-MM-DD hh:mm:ss`テキスト形式です。さらに、[formatDateTime](../../sql-reference/functions/date-time-functions.md#formatDateTime)関数を使用して出力を変更できます。

ClickHouseにデータを挿入する際、[date_time_input_format](../../operations/settings/settings-formats.md#date_time_input_format)設定の値に応じて、異なる形式の日時文字列を使用できます。

## Examples {#examples}

**1.** `DateTime`型のカラムを持つテーブルを作成し、そのデータを挿入する:

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

- 整数としてdatetimeを挿入すると、それはUnix タイムスタンプ（UTC）として扱われます。`1546300800`は`'2019-01-01 00:00:00'` UTCを表します。しかし、`timestamp`カラムには`Asia/Istanbul`（UTC+3）タイムゾーンが指定されているため、文字列として出力される際には値は`'2019-01-01 03:00:00'`として表示されます。
- 文字列値をdatetimeとして挿入する場合、それはカラムのタイムゾーンであるとみなされます。`'2019-01-01 00:00:00'`は`Asia/Istanbul`タイムゾーンであると見なされ、`1546290000`として保存されます。

**2.** `DateTime`値のフィルタリング

```sql
SELECT * FROM dt WHERE timestamp = toDateTime('2019-01-01 00:00:00', 'Asia/Istanbul')
```

```text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        1 │
└─────────────────────┴──────────┘
```

`DateTime`カラムの値は、`WHERE`述語内の文字列値を使用してフィルタリングできます。自動的に`DateTime`に変換されます:

```sql
SELECT * FROM dt WHERE timestamp = '2019-01-01 00:00:00'
```

```text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        1 │
└─────────────────────┴──────────┘
```

**3.** `DateTime`型のカラムのタイムゾーンを取得:

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

タイムゾーン変換はメタデータのみを変更するため、計算コストはありません。

## Limitations on time zones support {#limitations-on-time-zones-support}

一部のタイムゾーンは完全にはサポートされていない場合があります。いくつかのケース:

UTCからのオフセットが15分の倍数でない場合、時間と分の計算が不正確になることがあります。例えば、リベリアのモンロビアのタイムゾーンは、1972年1月7日以前はUTC -0:44:30でした。モンロビアタイムゾーンでの歴史的時刻に対する計算を行うと、時間処理関数が不正確な結果を返す可能性があります。しかし、1972年1月7日以降の結果は正確なものになります。

もしタイムの変化（夏時間やその他の理由による）が15分の倍数でない時点で実施された場合、この特定の日に不正確な結果が返されることもあります。

非単調カレンダー日付。例えば、Happy Valley - Goose Bayでは、2010年11月7日00:01:00に、時間が1時間戻された。（真夜中の1分後）したがって、11月6日が終了した後、人々は11月7日の1分間を観察し、その後11月6日の23:01に戻され、さらに59分後に11月7日が再び始まった。ClickHouseはこのような処理を（まだ）サポートしていません。これらの日の結果は、時間処理関数で若干の不正確さが生じるかもしれません。

2010年における南極のケイシー基地でも同様の問題があります。彼らは3月5日の02:00に、時間を3時間戻しました。南極基地で作業する場合でも、ClickHouseを使用することを恐れないでください。タイムゾーンをUTCに設定するか、不正確さを認識するようにしてください。

複数日の時間シフト。一部の太平洋の島々は、タイムゾーンのオフセットをUTC+14からUTC-12に変更しました。それは問題ありませんが、変換日における歴史的な時点でそのタイムゾーンを使って計算を行うときに不正確さが生じる可能性があります。

## Handling daylight saving time (DST) {#handling-daylight-saving-time-dst}

ClickHouseのDateTime型とタイムゾーンは、特に次の場合に夏時間（DST）遷移中に予期しない動作を示すことがあります。

- [`date_time_output_format`](../../operations/settings/settings-formats.md#date_time_output_format)が`simple`に設定されている。
- 時計が逆回り（「戻る」）し、1時間の重複が生じる。
- 時計が進む（「前にすすむ」）と、1時間のギャップが生じる。

デフォルトでは、ClickHouseは常に重複時間の早い方を選択し、前進シフト中の存在しない時間を解釈するかもしれません。

例えば、夏時間（DST）から標準時間への遷移を考慮してください。

- 2023年10月29日、02:00:00に時計が01:00:00（BST → GMT）に戻ります。
- 時間01:00:00 - 01:59:59は2回現れます（1回はBST、もう1回はGMT）。
- ClickHouseは常に最初の出現（BST）を選択するため、時間間隔を加算すると予期しない結果になります。

```sql
SELECT '2023-10-29 01:30:00'::DateTime('Europe/London') AS time, time + toIntervalHour(1) AS one_hour_later

┌────────────────time─┬──────one_hour_later─┐
│ 2023-10-29 01:30:00 │ 2023-10-29 01:30:00 │
└─────────────────────┴─────────────────────┘
```

同様に、標準時間から夏時間への遷移中、ある時間がスキップしているように見えることがあります。

例えば：

- 2023年3月26日、`00:59:59`に時計が02:00:00（GMT → BST）にジャンプします。
- 時間`01:00:00` - `01:59:59`は存在しません。

```sql
SELECT '2023-03-26 01:30:00'::DateTime('Europe/London') AS time, time + toIntervalHour(1) AS one_hour_later

┌────────────────time─┬──────one_hour_later─┐
│ 2023-03-26 00:30:00 │ 2023-03-26 02:30:00 │
└─────────────────────┴─────────────────────┘
```

この場合、ClickHouseは存在しない時間`2023-03-26 01:30:00`を`2023-03-26 00:30:00`に戻します。

## See Also {#see-also}

- [型変換関数](../../sql-reference/functions/type-conversion-functions.md)
- [日付および時間を扱うための関数](../../sql-reference/functions/date-time-functions.md)
- [配列を扱うための関数](../../sql-reference/functions/array-functions.md)
- [date_time_input_format設定](../../operations/settings/settings-formats.md#date_time_input_format)
- [date_time_output_format設定](../../operations/settings/settings-formats.md#date_time_output_format)
- [timezoneサーバー設定パラメータ](../../operations/server-configuration-parameters/settings.md#timezone)
- [session_timezone設定](../../operations/settings/settings.md#session_timezone)
- [日付と時間を扱うための演算子](../../sql-reference/operators#operators-for-working-with-dates-and-times)
- [Dateデータ型](../../sql-reference/data-types/date.md)
