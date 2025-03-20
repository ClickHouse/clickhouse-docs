---
slug: /sql-reference/data-types/datetime
sidebar_position: 16
sidebar_label: DateTime
---


# DateTime

時刻をカレンダー日付と一日の時間として表現できる瞬間を保存することを可能にします。

構文:

``` sql
DateTime([timezone])
```

サポートされている値の範囲: \[1970-01-01 00:00:00, 2106-02-07 06:28:15\]。

解像度: 1秒。

## Speed {#speed}

`Date` データ型は _ほとんど_ の条件下で `DateTime` よりも高速です。

`Date` 型は 2 バイトのストレージを必要とし、`DateTime` は 4 バイトを必要とします。しかし、データベースが圧縮されると、この違いは拡大します。この増幅は `DateTime` 内の分と秒が圧縮しにくいためです。また、`DateTime` の代わりに `Date` をフィルタリングし集約する方が高速です。

## Usage Remarks {#usage-remarks}

時刻は [Unix タイムスタンプ](https://en.wikipedia.org/wiki/Unix_time)として保存され、タイムゾーンやサマータイムに関係なく、表示される際は `DateTime` 型の値がテキスト形式でどのように表示されるか、または文字列として指定された値がどのように解析されるかに影響します（例: '2020-01-01 05:00:01'）。

タイムゾーン非依存の Unix タイムスタンプはテーブルに保存され、タイムゾーンはデータのインポート/エクスポート時にテキスト形式に変換したり、値に対してカレンダー計算を行うために使用されます（例: `toDate`、`toHour` 関数など）。タイムゾーンはテーブルの行（または結果セット）には保存されず、カラムのメタデータに保存されます。

サポートされているタイムゾーンのリストは [IANA タイムゾーンデータベース](https://www.iana.org/time-zones) にあり、`SELECT * FROM system.time_zones` でクエリすることもできます。[リスト](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)は Wikipedia でも確認できます。

テーブル作成時に `DateTime` 型のカラムのタイムゾーンを明示的に設定できます。例: `DateTime('UTC')`。タイムゾーンが設定されていない場合、ClickHouse はサーバー設定の [timezone](../../operations/server-configuration-parameters/settings.md#timezone) パラメータの値または ClickHouse サーバー起動時のオペレーティングシステムの設定の値を使用します。

[clickhouse-client](../../interfaces/cli.md) は、データ型初期化時に明示的にタイムゾーンが設定されていない場合、サーバーのタイムゾーンをデフォルトとして適用します。クライアントのタイムゾーンを使用するには、`--use_client_time_zone` パラメータを指定して `clickhouse-client` を実行します。

ClickHouse は [date_time_output_format](../../operations/settings/settings-formats.md#date_time_output_format) 設定の値に応じて値を出力します。デフォルトでは `YYYY-MM-DD hh:mm:ss` テキスト形式です。さらに、[formatDateTime](../../sql-reference/functions/date-time-functions.md#formatdatetime) 関数を使用して出力を変更できます。

ClickHouse にデータを挿入する際、[date_time_input_format](../../operations/settings/settings-formats.md#date_time_input_format) 設定の値に応じて、さまざまなフォーマットの日時文字列を使用できます。

## Examples {#examples}

**1.** `DateTime` 型のカラムを持つテーブルを作成し、データを挿入する:

``` sql
CREATE TABLE dt
(
    `timestamp` DateTime('Asia/Istanbul'),
    `event_id` UInt8
)
ENGINE = TinyLog;
```

``` sql
-- DateTime を解析
-- - 文字列から、
-- - 1970-01-01 からの秒数として解釈された整数から。
INSERT INTO dt VALUES ('2019-01-01 00:00:00', 1), (1546300800, 3);

SELECT * FROM dt;
```

``` text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        2 │
│ 2019-01-01 03:00:00 │        1 │
└─────────────────────┴──────────┘
```

- 整数として日時を挿入すると、それは Unix タイムスタンプ（UTC）として扱われます。`1546300800` は `'2019-01-01 00:00:00'` UTC を表します。しかし、`timestamp` カラムには `Asia/Istanbul`（UTC+3）タイムゾーンが指定されているため、文字列として出力すると、その値は `'2019-01-01 03:00:00'` と表示されます。
- 文字列値として日時を挿入すると、カラムのタイムゾーンで扱われます。`'2019-01-01 00:00:00'` は `Asia/Istanbul` タイムゾーンのものであり、`1546290000` として保存されます。

**2.** `DateTime` 値でのフィルタリング

``` sql
SELECT * FROM dt WHERE timestamp = toDateTime('2019-01-01 00:00:00', 'Asia/Istanbul')
```

``` text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        1 │
└─────────────────────┴──────────┘
```

`DateTime` カラムの値は、`WHERE` 述語内で文字列値を使用してフィルタリングできます。この場合、自動的に `DateTime` に変換されます:

``` sql
SELECT * FROM dt WHERE timestamp = '2019-01-01 00:00:00'
```

``` text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        1 │
└─────────────────────┴──────────┘
```

**3.** `DateTime` 型カラムのタイムゾーンの取得:

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

タイムゾーン変換はメタデータのみを変更するため、計算コストは発生しません。

## Limitations on time zones support {#limitations-on-time-zones-support}

いくつかのタイムゾーンは完全にはサポートされていません。以下のような場合があります:

UTC からのオフセットが 15 分の倍数でない場合、時間と分の計算が不正確になることがあります。例えば、リベリアのモンロビアのタイムゾーンは、1972年1月7日以前に UTC -0:44:30 のオフセットを持っていました。モンロビアタイムゾーンでの歴史的な時間の計算を行う場合、時間処理関数が不正確な結果を返すかもしれません。しかし、1972年1月7日以降の結果は正確です。

タイムトランジション（サマータイムまたはその他の理由による）が、15 分の倍数でない時刻に実施されると、その特定の日に不正確な結果を得ることもあります。

非単調のカレンダー日付。例如、ハッピーバレー - グースベイでは、2010年11月7日の00:01:00に1時間遡るタイムトランジションが行われました（真夜中の1分後）。したがって、11月6日が終了した後、人々は11月7日の1分間を観察し、次に時刻が11月6日の23:01に戻され、さらに59分後に再び11月7日が始まりました。ClickHouseはこのような処理を（まだ）サポートしていません。そのような日には、時間処理関数の結果がわずかに不正確になる可能性があります。

同様の問題が2010年のケイシー南極基地でも発生しました。彼らは3月5日に時刻を3時間戻しました。南極基地で作業する場合は、ClickHouseを使用することを恐れないでください。ただし、タイムゾーンをUTCに設定するか、不正確さに注意してください。

複数日の時刻のシフト。いくつかの太平洋諸島は、UTC+14からUTC-12にタイムゾーンオフセットを変更しました。これは問題ありませんが、変換の日における歴史的時間の計算に不正確さが生じる可能性があります。

## Handling Daylight Saving Time (DST) {#handling-daylight-saving-time-dst}

ClickHouse の DateTime 型（タイムゾーン付き）は、特に以下の状況では、サマータイム（DST）トランジション中に予期しない挙動を示す可能性があります。

- [`date_time_output_format`](../../operations/settings/settings-formats.md#date_time_output_format) が `simple` に設定されている場合。
- 時計が後ろに動き（「Fall Back」）、1時間のオーバーラップが発生する。
- 時計が前に動き（「Spring Forward」）、1時間のギャップが発生する。

デフォルトでは、ClickHouse は常に重複時間の早い方の出現を選択し、前方シフト中に存在しない時刻を解釈する可能性があります。

例えば、サマータイム（DST）から標準時間へのトランジションを考えてみましょう。

- 2023年10月29日、02:00:00、時計は01:00:00に戻ります（BST → GMT）。
- 01:00:00 – 01:59:59の時間が2回発生します（1回はBST、1回はGMT）。
- ClickHouse は常に最初の出現（BST）を選択し、時間の区間を追加する際に予期しない結果を引き起こします。

```sql
SELECT '2023-10-29 01:30:00'::DateTime('Europe/London') AS time, time + toIntervalHour(1) AS one_hour_later

┌────────────────time─┬──────one_hour_later─┐
│ 2023-10-29 01:30:00 │ 2023-10-29 01:30:00 │
└─────────────────────┴─────────────────────┘
```

同様に、標準時間からサマータイムへのトランジション中には、1時間がスキップされたように見えることがあります。

例えば:

- 2023年3月26日、00:59:59 に時計が前に進み 02:00:00（GMT → BST）になります。
- 01:00:00 – 01:59:59 の時間は存在しません。

```sql
SELECT '2023-03-26 01:30:00'::DateTime('Europe/London') AS time, time + toIntervalHour(1) AS one_hour_later

┌────────────────time─┬──────one_hour_later─┐
│ 2023-03-26 00:30:00 │ 2023-03-26 02:30:00 │
└─────────────────────┴─────────────────────┘
```

この場合、ClickHouse は存在しない時間 `2023-03-26 01:30:00` を `2023-03-26 00:30:00` に戻します。

## See Also {#see-also}

- [型変換関数](../../sql-reference/functions/type-conversion-functions.md)
- [日付と時刻を操作するための関数](../../sql-reference/functions/date-time-functions.md)
- [配列を操作するための関数](../../sql-reference/functions/array-functions.md)
- [date_time_input_format 設定](../../operations/settings/settings-formats.md#date_time_input_format)
- [date_time_output_format 設定](../../operations/settings/settings-formats.md#date_time_output_format)
- [timezone サーバー構成パラメータ](../../operations/server-configuration-parameters/settings.md#timezone)
- [session_timezone 設定](../../operations/settings/settings.md#session_timezone)
- [日付と時刻を操作するための演算子](../../sql-reference/operators#operators-for-working-with-dates-and-times)
- [Date データ型](../../sql-reference/data-types/date.md)
